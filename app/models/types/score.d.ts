interface ScoreString extends String { }

interface Score {
    isValid(score: ScoreString): boolean;
}