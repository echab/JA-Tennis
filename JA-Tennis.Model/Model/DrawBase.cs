using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Windows.Controls;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    public abstract class DrawBase : BindableType, IDraw, IIdentifiable, IDatable, INotifyDataErrorInfo, IXmlSerializable
    {
        #region Constants
        public const short MAX_BOITE = 511;
        //  const byte MIN_COL = 2; //Deprecated
        //  const byte MAX_COL = 9; //Deprecated
        public const byte MIN_ROUND = 1;
        public const byte MAX_ROUND = 8;
        public const int MAX_TETESERIE = 32;
        public const int MAX_QUALIF_ENTRANT = 32;
        //const int EmptyQualified = -1;
        #endregion


        #region Constructor
        public DrawBase()
            : this(null, null, 0, 0)
        { }

        public DrawBase(Tournament tournament, IDraw parent, byte outgoingCount, byte roundCount)
            : base(parent)
        {
            _Tournament = tournament;
            _Parent = parent;

            OutgoingCount = outgoingCount;
            RoundCount = roundCount;
            m_nBox = ComputeNBox(RoundCount, OutgoingCount);

            _ErrorManager = new ValidationErrorManager(this, s => OnErrorsChanged(s));

            Ranks = new Range<Rank>(null, null, this);

            Dates = new Range<DateHour>(null, null, this);

            //Matches = new ObservableCollection<Match>();
            //Matches.CollectionChanged += Matches_CollectionChanged;

            _Boxes = new BoxArray();

            //ComingQualifiers = new ObservableCollection<Qualifier>();
            //OutgoingQualifiers = new ObservableCollection<Qualifier>();
        }
        #endregion Constructor


        #region Tournament property
        Tournament _Tournament;
        [XmlIgnore]
        public Tournament Tournament
        {
            get { return _Tournament; }
            set { Set(ref _Tournament, value, () => Tournament); }
        }
        #endregion


        #region Parent property
        IDraw _Parent;
        [XmlIgnore]
        public IDraw Parent
        {
            get { return _Parent; }
            set { Set(ref _Parent, value, () => Parent); }
        }
        #endregion

        #region ParentEvent property
        public Event ParentEvent
        {
            get
            {
                for (IDraw p = Parent; p != null; p = p.Parent)
                {
                    if (p is Event)
                    {
                        return (Event)p;
                    }
                }

                return null;
            }
        }
        #endregion ParentEvent


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
        public string Name
        {
            get { return _Name; }
            set { Set(ref _Name, value, () => Name); }
        }
        #endregion


        #region IsLock property
        bool _IsLock;
        public bool IsLock
        {
            get { return _IsLock; }
            set { Set(ref _IsLock, value, () => IsLock); }
        }
        #endregion IsLock


        #region Dimensions
        #region RoundCount property
        byte _RoundCount;
        public byte RoundCount //GetnColonne() -1
        {
            get { return _RoundCount; }
            private set { Set(ref _RoundCount, value, () => RoundCount); }
        }

        //protected byte m_nColonne { get { return (byte)(_RoundCount + 1); } private set { _RoundCount = (byte)(value - 1); } }  //TODO à virer
        #endregion RoundCount


        #region OutgoingCount property
        byte _OutgoingCount;
        public byte OutgoingCount   //GetnQualifie()
        {
            get { return _OutgoingCount; }
            private set { Set(ref _OutgoingCount, value, () => OutgoingCount); }
        }
        //protected byte m_nQualifie { get { return _OutgoingCount; } private set { _OutgoingCount = value; } }    //TODO à virer
        #endregion OutgoingCount


        public bool SetDimension(byte nRoundNew, byte nQualNew, MatchFormat fm, IDraw oldDraw)
        {
            Debug.Assert(SetDimensionOk(nRoundNew, nQualNew, oldDraw));

            RoundCount = nRoundNew;
            OutgoingCount = nQualNew;

            _RoundCount = nRoundNew;
            _OutgoingCount = nQualNew;

            return true;
        }

        public abstract bool SetDimensionOk(byte nRoundNew, byte nQualNew, IDraw OldTableau);

        protected abstract short ComputeNBox(byte roundCount, byte outgoingCount);

        #endregion Dimensions


        #region Suite
        //protected bool m_bSuite;
        protected IDraw _Precedent = null;
        protected IDraw _Suivant = null;

        //public bool isSuite() { return m_bSuite; }
        //public void setSuite(bool bSuite = true) { m_bSuite = bSuite; }

        //public IEnumerable<DrawBase> GroupDraws
        //{
        //    get
        //    {
        //        DrawBase first = null;

        //        DrawBase d = this;
        //        while (d != null && d.isSuite())
        //        {
        //            if (d._Precedent == null)
        //            {
        //                break;
        //            }
        //            first = d;
        //            d = d._Precedent;
        //        }

        //        for (d = first; d != null; d = d.Suivant)
        //        {
        //            yield return d;
        //        }
        //    }
        //}

        public IDraw getDebut()
        {
            if (Parent is DrawGroup)
            {
                DrawGroup g = (DrawGroup)Parent;
                return g.Draws.First();
            }
            return null;

            //DrawBase p = this;	//cast!!!//(DrawBase)this;
            //while (p != null && p.isSuite())
            //{
            //    if (p._Precedent == null)
            //    {
            //        break;
            //    }
            //    p = p._Precedent;
            //}
            //return p;
        }
        public IDraw getFin()
        {
            if (Parent is DrawGroup)
            {
                DrawGroup g = (DrawGroup)Parent;
                return g.Draws.Last();
            }
            return null;

            //DrawBase p = getDebut();
            //while (p != null && p._Suivant != null && p._Suivant.isSuite())
            //{
            //    p = p._Suivant;
            //}
            //return p;
        }
        public IDraw Precedent
        {
            get
            {
                //IDraw p = getDebut();
                //return p != null ? (p._Precedent != null ? p._Precedent.getDebut() : null) : null;

                if (Parent is DrawGroup)
                {
                    DrawGroup g = (DrawGroup)Parent;
                    return g.Precedent;
                }
                return null;

                //if (Parent is DrawGroup)
                //{
                //    DrawGroup g = (DrawGroup)Parent;

                //    IDraw r = null;
                //    foreach (IDraw d in g.Draws)
                //    {
                //        if (d == this)
                //        {
                //            return r;
                //        }
                //        r = d;
                //    }
                //}
                //return null;

            }
            set
            {
                _Precedent = value;
            }
        }
        public IDraw Suivant
        {
            get
            {
                //IDraw p = _Suivant;
                //while (p != null && p.isSuite())
                //{
                //    p = p._Suivant;
                //}
                //return p;

                if (Parent is DrawGroup)
                {
                    DrawGroup g = (DrawGroup)Parent;
                    return g.Suivant;
                }
                return null;

                //if (Parent is DrawGroup)
                //{
                //    DrawGroup g = (DrawGroup)Parent;

                //    IDraw r = null;
                //    foreach (IDraw d in g.Draws)
                //    {
                //        if (r == this)
                //        {
                //            return d;
                //        }
                //        r = d;
                //    }
                //}
                //return null;
            }
            set
            {
                _Suivant = value;
            }
        }
        public short getnSuite()
        {
            if (Parent is DrawGroup)
            {
                DrawGroup g = (DrawGroup)Parent;
                return (short)g.Draws.Count;
            }
            return 1;

            //IDraw p = getDebut();
            //short n;
            //for (n = 0; p != null && (n == 0 || p.isSuite()); n++)
            //{
            //    p = p._Suivant;
            //}
            //return n;
        }

        //TODO: Deprecated
        //IDraw getPrec() { return _Precedent; }
        //IDraw getSuiv() { return _Suivant; }
        //void setPrecedent(IDraw p) { _Precedent = p; }
        //void setSuivant(IDraw p) { _Suivant = p; }
        //bool isPrecedent(IDraw p) { return _Precedent == p; }
        //bool isSuivant(IDraw p) { return _Suivant == p; }
        #endregion Suite


        #region Ranks property
        Range<Rank> _Ranks;
        public Range<Rank> Ranks
        {
            get { return _Ranks; }
            private set { Set(ref _Ranks, value, () => Ranks); }
        }
        #endregion


        #region Dates property
        Range<DateHour> _Dates;
        public Range<DateHour> Dates
        {
            get { return _Dates; }
            private set { Set(ref _Dates, value, () => Dates); }
        }
        #endregion


        #region MatchFormat property
        MatchFormat _MatchFormat;
        public MatchFormat MatchFormat
        {
            get { return _MatchFormat; }
            set { Set(ref _MatchFormat, value, () => MatchFormat); }
        }
        #endregion MatchFormat


        #region Boxes property

        BoxArray _Boxes;
        public BoxArray Boxes
        {
            get { return _Boxes; }
            private set { _Boxes = value; }
        }
        protected short m_nBox;  //TODO à virer ?
        #endregion Boxes


        #region ComingQualifiers collection
        public IEnumerable<MatchPlayer> ComingQualifiers { get; private set; }
        
        
        //public MatchPlayer FindComingQualified(int iQualifie)    //FindQualifieEntrant
        //{
        //    return MatchPlayers.SingleOrDefault(mp => mp.ComingQualified == iQualifie);
        //}

        //public short FindQualifieEntrant(int iQualifie, ref DrawBase ppSuite) //deprecated
        //{
        //    MatchPlayer p = FindComingQualified(iQualifie);
        //    if (p != null)
        //    {
        //        ppSuite = this;
        //        return (short)p.Position;
        //    }
        //    return -1;
        //}
        #endregion


        #region OutgoingQualifiers collection
        //public ObservableCollection<Qualifier> OutgoingQualifiers { get; private set; }
        public IEnumerable<Match> OutgoingQualifiers { get; private set; }


        //public Match FindOutgoingQualifier(int iQualifie)   //FindQualifieSortant
        //{
        //    Match m = Matches.SingleOrDefault(mm => mm.OutgoingQualifier == iQualifie);

        //    if (m != null)
        //    {
        //        return m;
        //    }
        //    else
        //    {
        //        if (Suivant != null)    // && Suivant.isSuite())
        //        {
        //            m = Suivant.FindOutgoingQualifier(iQualifie);
        //            if (m != null)
        //            {
        //                return m;
        //            }
        //        }

        //        ////Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
        //        //if (!isSuite() || _Precedent == null)
        //        //{
        //        //    ushort nSomme = 0;
        //        //    DrawBase pT = this;
        //        //    do
        //        //    {
        //        //        if (pT.isTypePoule)
        //        //        {
        //        //            nSomme += pT.OutgoingCount;
        //        //        }
        //        //        pT = pT.getSuiv();
        //        //    } while (pT != null && pT.isSuite());

        //        //    if (iQualifie <= nSomme)
        //        //    {
        //        //        return -2;
        //        //    }
        //        //}
        //    }
        //    return null;
        //}


        //public short FindQualifieSortant(int iQualifie, ref DrawBase ppSuite) //deprecated
        //{
        //    Match m = FindOutgoingQualifier(iQualifie);
        //    if (m != null)
        //    {
        //        ppSuite = this;
        //        return (short)m.Position;
        //    }

        //    //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
        //    if (!isSuite() || _Precedent == null)
        //    {
        //        ushort nSomme = 0;
        //        DrawBase pT = this;
        //        do
        //        {
        //            if (pT.isTypePoule)
        //                nSomme += pT.OutgoingCount;
        //            pT = pT.getSuiv();
        //        } while (pT != null && pT.isSuite());

        //        if (iQualifie <= nSomme)
        //            return -2;
        //    }

        //    return -1;
        //}

        #endregion


        //public MatchPlayer FindSeedPlayer(ushort iTeteSerie)    //FindTeteSerie
        //{
        //    MatchPlayer p = MatchPlayers.SingleOrDefault(mp => mp.SeededPlayer == iTeteSerie);

        //    if (p != null)
        //    {
        //        return p;
        //    }
        //    else
        //    {
        //        if (Suivant != null && Suivant.isSuite())
        //        {
        //            return Suivant.FindSeedPlayer(iTeteSerie);
        //        }
        //    }
        //    return null;
        //}


        public abstract IEnumerable<Box> GetBoxes();

        public IEnumerable<MatchPlayer> MatchPlayers
        {
            get
            {
                foreach (Box b in GetBoxes().Where(b => b is MatchPlayer))
                {
                    yield return (MatchPlayer)b;
                }

                //if (Suivant != null)    // && Suivant.isSuite())
                //{
                //    foreach (MatchPlayer mp in Suivant.MatchPlayers)
                //    {
                //        yield return mp;
                //    }
                //}
            }
        }

        public IEnumerable<Match> Matches
        {
            get
            {
                foreach (Box b in _Boxes.Values.Where(b => b is Match))
                {
                    yield return (Match)b;
                }
            }
        }

        //public IEnumerable<Match> GroupMatches
        //{
        //    get
        //    {

        //        foreach (Box b in _Boxes.Values.Where(b => b is Match))
        //        {
        //            yield return (Match)b;
        //        }

        //        if (_Suivant != null && _Suivant.isSuite())
        //        {
        //            foreach (Match m in _Suivant.Matches)
        //            {
        //                yield return m;
        //            }
        //        }

        //    }
        //}


        #region Orientation property
        Orientation _Orientation;
        public Orientation Orientation
        {
            get { return _Orientation; }
            set { Set(ref _Orientation, value, () => Orientation); }
        }
        #endregion Orientation


        #region DateMaj property
        DateTime _DateMaj;  //TODO auto-update DateMaj
        public DateTime DateMaj
        {
            get { return _DateMaj; }
            set { Set(ref _DateMaj, value, () => DateMaj); }
        }
        #endregion DateMaj


        #region RegisteredPlayers
        public IEnumerable<Player> RegisteredPlayers
        {
            get
            {
                Event parentEvent = ParentEvent;
                if (parentEvent == null) { return null; }
                return parentEvent.RegisteredPlayers.Where(p => parentEvent.Ranks.InRange(p.Rank));
            }
        }
        #endregion


        #region ToString
        public override string ToString()
        {
            return string.Format("[{0}] {1}", Id, !string.IsNullOrEmpty(Name) ? Name : Ranks.ToString());
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


        #region IDisposable Members

        public void Dispose()
        {
            if (_Tournament != null)
            {
                _Tournament.IdManager.FreeId(this);
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
            if (reader.IsStartElement("Draw"))
            {
                Id = reader.GetAttribute("Id");
                Name = reader.GetAttribute("Name");

                Ranks.Min = reader.GetAttribute("RankMin");
                Ranks.Max = reader.GetAttribute("RankMax");

                Dates.Min = reader.GetAttribute("DateMin");
                Dates.Max = reader.GetAttribute("DateMax");

                if (!reader.IsEmptyElement)
                {
                    while (reader.NodeType != XmlNodeType.EndElement)
                    {
                        reader.Read();

                        if (reader.IsStartElement("Match"))
                        {
                            XmlSerializer xMatch = new XmlSerializer(typeof(Match), Tournament.Namespace);
                            Match match = (Match)xMatch.Deserialize(reader);
                            Boxes.Add(match);
                        }
                    }
                    reader.ReadEndElement();
                }
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            writer.WriteAttributeNotNull("Id", Id);

            writer.WriteAttributeNotNull("Name", Name);

            writer.WriteAttributeNotNull("RankMin", Ranks.Min);

            writer.WriteAttributeNotNull("RankMax", Ranks.Max);

            writer.WriteAttributeNotNull("DateMin", Dates.Min);

            writer.WriteAttributeNotNull("DateMax", Dates.Max);

            //if (Matches.Count > 0)
            if (_Boxes.Count > 0)
            {
                XmlSerializer xMatch = new XmlSerializer(typeof(Match), Tournament.Namespace);
                //foreach (Match match in Matches)
                foreach (Match match in Boxes.Values.Where(b => b is Match))
                {
                    xMatch.Serialize(writer, match);
                }
            }
        }

        #endregion
    }
}
