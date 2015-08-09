interface MatchFormat {
    code: string;
    name: string;
    duration?: number;
}

interface MatchFormats {
    list(): { [code: string]: MatchFormat };
}