using System.Collections.Generic;
using System.ComponentModel;
using JA_Tennis.Model;
using JA_Tennis.Command;
using System.Windows.Input;
using JA_Tennis.Helpers;
using System.Collections.ObjectModel;
using System.Collections.Specialized;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel : NotifyPropertyChangedBase
    {
        public PlayerListViewModel()
        {

            AddPlayerCommand = new DelegateCommand<Player>(AddPlayer, CanAddPlayer);
            DeletePlayerCommand = new DelegateCommand<Player>(DeletePlayer, CanDeletePlayer);

            //Tournament.PropertyChanged += (sender, args) => RaisePropertyChanged(()=>Tournament));

            //_Selection = new Selection();   //TODO: pb events
            //Selection.PropertyChanged += (sender, args) => RaisePropertyChanged(()=>Selection));
        }

        #region AddPlayerCommand
        public ICommand AddPlayerCommand { get; private set; }
        private void AddPlayer(Player player)
        {
            // Add the Player to the collection
            Tournament.Players.Add(player);

            // Update the selection
            Selection.Player = player;
        }

        private bool CanAddPlayer(Player player)
        {
            return Tournament != null && player != null;
        }
        #endregion

        #region DeletePlayerCommand
        public ICommand DeletePlayerCommand { get; private set; }
        private void DeletePlayer(Player player)
        {
            // Delete the Player from the collection
            Tournament.Players.Remove(player);

            // Update the selection
            Selection.Player = null;
        }

        private bool CanDeletePlayer(Player player)
        {
            return Tournament != null && player != null;
        }
        #endregion


        public Tournament Tournament
        {
            get
            {
                return Selection != null ? Selection.Tournament : null;
            }
        }

        public PlayerCollection Players
        {
            get
            {
                return Tournament != null ? Tournament.Players : null;
            }
        }

        private Selection _Selection;
        public Selection Selection
        {
            get { return _Selection; }
            set
            {
                if (_Selection == value) { return; }
                if (_Selection != null)
                {
                    _Selection.PropertyChanged -= Selection_PropertyChanged;
                }

                _Selection = value;

                if (_Selection != null)
                {
                    RaisePropertyChanged(() => Selection);
                    _Selection.PropertyChanged += Selection_PropertyChanged;
                }
            }
        }

        void Selection_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            RaisePropertyChanged(() => Selection);

            if (e.PropertyName == Member.Of<Selection>(s => s.Tournament))
            {
                RaisePropertyChanged(() => Tournament);
                RaisePropertyChanged(() => Players);
            }
        }

    }
}
