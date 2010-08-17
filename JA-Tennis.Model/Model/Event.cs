using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Windows.Media;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    public class Event : BindableType, IDraw, IIdentifiable, IDatable, INotifyDataErrorInfo, IXmlSerializable
    {
        Tournament _Tournament;

        #region Constructor
        public Event()
            : this(null, null)
        { }

        public Event(Tournament tournament, BindableType parentAggregate)
            : base(parentAggregate)
        {
            _Tournament = tournament;

            _ErrorManager = new ValidationErrorManager(this, s => OnErrorsChanged(s));

            Ranks = new Range<Rank>(null, null, this);

            Draws = new ObservableCollection<IDraw>();
        }
        #endregion Constructor


        #region Id property
        string _Id;
        [XmlAttribute]
        public string Id
        {
            get { return _Id; }
            set
            {
                if (_ErrorManager.Validate(() => Id, new Check(!string.IsNullOrWhiteSpace(value), "Id cannot be empty")))
                {
                    if (_Tournament != null)
                    {
                        _Tournament.IdManager.FreeId(_Id);
                        _Tournament.IdManager.DeclareId(value);
                    }
                    Set(ref _Id, value, () => Id);
                }
            }
        }
        #endregion Id


        #region Name property
        string _Name;
        [XmlAttribute]
        public string Name
        {
            get { return _Name; }
            set
            {
                if (_ErrorManager.Validate(() => Name, new Check(!string.IsNullOrWhiteSpace(value), "Name cannot be empty")))
                {
                    Set(ref _Name, value, () => Name);
                }
            }
        }
        #endregion


        #region Sexe property
        SexeEnum _Sexe;
        public SexeEnum Sexe
        {
            get { return _Sexe; }
            set { Set(ref _Sexe, value, () => Sexe); }
        }
        #endregion Sexe


        //TODO Category


        #region IsConsolation property
        bool _IsConsolation;
        public bool IsConsolation
        {
            get { return _IsConsolation; }
            set { Set(ref _IsConsolation, value, () => IsConsolation); }
        }
        #endregion IsConsolation


        #region DateMaj property
        DateTime _DateMaj;  //TODO auto-update DateMaj
        public DateTime DateMaj
        {
            get { return _DateMaj; }
            set { Set(ref _DateMaj, value, () => DateMaj); }
        }
        #endregion DateMaj


        #region Ranks property
        Range<Rank> _Ranks;
        public Range<Rank> Ranks
        {
            get { return _Ranks; }
            private set { Set(ref _Ranks, value, () => Ranks); }
        }
        #endregion Ranks


        #region Dates property
        Range<DateHour> _Dates;
        public Range<DateHour> Dates
        {
            get { return _Dates; }
            set { Set(ref _Dates, value, () => Dates); }
        }
        #endregion Dates


        #region MatchFormat property
        MatchFormat _MatchFormat;
        public MatchFormat MatchFormat
        {
            get { return _MatchFormat; }
            set { Set(ref _MatchFormat, value, () => MatchFormat); }
        }
        #endregion MatchFormat


        #region Draws property
        public ObservableCollection<IDraw> Draws { get; private set; }
        #endregion


        #region Precedent property
        public IDraw Precedent
        {
            get { throw new NotImplementedException(); }
            set { throw new NotImplementedException(); }
        }
        #endregion Precedent


        #region Suivant property
        public IDraw Suivant
        {
            get { throw new NotImplementedException(); }
            set { throw new NotImplementedException(); }
        }
        #endregion Suivant


        #region Color property
        Color _Color;
        public Color Color
        {
            get { return _Color; }
            set { Set(ref _Color, value, () => Color); }
        }
        #endregion Color


        #region RegisteredPlayers
        public IEnumerable<Player> RegisteredPlayers
        {
            get
            {
                if (_Tournament == null)
                {
                    return null;
                }
                return _Tournament.Players.Where(p => p.Registration.Contains(this));
            }
        }
        #endregion


        public bool isSexeCompatible(SexeEnum sexePlayer)
        {
            return
                (Sexe == sexePlayer)	//sexe épreuve = sexe joueur
            || (
            ((Sexe & SexeEnum.EquipeMixte) == SexeEnum.Mixte)
            && ((sexePlayer & SexeEnum.Mixte) == 0)	//ou simple mixte
            );
        }


        #region IDraw Members

        public IDraw Parent { get { return null; } }

        public IEnumerable<MatchPlayer> MatchPlayers
        {
            get
            {
                foreach (IDraw d in Draws)
                {
                    foreach (MatchPlayer p in d.MatchPlayers)
                    {
                        yield return p;
                    }
                }
            }
        }

        public IEnumerable<Match> Matches
        {
            get
            {
                foreach (IDraw d in Draws)
                {
                    foreach (Match m in d.Matches)
                    {
                        yield return m;
                    }
                }
            }
        }

        public IEnumerable<MatchPlayer> ComingQualifiers
        {
            get { yield break; }
        }

        public IEnumerable<Match> OutgoingQualifiers
        {
            get
            {
                //TODO return event winners
                yield break;
            }
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


        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            //reader.Read();
            //reader.ReadStartElement();

            if (reader.IsStartElement("Event"))
            {
                Id = reader.GetAttribute("Id");
                Name = reader.GetAttribute("Name");
                //Ranks = new Range<Rank>(
                //    reader.GetAttribute("RankMin"),
                //    reader.GetAttribute("RankMax")
                //);
                Ranks.Min = reader.GetAttribute("RankMin");
                Ranks.Max = reader.GetAttribute("RankMax");

                //reader.MoveToContent();
                //reader.MoveToElement();
                if (!reader.IsEmptyElement)
                {
                    while (reader.NodeType != XmlNodeType.EndElement)
                    {
                        reader.Read();

                        if (reader.IsStartElement("Draw"))
                        {
                            XmlSerializer xDraw = new XmlSerializer(typeof(Draw), Tournament.Namespace);
                            Draw draw = (Draw)xDraw.Deserialize(reader);
                            Draws.Add(draw);
                        }
                    }
                    reader.ReadEndElement();
                }
                //reader.ReadStartElement();            
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            writer.WriteAttributeNotNull("Id", Id);

            writer.WriteAttributeNotNull("Name", Name);

            if (Ranks != null)
            {
                writer.WriteAttributeNotNull("RankMin", Ranks.Min);

                writer.WriteAttributeNotNull("RankMax", Ranks.Max);
            }

            if (Draws.Count > 0)
            {
                XmlSerializer xDraw = new XmlSerializer(typeof(Draw), Tournament.Namespace);
                foreach (Draw draw in Draws)
                {
                    xDraw.Serialize(writer, draw);
                }
            }
        }

        #endregion


        #region IDisposable Members

        public void Dispose()
        {
            if (_Tournament != null)
            {
                _Tournament.IdManager.FreeId(this);
            }
        }

        #endregion
    }
}
