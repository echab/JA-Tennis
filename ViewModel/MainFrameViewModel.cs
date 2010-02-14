using System;
using System.Windows.Resources;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class MainFrameViewModel
    {
        public Tournaments Tournaments = new Tournaments();

        public MainFrameViewModel() {

            //*
            //TODO test
            Tournament t = new Tournament() { Name = "test2"};
            t.AddPlayer(new Player() {Id="J1", Name = "Toto" });
            t.AddPlayer(new Player() { Id = "J2", Name = "Dudu" });
            Tournaments.List.Add(t);
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
                Tournaments.List.Add(tournament);
            }

        }
    }
}
