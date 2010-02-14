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

namespace JA_Tennis.Model
{
    public class Players
    {
        public List<Player> List { get; private set; }

        public Players()
        {
            List = new List<Player>();
        }

        public bool Add( Player player) {
            List.Add(player);
            return true;
        }

        public bool Remove(Player player)
        {
            //TODO: manage dependencies (registrations, matches, etc.)
            return List.Remove(player);
        }
    }
}
