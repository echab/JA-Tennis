interface DialogPlayerScope extends ng.IScope {
    title: string;
    player: models.Player;
    selection: Selection;
    ranks: RankString[];
    categories: CategoryString[];
}
