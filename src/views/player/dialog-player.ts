
export class DialogPlayer {

    ranks: RankString[];
    categories: CategoryString[];

    static $inject = [
        'title',
        'player',
        'events',
        'rank',
        'category'
    ];

    constructor(
        private title: string,
        private player: Player,
        private events: TEvent[],
        rank: Rank,
        category: Category
        ) {

        this.ranks = rank.list();
        this.categories = category.list();
    }
}