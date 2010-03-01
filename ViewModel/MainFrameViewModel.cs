using System;
using System.Windows.Resources;
using JA_Tennis.Model;
using System.ComponentModel;
using JA_Tennis.Command;
using System.Windows.Input;

namespace JA_Tennis.ViewModel
{
    public class MainFrameViewModel : NotifyPropertyChangedBase
    {
        public Tournaments Tournaments = new Tournaments();

        public MainFrameViewModel() {

            LoadDocumentCommand = new DelegateCommand(LoadDocument, CanLoadDocument);

            Tournaments.CollectionChanged += (s, args) => FirePropertyChanged("Tournaments");

            //Tournaments.Add(new Tournament());
            LoadDocument(null);
        }

        //Referenced into View like this: <Button cmd:Click.Command="{Binding LoadDocumentCommand}"/>
        public ICommand LoadDocumentCommand { get; set; }

        private void LoadDocument(object param)
        {
            //string filter = param as string ?? string.Empty;

            //*
            //TODO test
            Tournament t = new Tournament() { Name = "test2"};
            t.Players.Add(new Player() {Id="J1", Name = "Toto" });
            t.Players.Add(new Player() { Id = "J2", Name = "Dudu" });
            Tournaments.Add(t);
            System.IO.MemoryStream stream2 = new System.IO.MemoryStream();
            t.Save(stream2);
            stream2.Seek(0, System.IO.SeekOrigin.Begin);
            System.IO.StreamReader reader = new System.IO.StreamReader( stream2 );
            string sXml = reader.ReadToEnd();
            reader.Close();
            //*/

            //TODO: for test only
            //System.IO.Stream stream = this.GetType().Assembly.GetManifestResourceStream("JA_Tennis.Data.jeu2test.xml");  //embedded resource
            //if (stream != null){    Tournaments.Open(stream);}

            //TODO: for test only
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
    }
}
