declare module models {
    export interface Match extends Box {

        //winner: number; //1 or 2 (or undefined)
        score: string;  //a match is a box with a score member
        wo ?: boolean;
        qualifOut ?: number;

        canceled ?: boolean;
        vainqDef ?: boolean; //TODO english

        //Planning
        place: string;
        date: Date;

        matchFormat: string;    //FFT extent

        note ?: string;
    }
}
