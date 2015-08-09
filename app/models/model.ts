namespace models {
    
    //model.ts and not model.d.ts because enum are exported nd generate sme js
 
    export enum DrawType { Normal, Final, PouleSimple, PouleAR }

    export enum GenerateType { None, Create, PlusEchelonne, PlusEnLigne, Mix }

    export enum ModelType { None, Tournament, Player, Event, Draw, Match, Box }

    export enum Mode { Build, Plan, Play, Lock }
}