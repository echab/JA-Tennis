using JA_Tennis.Model;
using JA_Tennis.Assets.Resources;
using System.ComponentModel;
using JA_Tennis.Command;
using System.Windows.Input;

namespace JA_Tennis.ViewModel
{
    /// <summary>
    /// ViewModel for player editor view. 
    /// </summary>
    public class PlayerEditorViewModel:NotifyPropertyChangedBase
    {
        public PlayerEditorViewModel()
        {
            CommandOk = new DelegateCommand(Ok, CanOk);
        }

        public bool IsNew { get; set; }

        Player _Player;
        public Player Player { 
            get { return _Player; }
            set {
                if (_Player == value) { return; }

                if (_Player != null)
                {
                    _Player.PropertyChanged -= (sender, args) => FirePropertyChanged("Player");
                }
                bool oldIsPlayer = _Player != null;

                _Player = value;
                FirePropertyChanged("Player");

                if (_Player != null)
                {
                    _Player.PropertyChanged += (sender, args) => FirePropertyChanged("Player");
                }
                if ((_Player != null) != IsPlayer)
                {
                    IsPlayer = _Player != null;
                    FirePropertyChanged("IsPlayer");
                }
            }
        }

        public bool IsPlayer { get; private set; }

        #region Commands
        public ICommand CommandOk { get; set; }

        private void Ok(object param)
        {
            if (IsNew)
            {
            }
            else
            {
            }
        }

        private bool CanOk(object param)
        {
            return true;
        }
        #endregion

        #region Resources
        public string ResourceLabelName
        {
            get { return Strings.Label_Name + Strings.Label_Suffix; }
        }
        public string ResourceCommandOk
        {
            get { return Strings.Command_Ok; }
        }
        #endregion Resources
    }
}
