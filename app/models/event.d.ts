declare module models {

    export interface Event extends Model {

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
