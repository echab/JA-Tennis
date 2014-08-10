declare module models {
    export interface Box extends Model {
        id: string;
        position: number;

        hidden?: boolean;
        locked?: boolean;

        playerId: string;
        _player ?: Player;

        //Planning
        receive ?: boolean;
        aware ?: boolean;

        _draw ?: Draw;
    }
}
