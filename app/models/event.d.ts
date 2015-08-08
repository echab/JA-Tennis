declare namespace models {

    export interface Event {

        id: string;

        name: string;

        typeDouble ?: boolean;
        sexe: string;

        category: CategoryString;
        maxRank: RankString;

        consolation ?: boolean;

        start?: Date;
        end?: Date;

        matchFormat ?: string;    //FFT extent

        color ?: string;

        draws: Draw[];

        _tournament ?: Tournament;
    }
}
