using System.Collections.Generic;
using System.ComponentModel;
using JA_Tennis.Model;
using JA_Tennis.Command;
using System;
using System.Windows.Input;
using JA_Tennis.Assets.Resources;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel : NotifyPropertyChangedBase
    {
        public PlayerListViewModel()
        {
            CommandNewPlayer = new DelegateCommand(NewPlayer, CanNewPlayer);
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

        #region Commands
        public Player newPlayer;

        public ICommand CommandNewPlayer { get; set; }

        private void NewPlayer(object param)
        {
            newPlayer = new Player();
            Selection.Player = newPlayer;
        }

        private bool CanNewPlayer(object param)
        {
            return Selection.Player == null;
        }
        #endregion

        #region Resources
        public string ResourceCommandNewPlayer
        {
            get { return Strings.Command_NewPlayer; }
        }
        #endregion Resources
    }
}
