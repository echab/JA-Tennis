using JA_Tennis.Model;
using JA_Tennis.Assets.Resources;
using System.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.ViewModel
{
    /// <summary>
    /// ViewModel for player editor view. 
    /// </summary>
    public class PlayerEditorViewModel : BindableType //NotifyPropertyChangedBase
    {
        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set
            {
                Set<Player>(ref _Player, value, () => Player);

                Set<bool>(ref _IsPlayer, _Player != null, () => IsPlayer);
            }
        }

        bool _IsPlayer;
        public bool IsPlayer { get{ return _IsPlayer;} }

        //public PlayerEditorViewModel()
        //{
        //}
    }
}
