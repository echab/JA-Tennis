using System;
using System.Windows.Input;
using JA_Tennis.Command;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    /// <summary>
    /// ViewModel for player editor view. 
    /// </summary>
    public class PlayerEditorViewModel : BindableType, IDirtyAware
    {
        public PlayerEditorViewModel(UndoManager undoManager)
        {
            ChangeBehaviors.Add(new DirtyPropertyBehavior(this));

            if (undoManager != null)
            {
                ChangeBehaviors.Add(new UndoPropertyBehavior(undoManager));
            }

#if WITH_SUBPLAYER
            if (undoManager != null)
            {
                _Player = new Player(new UndoPropertyBehavior(undoManager));
            }
            else
            {
                _Player = new Player();
            }
#else
            //TODO dependent property IsPlayer
            this.PropertyChanged += (s, args) => Set(ref _IsPlayer, !string.IsNullOrWhiteSpace(Name), () => IsPlayer);
#endif

            //Init commands
            OkCommand = new DelegateCommand(Ok, CanOk);
            CancelCommand = new DelegateCommand(Cancel, CanCancel);
        }

#if WITH_SUBPLAYER
        //public Player Player
        //{
        //    get
        //    {
        //        Player player = new Player();
        //        PropertyHelper.Copy(player, this);
        //        return player;
        //    }
        //    set
        //    {
        //        PropertyHelper.Copy(this, value);
        //    }
        //}

        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set
            {
                //if (value == null) { throw new ArgumentNullException("Player"); }

                //Set<Player>(ref _Player, value, () => Player);

                var oldValue = _Player;
                PropertyHelper.Copy(_Player, value);
                RaisePropertyChanged(oldValue, value, () => Player);

                Set(ref _IsPlayer, !_Player.HasErrors, () => IsPlayer);
            }
        }
#else
        //Player members
        string _Name;
        public string Name
        {
            get { return _Name; }
            set { Set(ref _Name, value, () => Name); }
        }

        string _Id;
        public string Id
        {
            get { return _Id; }
            set { Set(ref _Id, value, () => Id); }
        }
#endif

        bool _IsPlayer;
        public bool IsPlayer { get { return _IsPlayer; } }

        #region OkCommand
        //Referenced into View like this: <Button Command="{Binding Path=OkCommand}"/>
        public ICommand OkCommand { get; private set; }
        public event EventHandler OnOk;

        private void Ok(object param)
        {
            if (OnOk != null)
            {
                OnOk(this, new EventArgs());
            }
        }
        private bool CanOk(object param)
        {
            return IsDirty; //TODO && no errors
        }
        #endregion OkCommand


        #region CancelCommand
        //Referenced into View like this: <Button Command="{Binding Path=CancelCommand}"/>
        public ICommand CancelCommand { get; private set; }
        public event EventHandler OnCancel;

        private void Cancel(object param)
        {
            if (OnCancel != null)
            {
                OnCancel(this, new EventArgs());
            }
        }
        private bool CanCancel(object param)
        {
            return true;
        }
        #endregion CancelCommand


        #region IDirtyAware Members

        public bool IsDirty { get; set; }

        #endregion
    }
}
