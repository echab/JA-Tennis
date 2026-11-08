import { selection, setSelection } from "../components/util/selection";
import type { Place, Slot, Tournament } from "../domain/tournament";
import { DAYS } from "../utils/date";
import { drawLib } from "./draw/drawLib";
import { isMatch } from "./drawService";
import type { Command } from "./util/commandManager";

const MAX_JOUR = 42;
const MAX_TIME = MAX_JOUR * DAYS;

export function updatePlace(place: Place): Command {
    const prev = selection.place && { ...selection.place };

    const act = () => {
        //TODO setTournament((t) => {});
        setSelection((sel) => {
            sel.place = place;
        });
    };
    act();

    const undo = () => setSelection((sel) => {
        sel.place = prev;
    });

    return { name: 'Update place', act, undo };
}

/**
 * Day index of the date relative to the start and end dates.
 * @returns the index or `NaN` if out of range
 */
export function dayOf(date: Date | undefined, { start, end }: { start?: Date, end?: Date }): number {
    if (!date || !start || !end) {
        return NaN;
    }
    const d = date.getTime();
    if (!(start <= date && date <= end && d <= start.getTime() + MAX_TIME)) {
        return NaN;
    }
    return Math.floor((d - start.getTime()) / DAYS);
}

export function matchesOfTheDay(tournament: Tournament, day: number): Slot[] {
    const { start, end } = tournament.info;

    if (!start || !end || start > end) {
        return [];
    }

    const dayCount = Math.floor((end.getTime() - start.getTime()) / DAYS + 1);
    if (day < 0 || dayCount < day) {
        return [];
    }

    const result: Slot[] = [];

    for (const event of tournament.events) {
        for (const draw of event.draws) {
            const lib = drawLib(event, draw);
            for (const match of draw.boxes) {
                if (isMatch(match) && match.date) {
                    const d = dayOf(match.date, tournament.info);
                    if (isFinite(d) && day === d) {
                        const { player1, player2 } = lib.boxesOpponents(match);
                        result.push({ event, draw, match, player1, player2 });
                    }
                }
            }
        }
    }
    result.sort(bySlotTime);

    return result;
}

export function bySlotTime(a: Slot, b: Slot): number {
    const t1 = a.match.date?.getTime(), t2 = b.match.date?.getTime();
    return t1 && t2
        ? t2 - t1
        : t1 ? 1 : t2 ? -1 : 0;
}
