using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using System.Collections.ObjectModel;

namespace JA_Tennis.Model
{
    //TODO replace isSuite, _Precedent, _Suivant by DrawGroup
    //*
    public class DrawGroup : BindableType, IDraw
    {
        #region Constructor
        public DrawGroup()
            : this(null)
        { }

        public DrawGroup(IDraw parent)
            : base(parent)
        {
            _Parent = parent;

            Draws = new ObservableCollection<IDraw>();
        }
        #endregion Constructor


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


        #region IDraw Members

        #region Parent property
        IDraw _Parent;
        [XmlIgnore]
        public IDraw Parent
        {
            get { return _Parent; }
            set { Set(ref _Parent, value, () => Parent); }
        }
        #endregion


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
            get
            {
                foreach (IDraw d in Draws)
                {
                    foreach (MatchPlayer p in d.MatchPlayers)
                    {
                        if (p.ComingQualified != Box.NoQualified)
                        {
                            yield return p;
                        }
                    }
                }
            }
        }

        public IEnumerable<Match> OutgoingQualifiers
        {
            get
            {
                foreach (IDraw d in Draws)
                {
                    foreach (Match m in d.Matches)
                    {
                        if (m.OutgoingQualifier != Box.NoQualified)
                        {
                            yield return m;
                        }
                    }
                }
            }
        }

        #endregion



        #region Precedent property
        IDraw _Precedent;
        public IDraw Precedent
        {
            get { return _Precedent; }
            set { Set(ref _Precedent, value, () => Precedent); }
        }
        #endregion Precedent


        #region Suivant property
        IDraw _Suivant;
        public IDraw Suivant
        {
            get { return _Suivant; }
            set { Set(ref _Suivant, value, () => Suivant); }
        }
        #endregion Suivant
    }
    //*/
}
