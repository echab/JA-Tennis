declare namespace models {
    
    export interface Match extends Box {

        //winner: number; //1 or 2 (or undefined)
        score: ScoreString;  //a match is a box with a score member
        wo?: boolean;
        qualifOut?: number;

        canceled?: boolean;
        vainqDef?: boolean; //TODO english

        //Planning
        place: string;
        date: Date;

        matchFormat: string;    //FFT extent

        note?: string;

        _player1: Player;    //TODO for planning and dialog match
        _player2: Player;
    }
}
