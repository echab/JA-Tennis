using System;
using System.IO;
using System.Windows.Input;
using System.Windows.Resources;
using JA_Tennis.Assets.Resources;
using JA_Tennis.Command;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class MainFrameViewModel : NotifyPropertyChangedBase
    {
        Tournaments _Tournaments = new Tournaments();
        public Tournaments Tournaments { 
            get { return _Tournaments; } 
        }

        Selection _Selection;
        public Selection Selection { 
            get { return _Selection; } 
            set { _Selection = value; FirePropertyChanged("Selection"); } 
        }

        public MainFrameViewModel() {

            LoadDocumentCommand = new DelegateCommand(LoadDocument, CanLoadDocument);

            //Tournaments.Add(new Tournament());
            LoadDocument(null);

            _Selection = new Selection()
            {
                Tournament = Tournaments[0]
            };
            Tournaments.CollectionChanged += (s, args) => FirePropertyChanged("Tournaments");
        }

        #region Commands
        //Referenced into View like this: <Button cmd:Click.Command="{Binding LoadDocumentCommand}"/>
        public ICommand LoadDocumentCommand { get; set; }

        private void LoadDocument(object param)
        {
            //string filter = param as string ?? string.Empty;

            /*
            //TODO test: serialization to xml
            Tournament t = new Tournament() { Name = "test2"};
            t.Players.Add(new Player() {Id="J1", Name = "Toto" });
            t.Players.Add(new Player() { Id = "J2", Name = "Dudu" });
            Tournaments.Add(t);
            MemoryStream stream2 = new MemoryStream();
            t.Save(stream2);
            stream2.Seek(0, SeekOrigin.Begin);
            StreamReader reader = new StreamReader( stream2 );
            string sXml = reader.ReadToEnd();
            reader.Close();
            //*/

            //TODO test: serialization from embedded resource xml
            //Stream stream = this.GetType().Assembly.GetManifestResourceStream("JA_Tennis.Data.jeu2test.xml");  //embedded resource
            //if (stream != null){    Tournaments.Open(stream);}

            //TODO test: serialization from resource xml
            StreamResourceInfo sri = App.GetResourceStream(new Uri("JA_Tennis;component/Data/jeu2test.xml", UriKind.Relative));  //Resource
            if (sri != null){
                Tournament tournament = Tournament.Open(sri.Stream);
                Tournaments.Add(tournament);
            }
        }
        private bool CanLoadDocument(object param)
        {
            return true;
        }
        #endregion Commands

        #region Resources
        public string ResourceCommandLoad
        {
            get { return Strings.Command_Load; }
        }
        #endregion Resources
    }
}
