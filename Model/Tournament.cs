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
using System.Xml.Serialization;

namespace JA_Tennis.Model
{
    public class Tournament
    {
        public string Name { get; set; }
        public Players Players { get; private set; }

        public Tournament() {
            Players = new Players();
        }
    }
}
