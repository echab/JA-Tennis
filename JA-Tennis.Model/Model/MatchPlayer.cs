using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using System.Diagnostics;
using JA_Tennis.Assets.Resources.Model;
using System.ComponentModel;

namespace JA_Tennis.Model
{
    public class MatchPlayer : Box, IXmlSerializable
    {
        #region Constructor
        public MatchPlayer()
            : this(null, null, NoPosition)
        { }

        public MatchPlayer(Tournament tournament, DrawBase draw, int position)
            : base(tournament, draw, position)
        {
            this.PropertyChanged += OnPropertyChanged;
        }
        #endregion Constructor


        #region Order property
        int _Order = NoOrder;
        public int Order
        {
            get { return _Order; }
            set { Set(ref _Order, value, () => Order); }
        }
        #endregion Order


        #region SeededPlayer property
        int _SeededPlayer = NoSeededPlayer;
        public int SeededPlayer
        {
            get { return _SeededPlayer; }
            set { Set(ref _SeededPlayer, value, () => SeededPlayer); }  //setTeteSerie
        }
        #endregion SeededPlayer


        #region ComingQualified property
        int _ComingQualified = NoQualified;
        public int ComingQualified
        {
            get { return _ComingQualified; }
            set {
                //setQualifieEntrant
                if (value != _ComingQualified)
                {
                    IDraw pSuite = Parent != null ? Parent.Precedent : null;

                    _ErrorManager.Validate(() => ComingQualified,
                        new Check(!IsLock, Strings.IDS_ERR_PROGAM_LOC),
                        new Check(value == NoQualified || Parent == null || Parent.getDebut().FindComingQualified(value) == null, "Qualifié entrant déjà placé"),
                        new Check(value == NoQualified || Parent == null || !Parent.IsLock, Strings.IDS_ERR_DESORTANT_SUIV_LOC)
                    );


                    if (pSuite != null && _ComingQualified != NoQualified)
                    {
                        //Met à jour le tableau suivant
                        Match oq = pSuite.FindOutgoingQualifier(_ComingQualified);
                        if (oq != null)
                        {
                            Debug.Assert(oq.Player == null);
                            oq.Player = Player;
                        }
                    }


                    Set(ref _ComingQualified, value, () => ComingQualified);


                    if (pSuite != null && _ComingQualified != NoQualified)
                    {
                        //Met à jour le tableau suivant
                        Match oq = pSuite.FindOutgoingQualifier(_ComingQualified);
                        if (oq != null)
                        {
                            Debug.Assert(oq.Player == null);
                            oq.Player = Player;
                        }
                    }
                }            
            }  
        }
        //public new int isQualifieEntrant() { return ComingQualified != NoQualified ? (ComingQualified == 0 ? EmptyQualified : ComingQualified) : 0; }    //TODO: Deprecated
        #endregion ComingQualified


        void OnPropertyChanged(object sender, PropertyChangedEventArgs args)
        {
            if (args.PropertyName == Member.Of(() => Player))
            {
                //TODO if the match is played, check the match against the new player
            }
        }


        #region Prevenu property
        public enum PrevenuEnum { non = 0, rep = 1, oui = 2 };

        PrevenuEnum _Prevenu;
        public PrevenuEnum Prevenu
        {
            get { return _Prevenu; }
            set { Set(ref _Prevenu, value, () => Prevenu); }
        }
        //public new int isTeteSerie() { return SeededPlayer != NoSeededPlayer ? SeededPlayer : 0; }       //TODO: Deprecated
        #endregion Prevenu


        //TODO:		flag pour "Wild Card": WC


        public new bool IsEmpty
        {
            get
            {
                return base.IsEmpty
                    && Order == NoOrder
                    && SeededPlayer == NoSeededPlayer
                    && ComingQualified == NoQualified;
                //&& Prevenu == PrevenuEnum.non;
            }
        }


        #region IXmlSerializable Members

        public new void ReadXml(XmlReader reader)
        {
            if (reader.IsStartElement("Player1") || reader.IsStartElement("Player2"))
            {
                string s;

                base.ReadXml(reader);

                Order = reader.GetAttributeOrDefaultInt("Order", NoOrder);
                SeededPlayer = reader.GetAttributeOrDefaultInt("SeededPlayer", NoSeededPlayer);
                ComingQualified = reader.GetAttributeOrDefaultInt("ComingQualified", NoQualified);

                s = reader.GetAttribute("Prevenu");
                Prevenu = !string.IsNullOrWhiteSpace(s)
                    ? s == "Rep"
                        ? PrevenuEnum.rep
                        : PrevenuEnum.oui
                    : PrevenuEnum.non;
            }
        }

        public new void WriteXml(XmlWriter writer)
        {
            base.WriteXml(writer);

            writer.WriteAttributeOrDefault("Order", Order, NoOrder);
            writer.WriteAttributeOrDefault("SeededPlayer", SeededPlayer, NoSeededPlayer);
            writer.WriteAttributeOrDefault("ComingQualified", ComingQualified, NoQualified);

            if (Prevenu != PrevenuEnum.non)
            {
                writer.WriteAttributeString("Prevenu", Prevenu == PrevenuEnum.rep ? "Rep" : "P");
            }
        }

        #endregion
    }
}
