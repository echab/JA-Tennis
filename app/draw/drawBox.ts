'use strict';
module jat.draw {

    interface BoxAttributes extends ng.IAttributes {
        drawBox: string;
        pos: string;
    }

    class boxCtrl {

        box: models.Box;
        isMatch: boolean;
        player: models.Player;
        pos: IPosition;
        played: boolean;

        constructor(
            private find: jat.service.Find
            ) {
        }

        getPlayer(id: string): models.Player {
            if (this.box && this.box._draw) {
                return <models.Player>this.find.byId(this.box._draw._event._tournament.players, id);
            }
        }
    }

    function drawBoxDirective() {
        return {
            restrict: 'EA',
            scope: true,
            templateUrl: 'draw/drawBox.html',
            controller: boxCtrl,
            controllerAs: 'ctrlBox',
            link: (scope: ng.IScope, element: JQuery, attrs: BoxAttributes, ctrlBox: boxCtrl) => {

                scope.$watch(attrs.drawBox, (box: models.Box) => {
                    ctrlBox.box = box;
                    ctrlBox.player = box ? ctrlBox.getPlayer(box.playerId) : undefined;
                    ctrlBox.isMatch = box && "score" in box; //isMatch();
                    ctrlBox.played = ctrlBox.isMatch && !!(<models.Match>box).score;
                });

                scope.$watch(attrs.pos, (pos: IPosition) => {
                    ctrlBox.pos = pos;
                });
            }
        };
    }

    angular.module('jat.draw.box', ['jat.services.find'])
        .directive('drawBox', drawBoxDirective);
} 