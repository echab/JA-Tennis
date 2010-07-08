using System.ComponentModel;
using System.Windows.Input;
using JA_Tennis.Command;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class PlayerListViewModel : BindableType //NotifyPropertyChangedBase
    {
        public PlayerListViewModel()
        {

            AddPlayerCommand = new DelegateCommand<Player>(AddPlayer, CanAddPlayer);
            DeletePlayerCommand = new DelegateCommand<Player>(DeletePlayer, CanDeletePlayer);
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
            get { return Selection != null ? Selection.Tournament : null; }
        }

        public PlayerCollection Players
        {
            get { return Tournament != null ? Tournament.Players : null; }
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

                Set<Selection>(ref _Selection, value, () => Selection);

                if (_Selection != null)
                {
                    _Selection.PropertyChanged += Selection_PropertyChanged;
                }
            }
        }

        void Selection_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            //Raise change on ViewModel when a property of Selection change (ie a sub-property of ViewModel)
            if (e.PropertyName == Member.Of<Selection>(s => s.Tournament))
            {
                OnPropertyChanged(() => Tournament);
                OnPropertyChanged(() => Players);
            }
        }

    }
}
