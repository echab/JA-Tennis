using System;

namespace JA_Tennis.Model
{
    [Flags]
    public enum SexeEnum    //BYTE	m_bSexe;	//0=H 1=F	Equipe/Double:4=HH 5=FF 6=HF
    {
        Homme = 0,
        Femme = 1,
        Mixte = 2,
        Equipe = 4,
        EquipeHomme = Equipe | Homme,
        EquipeFemme = Equipe | Femme,
        EquipeMixte = Equipe | Mixte
    }
}
