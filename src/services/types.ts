//TODO implement as a configurable feature
// import('./fft');

import { Category, Licence, MatchFormats, Rank, Ranking, Score } from "../domain/types";
import { CategoryFFT } from "./fft/category";
import { LicenceFFT } from "./fft/licence";
import { MatchFormatsFFT } from "./fft/matchFormat";
import { RankFFT } from "./fft/rank";
import { RankingFFT } from "./fft/ranking";
import { ScoreFFT } from "./fft/score";
import { FFTValidation } from "./fft/fftValidation";
import { ValidationService } from "./validationService";

export const category: Category = new CategoryFFT();
export const licence: Licence = new LicenceFFT();
export const matchFormat: MatchFormats = new MatchFormatsFFT();
export const rank: Rank = new RankFFT();
export const score: Score = new ScoreFFT();
export const ranking: Ranking = new RankingFFT(score);
export const validation: ValidationService = new FFTValidation();
