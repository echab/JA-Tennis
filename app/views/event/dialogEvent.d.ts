interface DialogEventScope extends ng.IScope {
    title: string;
    event: models.Event;
    selection: Selection;
    ranks: RankString[];
    categories: RankString[];
}
