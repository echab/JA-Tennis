module jat.service {

    var MIN_COL = 0,
        MAX_COL_POULE = 22,
        MAX_JOUEUR = 8191,
        MAX_TABLEAU = 63,
        QEMPTY = - 1;

    export class RoundrobinLib implements IDrawLib {

        constructor(
            private drawLib: jat.service.DrawLib,
            private ranking: ServiceRanking,
            private find: Find
            ) {
            drawLib._drawLibs[models.DrawType.PouleSimple]
            = drawLib._drawLibs[models.DrawType.PouleAR]
            = this;
        }

        private findBox(draw: models.Draw, position: number, create?: boolean): models.Box {
            var box = this.find.by(draw.boxes, 'position', position);
            if (!box && create) {
                box = this.drawLib.newBox(draw, undefined, position);
            }
            return box;
        }

        public nbColumnForPlayers(draw: models.Draw, nJoueur: number): number {
            return nJoueur;
        }

        public boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box } {
            var n = match._draw.nbColumn;
            var pos1 = seedPositionOpponent1(match.position, n),
                pos2 = seedPositionOpponent2(match.position, n);
            return {
                box1: < models.Box > this.find.by(match._draw.boxes, 'position', pos1),
                box2: <models.Box> this.find.by(match._draw.boxes, 'position', pos2)
            }
        }

        public getSize(draw: models.Draw, dimensions: IDrawDimensions): ISize {

            if (!draw || !draw.nbColumn) {
                return { width: 10, height: 10 };
            }

            var n = draw.nbColumn;
            return {
                width: (n + 1) * (dimensions.boxWidth + dimensions.interBoxWidth) - dimensions.interBoxWidth,
                height: n * (dimensions.boxHeight + dimensions.interBoxHeight) - dimensions.interBoxHeight
            };
        }

        public computePositions(draw: models.Draw, dimensions: IDrawDimensions): IPosition[] {
            return;
        }

        public resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void {

            throw "Not implemnted";

            if (nJoueur) {
                throw "Not implemnted";
            }

            if (draw.nbColumn === oldDraw.nbColumn && draw.nbOut === oldDraw.nbOut) {
                return;
            }

            var isTypePouleAller: boolean = models.DrawType.PouleSimple === draw.type;
            //var isTypePouleAllerRetour: boolean = models.DrawType.PouleAR === draw.type;

            if (draw.nbColumn) {
                ASSERT(MIN_COL <= draw.nbColumn && draw.nbColumn <= MAX_COL_POULE);
                var nBoxNew = draw.nbColumn * (draw.nbColumn + 1);
            } else {
                nBoxNew = 0;
            }

            //var nBox: number = draw.boxes.length;
            //var posMax = nBox - 1;
            //var colMin = 0;
            //var colMax = draw.nbColumn - 1;
            //var posMin = 0;
            //var fm: string = undefined; //TODO

            //if (nBox < nBoxNew) {   //draw is taller

            //    //Allocate new boxes
            //    for (; nBox < nBoxNew; nBox++) {
            //        //ASSERT(draw.boxes[nBox] == NULL);
            //        if (oldDraw && nBox < oldDraw.boxes.length) {
            //            var box: models.Box = this.drawLib.newBox(draw, oldDraw.boxes[nBox]);
            //        } else {
            //            box = this.drawLib.newBox(draw, fm);
            //        }
            //        draw.boxes[nBox] = box;
            //    }

            //    //Shift the boxes
            //    if (draw.nbColumn > oldDraw.nbColumn) {
            //        //Décale vers la gauche
            //        for (var c = oldDraw.nbColumn; c >= 0; c--) {
            //            for (var r = oldDraw.nbColumn - 1; r >= 0; r--) {
            //                b = positionMatchPoule(r, c, oldDraw.nbColumn);
            //                var b2 = positionMatchPoule(r + draw.nbColumn - oldDraw.nbColumn, c + draw.nbColumn - oldDraw.nbColumn, draw.nbColumn);
            //                var match: models.Match = <models.Match>draw.boxes[b];
            //                draw.boxes[b2] = match;
            //                draw.boxes[b] = this.drawLib.newBox(draw, match.matchFormat);   //Effacement ancienne boite
            //            }
            //        }
            //    }

            //    //draw.boxes.length = nBox;

            //} else if (draw.boxes.length > nBoxNew) {   //draw is smaller

            //    //shift the boxes
            //    if (draw.nbColumn < oldDraw.nbColumn) {
            //        //shift to the right
            //        for (var c = 0; c <= draw.nbColumn; c++) {
            //            for (var r = 0; r < draw.nbColumn; r++) {
            //                b = positionMatchPoule(r, c, draw.nbColumn);
            //                var b2 = positionMatchPoule(r + oldDraw.nbColumn - draw.nbColumn, c + oldDraw.nbColumn - draw.nbColumn, oldDraw.nbColumn);
            //                draw.boxes[b] = draw.boxes[b2];
            //            }
            //        }
            //    }

            //    //remove the extra boxes
            //    //TODO var next = nextGroup(draw);
            //    while (draw.boxes.length > nBoxNew) {
            //        var last = draw.boxes.length - 1
            //        //ASSERT(draw.boxes[last]);
            //        //if (next) {
            //        //    var match = <models.Match>draw.boxes[last];
            //        //    if (match.qualifOut) {
            //        //        //TODO remove qualifIn in next group
            //        //        //SetQualifieSortant(last, 0);
            //        //    }
            //        //}
            //        delete draw.boxes[last];
            //        draw.boxes.length--;
            //    }
            //}

            //oldDraw.nbColumn = draw.nbColumn;
            //oldDraw.nbOut = draw.nbOut;

            ////left column
            //for (var b = positionBottomCol(oldDraw.nbColumn); b <= posMax; b++) {
            //    delete draw.boxes[b].hidden;
            //}
            ////the table
            //for (var c = 0; c < oldDraw.nbColumn; c++) {
            //    //Matches retour
            //    for (b = positionBottomCol(c); b < c * (oldDraw.nbColumn + 1); b++) {
            //        draw.boxes[b].hidden = isTypePouleAller;
            //    }

            //    //Diagonale
            //    draw.boxes[b++].hidden = true;

            //    //Matches aller
            //    for (; b <= positionTopCol(c); b++) {
            //        delete draw.boxes[b].hidden;
            //    }
            //}

            ////TODO CalculeScore((CDocJatennis*)((CFrameTennis*) AfxGetMainWnd()).GetActiveDocument());


            //draw.nbColumn = oldDraw.nbColumn;
            //draw.nbOut = oldDraw.nbOut;
        }

        public FindQualifieEntrant(draw: models.Draw, iQualifie: number): models.PlayerIn {

            ASSERT(iQualifie >= 0);
            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                var boxIn = <models.PlayerIn>draw.boxes[i];
                if (!boxIn) {
                    continue;
                }
                var e = boxIn.qualifIn;
                if (e === iQualifie || (!iQualifie && e)) {
                    return boxIn;
                }

            }

            if (draw._next && draw._next.suite) {
                return this.drawLib.FindQualifieEntrant(draw._next, iQualifie);
            }
        }

        public FindQualifieSortant(draw: models.Draw, iQualifie: number): models.Match {

            ASSERT(0 < iQualifie);

            if (iQualifie === QEMPTY) {
                return;
            }

            for (var i = 0; i < draw.boxes.length; i++) {
                var boxOut = <models.Match>draw.boxes[i];
                if (boxOut && boxOut.qualifOut === iQualifie) {
                    return boxOut;
                }
            }

            if (draw._next && draw._next.suite) {
                return this.drawLib.FindQualifieSortant(draw._next, iQualifie);
            }
        }

        public SetQualifieEntrant(box: models.Box, inNumber?: number, player?: models.Player): boolean { //setPlayerIn
            // inNumber=0 => enlève qualifié

            var draw = box._draw;
            //ASSERT(SetQualifieEntrantOk(iBoite, inNumber, iJoueur));
            var boxIn = <models.PlayerIn> box;

            if (inNumber) {	//Ajoute un qualifié entrant
                var prev: models.Draw = this.drawLib.prevGroup(draw);
                if (!player && prev && prev.boxes && inNumber != QEMPTY) {
                    //Va chercher le joueur dans le tableau précédent
                    var boxOut = this.drawLib.FindQualifieSortant(prev, inNumber);
                    if (angular.isObject(boxOut)) {	//V0997
                        player = boxOut._player;
                    }
                }

                if (boxIn.qualifIn) {
                    if (!this.SetQualifieEntrant(box)) {	//Enlève le précédent qualifié
                        ASSERT(false);
                    }
                }

                if (player) {
                    if (!this.drawLib.MetJoueur(box, player)) {
                        ASSERT(false);
                    }
                }

                //Qualifié entrant pas déjà pris
                if (inNumber == QEMPTY ||
                    !this.drawLib.FindQualifieEntrant(draw, inNumber)) {

                    this.SetQualifieEntrant(box, inNumber);
                }
            } else {	// Enlève un qualifié entrant

                boxIn.qualifIn = 0;

                if (this.drawLib.prevGroup(draw) && !this.drawLib.EnleveJoueur(box)) {
                    ASSERT(false);
                }
            }

            return true;
        }

        public SetQualifieSortant(box: models.Box, outNumber?: number): boolean { //setPlayerOut
            // outNumber=0 => enlève qualifié

            //ASSERT(SetQualifieSortantOk(iBoite, outNumber));

            var next = this.drawLib.nextGroup(box._draw);

            //TODOjs findBox()
            var diag = box._draw.boxes[iDiagonale(box)];
            var box1 = box._draw.boxes[ADVERSAIRE1(box._draw, box.position)];

            if (outNumber) {	//Ajoute un qualifié sortant
                var boxOut = <models.Match>box;
                //Met à jour le tableau suivant
                if (next && next.boxes && box.playerId && boxOut.qualifOut) {
                    var boxIn = this.drawLib.FindQualifieEntrant(box._draw, outNumber);
                    if (boxIn) {
                        ASSERT(boxIn.playerId === box.playerId);
                        if (!this.drawLib.EnleveJoueur(boxIn)) {
                            ASSERT(false);
                        }
                    }
                }

                //Enlève le précédent n° de qualifié sortant
                if (boxOut.qualifOut)
                    if (!this.SetQualifieSortant(boxOut)) {	//Enlève le qualifié
                        ASSERT(false);
                    }

                this.SetQualifieSortant(boxOut, outNumber);

                diag.playerId = box1.playerId;
                this.drawLib.initBox(diag, box._draw);

                if (next && box.playerId) {
                    //Met à jour le tableau suivant
                    var boxIn = this.drawLib.FindQualifieEntrant(next, outNumber);
                    if (boxIn) {
                        ASSERT(!boxIn.playerId);
                        if (!this.drawLib.MetJoueur(boxIn, box._player, true)) {
                            ASSERT(false);
                        }
                    }
                }

            } else {	//Enlève un qualifié sortant
                var match = <models.Match>box;
                if (next && box.playerId) {
                    //Met à jour le tableau suivant
                    var boxIn = this.drawLib.FindQualifieEntrant(next, match.qualifOut);
                    if (boxIn) {
                        ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                        if (!this.drawLib.EnleveJoueur(boxIn, true)) {
                            ASSERT(false);
                        }
                    }
                }

                delete match.qualifOut;

                diag.playerId = undefined;
                this.drawLib.initBox(diag, box._draw);
            }

            //#ifdef WITH_POULE
            //	if( isTypePoule())
            //		CalculeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());
            //#endif //WITH_POULE

            return true;
        }

        private GetJoueursTableau(draw: models.Draw): models.Player[] {

            //Récupère les joueurs du tableau
            var ppJoueur: models.Player[] = [];
            var draws = this.drawLib.groupDraws(draw);
            for (var j = 0; j < draws.length; j++) {
                var d = draws[j];
                var first = positionFirstIn(d.nbColumn),
                    last = positionLastIn(d.nbColumn);
                for (var b = last; b <= first; b++) {
                    var boxIn = <models.PlayerIn>this.findBox(d, b);
                    if (!boxIn) {
                        continue;
                    }
                    //Récupérer les joueurs et les Qualifiés entrants
                    if (boxIn.qualifIn) {
                        ppJoueur.push(<any>boxIn.qualifIn);	//no qualifie entrant
                    } else if (boxIn.playerId) {
                        ppJoueur.push(boxIn._player);	//a player
                    }
                }
            }

            return ppJoueur;
        }

        public generateDraw(draw: models.Draw, generate?: number): models.Draw[] {

            var oldDraws = this.drawLib.groupDraws(draw);
            var t = this.find.indexOf(draw._event.draws, 'id', oldDraws[0].id);

            //this.drawLib.resetDraw(draw, draw.nbColumn);

            var players = this.drawLib.GetJoueursInscrit(draw);

            //Tri et Mélange les joueurs de même classement
            this.drawLib.TriJoueurs(players);

            ////Delete previous tableau
            //draw._event.draws.splice(t, oldDraws.length);

            var draws = this.GeneratePoule(t, players, draw);

            ////replace previous draws by generated ones
            ////draw._event.draws.splice(t, oldDraws.length, draws);
            //var args: any[] = [t, oldDraws.length].concat( <any[]>draws);
            //Array.prototype.splice.apply(draw._event.draws, args);

            //for (var i = 0; i < draws.length; i++) {
            //    this.drawLib.initDraw(draws[i], draw._event);
            //}

            return draws;
        }

        private GeneratePoule(iTableau: number, players: models.Player[], oldDraw: models.Draw): models.Draw[] {
            var event = oldDraw._event;
            ASSERT(0 <= iTableau && iTableau <= event.draws.length);
            ASSERT(0 <= players.length && players.length < (MAX_JOUEUR >> 1));

            var nDraw = Math.floor((players.length + (oldDraw.nbColumn - 1)) / oldDraw.nbColumn);
            if (!nDraw) {
                nDraw = 1;
            }

            if ((event.draws.length + nDraw) >= MAX_TABLEAU) {
                throw ('Maximum oldDraw count is reached'); //TODOjs
                return;
            }

            var draws: models.Draw[] = [];

            //Créé les poules
            for (var t = 0; t < nDraw; t++) {

                if (t = 0) {
                    var draw = oldDraw;
                } else {
                    draw = this.drawLib.newDraw(event, oldDraw);
                    draw.id = oldDraw.id + t;    //TODOjs guid service
                    draw.suite = true;
                }
                draw.boxes = [];
                draw.name = oldDraw.name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');

                for (var i = draw.nbColumn - 1; i >= 0 && players.length; i--) {

                    var b = ADVERSAIRE1(draw, i);
                    var j = t + (draw.nbColumn - i - 1) * nDraw;

                    if (j >= players.length) {
                        break;
                    }

                    var boxIn = <models.PlayerIn>this.drawLib.newBox(draw, undefined, b);
                    draw.boxes.push(boxIn);

                    var qualif: number = 'number' === typeof players[j] ? <any>players[j] : 0;
                    if (qualif) {	//Qualifié entrant
                        if (!this.drawLib.SetQualifieEntrant(boxIn, qualif)) {
                            return;
                        }
                    } else if (!this.drawLib.MetJoueur(boxIn, players[j])) {
                        return;
                    }

                    //Append the matches
                    var diag = iDiagonalePos(draw.nbColumn, b);
                    for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                        if (b === diag || (b < diag && draw.type === models.DrawType.PouleSimple)) {
                            continue;
                        }
                        var match = <models.Match>this.drawLib.newBox(draw, undefined, b);
                        match.score = '';
                        draw.boxes.push(match);
                    }
                }

                //Ajoute 1 tête de série
                var boxT = <models.PlayerIn>this.findBox(draw, ADVERSAIRE1(draw, draw.nbColumn - 1));
                this.drawLib.SetTeteSerie(boxT, t + 1);

                draws.push(draw);
            }

            return draws;
        }

        //Calcul classement des poules
        public CalculeScore(draw: models.Draw): boolean {

            //TODO
            throw "Not implemented";

            var m_pOrdrePoule: ServiceRanking[];    //classement de chaque joueur de la poule

            //this.ranking.

            //for (var b = 0; b < draw.nbColumn; b++) {

            //    if (m_pOrdrePoule[b])
            //        m_pOrdrePoule[b].Release();	//V0997

            //    //		if( !m_pOrdrePoule[ b])
            //    m_pFactT.CreateObject(IID_OrdrePoule, (LPLPUNKNOWNJ) & m_pOrdrePoule[b]);
            //    ASSERT( m_pOrdrePoule[ b]);

            //    pB = boxes[ADVERSAIRE1(b)];
            //    pB.m_iClassement = 0;
            //    iPlace[b] = ADVERSAIRE1(b);	//v1.12.1	//(char)ADVERSAIRE1( b);	//b;	//(m_nColonne-1 - b);
            //}

            //if (!draw || !m_pOrdrePoule[0]) {
            //    return false;
            //}

            ////ASSERT(m_pFactT == pDoc.m_pFactD);

            //var e = draw._event;

            //for (var b = iBoiteMin(); b < iBasColQ(m_nColonne); b++) {

            //    if (isMatch(b) && isMatchJoue(b)) {
            //        bJoue = TRUE;

            //        ASSERT(!boxes[b].m_Score.isVainqDef());

            //        var v = ADVERSAIRE1(b);
            //        var d = ADVERSAIRE2(b);
            //        if (boxes[b].m_iJoueur != boxes[v].m_iJoueur) {
            //            v += d; d = v - d; v -= d;	//swap
            //        }
            //        //v: vainqueur  d:défait

            //        m_pOrdrePoule[v % draw.nbColumn].AddResultat(1, boxes[b].m_Score, boxes[b].FormatMatch());

            //        m_pOrdrePoule[d % draw.nbColumn].AddResultat(-1, boxes[b].m_Score, boxes[b].FormatMatch());

            //    }
            //}

            ////Calcul le classement
            //if (bJoue) {
            //    gpTableau = this;
            //    qsort( &iPlace, m_nColonne, sizeof(IBOITE), (int(__cdecl *)(const void *,const void *))compareScorePoule);	//v1.12.1
            //    gpTableau = NULL;

            //    for (b = 0; b < m_nColonne; b++) {
            //        boxes[iPlace[b]].m_iClassement = m_nColonne - (char) b;
            //    }
            //}

            return true;
        }
    }

    function ASSERT(b: boolean, message?: string): void {
        if (!b) {
            debugger;
            throw message || 'Assertion is false';
        }
    }

    function column(pos: number, nCol: number): number { //iColPoule
        return Math.floor(pos / nCol);
    }

    function row(pos: number, nCol: number): number { //iRowPoule
        return pos % nCol;
    }

    function positionFirstIn(nCol: number): number {
        return nCol * (nCol + 1);
    }
    function positionLastIn(nCol: number): number {
        return nCol * nCol + 1;
    }

    function seedPositionOpponent1(pos: number, nCol: number): number {    //POULE_ADVERSAIRE1
        return (pos % nCol) + (nCol * nCol);
    }

    function seedPositionOpponent2(pos: number, nCol: number): number {    //POULE_ADVERSAIRE2
        return Math.floor(pos / nCol) + (nCol * nCol);
    }


    function positionMatchPoule(row: number, col: number, nCol: number): number { //IMATCH
        return (col * nCol) + row;
    }

    function iDiagonale(box: models.Box): number {
        var n = box._draw.nbColumn;
        return (box.position % n) * (n + 1);
    }
    function iDiagonalePos(nbColumn: number, pos: number): number {
        return (pos % nbColumn) * (nbColumn + 1);
    }

    function ADVERSAIRE1(draw: models.Draw, pos: number): number {
        var n = draw.nbColumn;
        return pos % n + n * n;
    };

    angular.module('jat.services.roundrobinLib', ['jat.services.drawLib', 'jat.services.type', 'jat.services.find'])
        .factory('roundrobinLib', (drawLib: jat.service.DrawLib, ranking: ServiceRanking, find: Find) => {
            return new RoundrobinLib(drawLib, ranking, find);
        });
}