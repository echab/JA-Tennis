module jat.service {

    var MAX_TETESERIE = 32,
        MAX_QUALIF = 32,
        QEMPTY = - 1,
        MAX_MATCHJOUR	=16;

    export class KnockoutValidation implements IValidation {

        constructor(
            private validation: jat.service.Validation,
            private knockout: jat.service.Knockout,
            private drawLib: jat.service.DrawLib,
            private tournamentLib: jat.service.TournamentLib,
            private rank: ServiceRank,
            private category: ServiceCategory,
            private score: ServiceScore,
            private find: jat.service.Find
            ) {
            validation.addValidator(this);
        }

        validatePlayer(player: models.Player): boolean {
            return true;
        }

        validateGroup(draw: models.Draw): boolean {
            var bRes = true;

            if (draw.suite) {
                var iTableau = this.find.indexOf(draw._event.draws, 'id', draw.id);
                if (iTableau === 0 || !draw._previous) {
                    this.validation.error('IDS_ERR_TAB_SUITE_PREMIER', draw);
                    bRes = false;
                }

                var group = this.drawLib.group(draw);
                if (group) {
                    if (draw.type !== group[0].type) {
                        this.validation.error('IDS_ERR_TAB_SUITE_TYPE', draw);
                        bRes = false;
                    }
                    if (draw.minRank != group[0].minRank) {
                        this.validation.error('IDS_ERR_TAB_SUITE_MIN', draw);
                        bRes = false;
                    }
                    if (draw.maxRank != group[0].maxRank) {
                        this.validation.error('IDS_ERR_TAB_SUITE_MAX', draw);
                        bRes = false;
                    }
                }
            }

            var prevGroup = this.drawLib.previousGroup(draw);
            if (prevGroup) {
                if (prevGroup[0].type !== models.DrawType.Final && draw.minRank && prevGroup[0].maxRank) {
                    if (this.rank.compare(draw.minRank, prevGroup[0].maxRank) < 0) {
                        this.validation.error('IDS_ERR_TAB_CLASSMAX_OVR', draw);
                        bRes = false;
                    }
                }
            }

            var nextGroup = this.drawLib.nextGroup(draw);
            if (nextGroup) {
                if (draw.type !== models.DrawType.Final && draw.maxRank && nextGroup[0].minRank) {
                    if (this.rank.compare(nextGroup[0].minRank, draw.maxRank) < 0) {
                        this.validation.error('IDS_ERR_TAB_CLASSMAX_NEXT_OVR', draw);
                        bRes = false;
                    }
                }
            }

            var e = MAX_QUALIF;
            if (!draw.suite) {
                //Trouve le plus grand Qsortant
                for (e = MAX_QUALIF; e >= 1; e--) {
                    if (this.drawLib.FindQualifieSortant(group, e)) {
                        break;
                    }
                }
                for (var e2 = 1; e2 <= e; e2++) {
                    if (!this.drawLib.FindQualifieSortant(group, e2)) {
                        this.validation.error('IDS_ERR_TAB_SORTANT_NO', draw, undefined, 'Q' + e2);
                        bRes = false;
                    }
                }
            }

            return bRes;
        }

        validateMatches(draw: models.Draw): boolean {
            var bRes = true;


            return bRes;
        }

        validateDraw(draw: models.Draw): boolean {
            var bRes = true;
            var nqe = 0;
            var nqs = 0;
            var tournament = draw._event._tournament;
            var isTypePoule = draw.type >= 2;

            //Interdits:
            // - De faire rencontrer 2 Qualifiés entre eux
            // - D'avoir plus de Qualifiés que de joueurs admis directement
            // - De prévoir plus d'un tour d'écart entre deux joueurs de même classement
            // - De faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien

            //Buts à atteindre:
            // Faire jouer chaque joueur
            // - Une première fois à classement inférieur
            // - Eventuellement à égalité de classement
            // - Ensuite à un classement supérieur au sien
            // - Ecart maximal souhaité DEUX échelons

            if (draw.minRank && draw.maxRank && draw.maxRank < draw.minRank) {
                this.validation.error('IDS_ERR_TAB_CLAST_INV', draw);
                bRes = false;
            }

            //DONE 00/05/10: CTableau contrôle progression des classements
            if (draw._event.maxRank && this.rank.compare(draw._event.maxRank, draw.maxRank) < 0) {
                this.validation.error('IDS_ERR_TAB_CLASSLIM_OVR', draw);
                bRes = false;
            }

            bRes = bRes && this.validateGroup(draw);

            bRes = bRes && this.validateMatches(draw);

            var colMax = columnMax(draw.nbColumn, draw.nbOut);
            var pClastMaxCol: RankString[] = new Array(colMax + 1);
            pClastMaxCol[colMax] = 'NC';    //pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();

            //Match avec deux joueurs gagné par un des deux joueurs
            for (var i = 0; i < draw.boxes.length; i++) {
                var box = draw.boxes[i];
                var boxIn = !isMatch(box) ? <models.PlayerIn>box : undefined;
                var match = isMatch(box) ? <models.Match>box : undefined;
                var b = box.position;

                //ASSERT(-1 <= box.playerId && box.playerId < tournament.players.length);
                //Joueur inscrit au tableau ?

                var c = column(b);
                if (b === positionTopCol(c)) {
                    if (c < colMax) {
                        pClastMaxCol[c] = pClastMaxCol[c + 1];
                        //pClastMinCol[ c] = pClastMinCol[ c+1];
                    }
                }

                if (boxIn
                    && boxIn.order < 0
                    && !boxIn.qualifIn
                    && !box.hidden
                    ) {
                    this.validation.error('IDS_ERR_TAB_DUPLI', draw, box);
                    bRes = false;
                }

                var player = box._player;

                //if( boxes[ i].order >= 0 && player) 
                if (player && boxIn && this.knockout.isJoueurNouveau(box) && !boxIn.qualifIn) {

                    //DONE 00/03/07: Tableau, joueur sans classement
                    //DONE 00/03/04: Tableau, Classement des joueurs correspond au limites du tableau
                    if (!player.rank) {
                        this.validation.error('IDS_ERR_CLAST_NO', draw, box);
                        bRes = false;
                    } else {

                        //Players rank within draw min and max ranks
                        if (!this.rank.within(player.rank, draw.minRank, draw.maxRank)) {
                            this.validation.error('IDS_ERR_CLAST_MIS', draw, box, player.rank);
                            bRes = false;
                        }

                        //DONE: 01/07/15 (00/05/11): CTableau, isValide revoir tests progression des classements
                        //if (!isTypePoule) {
                        if (pClastMaxCol[c] < player.rank) {
                            pClastMaxCol[c] = player.rank;
                        }

                        //if( player.rank < pClastMinCol[ c])
                        //	pClastMinCol[ c] = player.rank;

                        if (c < colMax
                            && pClastMaxCol[c + 1]
                            && this.rank.compare(player.rank, pClastMaxCol[c + 1]) < 0) {
                            this.validation.error('IDS_ERR_CLAST_PROGR', draw, box, player.rank);
                            bRes = false;
                        }
                        //}

                    }

                    //Check inscriptions
                    if (!this.tournamentLib.isSexeCompatible(draw._event, player.sexe)) {
                        this.validation.error('IDS_ERR_EPR_SEXE', draw, box);

                    } else if (!this.tournamentLib.isRegistred(draw._event, player)) {
                        this.validation.error('IDS_ERR_INSCR_NO', draw, box);
                    }

                    //DONE 00/05/11: CTableau, check categorie
                    //Check Categorie
                    if (!this.category.isCompatible(draw._event.category, player.category)) {
                        this.validation.error('IDS_ERR_CATEG_MIS', draw, box);
                    }
                }

                //if (!isMatch(box) && match.score) {

                //    //DONE 01/07/13: CTableau, isValid score sans match
                //    this.validation.error('IDS_ERR_SCORE_MATCH_NO', draw, box);
                //    bRes = false;
                //}

                if (match) {

                    //DONE 00/01/10: 2 joueurs du même club
                    //DONE 00/03/03: Test de club identique même si le club est vide
                    //TODO 00/07/27: Test de club identique avec des matches joués



                    ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));

                    //TODO this.drawLib.boxesOpponents(match)
                    var opponent = this.knockout.boxesOpponents(match);

                    ASSERT(!!opponent.box1 && !!opponent.box2);

                    if (!match.score) {

                        if (box.playerId) {
                            this.validation.error('IDS_ERR_VAINQ_SCORE_NO', draw, box);
                            bRes = false;
                        }

                    } else {
                        ASSERT(b < positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche

                        if (!box.playerId) {
                            this.validation.error('IDS_ERR_SCORE_VAINQ_NO', draw, box);
                            bRes = false;
                        }

                        if (!this.score.isValid(match.score)) {
                            this.validation.error('IDS_ERR_SCORE_BAD', draw, box, <string>match.score);
                            bRes = false;
                        }

                        //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                        ASSERT(column(b) < colMax);
                        if (!opponent.box1.playerId || !opponent.box2.playerId) {
                            this.validation.error('IDS_ERR_MATCH_JOUEUR_NO', draw, box);
                            bRes = false;

                        } else if (opponent.box1.playerId != box.playerId
                            && opponent.box2.playerId != box.playerId) {
                            this.validation.error('IDS_ERR_VAINQUEUR_MIS', draw, box);
                            bRes = false;
                        }
                    }

                    if (!this.isMatchJoue(match)) {

                        //match before opponent 2
                        var opponent1 = this.drawLib.boxesOpponents(<models.Match>opponent.box1);
                        var opponent2 = this.drawLib.boxesOpponents(<models.Match>opponent.box2);

                        if (opponent.box1.playerId) {
                            if (opponent.box2.playerId) {
                                if (!CompString(opponent.box1._player.club, opponent.box2._player.club)) {
                                    this.validation.error('IDS_ERR_MEME_CLUB1', draw, box, opponent.box1._player.club);
                                    bRes = false;
                                }
                            } else if (this.isMatchJouable(opponent.box2)) { //!isTypePoule &&

                                if (!CompString(opponent.box1._player.club, opponent2.box1._player.club)) {
                                    this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent.box1._player.club);
                                    bRes = false;
                                } else if (!CompString(opponent.box1._player.club, opponent2.box2._player.club)) {
                                    this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent.box1._player.club);
                                    bRes = false;
                                }
                            }
                        } else if (isTypePoule) {
                            //TODO Poule
                        } else if (opponent.box2.playerId) {
                            if (this.isMatchJouable(opponent.box1)) {
                                if (!CompString(opponent.box2._player.club, opponent1.box1._player.club)) {
                                    this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent.box2._player.club);
                                    bRes = false;
                                } else if (!CompString(opponent.box2._player.club, opponent1.box2._player.club)) {
                                    this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent.box2._player.club);
                                    bRes = false;
                                }
                            }
                        } else if (this.isMatchJouable(opponent.box1) && this.isMatchJouable(opponent.box2)) {

                            if (!CompString(opponent1.box1._player.club, opponent2.box1._player.club)
                                || !CompString(opponent1.box1._player.club, opponent2.box2._player.club)) {
                                this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent1.box1._player.club);
                                bRes = false;
                            }
                            if (!CompString(opponent1.box2._player.club, opponent2.box1._player.club)
                                || !CompString(opponent1.box2._player.club, opponent2.box2._player.club)) {
                                this.validation.error('IDS_ERR_MEME_CLUB2', draw, box, opponent1.box2._player.club);
                                bRes = false;
                            }
                        }
                    }

                    //DONE 01/08/01 (00/07/27): Date d'un match entre dates de l'épreuve
                    if (match.date) {
                        if (draw._event.start
                            && match.date < draw._event.start) {
                            this.validation.error('IDS_ERR_DATE_MATCH_EPREUVE', draw, box, match.date.toDateString());
                            bRes = false;
                        }

                        if (draw._event.end
                            && draw._event.end < match.date) {
                            this.validation.error('IDS_ERR_DATE_MATCH_EPREUVE', draw, box, match.date.toDateString());
                            bRes = false;
                        }

                        tournament._dayCount = dateDiff(tournament.info.start, tournament.info.end, UnitDate.Day) + 1;

                        if (tournament._dayCount) {
                            var iDay = dateDiff(match.date, tournament.info.start, UnitDate.Day);
                            if (0 <= iDay && iDay < tournament._dayCount) {	//v0998

                                var dayMatches = tournament._day[iDay];
                                ASSERT(dayMatches.length <= MAX_MATCHJOUR);

                                for (var m = dayMatches.length - 1; m >= 0; m--) {
                        	        var match2 = dayMatches[m];

                                    if (match2.position != match.position
                                        && match2.place == match.place
                                        && Math.abs(match.date.getTime() - match2.date.getTime()) < tournament.info.slotLength) {
                                        this.validation.error('IDS_ERR_PLN_OVERLAP', draw, box, match.date.toDateString());
                                        bRes = false;
                                    }
                                }
                            } else {
                                //Match en dehors du planning
                                this.validation.error('IDS_ERR_DATE_MATCH_TOURNOI', draw, box, match.date.toDateString());
                                bRes = false;
                            }
                        }

                        //TODO 00/07/27: Date d'un match après les matches précédents (au moins 3 heures) ça test pas bien à tous les coups
                        //TODO 00/12/20: Dans tous les tableaux où le joueur est inscrit, date des matches différentes pour un même joueur
                        ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));

                        //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur

                        //if (!isTypePoule) {
                        var match1 = <models.Match>opponent.box1;
                        var match2 = <models.Match>opponent.box2;

                        if (isMatch(opponent.box1)
                            && match1.date) {
                            if (match.date < match1.date) {
                                this.validation.error('IDS_ERR_DATE_MATCHS', draw, box, match.date.toDateString());
                                bRes = false;
                            } else if (match.date.getTime() < (match1.date.getTime() + (tournament.info.slotLength << 1))) {
                                this.validation.error('IDS_ERR_DATE_MATCHS', draw, box, match.date.toDateString());
                                bRes = false;
                            }
                        }

                        if (isMatch(opponent.box2) && match2.date) {
                            if (match.date < match2.date) {
                                this.validation.error('IDS_ERR_DATE_MATCHS', draw, box, match.date.toDateString());
                                bRes = false;
                            } else if (match.date.getTime() < (match2.date.getTime() + (tournament.info.slotLength << 1))) {
                                this.validation.error('IDS_ERR_DATE_MATCHS', draw, box, match.date.toDateString());
                                bRes = false;
                            }
                        }
                        //}

                        if (match.date) {
                            if (!box.playerId && !match.place && tournament.places.length && tournament._dayCount) {
                                this.validation.error('IDS_ERR_PLN_COURT_NO', draw, box);
                                bRes = false;
                            }
                        }

                    }


                    //DONE 01/08/01 (00/05/28): CTableau, interdit d'avoir plus de Qualifiés que de joueurs admis directement

                    //DONE 01/08/19 (00/05/28): CTableau, interdit de prévoir plus d'un tour d'écart entre deux joueurs de même classement

                    //DONE 01/08/19 (00/05/28): CTableau, interdit de faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien

                }

                var e = boxIn.qualifIn;
                if (e && e != QEMPTY) {
                    nqe++;

                    ASSERT(!isTypePoule || (b >= positionBottomCol(draw.nbColumn, draw.nbOut)));	//Qe que dans colonne de gauche

                    var iTableau = this.find.indexOf(draw._event.draws, 'id', draw.id);
                    if (iTableau == 0) {
                        this.validation.error('IDS_ERR_TAB_ENTRANT_TAB1', draw, box);
                        bRes = false;
                    }
                    //ASSERT( iTableau != 0);

                    //DONE 00/03/07: CTableau, qualifié entrant en double
                    var j: models.Box;
                    if (!draw.suite && (j = this.drawLib.FindQualifieEntrant(draw, e)) && (j.position != b || j._draw.id != draw.id)) {
                        this.validation.error('IDS_ERR_TAB_ENTRANT_DUP', draw, box);
                        bRes = false;
                    }

                    var group = this.drawLib.previousGroup(draw);
                    if (group) {
                        //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                        j = this.drawLib.FindQualifieSortant(group, e);
                        if (!j) {
                            this.validation.error('IDS_ERR_TAB_ENTRANT_PREC_NO', draw, box);
                            bRes = false;
                        } else if (j.playerId != box.playerId) {
                            this.validation.error('IDS_ERR_TAB_ENTRANT_PREC_MIS', draw, box);
                            bRes = false;
                        }
                    }
                }

                if (e = match.qualifOut) {
                    nqs++;

                    //ASSERT(!isTypePoule || (b == iDiagonale(b)));	//Qs que dans diagonale des poules

                    //DONE 00/03/07: CTableau, qualifié sortant en double
                    j = this.drawLib.FindQualifieSortant(draw, e)
                    if (j &&
                        (j.position != b || j._draw.id != draw.id)) {
                        this.validation.error('IDS_ERR_TAB_SORTANT_DUP', draw, box);
                        bRes = false;
                    }

                    if (draw.type === models.DrawType.Final) {
                        this.validation.error('IDS_ERR_TAB_SORTANT_FINAL', draw, box);
                        bRes = false;
                    }
                    /*			
                    pSuite = getSuivant();
                    if( pSuite && (j = pSuite.FindQualifieEntrant( e, &pSuite)) != -1) {
                        if( boxes[ i].playerId != pSuite.boxes[ j].playerId) {
                            this.validation.error('IDS_ERR_TAB_ENTRANT_PREC_MIS', tournament.events[ iEpreuve].FindTableau( pSuite), j);
                            bRes=false;
                        }
                    }
                    */
                }

            }

            //Check Têtes de série
            //	if( !isTypePoule)
            if (!draw.suite) {
                for (var e2 = 0, e = 1; e <= MAX_TETESERIE; e++) {
                    boxIn = this.drawLib.FindTeteSerie(draw, e);
                    if (boxIn) {
                        if (e > e2 + 1) {
                            this.validation.error('IDS_ERR_TAB_TETESERIE_NO', boxIn._draw, boxIn, 'Seeded ' + e);
                            bRes = false;
                        }

                        if (isMatch(boxIn)) {
                            this.validation.error('IDS_ERR_TAB_TETESERIE_ENTRANT', boxIn._draw, boxIn, 'Seeded ' + e);
                            bRes = false;
                        }

                        for (var i = 0; i <= draw.boxes.length; i++) {
                            var boxIn2 = <models.PlayerIn>draw.boxes[i];
                            if (boxIn2.seeded == e && boxIn2.position !== boxIn.position) {
                                this.validation.error('IDS_ERR_TAB_TETESERIE_DUP', boxIn._draw, boxIn, 'Seeded ' + e);
                                bRes = false;
                            }
                        }

                        e2 = e;
                    }
                }
            }

            //Tous les qualifiés sortants du tableau précédent sont utilisés
            if (!draw.suite) {
                var pT = this.drawLib.previousGroup(draw);
                if (pT && pT.length) {
                    for (var e = 1; e <= MAX_QUALIF; e++) {
                        var boxOut = this.drawLib.FindQualifieSortant(pT, e);
                        boxIn = this.drawLib.FindQualifieEntrant(draw, e);
                        if (boxOut && !boxIn) {
                            this.validation.error('IDS_ERR_TAB_SORTANT_PREC_NO', boxOut._draw, boxOut);
                            bRes = false;
                        }
                    }
                }
            }

            if (isTypePoule && nqs < draw.nbOut) {
                this.validation.error('IDS_ERR_POULE_SORTANT_NO', draw);
                bRes = false;
            }

            if (draw.type === models.DrawType.Final) {

                if (draw.suite || group[group.length - 1].id !== draw.id) {
                    this.validation.error('IDS_ERR_TAB_SUITE_FINAL', draw);
                    bRes = false;
                }

                if (draw.nbOut != 1) {
                    this.validation.error('IDS_ERR_TAB_FINAL_NQUAL', draw);
                    bRes = false;
                }
            }

            return bRes;
        }

        //private boxOpponent1(match: models.Match): models.Box {
        //    return this.find.by(match._draw.boxes, 'position', positionOpponent1(match.position));
        //}
        //private boxOpponent2(match: models.Match): models.Box {
        //    return this.find.by(match._draw.boxes, 'position', positionOpponent2(match.position));
        //}

        private isMatchJoue(match: models.Match): boolean {
            var opponent = this.drawLib.boxesOpponents(match);
            return !!match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
        }
        private isMatchJouable(match: models.Box): boolean {
            if (!isMatch(match)) {
                return false;
            }
            var opponent = this.drawLib.boxesOpponents(<models.Match> match);
            return !match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
        }

    }

    function ASSERT(b: boolean, message?: string): void {
        if (!b) {
            debugger;
            throw message || 'Assertion is false';
        }
    }

    function isMatch(box: models.Box): boolean {
        return 'score' in box;
    }

    function column(pos: number): number {    //iCol
        //TODO, use a table
        var col = -1;
        for (pos++; pos; pos >>= 1, col++) { }
        return col;
    }

    function columnMin(nQ?: number): number {   //iColMinQ
        return !nQ || nQ === 1
            ? 0
            : column(nQ - 2) + 1;
    }

    function columnMax(nCol: number, nQ?: number): number { //iColMaxQ
        return !nQ || nQ === 1
            ? nCol - 1
            : column(nQ - 2) + nCol;
    }

    function positionTopCol(col: number): number { // iHautCol
        return (1 << (col + 1)) - 2;
    }

    function positionBottomCol(col: number, nQ?: number): number {  //iBasColQ
        return !nQ || nQ === 1
            ? (1 << col) - 1    //iBasCol
            : (positionTopCol(col) - countInCol(col, nQ) + 1);
    }

    function countInCol(col: number, nQ?: number): number { //nInColQ
        return !nQ || nQ === 1
            ? (1 << col)    //countInCol
            : nQ * countInCol(col - columnMin(nQ), 1);
    }

    function positionMax(nCol: number, nQ?: number): number {   //iBoiteMaxQ
        return !nQ || nQ === 1
            ? (1 << nCol) - 2  //iHautCol
            : positionTopCol(columnMax(nCol, nQ));
    }

    function positionOpponent1(pos: number): number { //ADVERSAIRE1
        return (pos << 1) + 2;
    }
    function positionOpponent2(pos: number): number { //ADVERSAIRE2
        return (pos << 1) + 1;
    }

    function CompString(a: string, b: string): number {
        var u = (a || '').toUpperCase(), v = (b || '').toUpperCase();
        return u === v ? 0 : u < v ? -1 : 1;
    }

    enum UnitDate {
        Day = 1000 * 60 * 60 * 24,
        Hour = 1000 * 60 * 60
    }

    function dateDiff(first: Date, second: Date, unit: UnitDate) {

        // Copy date parts of the timestamps, discarding the time parts.
        var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
        var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

        return Math.floor((two.getTime() - one.getTime()) / unit);
    }

    angular.module('jat.services.validation.knockout', ['jat.services.validation', 'jat.services.type'])
        .factory('knockoutValidation', (validation: jat.service.Validation, knockout: jat.service.Knockout, drawLib: jat.service.DrawLib, tournamentLib: jat.service.TournamentLib, rank: ServiceRank, category: ServiceCategory, score: ServiceScore, find: jat.service.Find) => {
            return new KnockoutValidation(validation, knockout, drawLib, tournamentLib, rank, category, score, find);
        });
} 