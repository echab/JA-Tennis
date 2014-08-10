declare module models {

    export enum DrawType { Normal, Final, PouleSimple, PouleAR }

    export interface Draw extends Model {
        id: string; //new draw has no id

        name: string;

        type: DrawType;   //Normal, Final, Poule simple, Poule aller/retour

        suite?: boolean;

        minRank: string;
        maxRank: string;

        //nbEntry: number;
        nbColumn: number;
        nbOut: number;

        orientation?: number;    //Default, Portrait, Landscape

        //matches: Match[];
        boxes: Box[];

        locked?: boolean;

        //group/suite
        _previous?: models.Draw;
        _next?: models.Draw;

        _event?: Event;
        _refresh?: Date; //force angular refresh //TODO?
    }
}
