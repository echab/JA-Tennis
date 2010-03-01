
using System.Collections.ObjectModel;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class Selection : NotifyPropertyChangedBase
    {
        Tournament _Tournament;
        public Tournament Tournament {
            get { return _Tournament; }
            set { _Tournament = value; FirePropertyChanged("Tournament"); }
        }

        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set { _Player = value; FirePropertyChanged("Player"); }
        }

        public ObservableCollection<Player> Players { get; set; }
    }
}
