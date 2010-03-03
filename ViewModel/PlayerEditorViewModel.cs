using JA_Tennis.Model;
using JA_Tennis.Assets.Resources;

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

        public string ResourceLabelName
        {
            get { return Strings.Label_Name + Strings.Label_Suffix; }
        }
    }
}
