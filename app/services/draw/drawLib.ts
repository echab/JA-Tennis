module jat.service {

    var MAX_TETESERIE = 32,
        MAX_QUALIF = 32,
        QEMPTY = - 1;

    export class DrawLib {

        constructor(
            private services: jat.service.Services,
            private find: jat.service.Find,
            private rank: Rank,
            private guid: jat.service.Guid
            ) {
        }

        public newDraw(parent: models.Event, source?: models.Draw, after?: models.Draw): models.Draw {
            var draw: models.Draw = <any>{};
            if (angular.isObject(source)) {
                angular.extend(draw, source);
            }
            draw.id = draw.id || this.guid.create('d');
            delete (<any>draw).$$hashKey;   //remove angular id

            //default values
            draw.type = draw.type || models.DrawType.Normal;
            draw.nbColumn = draw.nbColumn || 3;
            draw.nbOut = draw.nbOut || 1;
            if (after) {
                draw._previous = after;
                //TODO? after._next = draw;
            }
            if (!draw.minRank) {
                draw.minRank = after && after.maxRank ? this.rank.next(after.maxRank) : 'NC';
            }
            if (draw.maxRank && this.rank.compare(draw.minRank, draw.maxRank) > 0) {
                draw.maxRank = draw.minRank;
            }

            draw._event = parent;
            return draw;
        }

        public initDraw(draw: models.Draw, parent: models.Event): void {
            draw._event = parent;

            draw.type = draw.type || 0;
            draw.nbColumn = draw.nbColumn || 0;
            draw.nbOut = draw.nbOut || 0;

            //init boxes
            if (!draw.boxes) {
                return;
            }
            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                var box = draw.boxes[i];
                this.initBox(box, draw);
            }
        }

        public newBox(parent: models.Draw, matchFormat?: string, position?: number): models.Box
        public newBox(parent: models.Draw, source?: models.Box, position?: number): models.Box
        public newBox(parent: models.Draw, source?: any, position?: number): models.Box {
            var box: models.Box = <any>{};
            if (angular.isObject(source)) {
                angular.extend(box, source);
                //box.id = undefined;
                //box.position= undefined;
            } else if (angular.isString(source)) {
                var match: models.Match = <models.Match>box;
                match.score = undefined;
                match.matchFormat = source;
            }
            if (angular.isNumber(position)) {
                box.position = position;
            }
            this.initBox(box, parent);
            return box;
        }

        public initBox(box: models.Box, parent: models.Draw): void {
            box._draw = parent;
            box._player = this.getPlayer(box);
        }

        //         public abstract nbColumnForPlayers(draw: models.Draw, nJoueur: number): number {
        //             return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
        //         }
        //         public getSize(draw: models.Draw): ISize {
        //             return this._drawLibs[draw.type].getSize(draw);
        //         }
        //         public computePositions(draw: models.Draw): IPoint[] {
        //             return this._drawLibs[draw.type].computePositions(draw);
        //         }
        //         public resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void {
        //             this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
        //         }
        // 
        //         public generateDraw(draw: models.Draw, generate: models.GenerateType, afterIndex: number): models.Draw[] {
        //             return this._drawLibs[draw.type].generateDraw(draw, generate, afterIndex);
        //         }

        refresh(draw: models.Draw): void {
            draw._refresh = new Date(); //force angular refresh
        }

        public updateQualif(draw: models.Draw): void {

            var drawLib = this.services.drawLibFor(draw);

            //retreive qualifIn box
            var qualifs: models.PlayerIn[] = [];
            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                var boxIn = <models.PlayerIn>draw.boxes[i];
                if (boxIn.qualifIn) {
                    qualifs.push(boxIn);
                }
            }

            tool.shuffle(qualifs);

            //remove old qualif numbers
            for (i = qualifs.length - 1; i >= 0; i--) {
                drawLib.setPlayerIn(qualifs[i], 0);
            }

            //assign new qualif number
            for (i = qualifs.length - 1; i >= 0; i--) {
                drawLib.setPlayerIn(qualifs[i], i + 1);
            }
        }

        public getPlayer(box: models.Box): models.Player {
            return this.find.byId(box._draw._event._tournament.players, box.playerId);
        }

        private groupBegin(draw: models.Draw): models.Draw {   //getDebut
            //return the first Draw of the suite
            var p = draw;
            while (p && p.suite) {
                if (!p._previous)
                    break;
                p = p._previous;
            }
            return p;
        }

        private groupEnd(draw: models.Draw): models.Draw { //getFin
            //return the last Draw of the suite
            var p = this.groupBegin(draw);
            while (p && p._next && p._next.suite)
                p = p._next;
            return p;
        }

        //** return the group of draw of the given draw (mainly for group of round robin). */
        public group(draw: models.Draw): models.Draw[] {
            var draws: models.Draw[] = [];
            var d = this.groupBegin(draw);
            while (d) {
                draws.push(d);
                d = d._next;
                if (d && !d.suite) {
                    break;
                }
            }
            return draws;
        }

        //** return the draws of the previous group. */
        public previousGroup(draw: models.Draw): models.Draw[] {	//getPrecedent
            var p = this.groupBegin(draw);
            return p && p._previous ? this.group(p._previous) : null;
        }

        //** return the draws of the next group. */
        public nextGroup(draw: models.Draw): models.Draw[] {	    //getSuivant
            var p = this.groupEnd(draw);
            return p && p._next ? this.group(p._next) : null;
        }

        //public setType(BYTE iType) {
        //    //ASSERT(TABLEAU_NORMAL <= iType && iType <= TABLEAU_POULE_AR);
        //    if ((m_iType & TABLEAU_POULE ? 1 : 0) != (iType & TABLEAU_POULE ? 1 : 0)) {

        //        //Efface les boites si poule et plus poule ou l'inverse
        //        for (; m_nBoite > 0; m_nBoite--) {
        //            delete draw.boxes[m_nBoite - 1];
        //            draw.boxes[m_nBoite - 1] = NULL;
        //        }
        //        m_nColonne = 0;
        //        m_nQualifie = 0;
        //    }

        //    m_iType = iType;
        //}

        public isCreneau(box: models.Match): boolean {
            return box && ('score' in box) && (!!box.place || !!box.date);
        }

        public findSeeded(origin: models.Draw | models.Draw[], iTeteSerie: number): models.PlayerIn {    //FindTeteSerie
            ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
            var group = angular.isArray(origin) ? <models.Draw[]>origin : this.group(<models.Draw>origin);
            for (var i = 0; i < group.length; i++) {
                var boxes = group[i].boxes;
                for (var j = 0; j < boxes.length; j++) {
                    var boxIn: models.PlayerIn = boxes[j];
                    if (boxIn.seeded === iTeteSerie) {
                        return boxIn;
                    }
                }
            }
            return null;
        }

        public groupFindPlayerIn(group: models.Draw[], iQualifie: number): models.PlayerIn {
            ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
            //var group = angular.isArray(group) ? <models.Draw[]>group : this.group(<models.Draw>group);
            for (var i = 0; i < group.length; i++) {
                var d = group[i];
                var drawLib = this.services.drawLibFor(d);
                var playerIn = drawLib.findPlayerIn(d, iQualifie);
                if (playerIn) {
                    return playerIn;
                }
            }
        }

        public groupFindPlayerOut(group: models.Draw[], iQualifie: number): models.Match {
            ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
            //var group = angular.isArray(origin) ? <models.Draw[]>origin : this.group(<models.Draw>origin);
            for (var i = 0; i < group.length; i++) {
                var d = group[i];
                var drawLib = this.services.drawLibFor(d);
                var boxOut = drawLib.findPlayerOut(d, iQualifie);
                if (boxOut) {
                    return boxOut;
                }
            }

            //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
            var outCount = 0;
            for (var i = 0; i < group.length; i++) {
                var d = group[i];
                if (d.type >= 2) {
                    outCount += d.nbOut;
                }
            }
            if (iQualifie <= outCount) {
                return <any> -2;    //TODO
            }
            return null;
        }

        public groupFindAllPlayerOut(origin: models.Draw | models.Draw[], hideNumbers?: boolean): number[] {   //FindAllQualifieSortant
            //Récupère les qualifiés sortants du tableau
            var group = angular.isArray(origin) ? <models.Draw[]>origin : this.group(<models.Draw>origin);
            if (group) {
                var a: number[] = [];
                for (var i = 1; i <= MAX_QUALIF; i++) {
                    if (this.groupFindPlayerOut(group, i)) {
                        a.push(hideNumbers ? QEMPTY : i);
                    }
                }
                return a;
            }
        }

        public findAllPlayerOutBox(origin: models.Draw | models.Draw[]): models.Match[] { //FindAllQualifieSortantBox
            //Récupère les qualifiés sortants du tableau
            var group = angular.isArray(origin) ? <models.Draw[]>origin : this.group(<models.Draw>origin);
            if (group) {
                var a: models.Match[] = [], m: models.Match;
                for (var i = 1; i <= MAX_QUALIF; i++) {
                    if (m = this.groupFindPlayerOut(group, i)) {
                        a.push(m);
                    }
                }
                return a;
            }
        }

        /**
          * Fill or erase a box with qualified in and/or player
          * setPlayerIn
          * 
          * @param box 
          * @param inNumber (optional)
          * @param player   (optional)
          */
        //         public setPlayerIn(box: models.PlayerIn, inNumber?: number, player?: models.Player): boolean {
        //             // inNumber=0 => enlève qualifié
        //             return this._drawLibs[box._draw.type].setPlayerIn(box, inNumber, player);
        //         }
        // 
        //         public setPlayerOut(box: models.Match, outNumber?: number): boolean { //setPlayerOut
        //             // iQualifie=0 => enlève qualifié
        //             return this._drawLibs[box._draw.type].setPlayerOut(box, outNumber);
        //         }
        // 
        //         public computeScore(draw: models.Draw): boolean {
        //             return this._drawLibs[draw.type].computeScore(draw);
        //         }

        // public boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box } {
        //     return this._drawLibs[match._draw.type].boxesOpponents(match);
        // }
    }

    function ASSERT(b: boolean, message?: string): void {
        if (!b) {
            debugger;
            throw message || 'Assertion is false';
        }
    }

    angular.module('jat.services.drawLib', ['jat.services.services', 'jat.services.find', 'jat.services.type', 'jat.services.guid'])
        .factory('drawLib', [
            'services',
            'find',
            'rank',
            'guid',
            (services: jat.service.Services,
                find: jat.service.Find,
                rank: Rank,
                guid: jat.service.Guid

                ) => {
                return new DrawLib(services, find, rank, guid);
            }]);
}