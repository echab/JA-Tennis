import { Category, Licence, MatchFormats, Rank, Ranking, Score } from "../domain/types";
import { addValidator } from "./validationService";

//TODO implement as a configurable feature
import typ from "./fft";

// const typ = await import('./fft').then(mod => mod.default);

// let p: Promise<{default:any}>;
// const [typ] = createResource(() => (p || (p = import('./fft'))).then(mod => mod.default));

export const category: Category = new typ.Category();
export const licence: Licence = new typ.Licence();
export const matchFormat: MatchFormats = new typ.MatchFormats();
export const rank: Rank = new typ.Rank();
export const score: Score = new typ.Score();
export const ranking: Ranking = new typ.Ranking(score);

addValidator(typ.Validation);
