interface ScoreString extends String { }

interface ServiceScore {
    isValid(score: ScoreString): boolean;
}