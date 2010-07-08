
using System.Collections.ObjectModel;
using JA_Tennis.Model;
using JA_Tennis.Helpers;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.ViewModel
{
    public class Selection : BindableType //NotifyPropertyChangedBase
    {
        Tournament _Tournament;
        public Tournament Tournament
        {
            get { return _Tournament; }
            set { Set<Tournament>(ref _Tournament, value, () => Tournament); }
        }

        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set { Set<Player>(ref _Player, value, () => Player); }
        }

        //public PlayerCollection Players { get; set; }     //TODO selection multiple players 
    }
}
