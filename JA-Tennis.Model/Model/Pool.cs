using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace JA_Tennis.Model
{
    public class Pool : DrawBase
    {
        #region Constants
        const byte MAX_COL_POULE = 22;
        #endregion


        #region Constructor
        public Pool()
            : this(null, null, 0, 0)
        { }

        public Pool(Tournament tournament, IDraw _event, byte outgoingCount, byte roundCount)
            : base(tournament, _event, outgoingCount, roundCount)
        {
        }
        #endregion Constructor


        #region PoolType property
        PoolTypeEnum _PoolType;
        public PoolTypeEnum PoolType
        {
            get { return _PoolType; }
            set
            {
                //if (isTypePoule != (value == PoolTypeEnum.POULE || value == PoolTypeEnum.POULE_AR))
                //{
                //    //Efface les boites si poule et plus poule ou l'inverse
                //    _Boxes.Clear();
                //    RoundCount = 0;
                //    OutgoingCount = 0;
                //}

                Set(ref _PoolType, value, () => PoolType);
            }
        }

        [Flags]
        public enum PoolTypeEnum
        {
            POULE = 2,
            POULE_AR = 3
        }

        //public bool isTypePouleAller { get { return PoolType == PoolTypeEnum.POULE; } }
        //public bool isTypePouleAllerRetour { get { return PoolType == PoolTypeEnum.POULE_AR; } }
        #endregion PoolType


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
                if (nRoundNew > RoundCount)
                {
                    //Décale vers la gauche
                    for (byte c = (byte)(RoundCount + 1); c >= 0; c--)
                    {
                        for (byte r = RoundCount; r >= 0; r--)
                        {
                            short b = IMATCH(r, c, RoundCount + 1);
                            short b2 = IMATCH(r + nRoundNew - RoundCount, c + nRoundNew - RoundCount, nRoundNew + 1);

                            //*Boxes[b2] = *Boxes[b];
                            //*Boxes[b] = Box(Boxes[b].FormatMatch());	//Effacement ancienne box
                            Box box = Boxes[b];
                            Boxes.Remove(b);
                            box.Position = b2;
                            Boxes.Add(box);
                        }
                    }
                    //for( r=(nRoundNew+1); r>(RoundCount + 1); r--) {
                    //	short b2 = IMATCH( (nRoundNew+1) - r, nRoundNew+1, nRoundNew+1);
                    //	*Boxes[ b2] = Box( Boxes[ b].FormatMatch());	//Effacement ancienne box
                    //}

                }
                m_nBox = nBox;

            }
            else if (m_nBox > nBoxNew)
            {

                //Décale les boxes

                if (nRoundNew < RoundCount)
                {
                    //Décale vers la droite
                    for (byte c = 0; c <= nRoundNew + 1; c++)
                    {
                        for (byte r = 0; r < nRoundNew + 1; r++)
                        {
                            short b = IMATCH(r, c, nRoundNew + 1);
                            short b2 = IMATCH(r + RoundCount - nRoundNew, c + RoundCount - nRoundNew, RoundCount + 1);
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

            base.SetDimension( nRoundNew, nQualNew,fm,oldDraw);


            //short b;
            //
            ////Colonne de gauche
            //for (b = iBasColQ((sbyte)(_RoundCount + 1)); b <= iBoxMax; b++)
            //{
            //    Boxes[b].setCache(false);
            //}
            ////La grille
            //for (sbyte c = 0; c < _RoundCount + 1; c++)
            //{
            //    //Matches retour
            //    for ( b = iBasColQ((sbyte)c); b < c * (_RoundCount + 2); b++)
            //    {
            //        Boxes[b].setCache(isTypePouleAller);
            //    }

            //    //Diagonale
            //    Boxes[b++].setCache(true);

            //    //Matches aller
            //    for (; b <= iHautCol(c); b++)
            //    {
            //        Boxes[b].setCache(false);
            //    }
            //}

            //CalculeScore((CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());


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

            if (nRoundNew + 1 != 0)
            {
                nBoxNew = iBoxMax - ((nRoundNew + 1) * (nRoundNew + 2));
                if (nBoxNew < 0)
                    nBoxNew = 0;
            }
            else
                nBoxNew = 0;

            Debug.Assert(0 <= nBoxNew && nBoxNew <= MAX_BOITE);

            //Debug.Assert( m_nBox == nBoxNew);

            return true;
        }

        protected override short ComputeNBox(byte roundCount, byte outgoingCount)
        {
            short nBoxNew;

            if (roundCount != 0)
            {
                Debug.Assert(MIN_ROUND <= roundCount && roundCount - 1 <= MAX_COL_POULE);
                nBoxNew = (short)((roundCount + 1) * ((roundCount + 1) + 1));
            }
            else
            {
                nBoxNew = 0;
            }

            return nBoxNew;
        }
        #endregion Dimensions


        public override IEnumerable<Box> GetBoxes()
        {
            short i;
            i = iBasColQ((sbyte)(RoundCount + 1));
            for (; i <= iBoxMax; i++)
            {
                Box b = Boxes[i];
                if (b != null)
                {
                    yield return b;
                }
            }
        }


        //TODO: public static short GeneratePoule( IDraw parent, short iTableau, IEnumerable<Player> pJoueur, Draw tableau)
        //{
        //    Debug.Assert( 0 <= iTableau && iTableau <= m_nTableau);
        //    Debug.Assert( 0 <= nJoueur && nJoueur < (MAX_JOUEUR >>1));

        //    short n, t, j, b;

        //    n = (nJoueur + (tableau.GetnColonne() -1)) / tableau.GetnColonne();

        //    if( n==0) {
        //        n = 1;
        //    }

        //    if( (m_nTableau + n) >= MAX_TABLEAU) {
        //        AfxMessageBox( IDS_ERR_MAX_TABLEAU);
        //        return 0;
        //    }

        //    //Créé les poules
        //    for( t=0; t<n; t++) {

        ////		if( (t + (tableau.GetnColonne() -1) * n) >= nJoueur)
        ////			tableau.SetDimension( tableau.GetnColonne() -1, tableau.GetnQualifie());

        //        if (!InsertTableau( iTableau + t, tableau))
        //            return t;

        //        CTableau* pT = m_pTableau[ iTableau + t];

        ////#ifdef WITH_SUITE
        //        pT->setSuite( t>0);
        ////#endif //WITH_SUITE

        //        for( b=pT->GetnColonne() -1; b>=0 && nJoueur; b--) {

        //            j = t + (pT->GetnColonne() - b -1) * n;

        //            if( j >= nJoueur)
        //                break;

        //            if( pJoueur[ j] < 0) {
        ////#ifdef WITH_QEMPTY
        //                if( pJoueur[ j] == QEMPTYBIS) {
        //                    if( !pT->SetQualifieEntrant( pT->ADVERSAIRE1( b), EmptyQualified) )
        //                        return t;
        //                } else
        ////#endif	//WITH_QEMPTY
        //                if( !pT->SetQualifieEntrant( pT->ADVERSAIRE1( b), -pJoueur[ j]) )
        //                    return t;
        //            } else {
        //                if( !pT->MetJoueur( pT->ADVERSAIRE1( b), pJoueur[ j]) )
        //                    return t;
        //            }
        //        }

        //        //Ajoute 1 tête de série
        //        pT->SetTeteSerie( pT->ADVERSAIRE1( pT->GetnColonne() -1), t +1);
        //    }

        //    return n; 
        //}




        #region internal functions
        internal short iBoxMin { get { return (short)0; } }	// return m_nQualifie - 1;
        internal short iBoxMax { get { return (short)(m_nBox - 1); } }
        internal sbyte iColMin { get { return (sbyte)0; } }
        internal sbyte iColMax { get { return (sbyte)RoundCount; } }
        internal short iHautCol(sbyte col) { return (short)((RoundCount + 1) * (col + 1) - 1); }
        internal short iBasColQ(sbyte col) { return (short)((RoundCount + 1) * col); }
        internal short nInColQ(sbyte col) { return (short)(RoundCount + 1); }
        internal short ADVERSAIRE1(short b) { return (short)(b % (RoundCount + 1) + (RoundCount + 1) * (RoundCount + 1)); }
        internal short ADVERSAIRE2(short b) { return (short)(b / (RoundCount + 1) + (RoundCount + 1) * (RoundCount + 1)); }
        internal int iDiagonale(int b) { return (b % (RoundCount + 1)) * (RoundCount + 2); }
        internal bool isGauchePoule(int b) { return (b >= ((RoundCount + 1) * (RoundCount + 1))); }
        #endregion internal functions


        #region static functions

        internal static short IMATCH(int row, int col, int nCol) { return (short)((col * nCol) + row); }

        #endregion static
    }
}
