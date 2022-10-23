import { createStore, produce } from "solid-js/store";
import { Box, Draw } from "../../domain/draw";
import { Player } from "../../domain/player";
import { DEFAULT_SLOT_LENGTH, TEvent, Tournament } from "../../domain/tournament";
import { groupFindQ } from "../../services/drawService";

// export interface Selection extends SelectionActions {
//     selection: SelectionItems,
// };

export interface SelectionItems {
    tournament: Tournament;
    event?: TEvent;
    draw?: Draw;
    box?: Box;
    boxQ?: Box;
    player?: Player;
}

const emptyTournament: Tournament = { id: '', info: { name: '', slotLength: DEFAULT_SLOT_LENGTH }, players: [], events: [] };

export const [selection, setSelection] = createStore<SelectionItems>({ tournament: emptyTournament });

export function selectTournament(tournament: Tournament) {
    update((sel) => {
        sel.tournament = tournament;
        sel.player = undefined;
        sel.event = undefined;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

// export function setTournament(tournamentSetter: (pred?: Tournament) => Tournament) {
//     update((sel) => {
//         sel.tournament = tournamentSetter(sel.tournament);
//     });
// }

export function selectPlayer(player?: Player): void {
    update((sel) => {
        sel.player = player;
    });
}

export function selectEvent(event?: TEvent): void {
    update((sel) => {
        sel.event = event;
        sel.draw = undefined;
        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

export function selectDraw(event: TEvent, draw?: Draw): void {
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = undefined;
        sel.boxQ = undefined;
    });
}

export function selectBox(event: TEvent, draw: Draw, box?: Box): void {
    update((sel) => {
        sel.event = event;
        sel.draw = draw;
        sel.box = box;
        sel.boxQ = box ? groupFindQ(event, draw, box) : undefined;
    });
}

export function update(fn: (original: SelectionItems) => void) {
    setSelection(produce(fn));
}

// export interface SelectionActions {
//     selectTournament(tournament?: Tournament): void;
//     selectPlayer(player?: Player) : void;
//     // selectTournament(tournament?: Signal<Tournament>): void;
//     // selectPlayer(player?: Signal<Player>) : void;
// };

// const SelectionContext = createContext<Selection>();

// export interface SelectionContextProps {
//     children: JSX.Element;
// }

// export function SelectionProvider(props: SelectionContextProps) {
//     const [selection, setSelection] = createStore<SelectionItems>({}); // TODO?
//     // const selection: SelectionItems = {};
//     // const setSelection = <T,>(member: keyof SelectionItems, value: () => T) => {
//     //     (selection[member] as any) = value();
//     // };

//     const value = {
//         selection,
//         selectTournament(tournament?: Tournament) {
//             // setSelection('tournament', (t) => tournament);
//             update((sel) => {
//                 sel.tournament = tournament;
//             });
//         },
//         selectPlayer(player?: Player) : void {
//             // setSelection('player', () => player);
//             update((sel) => {
//                 sel.player = player;
//             });
//         }
//     };

//     return (
//         <SelectionContext.Provider value={value}>
//             {props.children}
//         </SelectionContext.Provider>
//     );
// }

// export function useSelection(): Selection {
//     const context = useContext(SelectionContext)
//     if (!context) {
//         throw new Error('useSelection should be used into a <SelectionProvider> component');
//     }
//     return context;
// }
