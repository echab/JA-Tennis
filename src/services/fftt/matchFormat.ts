import type { MatchFormats, MatchFormat } from "../../domain/types";

const _matchFormats: MatchFormat[] = [
    { code:'A', name: 'A - 3 sets en 21 points' },
    { code:'B', name: 'B - 3 sets en 11 points' },
    { code:'C', name: 'C - 5 sets en 11 points' },
];

export const matchFormatsFFTT: MatchFormats = {
    list(): MatchFormat[] {
        return _matchFormats;
    }
}