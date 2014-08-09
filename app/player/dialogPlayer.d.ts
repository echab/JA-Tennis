export interface DialogPlayerScope extends ng.IScope {
    title: string;
    player: models.Player;
    selection: ISelectionService;
    ranks: RankString[];
    categories: CategoryString[];
}
