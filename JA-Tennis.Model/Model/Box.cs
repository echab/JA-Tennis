using System;
using System.Collections;
using System.ComponentModel;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    public abstract class Box : BindableType, INotifyDataErrorInfo, IXmlSerializable, INotifyPropertyChanging
    {
        public const int NoQualified = 0;
        public const int EmptyQualified = -1;
        public const int NoPosition =  -1;
        public const int NoOrder = -1;
        public const int NoSeededPlayer = 0;


        #region Constructor
        public Box()
            : this(null, null, 0)
        { }

        public Box(Tournament tournament, DrawBase parent, int position)
            : base(parent)
        {
            _Tournament = tournament;
            _Parent = parent;
            _Position = position;

            ChangeBehaviors.Add(new NotifyPropertyChangingBehavior<int>(this, OnPropertyChanging));

            _ErrorManager = new ValidationErrorManager(this, s => OnErrorsChanged(s));
        }
        #endregion Constructor


        #region Tournament property
        protected Tournament _Tournament;
        [XmlIgnore]
        public Tournament Tournament
        {
            get { return _Tournament; }
            set
            {
                Set(ref _Tournament, value, () => Tournament);
                if (_Tournament != null)
                {
                    Player.IdsSource = _Tournament.Players;
                }
                else
                {
                    Player.IdsSource = null;
                }
            }
        }
        #endregion


        #region Parent property
        protected DrawBase _Parent;
        [XmlIgnore]
        public DrawBase Parent
        {
            get { return _Parent; }
            set { Set(ref _Parent, value, () => Parent); }
        }
        #endregion


        #region Position property
        int _Position=NoPosition;
        public int Position
        {
            get { return _Position; }
            set { Set(ref _Position, value, () => Position); }
        }

        private void OnPropertyChanging(string propertyName, object oldVal, object newVal)
        {
            if (propertyName == Member.Of(() => Position))
            {
                //TODO update BoxArray array according to position (see: BoxArray::box_PropertyChanged)
                var handler = PropertyChanging;
                if (handler != null)
                {
                    handler.Invoke(this, new PropertyChangingEventArgs(propertyName, oldVal, newVal));
                }
            }
        }
        #endregion Position


        #region Player properties
        IdRef<Player> _Player;
        public IdRef<Player> Player
        {
            get { return _Player; }
            set { Set(ref _Player, value, () => Player); }
        }
        #endregion Player properties


        public bool IsEmpty
        {
            get
            {
                return Player == null || (Player)Player == null;
            }
        }
        public bool IsLock { get { return false; } }    //TODO

        //public bool isJoueur() { return Player != null; }


        #region INotifyPropertyChanging Members

        public event PropertyChangingEventHandler PropertyChanging;

        #endregion


        #region INotifyDataErrorInfo Members
        protected ValidationErrorManager _ErrorManager;

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        public IEnumerable GetErrors(string propertyName) { return _ErrorManager.GetErrors(propertyName); }

        public bool HasErrors { get { return _ErrorManager.HasErrors; } }

        private void OnErrorsChanged(string propertyName)
        {
            var handler = ErrorsChanged;
            if (handler != null)
            {
                handler.Invoke(this, new DataErrorsChangedEventArgs(propertyName));
            }
        }
        #endregion


        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            if (reader.IsStartElement())
            //if (reader.IsStartElement("Player1") || reader.IsStartElement("Player2"))
            {
                string s;

                s = reader.GetAttribute("Player");
                if (!string.IsNullOrWhiteSpace(s))
                {
                    Player = new IdRef<Player>(s, null);    //TODO _Tournament != null ? _Tournament.Players : null);
                }

                Position = reader.GetAttributeOrDefaultInt("Position", Position);
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            if (Player != null && (Player)Player != null)
            {
                writer.WriteAttributeString("Player", ((Player)Player).Id);
            }

            if (this is Match)
            {
                //writer.WriteAttributeNotNull("Position", Position);
                writer.WriteAttributeOrDefault("Position", Position, NoPosition);
            }
        }

        #endregion
    }
}
