using JA_Tennis.Model;
using JA_Tennis.Assets.Resources;
using System.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.ComponentModel;
using System.Xml.Serialization;
using System;
using System.Collections;
using JA_Tennis.Command;
using System.Windows.Input;

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

#if !WITH_SUBPLAYER
            //TODO dependent property IsPlayer
            this.PropertyChanged += (s, args) => Set<bool>(ref _IsPlayer, !string.IsNullOrWhiteSpace(Name), () => IsPlayer);
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
        //        PropertyHelper.SetProperties(player, this);
        //        return player;
        //    }
        //    set
        //    {
        //        PropertyHelper.SetProperties(this, value);
        //    }
        //}

        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set
            {
                //if (_Player != null)
                //{
                //    _Player.PropertyChanged -= Player_PropertyChanged;
                //}

                //Set<Player>(ref _Player, value, () => Player);
                Set<Player>(ref _Player, PropertyHelper.Clone(value), () => Player);

                //if (_Player != null)
                //{
                //    _Player.PropertyChanged += Player_PropertyChanged;
                //}

                Set<bool>(ref _IsPlayer, _Player != null, () => IsPlayer);
            }
        }

        //void Player_PropertyChanged(object sender, PropertyChangedEventArgs e)
        //{
        //    this.OnPropertyChanged(Member.Of(() => Player) + "." + e.PropertyName);
        //}
#else
        //Player members
        string _Name;
        public string Name
        {
            get { return _Name; }
            set { Set<string>(ref _Name, value, () => Name); }
        }

        string _Id;
        public string Id
        {
            get { return _Id; }
            set { Set<string>(ref _Id, value, () => Id); }
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
