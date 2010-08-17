using System;
using System.Collections;
using System.ComponentModel;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    public class Score : BindableType, INotifyDataErrorInfo, IXmlSerializable
    {
        #region Constructor
        public Score()
            : this(null)
        { }

        public Score(BindableType parentAggregate)
            : base(parentAggregate)
        {
            _ErrorManager = new ValidationErrorManager(this, s => OnErrorsChanged(s));
        }
        #endregion Constructor


        //TODO MatchFormat  //A, B, c, D, E, F, G
        //TODO: bool	bNoAd
        //TODO: bool	bSetQuatreJeux
        //TODO: bool	bJeuDecisifDernierSet


        #region Value property
        string _Value;
        [XmlAttribute]
        public string Value
        {
            get { return _Value; }
            set
            {
                bool? isFirstWinner;
                if (_ErrorManager.Validate(() => Value, new Check(ParseScore(value, out isFirstWinner), "Bad score")))
                {
                    Set(ref _Value, value, () => Value);
                    IsFirstWinner = isFirstWinner;
                }
            }
        }
        #endregion Value


        #region IsWO property
        bool _IsWO;
        [XmlAttribute("WO")]
        public bool IsWO
        {
            get { return _IsWO; }
            set { Set(ref _IsWO, value, () => IsWO); }
        }
        #endregion IsWO


        #region IsSurrender property
        bool _IsSurrender;
        [XmlAttribute("Ab")]
        public bool IsSurrender
        {
            get { return _IsSurrender; }
            set { Set(ref _IsSurrender, value, () => IsSurrender); }
        }
        #endregion IsSurrender


        #region IsBadWinner property
        bool _IsBadWinner;
        [XmlAttribute("VD")]
        public bool IsBadWinner
        {
            get { return _IsBadWinner; }
            set { Set(ref _IsBadWinner, value, () => IsBadWinner); }
        }
        #endregion IsBadWinner


        #region IsFirstWinner property
        bool? _IsFirstWinner;
        [XmlIgnore]
        public bool? IsFirstWinner
        {
            get { return _IsFirstWinner; }
            set { Set(ref _IsFirstWinner, value, () => IsFirstWinner); }
        }
        #endregion IsFirstWinner


        public bool IsEmpty
        {
            get { return string.IsNullOrWhiteSpace(Value) && !IsWO; }
        }


        protected bool ParseScore(string score, out bool? isFirstWinner)
        {
            isFirstWinner = null;

            if (!string.IsNullOrEmpty(score))
            {
                //TODO
                //Compute the winner
                int nSetWin = 0;
                string[] sets = score.Split(' ');
                foreach (string set in sets)
                {
                    string[] games = set.Split('/');
                    if (games.Length != 2)
                    {
                        return false;
                    }
                    if (games[0].CompareTo(games[1]) > 0)
                    {
                        nSetWin++;
                    }
                }
                isFirstWinner = nSetWin > (sets.Length / 2);
            }
            return true;
        }


        public override string ToString()
        {
            string s;
            if (IsWO)
            {
                s = "WO";
            }
            else
            {
                s = Value;
                if (IsSurrender)
                {
                    s += " Ab";
                }
            }
            return s;
        }


        #region IXmlSerializable Members

        public System.Xml.Schema.XmlSchema GetSchema() { return null; }

        public void ReadXml(System.Xml.XmlReader reader)
        {
            if (!reader.IsStartElement("Score"))
            {
                reader.Read();
                reader.ReadStartElement("Score");
            }

            IsWO = (reader.GetAttribute("WO") == "1");

            IsSurrender = (reader.GetAttribute("Ab") == "1");

            IsBadWinner = (reader.GetAttribute("VD") == "1");

            //reader.MoveToContent();
            //reader.ReadStartElement();

            Value = reader.ReadElementContentAsString();

            //reader.ReadEndElement();
        }

        public void WriteXml(System.Xml.XmlWriter writer)
        {
            //writer.WriteStartElement( "Score");

            writer.WriteAttributeOrDefault("WO", IsWO, false);

            writer.WriteAttributeOrDefault("Ab", IsSurrender, false);

            writer.WriteAttributeOrDefault("VD", IsBadWinner, false);

            writer.WriteString(Value);

            //writer.WriteEndElement();
        }

        #endregion


        #region INotifyDataErrorInfo Members
        ValidationErrorManager _ErrorManager;

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
    }
}
