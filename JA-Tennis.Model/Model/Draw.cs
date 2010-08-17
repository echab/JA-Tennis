using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace JA_Tennis.Model
{
    public class Draw : DrawBase
    {
        #region Constructor
        public Draw()
            : this(null, null, 0, 0)
        { }

        public Draw(Tournament tournament, IDraw _event, byte outgoingCount, byte roundCount)
            : base(tournament, _event, outgoingCount, roundCount)
        {
        }
        #endregion Constructor


        #region Dimensions

        public new bool SetDimension(byte nRoundNew, byte nQualNew, MatchFormat fm, IDraw oldDraw)
        {
            Debug.Assert(SetDimensionOk(nRoundNew, nQualNew, oldDraw));

            int nBoxNew = ComputeNBox(nRoundNew, nQualNew);

            if (m_nBox < nBoxNew)
            {
                short nBox = m_nBox;

                ////Allocate new boxes
                //for (; nBox < nBoxNew; nBox++)
                //{
                //    Debug.Assert(!Boxes.ContainsKey(nBox));
                //    if (oldDraw != null && nBox < oldDraw.m_nBox)
                //        Boxes[nBox] = new Box(*oldDraw.Boxes[nBox]);
                //    else
                //    {
                //        Boxes[nBox] = new Box(fm);
                //        //Boxes[nBox].SetFormatMatch( fm);
                //    }
                //}

                //Décale les boxes
                if (nRoundNew == RoundCount)
                {
                    sbyte n = (sbyte)(iColMaxQ(nRoundNew + 1, nQualNew) - iColMaxQ(RoundCount + 1, OutgoingCount));
                    if (n > 0)
                    {
                        //Décale vers la gauche
                        short bMin = (short)iBoxMin;
                        for (short b = iBoxMax; b >= bMin; b--)
                        {
                            short b2 = iBoxPivotGauche(b, iHautCol0(n));
                            //*Boxes[b2] = *Boxes[b];
                            //*Boxes[b] = Box(Boxes[b].FormatMatch());	//Effacement ancienne box

                            //Box box = Boxes[b];
                            //Boxes.Remove(b);
                            //box.Position = b2;
                            //Boxes.Add(box);

                            Boxes[b].Position = b2;
                        }
                    }
                }

                m_nBox = nBox;

            }
            else if (m_nBox > nBoxNew)
            {

                //Décale les boxes
                if (nRoundNew == RoundCount)
                {
                    sbyte n = (sbyte)(iColMaxQ(RoundCount + 1, OutgoingCount) - iColMaxQ(nRoundNew + 1, nQualNew));
                    if (n > 0)
                    {
                        //Décale vers la droite
                        short bMax = iBoxMaxQ(nRoundNew + 1, nQualNew);
                        for (short b = iBoxMinQ(nQualNew); b <= bMax; b++)
                        {
                            short b2 = iBoxPivotGauche(b, iHautCol0(n));
                            //*Boxes[b] = *Boxes[b2];

                            //Box box = Boxes[b2];
                            //Boxes.Remove(b2);
                            //box.Position = b;
                            //Boxes.Add(box);

                            Boxes[b2].Position = b;
                        }
                    }
                }

                //Vire des boxes
                IDraw pSuite = Suivant;
                for (; m_nBox > nBoxNew; m_nBox--)
                {
                    Debug.Assert(Boxes.ContainsKey(m_nBox - 1));
                    if (pSuite != null)
                    {
                        //if (Boxes[m_nBox - 1].isQualifieSortant())
                        //{
                        //    SetQualifieSortant(m_nBox - 1, 0);
                        //}
                    }
                    Boxes.Remove(m_nBox - 1);    //delete Boxes[m_nBox-1];
                    //Boxes[m_nBox - 1] = null;
                }
            }

            base.SetDimension(nRoundNew, nQualNew, fm, oldDraw);

            if (RoundCount + 1 != 0)
            {
                //TODO 00/01/09: Tableau, Enlever les têtes de série et les qualifiés entrants de la nouvelle colonne de droite
                short bHaut = iHautCol0(iColMin);
                for (short b = iBasColQ(iColMin); b <= bHaut; b++)
                {
                    MatchPlayer box = Boxes[b] as MatchPlayer;
                    //if (Boxes[b].isTeteSerie())
                    if (box != null && box.SeededPlayer != Box.NoSeededPlayer)
                    {
                        //Boxes[b].enleveEtiquette();
                        box.SeededPlayer = Box.NoSeededPlayer;
                    }
                }

                //TODO 00/01/09: Tableau, Enlever les qualifiés sortants de la nouvelle colonne de gauche
                bHaut = iHautCol0(iColMax);
                for (short b = iBasColQ(iColMax); b <= bHaut; b++)
                {
                    Match box = Boxes[b] as Match;
                    //if (Boxes[b].isQualifieSortant())
                    if (box != null && box.OutgoingQualifier != Box.NoQualified)
                    {
                        //Boxes[b].enleveEtiquette();
                        box.OutgoingQualifier = Box.NoQualified;
                    }
                }
            }

#if DEBUG
            //AssertValid();
            //ASSERT_VALID(this);
#endif

            return true;
        }

        public override bool SetDimensionOk(byte nRoundNew, byte nQualNew, IDraw OldTableau)
        {
            int nBoxNew;

            Debug.Assert(0 <= m_nBox && m_nBox <= MAX_BOITE);


            if ((nRoundNew + 1) != 0 && nQualNew != 0)
            {
                nBoxNew = iHautCol0((sbyte)(iColMinQ(nQualNew) + nRoundNew)) + 1;	//iHautCol( nColNew + iCol( nQualNew -1) -1) +1;
            }
            else
            {
                nBoxNew = 0;
            }

            Debug.Assert(0 <= nBoxNew && nBoxNew <= MAX_BOITE);

            //Debug.Assert( m_nBox == nBoxNew);

            return true;
        }

        protected override short ComputeNBox(byte roundCount, byte outgoingCount)
        {
            short nBoxNew;
            if (roundCount != 0 && outgoingCount != 0)
            {
                Debug.Assert(MIN_ROUND <= roundCount && roundCount <= MAX_ROUND);
                nBoxNew = (short)(iHautCol0((sbyte)(iColMinQ(outgoingCount) + roundCount)) + 1);	//iHautCol( nColNew + iCol( nQualNew -1) -1) +1;
            }
            else
            {
                nBoxNew = 0;
            }
            return nBoxNew;
        }
        #endregion Dimensions


        #region DrawType property
        DrawTypeEnum _DrawType;
        public DrawTypeEnum DrawType
        {
            get { return _DrawType; }
            set
            {
                //if (isTypePoule != (value == DrawTypeEnum.POULE || value == DrawTypeEnum.POULE_AR))
                //{
                //    //Efface les boites si poule et plus poule ou l'inverse
                //    _Boxes.Clear();
                //    RoundCount = 0;
                //    OutgoingCount = 0;
                //}

                Set(ref _DrawType, value, () => DrawType);
            }
        }

        [Flags]
        public enum DrawTypeEnum
        {
            NORMAL = 0,
            FINAL = 1
        }

        //public bool isTypeTableauFinal { get { return DrawType == DrawTypeEnum.FINAL; } }
        #endregion DrawType


        private bool isBox(short iBox)
        {
            return iBoxMin <= iBox && iBox <= iBoxMax;
        }


        public override IEnumerable<Box> GetBoxes()
        {
            short i;
            i = iBoxMin;
            for (; i <= iBoxMax; i++)
            {
                Box b = Boxes[i];
                if (b != null)
                {
                    yield return b;
                }
            }
        }

        //#region Matches collection
        //public ObservableCollection<Match> Matches { get; private set; }

        //void Matches_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        //{
        //    throw new NotImplementedException();
        //}
        //#endregion


        #region internal functions
        internal short iBoxMin { get { return iBasCol(iColMin); } }	// return OutgoingCount - 1;
        internal short iBoxMax { get { return (short)(m_nBox - 1); } }
        internal sbyte iColMin { get { return iColMinQ(OutgoingCount); } }
        internal sbyte iColMax { get { return iCol(iBoxMax); } }
        internal short iHautCol(sbyte col) { return iHautCol0(col); }
        internal short iBasColQ(sbyte col) { return iBasColQ(col, OutgoingCount); }
        internal short nInColQ(sbyte col) { return nInColQ(col, OutgoingCount); }
        internal short ADVERSAIRE1(short b) { return (short)((b << 1) + 2); }
        internal short ADVERSAIRE2(short b) { return (short)((b << 1) + 1); }
        #endregion internal functions


        #region static functions
        public static sbyte iCol(short i)
        {
            sbyte col;
            Debug.Assert(0 <= i && i < MAX_BOITE);
            col = -1;
            for (i++; i != 0; i >>= 1, col++) ;
            return col;
        }

        internal static sbyte iColEx(short i)	//Allow i==-1
        {
            sbyte col;
            Debug.Assert(-1 <= i && i < MAX_BOITE);
            col = -1;
            for (i++; i != 0; i >>= 1, col++) ;
            return col;
        }

        internal static short iHautCol0(sbyte col)
        {
            Debug.Assert(0 <= col && col <= MAX_ROUND + 1);
            return (short)((1 << (col + 1)) - 2);
        }

        internal static short iBasCol(sbyte col)
        {
            Debug.Assert(0 <= col && col <= MAX_ROUND + 1);
            return (short)((1 << col) - 1);
        }

        internal static short nInCol(sbyte col)
        {
            Debug.Assert(0 <= col && col <= MAX_ROUND + 1);
            return (short)(1 << col);
        }
        /*
        internal static short log2( DWORD x)
            {
            Debug.Assert(x>0);
            DWORD	dw = x;
            for (short i=-1; dw; dw >>= 1, i++);
            return i;
            }
        */
        internal static sbyte log2(short x)	//short log2( short x)
        {
            Debug.Assert(x > 0);
            short sh = x;
            sbyte i;
            for (i = -1; sh != 0; sh >>= 1, i++) ;
            return i;
        }

        internal static sbyte iColMaxQ(int nCol, short nQualifie)
        {
            Debug.Assert(2 <= nCol && nCol < MAX_ROUND + 1);
            Debug.Assert(1 <= nQualifie && nQualifie <= ((MAX_BOITE + 1) >> 2));
            return (sbyte)(iColEx((short)(nQualifie - 2)) + nCol);
        }

        internal static sbyte iColMinQ(short nQualifie)
        {
            Debug.Assert(1 <= nQualifie && nQualifie <= ((MAX_BOITE + 1) >> 2));
            return (sbyte)(iColEx((short)(nQualifie - 2)) + 1);
        }

        internal static short iBasColQ(sbyte col, short nQualifie)
        {
            Debug.Assert(0 <= col && col <= MAX_ROUND + 1);
            Debug.Assert(1 <= nQualifie && nQualifie <= nInCol(col));		//Debug.Assert(1<=nQualifie && nQualifie<=nInCol(col));
            return (short)(iHautCol0(col) - nInColQ(col, nQualifie) + 1);
        }

        internal static short nInColQ(sbyte col, short nQualifie)
        {
            Debug.Assert(0 <= col && col <= MAX_ROUND + 1);
            Debug.Assert(1 <= nQualifie && nQualifie <= nInCol(col));
            return (short)(nQualifie * nInCol((sbyte)(col - iColMinQ(nQualifie))));
        }

        internal static short iBoxMinQ(short nQualifie)
        {
            return iBasColQ(iColMinQ(nQualifie), nQualifie); 	// return OutgoingCount - 1;
        }

        internal static short iBoxMaxQ(int nCol, short nQualifie)
        {
            return iHautCol0(iColMaxQ(nCol, nQualifie));	//m_nBox - 1; 
        }

        internal static short exp2(byte c) { return (short)(1L << c); }

        internal static short iBoxPivotGauche(short iBox, short iPivot)
        {
            return (short)(iBox + iPivot * exp2((byte)log2((short)(iBox + 1))));
        }

        internal static short IMATCH(int i) { return (short)((i - 1) >> 1); }

        #endregion static
    }
}
