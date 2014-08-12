declare module mock {

    interface Math {
        random(): number;
        randomReturns(values: number[]): void;
    }
} 