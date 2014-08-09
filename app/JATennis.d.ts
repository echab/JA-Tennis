interface RankString extends String {
}
interface RankGroupString extends String {
}
interface ServiceRank {
    list(): RankString[];
    isValid(rank: RankString): boolean;
    next(rank: RankString): RankString;
    previous(rank: RankString): RankString;
    compare(rank1: RankString, rank2: RankString): number;
    groups(): RankGroupString[];
    groupOf(rank: RankString): RankGroupString;
}
interface CategoryString extends String {
}
interface ServiceCategory {
    currentYear: number;
    list(): CategoryString[];
    isValid(category: CategoryString): boolean;
    ofDate(date: Date): CategoryString;
    getAge(date: Date): number;
    compare(category1: CategoryString, category2: CategoryString): number;
}
interface MatchFormatCategory {
    list(): any;
}
interface ScoreString extends String {
}
interface ServiceScore {
    isValid(score: ScoreString): boolean;
}
interface ServiceLicence {
    isValid(licence: string): boolean;
}
interface ListEventsScope extends MainScope {
    events: models.Event[];
}
interface DrawScope extends ng.IScope {
    draw: models.Draw;
    ranks: RankString[];
    width: number;
    height: number;
    getPosition(position: number): MatchPosition;
    getPlayer(id: string): models.Player;
    filterPlayer(player: models.Player, index: number): any;
    getMatch(position: number): models.Match;
}
interface MatchScope extends DrawScope, MatchPosition {
    position: number;
    match: models.Match;
    player1: models.Player;
    player2: models.Player;
    player: models.Player;
}
interface InPlayerScope extends MatchScope {
    $index: number;
}
interface MatchPosition {
    x: number;
    y: number;
}
interface DialogDrawScope extends ng.IScope {
    title: string;
    draw: models.Draw;
    selection: ISelectionService;
    ranks: RankString[];
    categories: RankString[];
}
interface DialogEventScope extends ng.IScope {
    title: string;
    event: models.Event;
    selection: ISelectionService;
    ranks: RankString[];
    categories: RankString[];
}
interface DialogMatchScope extends ng.IScope {
    title: string;
    match: models.Match;
    player1Id: string;
    player2Id: string;
    player1: models.Player;
    player2: models.Player;
    places: string[];
    matchFormats: any;
}
interface DialogPlayerScope extends ng.IScope {
    title: string;
    player: models.Player;
    selection: ISelectionService;
    ranks: RankString[];
    categories: CategoryString[];
}
declare module models {
    interface Model {
    }
    function copy(source: any, destination?: any);
}
declare module models {
    class Box implements models.Model {
        public id: string;
        public position: number;
        public playerId: string;
        public receive: boolean;
        public aware: boolean;
        public _draw: models.Draw;
        static init(box: Box, parent: models.Draw): void;
        public getPlayer(): models.Player;
    }
}
declare module models {
    class PlayerIn implements models.Box {
        public id: string;
        public position: number;
        public playerId: string;
        public receive: boolean;
        public aware: boolean;
        public _draw: models.Draw;
        public qualifIn: number;
        constructor(parent: models.Draw, data?: any);
        public getPlayer(): models.Player;
    }
}
interface IMatchPosition {
    x: number;
    y: number;
}
interface IScopeDraw extends ng.IScope {
    draw: models.Draw;
    width: number;
    height: number;
    positions: IMatchPosition[];
    getPlayer(id: string): models.Player;
}
interface IScopeBox extends ng.IScope {
    position: Number;
    player: models.Player;
    box: models.Box;
    playerIn: models.PlayerIn;
    match: models.Match;
    x: number;
    y: number;
}
interface MainScope extends ng.IScope {
    selection: ISelectionService;
    undo: IUndoService;
    addPlayer(player: models.Player): void;
    editPlayer(player: models.Player): void;
    removePlayer(player: models.Player): void;
    addEvent(event: models.Event): void;
    editEvent(event: models.Event): void;
    removeEvent(event: models.Event): void;
    addDraw(event: models.Event, draw: models.Draw): void;
    editDraw(event: models.Event, draw: models.Draw): void;
    removeDraw(event: models.Event, draw: models.Draw): void;
    editMatch(match: models.Match): void;
}
interface ListPlayersScope extends MainScope {
    players: models.Player[];
}
interface ISelectionService {
    tournament: models.Tournament;
    event: models.Event;
    draw: models.Draw;
    match: models.Match;
    player: models.Player;
}
declare module models {
    class Event implements models.Model {
        public id: string;
        public name: String;
        public typeDouble: boolean;
        public sexe: String;
        public category: String;
        public maxRank: String;
        public consolation: boolean;
        public start: Date;
        public end: Date;
        public matchFormat: String;
        public color: String;
        public draws: models.Draw[];
        public _tournament: models.Tournament;
        constructor(parent: models.Tournament, data?: any);
        static init(me: Event, parent: models.Tournament): void;
    }
}
declare module models {
    class Draw implements models.Model {
        public id: string;
        public name: String;
        public type: String;
        public suite: boolean;
        public minRank: string;
        public maxRank: string;
        public nbEntry: number;
        public nbColumn: number;
        public nbOut: number;
        public orientation: number;
        public boxes: models.Box[];
        public _event: models.Event;
        constructor(parent: models.Event, data?: any);
        static init(draw: Draw, parent: models.Event): void;
    }
}
declare module models {
    class Match implements models.Box {
        public id: string;
        public position: number;
        public playerId: string;
        public receive: boolean;
        public aware: boolean;
        public _draw: models.Draw;
        public score: String;
        public wo: boolean;
        public qualifOut: number;
        public canceled: boolean;
        public vainqDef: boolean;
        public place: string;
        public date: Date;
        public matchFormat: String;
        public note: string;
        constructor(parent: models.Draw, data?: any);
        public getPlayer(): models.Player;
    }
}
interface IMathService {
    column(pos: number): number;
    columnMin(nQ: number): number;
    columnMax(nCol: number, nQ?: number): number;
    countInCol(col: number, nQ?: number): number;
    positionTopCol(col: number): number;
    positionBottomCol(col: number, nQ: number): number;
    positionMin(nQ: number): number;
    positionMax(nCol: number, nQ?: number): number;
    positionOpponent(pos: number): number;
    positionOpponent1(pos: number): number;
    positionOpponent2(pos: number): number;
    positionMatch(pos: number): number;
    seedColumn(pos: number, nCol: number): number;
    seedRow(pos: number, nCol: number): number;
    seedPositionOpponent1(pos: number, nCol: number): number;
    seedPositionOpponent2(pos: number, nCol: number): number;
    isMatch(box: models.Box): boolean;
    box1(match: models.Match): models.Box;
    player1(match: models.Match): models.Player;
    box2(match: models.Match): models.Box;
    player2(match: models.Match): models.Player;
}
interface IFindService {
    indexOf<T>(array: T[], member: string, value: any, error?: string): number;
    by<T>(array: T[], member: string, value: any, error?: string): T;
    byId<T>(array: T[], value: any, error?: string): T;
}
interface IUndoService {
    reset(): void;
    action(fnDo: () => void, fnUndo: () => void, message: string): void;
    update(obj: any[], member: number, value: any, message: string): void;
    update(obj: Object, member: string, value: any, message: string): void;
    insert(obj: any[], member: number, value: any, message: string): void;
    insert(obj: Object, member: string, value: any, message: string): void;
    remove(obj: any[], member: number, message: string): void;
    remove(obj: Object, member: string, message: string): void;
    splice(obj: any[], index: number, howmany: number, itemX: any, message: string): void;
    newGroup(message: string, fnGroup?: () => void): void;
    endGroup(): void;
    cancelGroup(): void;
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    messageUndo(): string;
    messageRedo(): string;
    setMaxUndo(v: number): void;
    toString(): string;
}
interface IUndoAction {
    type: number;
    fnDo? (): void;
    fnUndo? (): void;
    obj?: any;
    index?: number;
    message: string;
    howmany?: number;
    values?: any;
    member?: string;
    value?: any;
    stack?: IUndoAction[];
}
declare module models {
    class Player implements models.Model {
        public id: string;
        public name: String;
        public surname: String;
        public sexe: String;
        public birth: Date;
        public club: String;
        public licence: String;
        public nationality: String;
        public external: boolean;
        public assimilated: boolean;
        public rank: String;
        public rank2: String;
        public registration: String[];
        public solde: Number;
        public adress1: String;
        public adress2: String;
        public zipCode: String;
        public city: String;
        public phone1: String;
        public phone2: String;
        public email: String;
        public players: Player[];
        public comment: String;
        private _tournament;
        constructor(parent: models.Tournament, data?: any);
        static init(me: Player, parent: models.Tournament): void;
    }
}
declare module models {
    class Tournament implements models.Model {
        public info: TournamentInfo;
        public players: models.Player[];
        public events: models.Event[];
        public places: string[];
        constructor(data?: any);
        static init(me: Tournament): void;
    }
    class TournamentInfo {
        public name: String;
    }
}
