import { CategoryFFTT } from './category';
import { LicenceFFTT } from './licence';
import { matchFormatsFFTT } from './matchFormat';
import { RankFFTT } from './rank';
import { RankingFFTT } from './ranking';
import { ScoreFFTT } from './score';
import { FFTTValidation } from './ffttValidation';
import type { DataType } from '../../domain/types';

const category = new CategoryFFTT();
const licence = new LicenceFFTT();
const rank = new RankFFTT();
const score = new ScoreFFTT();
const ranking = new RankingFFTT(score);

const dataType: DataType = {
    category,
    licence,
    matchFormat: matchFormatsFFTT,
    rank,
    score,
    ranking,
    validation: FFTTValidation,
};

export default dataType;