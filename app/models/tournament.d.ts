declare namespace models {

    export interface Tournament {

        id: string;

        info: TournamentInfo;

        players: Player[];

        events: Event[];

        places?: string[];

        _url?: string;

        _dayCount?: number;
        _day?: Match[][]; //list of matches by day
    }

    export interface TournamentInfo {
        name: string;

        start?: Date;
        end?: Date;

        slotLength?: number;
    }
}