module models {

    export interface Tournament extends Model {
        
        id: string;

        info: TournamentInfo;

        players: Player[];

        events: Event[];

        places ?: string[];
    }

    export interface TournamentInfo {
        name: string;
    }
}