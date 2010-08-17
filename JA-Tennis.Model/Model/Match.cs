using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Xml;
using System.Xml.Serialization;
using JA_Tennis.Assets.Resources.Model;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    public class Match : Box, INotifyDataErrorInfo, IXmlSerializable
    {
        #region Constructor
        public Match()
            : this(null, null, 0)
        { }

        public Match(Tournament tournament, DrawBase parent, int position)
            : base(tournament, parent, position)
        {
            //Player1 = new MatchPlayer();
            //Player2 = new MatchPlayer();
            //if (_Tournament != null)
            //{
            //    Player1.Player.IdsSource = _Tournament.Players;
            //    Player2.Player.IdsSource = _Tournament.Players;
            //}

            this.PropertyChanged += OnPropertyChanged;
        }
        #endregion Constructor


        #region Player1 and Player2 properties
        //IdRef<Player> _Player1;
        //[IdRef]
        //public IdRef<Player> Player1
        //{
        //    get { return _Player1; }
        //    set { Set(ref _Player1, value, () => Player1); }
        //}

        //IdRef<Player> _Player2;
        //[IdRef]
        //public IdRef<Player> Player2
        //{
        //    get { return _Player2; }
        //    set { Set(ref _Player2, value, () => Player2); }
        //}

        //public MatchPlayer Player1 { get; private set; }
        //public MatchPlayer Player2 { get; private set; }

        protected int PositionPlayer1
        {
            get
            {
                if (Position == NoPosition)
                {
                    throw new Exception("Invalid position value");
                }
                return Position * 2 + 2;
            }
        }
        protected int PositionPlayer2
        {
            get
            {
                if (Position == NoPosition)
                {
                    throw new Exception("Invalid position value");
                }
                return Position * 2 + 1;
            }
        }

        public Box Player1
        {
            get
            {
                return _Parent != null ? _Parent.Boxes[PositionPlayer1] : null;
            }
            set
            {
                if (_Parent == null)
                {
                    throw new NullReferenceException("Parent");
                }

                value.Position = PositionPlayer1;
                value.Parent = Parent;
                value.Tournament = Tournament;
                _Parent.Boxes.Remove(value.Position);
                _Parent.Boxes.Add(value);
            }
        }
        public Box Player2
        {
            get
            {
                return _Parent != null ? _Parent.Boxes[PositionPlayer2] : null;
            }
            set
            {
                if (_Parent == null)
                {
                    throw new NullReferenceException("Parent");
                }

                value.Position = PositionPlayer2;
                value.Parent = Parent;
                value.Tournament = Tournament;
                _Parent.Boxes.Remove(value.Position);
                _Parent.Boxes.Add(value);
            }
        }
        #endregion Player1 and Player2


        #region OutgoingQualifier property
        int _OutgoingQualifier;
        public int OutgoingQualifier
        {
            get { return _OutgoingQualifier; }  //isQualifieSortant()
            set
            {   //setQualifieSortant
                if (value != _OutgoingQualifier)
                {
                    _ErrorManager.Validate(() => OutgoingQualifier,
                        new Check(!IsLock, Strings.IDS_ERR_PROGAM_LOC),
                        new Check(value == NoQualified || Parent == null || Parent.getDebut().FindOutgoingQualifier(value) == null, "Qualifié sortant déjà placé"),
                        new Check(value == NoQualified || Parent == null || !Parent.IsLock, Strings.IDS_ERR_DESORTANT_SUIV_LOC)
                    );

                    //Debug.Assert(SetQualifieSortantOk(value));

                    IDraw pSuite = Parent != null ? Parent.Suivant : null;
                    if (pSuite != null && _OutgoingQualifier != NoQualified)
                    {
                        //Met à jour le tableau suivant
                        MatchPlayer iq = pSuite.FindComingQualified(_OutgoingQualifier);
                        if (iq != null)
                        {
                            Debug.Assert(iq.Player == null);
                            iq.Player = Player;
                        }
                    }


                    Set(ref _OutgoingQualifier, value, () => OutgoingQualifier);


                    if (Parent is Pool)
                    {
                        Pool parentPool = (Pool)Parent; //TODO remove dependency with Pool
                        parentPool.Boxes[parentPool.iDiagonale(Position)].Player = (value != NoQualified) ? Player1.Player : null;
                    }


                    if (pSuite != null)
                    {
                        //Met à jour le tableau suivant
                        MatchPlayer iq = pSuite.FindComingQualified(_OutgoingQualifier);
                        if (iq != null)
                        {
                            Debug.Assert(iq.Player == null);
                            iq.Player = Player;
                        }
                    }
                }
            }
        }
        //public new int isQualifieSortant() { return OutgoingQualifier != NoQualified ? OutgoingQualifier : 0; }

        /* private bool SetQualifieSortantOk(int iQualifie)         // iQualifie=0 => enlève qualifié
        {
            short i;
            DrawBase pSuite = null;

            Debug.Assert(iQualifie >= 0);

            //CDocJatennis* pDoc = (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument();

            if (Parent == null || !(Parent is Pool))  //if (match.isCache() && !isTypePoule)
            {
                _ErrorManager.AddError(Member.Of(() => OutgoingQualifier), Strings.IDS_ERR_SORTANT_HIDE);	//AfxMessageBox( IDS_ERR_SORTANT_HIDE);
                return false;
            }

            //if ((Parent is Pool))
            //{
            //    //que dans la diagonale pour une poule ?
            //    Debug.Assert(Parent.iDiagonale(Position) == Position);
            //}
            //else

            if (iQualifie != NoQualified)	//Ajoute un qualifié sortant
            {
                ////Qualifié sortant interdit dans la première colonne
                //Debug.Assert(DrawBase.iCol((short)Position) != Parent.iColMax);

                //if ( isTeteSerie() != 0 || isQualifieEntrant() != 0)
                //{
                //    _ErrorManager.AddError(Member.Of(() => OutgoingQualifier), Strings.IDS_ERR_SORTANT_TDS_E);	//AfxMessageBox( IDS_ERR_SORTANT_TDS_E);
                //    return false;
                //}

                //Qualifié sortant pas déjà pris
                //Debug.Assert((i = Parent.getDebut().FindQualifieSortant(iQualifie, ref pSuite)) < 0 || (i == Position && pSuite == Parent));
                Debug.Assert(Parent.getDebut().FindOutgoingQualifier(iQualifie) == null);
                //if( FindQualifieSortant( iQualifie) < 0)
                //	{
                //	TRACE("Qualifié sortant déjà placé\n");
                //	return false;
                //	}

                //Met à jour le tableau suivant
                pSuite = Parent != null ? Parent.Suivant : null;
                if (pSuite != null)
                {
                    if (isJoueur() && OutgoingQualifier != NoQualified)
                    {
                        if ((i = pSuite.FindQualifieEntrant(iQualifie, ref pSuite)) != -1)
                        {
                            Debug.Assert(pSuite.Boxes[i].Player == Player);
                            if (pSuite.IsLock || !((Match)pSuite.Boxes[i]).EnleveJoueurOk(true))
                                return false;
                        }
                    }
#if DEBUG
                    else
                    {	//Vérifie que le qualifié dans le tableau suivant est bien vide
                        pSuite = Parent.Suivant;
                        if ((i = pSuite.FindQualifieEntrant(iQualifie, ref pSuite)) != -1)
                            Debug.Assert(!pSuite.Boxes[i].isJoueur());
                    }
#endif	//_DEBUG
                }

                //Enlève le précédent n° de qualifié sortant
                if (OutgoingQualifier != NoQualified)
                    if (!SetQualifieSortantOk(0))	//Enlève le qualifié
                        return false;

                pSuite = Parent.Suivant;
                if (pSuite != null && isJoueur())
                {
                    //Met à jour le tableau suivant
                    if ((i = pSuite.FindQualifieEntrant(iQualifie, ref pSuite)) != -1)
                    {
                        Debug.Assert(!pSuite.Boxes[i].isJoueur());
                        if (pSuite.IsLock || !((Match)pSuite.Boxes[i]).MetJoueurOk(Player, true))
                            return false;
                    }
                }

            }
            else	//Enlève un qualifié sortant
            {
                Debug.Assert(OutgoingQualifier != NoQualified);

                pSuite = Parent.Suivant;
                if (pSuite != null && pSuite.IsLock)
                {
                    _ErrorManager.AddError(Member.Of(() => OutgoingQualifier), Strings.IDS_ERR_DESORTANT_SUIV_LOC);	//AfxMessageBox( IDS_ERR_DESORTANT_SUIV_LOC);
                    return false;
                }

                if (IsLock)
                {
                    _ErrorManager.AddError(Member.Of(() => OutgoingQualifier), Strings.IDS_ERR_DESORTANT_LOC);	//AfxMessageBox( IDS_ERR_DESORTANT_LOC);
                    return false;
                }

                if (pSuite != null && isJoueur())
                {
                    //Met à jour le tableau suivant
                    i = pSuite.FindQualifieEntrant(OutgoingQualifier, ref pSuite);
                    if (i != -1)
                    {
                        Debug.Assert(pSuite.Boxes[i].isJoueur());
                        Debug.Assert(pSuite.Boxes[i].Player == Player);
                        if (pSuite.IsLock || !((Match)pSuite.Boxes[i]).EnleveJoueurOk(true))
                            return false;
                    }
                }
            }

            return true;
        }
        //*/
        #endregion OutgoingQualifier


        /* //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
        private bool MetJoueurOk(Player player, bool bForce) //cast //const
        {
            //Debug.Assert(isBox(Position));
            Debug.Assert(player != null);

            //CDocJatennis* pDoc = (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument();
            Box box = this;
            MatchPlayer matchPlayer = (MatchPlayer)box;
            Match match = this;

            if (box.IsLock && (Player)(box.Player) != player)
            {
                _ErrorManager.AddError("Match", Strings.IDS_ERR_PROGAM_LOC);	//AfxMessageBox( IDS_ERR_PROGAM_LOC);
                return false;
            }

            if (box.isQualifieEntrant() != 0 && !bForce)
            {
                _ErrorManager.AddError("Match", Strings.IDS_ERR_TAB_ENTRANT_LOC);	//AfxMessageBox( IDS_ERR_TAB_ENTRANT_LOC);
                return false;
            }

            if (box == null) //if (box.isCache())
            {
                _ErrorManager.AddError("Match", Strings.IDS_ERR_TAB_ENTRANT_DEVANT);	//AfxMessageBox( IDS_ERR_TAB_ENTRANT_DEVANT);
                return false;
            }

            if ((Player)box.Player != player && box.isJoueur())
            {
                if (!EnleveJoueurOk(true))		//Enlève le joueur précédent
                    return false;
            }

            return true;
        }

        //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
        public bool MetJoueur(Player player, bool bForce = false)
        {
            short i;
            int e;

            Debug.Assert(MetJoueurOk(player, bForce));

            Box box = this;
            MatchPlayer matchPlayer = (MatchPlayer)box;
            Match match = this;

            if ((Player)box.Player != player && box.isJoueur())
            {
                if (!EnleveJoueur())		//Enlève le joueur précédent
                    Debug.Assert(false);
            }

            box.Player = player;
            matchPlayer.Order = NoOrder;
            match.Score = new Score();

            if (Parent.isGauchePoule(Position))
            {
                //box.m_iClassement = 0;  //TODO ORDREPOULE
            }
            else
            {
                match.Date = null;
                match.Place = null;
            }

            DrawBase pSuite = Parent.Suivant;
            e = box.isQualifieSortant();
            if (e != 0 && pSuite != null)
            {
                if ((i = pSuite.FindQualifieEntrant(e, ref pSuite)) != -1)
                {
                    if (!pSuite.Boxes[i].isJoueur()
                     && !((Match)pSuite.Boxes[i]).MetJoueur(player, true))
                        Debug.Assert(false);
                }
            }
            return true;
        }

        //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
        public bool EnleveJoueurOk(bool bForce) //cast //const
        {
            short i;

            //Debug.Assert(isBox(Position));
            Box box = this;
            MatchPlayer matchPlayer = (MatchPlayer)box;
            Match match = this;

            if ((Player)box.Player == null && match.Score.IsEmpty)
                return true;

            //CDocJatennis* pDoc = (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument();

            //	Debug.Assert( bForce);
            //	if( !bForce)
            //		{
            //		TRACE("Tableau en mode résultat, impossible de déprogrammer un joueur\n");
            //		return false;
            //		}

            if (box.IsLock)
            {
                _ErrorManager.AddError("Match", Strings.IDS_ERR_DEPROGRAM_LOC);	//AfxMessageBox( IDS_ERR_DEPROGRAM_LOC);
                return false;
            }

            if (box.isQualifieEntrant() != 0 && !bForce)
            {
                _ErrorManager.AddError("Match", Strings.IDS_ERR_DEENTRANT_LOC);	//AfxMessageBox( IDS_ERR_DEENTRANT_LOC);
                return false;
            }

            DrawBase pSuite = Parent.Suivant;
            i = (short)box.isQualifieSortant();
            if (i != 0 && pSuite != null)
            {
                i = pSuite.FindQualifieEntrant(i, ref pSuite);
                if (i != -1)
                {
                    if (pSuite.IsLock || !((Match)pSuite.Boxes[i]).EnleveJoueurOk(true))
                        return false;
                }
            }

            return true;
        }

        //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
        public bool EnleveJoueur(bool bForce = false)
        {
            short i;
            Box box = this;
            MatchPlayer matchPlayer = (MatchPlayer)box;
            Match match = this;

            if (box.Player == null && match.Score.IsEmpty)
                return true;

            Debug.Assert(EnleveJoueurOk(bForce));

            DrawBase pSuite = Parent.Suivant;
            i = (short)box.isQualifieSortant();
            if (i != 0 && pSuite != null)
            {
                i = pSuite.FindQualifieEntrant(i, ref pSuite);
                if (i != -1)
                {
                    if (!((Match)pSuite.Boxes[i]).EnleveJoueur(true))
                        Debug.Assert(false);
                }
            }

            box.Player = null;
            match.Score = null;
            matchPlayer.Order = Box.NoOrder;
            return true;
        }
        //*/

        //TODO bool bReceive: Does Player2 receive ?

        //TODO:		flag pour "Lucky Looser": LL


        void OnPropertyChanged(object sender, PropertyChangedEventArgs args)
        {
            if (args.PropertyName == Member.Of(() => Player))
            {
                _ErrorManager.Validate(() => Player,
                    new Check(Player == null || Player.Equals(Player1) || Player.Equals(Player2), "The winner must be one of the two players"),
                    new Check(!IsLock, Strings.IDS_ERR_PROGAM_LOC)
                );

                if (Player == null)
                {
                    Score = new Score();
                    Date = null;
                    Place = null;
                }

                //if (Parent.isGauchePoule(Position))
                //{
                //    box.m_iClassement = 0;  //TODO ORDREPOULE
                //}

                IDraw pSuite = Parent != null ? Parent.Suivant : null;
                if (OutgoingQualifier != NoQualified && pSuite != null)
                {
                    MatchPlayer iq = pSuite.FindComingQualified(OutgoingQualifier);
                    if (iq != null)
                    {
                        iq.Player = Player;
                    }
                }
            }
        }


        #region Date property
        DateHour _Date;
        [XmlAttribute]
        public DateHour Date
        {
            get { return _Date; }
            set { Set(ref _Date, value, () => Date); }
        }
        #endregion Date


        #region Place property
        string _Place;
        [XmlAttribute]
        public string Place
        {
            get { return _Place; }
            set { Set(ref _Place, value, () => Place); }
        }
        #endregion Place


        #region MatchFormat property
        MatchFormat _MatchFormat;
        public MatchFormat MatchFormat
        {
            get { return _MatchFormat; }
            set { Set(ref _MatchFormat, value, () => MatchFormat); }
        }
        #endregion MatchFormat


        #region Score property
        Score _Score;
        public Score Score
        {
            get { return _Score; }
            set
            {
                Set(ref _Score, value, () => Score);

                if (!Score.IsEmpty)
                {
                    if (Player1 == null || Player2 == null)
                    {
                        _ErrorManager.AddError(Member.Of(() => Score), "Score without players");
                    }
                    else
                    {

                        if (_Score.IsFirstWinner == true)
                        {
                            Player = Player1.Player;
                        }
                        else
                            if (_Score.IsFirstWinner == false)
                            {
                                Player = Player2.Player;
                            }
                            else
                            {
                                Player = null;
                            }
                    }
                }
            }
        }
        #endregion Score


        #region Note property
        string _Note;
        public string Note
        {
            get { return _Note; }
            set { Set(ref _Note, value, () => Note); }
        }
        #endregion Note


        #region IXmlSerializable Members

        public new void ReadXml(XmlReader reader)
        {
            if (reader.IsStartElement("Match"))
            {
                string s;

                //if (reader.IsStartElement("Player1") || reader.IsStartElement("Player2"))

                base.ReadXml(reader);

                //s = reader.GetAttribute("Player1");
                //if (!string.IsNullOrWhiteSpace(s))
                //{
                //    Player1.Player = new IdRef<Player>(s, _Tournament != null ? _Tournament.Players : null);
                //}

                //s = reader.GetAttribute("Player2");
                //if (!string.IsNullOrWhiteSpace(s))
                //{
                //    Player2.Player = new IdRef<Player>(s, _Tournament != null ? _Tournament.Players : null);
                //}


                OutgoingQualifier = reader.GetAttributeOrDefaultInt("OutgoingQualifier", NoQualified);

                s = reader.GetAttribute("Date");
                if (!string.IsNullOrWhiteSpace(s))
                {
                    Date = new DateHour(s, true);   // DateHour.ParseExact(s, "yyyy/M/d H:mm", null);
                }

                Place = reader.GetAttribute("Place");


                if (!reader.IsEmptyElement)
                {
                    XmlSerializer xMatchPlayer = new XmlSerializer(typeof(MatchPlayer), Tournament.Namespace);

                    while (reader.NodeType != XmlNodeType.EndElement)
                    {
                        reader.Read();

                        MatchPlayer matchPlayer;
                        if (reader.IsStartElement("Player1"))
                        {
                            //Player1 = (MatchPlayer)xMatchPlayer.Deserialize(reader);
                            //Player1.ReadXml(reader);
                            Debug.Assert(Parent != null);
                            if (Parent != null)
                            {
                                matchPlayer = new MatchPlayer(null, Parent, PositionPlayer1);
                                matchPlayer.ReadXml(reader);
                                Parent.Boxes.Add(matchPlayer);
                            }
                        }

                        if (reader.IsStartElement("Player2"))
                        {
                            //Player2 = (MatchPlayer)xMatchPlayer.Deserialize(reader);
                            //Player2.ReadXml(reader);
                            Debug.Assert(Parent != null);
                            if (Parent != null)
                            {
                                matchPlayer = new MatchPlayer(null, Parent, PositionPlayer2);
                                matchPlayer.ReadXml(reader);
                                Parent.Boxes.Add(matchPlayer);
                            }
                        }

                        if (reader.IsStartElement("Score"))
                        {
                            XmlSerializer xScore = new XmlSerializer(typeof(Score), Tournament.Namespace);
                            Score = (Score)xScore.Deserialize(reader);
                        }

                        if (reader.IsStartElement("Note"))
                        {
                            Note = reader.ReadElementContentAsString("Note", Tournament.Namespace);
                        }

                    }
                    reader.ReadEndElement();
                }
            }
        }

        public new void WriteXml(XmlWriter writer)
        {
            base.WriteXml(writer);

            writer.WriteAttributeOrDefault("OutgoingQualifier", OutgoingQualifier, NoQualified);

            writer.WriteAttributeNotNull("Date", (string)Date);

            writer.WriteAttributeNotNull("Place", Place);

            //XmlSerializer xMatchPlayer = new XmlSerializer(typeof(MatchPlayer), Tournament != null ? Tournament.Name : null);

            Debug.Assert(Player1 == null || !Player1.IsEmpty);  //TODO IsEmpty not used
            if (Player1 != null && !Player1.IsEmpty)
            {
                writer.WriteStartElement("Player1");
                //xMatchPlayer.Serialize(writer, Player1);
                Player1.WriteXml(writer);
                writer.WriteEndElement();
            }

            Debug.Assert(Player2 == null || !Player2.IsEmpty);  //TODO IsEmpty not used
            if (Player2 != null && !Player2.IsEmpty)
            {
                writer.WriteStartElement("Player2");
                //xMatchPlayer.Serialize(writer, Player2);
                Player2.WriteXml(writer);
                writer.WriteEndElement();
            }

            //if ((Player)Player1.Player != null)
            //{
            //    writer.WriteAttributeString("Player1", ((Player)Player1.Player).Id);
            //}

            //if ((Player)Player2.Player != null)
            //{
            //    writer.WriteAttributeString("Player2", ((Player)Player2.Player).Id);
            //}

            if (Score != null)
            {
                XmlSerializer xScore = new XmlSerializer(typeof(Score), Tournament.Namespace);
                xScore.Serialize(writer, Score);
            }

            writer.WriteElementOrDefault("Note", Note, null);
        }

        #endregion
    }
}
