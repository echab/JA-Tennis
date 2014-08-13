declare module models {

    export interface Tournament extends Model {

        id: string;

        info: TournamentInfo;

        players: Player[];

        events: Event[];

        places?: string[];

        _url?: string;

        _dayCount?: number;
        _day?: models.Match[][]; //list of matches by day
    }

    export interface TournamentInfo {
        name: string;

        start?: Date;
        end?: Date;

        slotLength?: number;
    }
}