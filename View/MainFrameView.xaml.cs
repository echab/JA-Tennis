using System.Windows.Controls;
using JA_Tennis.ViewModel;
using System.ComponentModel;

namespace JA_Tennis.View
{
    public partial class MainFrameView : UserControl
    {
        public MainFrameView()
        {
            InitializeComponent();
        }

        public MainFrameViewModel ViewModel {
            get { return DataContext as MainFrameViewModel; }
            set
            {
                MainFrameViewModel oldVM = DataContext as MainFrameViewModel;
                if (oldVM != null && oldVM.Selection != null)
                {
                    oldVM.Selection.PropertyChanged -= new PropertyChangedEventHandler(Selection_PropertyChanged);
                }

                DataContext = value;

                //Init player list
                playerListView.ViewModel = new PlayerListViewModel()
                {
                    Selection = value.Selection,
                    Tournament = value.Selection.Tournament,
                };

                playerEditorView.ViewModel = new PlayerEditorViewModel()
                {
                    Player = value.Selection.Player
                };

                if (value.Selection != null)
                {
                    value.Selection.PropertyChanged += new PropertyChangedEventHandler(Selection_PropertyChanged);
                }
            }
        }

        void Selection_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (playerListView != null && playerListView.ViewModel != null)
            {
                playerListView.ViewModel.Selection = ViewModel.Selection;
                playerListView.ViewModel.Tournament = ViewModel.Selection.Tournament;
            }

            if (playerEditorView != null && playerEditorView.ViewModel != null)
            {
                playerEditorView.ViewModel.Player = ViewModel.Selection.Player;
            }
        }
    }
}
