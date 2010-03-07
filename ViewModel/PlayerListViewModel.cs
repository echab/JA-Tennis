using System.Collections.Generic;
using System.ComponentModel;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel : NotifyPropertyChangedBase
    {
        public PlayerListViewModel()
        {
            //Tournament.PropertyChanged += (sender, args) => FirePropertyChanged("Tournament");

            //_Selection = new Selection();   //TODO: pb events
            //Selection.PropertyChanged += (sender, args) => FirePropertyChanged("Selection");
        }


        Tournament _Tournament;
        public Tournament Tournament
        {
            get { return _Tournament; }
            set
            {
                if (_Tournament == value) { return; }
                if (_Tournament != null)
                {
                    _Tournament.PropertyChanged -= (sender, args) => FirePropertyChanged("Tournament");
                }

                _Tournament = value;

                if (_Tournament != null)
                {
                    _Tournament.PropertyChanged += (sender, args) => FirePropertyChanged("Tournament");
                    FirePropertyChanged("Tournament");
                }
            }
        }

        Selection _Selection;
        public Selection Selection
        {
            get { return _Selection; }
            set
            {
                if (_Selection == value) { return; }
                if (_Selection != null)
                {
                    _Selection.PropertyChanged -= (sender, args) => FirePropertyChanged("Selection");
                }

                _Selection = value;

                if (_Selection != null)
                {
                    _Selection.PropertyChanged += (sender, args) => FirePropertyChanged("Selection");
                    FirePropertyChanged("Selection");
                }

            }
        }

        public IEnumerable<Player> Players
        {
            get
            {
                return Tournament.Players;
            }
        }
    }
}
