using System.Collections.Generic;
using System.ComponentModel;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel : NotifyPropertyChangedBase
    {
        public PlayerListViewModel() {
            Tournament.PropertyChanged += (sender, args) => FirePropertyChanged("Tournament");
            Selection.PropertyChanged += (sender, args) => FirePropertyChanged("Selection");

            _Selection = new Selection();
        }


        Tournament _Tournament;
        public Tournament Tournament
        {
            get { return _Tournament; }
            set { _Tournament = value; FirePropertyChanged("Tournament"); }
        }

        Selection _Selection;
        public Selection Selection
        {
            get { return _Selection; }
            set { _Selection = value; FirePropertyChanged("Selection"); }
        }

        public IEnumerable<Player> Players { 
            get {
                return Tournament.Players;
            }
        }

        public PlayerListViewModel(Tournament tournament) {
            Tournament = tournament;
        }
    }
}
