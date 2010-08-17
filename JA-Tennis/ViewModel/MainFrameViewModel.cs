using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Windows.Input;
using System.Windows.Resources;
using JA_Tennis.Command;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.Model;
using System.Collections.ObjectModel;

namespace JA_Tennis.ViewModel
{
    public class MainFrameViewModel : BindableType //NotifyPropertyChangedBase
    {
        #region Constructor
        public MainFrameViewModel()
        {
            UndoManager = new UndoManager();

            Tournaments = new ObservableCollection<Tournament>();
            Tournaments.CollectionChanged += (s, args) => OnPropertyChanged(() => Tournaments);

            Selection = new Selection();
            Selection.PropertyChanged += Selection_PropertyChanged;

            //init child ViewModels
            _PlayerListViewModel = new PlayerListViewModel()
            {
                Selection = this.Selection
            };

            _PlayerEditorViewModel = new PlayerEditorViewModel(UndoManager)
            {
#if WITH_SUBPLAYER
                Player = this.Selection.Player
#else
                //Name = this.Selection.Player != null ? this.Selection.Player.Name : null,
                //Id = this.Selection.Player != null ? this.Selection.Player.Id : null
#endif
            };
#if !WITH_SUBPLAYER
            if (this.Selection.Player != null)
            {
                PropertyHelper.Copy(_PlayerEditorViewModel, this.Selection.Player);
            }
#endif

            //Init commands
            OpenDocumentCommand = new DelegateCommand(OpenDocument, CanOpenDocument);
            CloseDocumentCommand = new DelegateCommand<Tournament>(CloseDocument, CanCloseDocument);

#if !WITH_SUBPLAYER
            _PlayerEditorViewModel.OnOk += (s, args) => PropertyHelper.Copy(Selection.Player, _PlayerEditorViewModel);
            _PlayerEditorViewModel.OnCancel += (s, args) => PropertyHelper.Copy(_PlayerEditorViewModel, this.Selection.Player);
#endif

            Tournaments.CollectionChanged += Tournaments_CollectionChanged;

#if DEBUG
            //Tournaments.Add(new Tournament());
            //OpenDocument(null); //TODO
#endif //DEBUG
        }
        #endregion Constructor

        public UndoManager UndoManager { get; private set; }

        #region Tournaments
        public ObservableCollection<Tournament> Tournaments { get; private set; }

        private void Tournaments_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    Selection.Tournament = e.NewItems[0] as Tournament; //TODO Multi tournament selection ?
                    break;
                case NotifyCollectionChangedAction.Remove:
                case NotifyCollectionChangedAction.Replace:
                    if (e.OldItems.Contains(Selection.Tournament))
                    {
                        ObservableCollection<Tournament> tournaments = sender as ObservableCollection<Tournament>;
                        Selection.Tournament = tournaments.Count > 0 ? tournaments[tournaments.Count - 1] : null;   //Last one
                    }
                    break;
                case NotifyCollectionChangedAction.Reset:
                    Selection.Tournament = null;
                    break;
            }
        }
        #endregion Tournaments

        #region Selection property
        private Selection _Selection;
        public Selection Selection
        {
            get { return _Selection; }
            set { Set<Selection>(ref _Selection, value, () => Selection); }
        }

        void Selection_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            Selection selection = (Selection)sender;

            _PlayerListViewModel.Selection = selection;

            if (e.PropertyName == Member.Of<Selection>(s => s.Player))
            {
#if WITH_SUBPLAYER
                _PlayerEditorViewModel.Player = selection.Player;
#else
                //_PlayerEditorViewModel.Name = selection.Player != null ? selection.Player.Name : null;
                //_PlayerEditorViewModel.Id = selection.Player != null ? selection.Player.Id : null;
                PropertyHelper.Copy(_PlayerEditorViewModel, selection.Player);
#endif
            }
        }
        #endregion

        #region Child ViewModels
        //Silverlight View Model Communication http://www.codeproject.com/KB/silverlight/VMCommunication.aspx
        private PlayerListViewModel _PlayerListViewModel;
        public PlayerListViewModel PlayerListViewModel
        {
            get { return _PlayerListViewModel; }
            private set { Set<PlayerListViewModel>(ref _PlayerListViewModel, value, () => PlayerListViewModel); }
        }

        private PlayerEditorViewModel _PlayerEditorViewModel;
        public PlayerEditorViewModel PlayerEditorViewModel
        {
            get { return _PlayerEditorViewModel; }
            private set { Set<PlayerEditorViewModel>(ref _PlayerEditorViewModel, value, () => PlayerEditorViewModel); }
        }
        #endregion Child ViewModels

        #region OpenDocumentCommand
        //Referenced into View like this: 
        //SL3: <Button cmd:Click.Command="{Binding OpenDocumentCommand}"/>
        //SL3: <Button cmd:CommandManager.EventName="Click" cmd:CommandManager.Command="{Binding OpenDocumentCommand}"/>
        //SL4: <Button Command="{Binding Path=OpenDocumentCommand}"/>
        public ICommand OpenDocumentCommand { get; private set; }

        private void OpenDocument(object param)
        {
            //string filter = param as string ?? string.Empty;


            //TODO test: serialization from embedded resource xml
            //Stream stream = this.GetType().Assembly.GetManifestResourceStream("JA_Tennis.Data.jeu2test.xml");  //embedded resource
            //if (stream != null){    Tournaments.Open(stream);}

#if DEBUG
            //Serialization from resource xml
            StreamResourceInfo sri = App.GetResourceStream(new Uri("JA_Tennis;component/Data/jeu2test.xml", UriKind.Relative));  //Resource
            if (sri != null)
            {
                Tournament tournament = Tournament.Open(sri.Stream);
                Tournaments.Add(tournament);
            }
#else
            OpenFileDialog dlg = new OpenFileDialog();
            dlg.Filter = "Xml Files (*.xml)|*.xml";
            if (dlg.ShowDialog() == true)
            {
                Tournament tournament = Tournament.Open(dlg.File.OpenRead());
                Tournaments.Add(tournament);
            }
#endif //DEBUG

        }
        private bool CanOpenDocument(object param)
        {
            return true;
        }
        #endregion OpenDocumentCommand

        #region CloseDocumentCommand
        //Referenced into View like this: <Button Command="{Binding Path=CloseDocumentCommand}" CommandParameter="{Binding Path=Selection.Tournament}"/>
        public ICommand CloseDocumentCommand { get; private set; }

        private void CloseDocument(Tournament tournament)
        {
            Tournaments.Remove(tournament);
        }
        private bool CanCloseDocument(Tournament tournament)
        {
            return Tournaments.Count > 0 && tournament != null;
        }
        #endregion CloseDocumentCommand
    }
}
