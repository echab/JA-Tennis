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
using System.Collections.Generic;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel
    {
        public Tournament tournament { get; set; }

        public IEnumerable<Player> Players { 
            get {
                return tournament.Players;
            }
        }

        public PlayerListViewModel(Tournament tournament) {
            this.tournament = tournament;
        }
    }
}
