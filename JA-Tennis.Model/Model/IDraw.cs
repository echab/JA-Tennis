using System.Collections.Generic;
using JA_Tennis.ComponentModel;
using System.Linq;

namespace JA_Tennis.Model
{
    public interface IDraw : IBindableBehaviors
    {
        IDraw Parent { get; }

        IDraw Precedent { get; set; }
        IDraw Suivant { get; set; }


        IEnumerable<MatchPlayer> MatchPlayers { get; }

        IEnumerable<Match> Matches { get; }

        #region ComingQualifiers collection
        IEnumerable<MatchPlayer> ComingQualifiers { get; }
        #endregion

        #region OutgoingQualifiers collection
        IEnumerable<Match> OutgoingQualifiers { get; }
        #endregion


        #region Ranks property
        Range<Rank> Ranks { get; }
        #endregion Ranks


        #region Dates property
        Range<DateHour> Dates { get; }
        #endregion Dates


        #region MatchFormat property
        MatchFormat MatchFormat { get; }
        #endregion MatchFormat

    }

    public static class IDrawHelper
    {
        public static Match FindOutgoingQualifier(this IDraw draw, int outgoingQualifier)   //FindQualifieSortant
        {
            return draw.Matches.SingleOrDefault(mm => mm.OutgoingQualifier == outgoingQualifier);
        }

        public static MatchPlayer FindSeedPlayer(this IDraw draw, ushort seedPlayer)    //FindTeteSerie
        {
            return draw.MatchPlayers.SingleOrDefault(mp => mp.SeededPlayer == seedPlayer);
        }

        public static MatchPlayer FindComingQualified(this IDraw draw, int iQualifie)    //FindQualifieEntrant
        {
            return draw.MatchPlayers.SingleOrDefault(mp => mp.ComingQualified == iQualifie);
        }

    }
}
