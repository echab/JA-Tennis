using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class PlayerEditorViewModel:NotifyPropertyChangedBase
    {
        Player _Player;
        public Player Player { 
            get { return _Player; }
            set { _Player = value; FirePropertyChanged("Player"); }
        }

        public PlayerEditorViewModel(Player player)
        {
            this.Player = player;
        }
    }
}
