
using System;
namespace JA_Tennis.Model
{
    [Flags]
    public enum MatchFormats
    {
        Unknown = 0,
        NoAd = 1,
        SetQuatreJeux = 2,
        JeuDecisifDernierSet = 4,
        NoLet = 8,
        CinqSets = 16
    }

    public class MatchFormat
    {
        public MatchFormats Format {get;set;}
    }
}
