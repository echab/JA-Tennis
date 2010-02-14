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
using System.Collections.Generic;
using System.IO;
using System.Xml.Serialization;

namespace JA_Tennis.Model
{
    public class Tournaments
    {
        public List<Tournament> List;

        public Tournaments() {
            List = new List<Tournament>();
        }
    }
}
