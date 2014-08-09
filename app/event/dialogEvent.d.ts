export interface DialogEventScope extends ng.IScope {
    title: string;
    event: models.Event;
    selection: ISelectionService;
    ranks: RankString[];
    categories: RankString[];
}
