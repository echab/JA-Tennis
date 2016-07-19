import  { CategoryFFT } from './fft/category';
import  { LicenceFFT } from './fft/licence';
import  { MatchFormatsFFT } from './fft/matchFormat';
import  { RankFFT } from './fft/rank';
import  { RankingFFT } from './fft/ranking';
import  { ScoreFFT } from './fft/score';
import { FFTValidation } from './fft/fftValidation';
import { Validation } from './validation';

export var category : Category = new CategoryFFT();
export var licence : Licence = new LicenceFFT();
export var matchFormat : MatchFormats = new MatchFormatsFFT();
export var rank : Rank = new RankFFT();
export var score : Score = new ScoreFFT();
export var ranking : Ranking = new RankingFFT(score);
export var validation : Validation = new FFTValidation();
