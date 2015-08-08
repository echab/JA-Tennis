declare namespace models {
    
    export interface Box {
        id: string;
        position: number;

        hidden?: boolean;
        locked?: boolean;

        playerId: string;
        _player?: Player;

        //Planning
        receive?: boolean;
        aware?: boolean;

        _draw?: Draw;
        _x?: number;
        _y?: number;
    }
}
