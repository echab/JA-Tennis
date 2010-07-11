using JA_Tennis.Model;
using JA_Tennis.Assets.Resources;
using System.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.ComponentModel;
using System.Xml.Serialization;
using System;
using System.Collections;
using JA_Tennis.Command;

namespace JA_Tennis.ViewModel
{
    /// <summary>
    /// ViewModel for player editor view. 
    /// </summary>
    public class PlayerEditorViewModel : BindableType, IDirtyAware  //, IUndoAware
    {
        public PlayerEditorViewModel(UndoManager undoManager)
        {
            _UndoManager = undoManager;

            ChangeBehaviors.Add(new DirtyPropertyBehavior(this));

            //if (undoManager != null)
            //{
            //    ChangeBehaviors.Add(new UndoPropertyBehavior(this, undoManager));
            //}

            //TODO dependant property IsPlayer
            this.PropertyChanged += (s, args) => _IsPlayer = string.IsNullOrWhiteSpace(Name);
        }

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

        public Player Player
        {
            get
            {
                Player player = new Player();
                PropertyHandler.SetProperties(this, player);
                return player;
            }
            set
            {
                PropertyHandler.SetProperties(value, this);
            }
        }

        //Player _Player;
        //public Player Player
        //{
        //    get { return _Player; }
        //    set
        //    {
        //        //if (_Player != null)
        //        //{
        //        //    _Player.PropertyChanged -= Player_PropertyChanged;
        //        //}

        //        Set<Player>(ref _Player, value, () => Player);

        //        //if (_Player != null)
        //        //{
        //        //    _Player.PropertyChanged += Player_PropertyChanged;
        //        //}

        //        Set<bool>(ref _IsPlayer, _Player != null, () => IsPlayer);
        //    }
        //}

        //void Player_PropertyChanged(object sender, PropertyChangedEventArgs e)
        //{
        //    this.OnPropertyChanged(Member.Of(() => Player) + "." + e.PropertyName);
        //}


        bool _IsPlayer;
        public bool IsPlayer { get { return _IsPlayer; } }


        #region IDirtyAware Members

        public bool IsDirty { get; set; }

        #endregion

        #region IUndoAware Members
        UndoManager _UndoManager;
        public UndoManager UndoManager { get { return _UndoManager; } }
        #endregion IUndoAware Members
    }
}
