import { categoryFFT } from './category';
import { LicenceFFT } from './licence';
import { MatchFormatsFFT } from './matchFormat';
import { RankFFT } from './rank';
import { RankingFFT } from './ranking';
import { ScoreFFT } from './score';
import { FFTValidation } from './fftValidation';
import type { DataType } from '../../domain/types';

const licence = new LicenceFFT();
const matchFormat = new MatchFormatsFFT();
const rank = new RankFFT();
const score = new ScoreFFT();
const ranking = new RankingFFT(score);

const dataType: DataType = {
    category: categoryFFT,
    licence,
    matchFormat,
    rank,
    score,
    ranking,
    validation: FFTValidation,
};

export default dataType;