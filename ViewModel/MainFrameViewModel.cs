using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using JA_Tennis.Model;
using System.Windows.Resources;

namespace JA_Tennis.ViewModel
{
    public class MainFrameViewModel
    {
        public Tournaments Tournaments { get; set; }

        public MainFrameViewModel() {
            Tournaments = new Tournaments();

            //TODO: for test only
            //System.IO.Stream stream = System.Reflection.Assembly.GetExecutingAssembly().GetManifestResourceStream("Test/test1.xml");    //embedded resource
            //System.IO.Stream stream = this.GetType().Assembly.GetManifestResourceStream("Test/test1.xml");
            StreamResourceInfo sri = App.GetResourceStream(new Uri( "Test/test1.xml", UriKind.Relative));
            if (sri != null)
            {
                Tournaments.Open(sri.Stream);
            }

            //WebClient wc = new WebClient();
            //wc.OpenReadCompleted+=new OpenReadCompletedEventHandler(wc_OpenReadCompleted);
            //wc.OpenReadAsync( new Uri("Test/test1.xml",UriKind.Relative));
        }
/*
        void wc_OpenReadCompleted(object sender, OpenReadCompletedEventArgs e)
        {
            if(e.Error != null) {
                Console.Write(e.Error.Message);
            }else {
                Tournaments.Open(e.Result);
            }
        }
//*/ 
    }
}
