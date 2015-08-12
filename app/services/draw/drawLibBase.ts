interface IDrawLib {
    manage(draw: models.Draw): boolean;
    getSize(draw: models.Draw): ISize;
    computePositions(draw: models.Draw): IPoint[];
    resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void;
    nbColumnForPlayers(draw: models.Draw, nJoueur: number): number;
    generateDraw(draw: models.Draw, generate: models.GenerateType, afterIndex: number): models.Draw[];
    setPlayerIn(box: models.PlayerIn, inNumber?: number, player?: models.Player): boolean;    //SetQualifieEntrant
    setPlayerOut(box: models.Match, outNumber?: number): boolean;    //SetQualifieSortant
    findPlayerIn(draw: models.Draw, inNumber: number): models.PlayerIn;  //FindQualifieEntrant
    findPlayerOut(draw: models.Draw, outNumber: number): models.Match;    //FindQualifieSortant
    computeScore(draw: models.Draw): boolean;   //CalculeScore
    boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box };
}

//interface IDrawDimensions {
//    boxWidth: number;
//    boxHeight: number;
//    interBoxWidth: number;
//    interBoxHeight: number;
//}
interface IPoint {
    x: number;
    y: number
};
interface ISize {
    width: number;
    height: number;
}

module jat.service {

    var MAX_TETESERIE = 32,
        MAX_QUALIF = 32,
        QEMPTY = - 1;

    export class DrawLibBase {

        constructor(
            protected services: jat.service.Services,
            protected drawLib: jat.service.DrawLib,
            protected find: jat.service.Find,
            protected rank: Rank,
            protected guid: jat.service.Guid
            ) {
        }

        public resetDraw(draw: models.Draw, nPlayer: number): void {
            //remove qualif out
            var next = this.drawLib.nextGroup(draw);
            if (next && draw.boxes) {
                for (var i = 0; i < next.length; i++) {
                    var boxes = next[i].boxes;
                    if (boxes) {
                        var drawLibNext = this.services.drawLibFor( next[i]);
                        for (var b = 0; b < boxes.length; b++) {
                            var box = <models.Match> boxes[b];
                            if (box && box.qualifOut) {
                                drawLibNext.setPlayerOut(box);
                            }
                        }
                    }
                }
            }

            //reset boxes
            var drawLib = this.services.drawLibFor( draw);
            draw.boxes = [];
            draw.nbColumn = drawLib.nbColumnForPlayers(draw, nPlayer);
        }

        public getPlayer(box: models.Box): models.Player {
            return this.find.byId(box._draw._event._tournament.players, box.playerId);
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
            var group = angular.isArray(origin) ? <models.Draw[]>origin : this.drawLib.group(<models.Draw>origin);
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

        //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
        public MetJoueur(box: models.Box, player: models.Player, bForce?: boolean): boolean {

            //ASSERT(MetJoueurOk(box, iJoueur, bForce));

            if (box.playerId !== player.id && box.playerId) {
                if (!this.EnleveJoueur(box)) {		//Enlève le joueur précédent
                    throw 'Error';
                }
            }

            var boxIn = <models.PlayerIn>box;
            var match = isMatch(box) ? <models.Match>box : undefined;
            box.playerId = player.id;
            box._player = player;
            //boxIn.order = 0;
            //match.score = '';

            if (isGauchePoule(box)) {
                //TODO boxIn.rank = 0;   //classement de la poule
            } else if (match) {
                match.date = undefined;
                match.place = undefined;
            }

            var boxOut = <models.Match>box;
            if (boxOut.qualifOut) {
                var next = this.drawLib.nextGroup(box._draw);
                if (next) {
                    var boxIn = this.drawLib.groupFindPlayerIn(next, boxOut.qualifOut);
                    if (boxIn) {
                        if (!boxIn.playerId
                            && !this.MetJoueur(boxIn, player, true)) {
                            throw 'Error';
                        }
                    }
                }
            }

            ////Lock les adversaires (+ tableau précédent si qualifié entrant)
            //if( isMatchJoue( box))	//if( isMatchJouable( box))
            //{
            //    LockBoite( ADVERSAIRE1(box));
            //    LockBoite( ADVERSAIRE2(box));
            //}

            ////Lock les boites du match, si on a ajouter un des deux adversaires aprés le résultat...
            //if( isTypePoule()) {
            //    if( isGauchePoule( box)) {
            //        //matches de la ligne
            //        for( i=ADVERSAIRE1( box) - GetnColonne(); i>= iBoiteMin(); i -= GetnColonne()) {
            //            if( i != box && isMatchJoue( i)) {
            //                LockBoite( box);
            //                LockBoite( ADVERSAIRE1( i));
            //                LockBoite( ADVERSAIRE2( i));
            //            }
            //        }
            //        //matches de la colonne
            //        for( i=iHautCol( iRowPoule( box, GetnColonne())); i>= iBasColQ( iRowPoule( box, GetnColonne())); i --) {
            //            if( i != box && isMatchJoue( i)) {
            //                LockBoite( box);
            //                LockBoite( ADVERSAIRE1( i));
            //                LockBoite( ADVERSAIRE2( i));
            //            }
            //        }
            //    }
            //    computeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd())->GetActiveDocument());
            //    //TODO Poule, Lock
            //} else
            //if( iBoiteMin() <= IAUTRE( box) 
            // && iBoiteMin() <= IMATCH( box) 
            // && boxes[ IAUTRE( box)]->isJoueur()
            // && boxes[ IMATCH( box)]->isJoueur()) {
            //    LockBoite( box);
            //    LockBoite( IAUTRE( box));
            //}

            return true;
        }

        //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
        public SetResultat(box: models.Match, boite: models.Match): boolean {
            //ASSERT(SetResultatOk(box, boite));

            //v0998
            //	//Check changement de vainqueur par vainqueur défaillant
            //	if( !isTypePoule())
            //	if( boite.score.isVainqDef()) {
            //		if( boite.m_iJoueur == boxes[ ADVERSAIRE1(box)]->m_iJoueur)
            //			boite.m_iJoueur = boxes[ ADVERSAIRE2(box)]->m_iJoueur;
            //		else
            //			boite.m_iJoueur = boxes[ ADVERSAIRE1(box)]->m_iJoueur;
            //	}

            if (boite.playerId) {
                if (!this.MetJoueur(box, boite._player)) {
                    throw 'Error';
                }
            } else if (!this.EnleveJoueur(box)) {
                throw 'Error';
            }

            box.score = boite.score;

            var drawLib = this.services.drawLibFor(box._draw);  
            drawLib.computeScore(box._draw);

            return true;
        }

        //Planification d'un match : met le court, la date et l'heure
        public MetCreneau(box: models.Match, boite: models.Match): boolean {
            ASSERT(isMatch(box));
            //ASSERT(MetCreneauOk(box, boite));

            box.place = boite.place;
            box.date = boite.date;

            return true;
        }

        public EnleveCreneau(box: models.Match): boolean {
            ASSERT(isMatch(box));
            //ASSERT(EnleveCreneauOk(box));

            box.place = undefined;
            box.date = undefined;

            return true;
        }

        public MetPointage(box: models.Box, boite: models.Box): boolean {
            //ASSERT(MetPointageOk(box, boite));

            //TODO
            //box.setPrevenu(box, boite.isPrevenu(box));
            //box.setPrevenu(box + 1, boite.isPrevenu(box + 1));
            //box.setRecoit(box, boite.isRecoit(box));

            return true;
        }

        //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
        public EnleveJoueur(box: models.Box, bForce?: boolean): boolean {

            var match = <models.Match>box;
            if (!match.playerId && !match.score) {
                return true;
            }

            //ASSERT(EnleveJoueurOk(box, bForce));

            var next = this.drawLib.nextGroup(box._draw);
            var boxOut = <models.Match> box;
            var i: number;
            if ((i = boxOut.qualifOut) && next) {
                var boxIn = this.drawLib.groupFindPlayerIn(next, i);
                if (boxIn) {
                    if (!this.EnleveJoueur(boxIn, true)) {
                        throw 'Error';
                    }
                }
            }

            box.playerId = box._player = undefined;
            if (isMatch(box)) {
                match.score = '';
            }

            var boxIn = <models.PlayerIn>box;
            //delete boxIn.order;
            /*
                //Delock les adversaires
                if( isTypePoule()) {
                    if( isMatch( box)) {
                        //Si pas d'autre matches dans la ligne, ni dans la colonne
                        BOOL bMatch = false;

                        //matches de la ligne
                        for( i=ADVERSAIRE1( box) - GetnColonne(); 
                            i>= iBoiteMin() && !bMatch; 
                            i -= GetnColonne()) 
                        {
                            if( i != box && boxes[ i]->isLock()) {
                                bMatch = true;
                                break;
                            }
                        }
                        //matches de la colonne
                        for( i=iHautCol( iRowPoule( ADVERSAIRE1( box), GetnColonne())); 
                            i>= iBasColQ( iRowPoule( ADVERSAIRE1( box), GetnColonne())) && !bMatch; 
                            i --) 
                        {
                            if( i != box && boxes[ i]->isLock()) {
                                bMatch = true;
                                break;
                            }
                        }
                        if( !bMatch)
                            DelockBoite( ADVERSAIRE1(box));

                        bMatch = false;
                        //matches de la ligne
                        for( i=ADVERSAIRE2( box) - GetnColonne(); 
                            i>= iBoiteMin() && !bMatch; 
                            i -= GetnColonne())
                        {
                            if( i != box && boxes[ i]->isLock()) {
                                bMatch = true;
                                break;
                            }
                        }
                        //matches de la colonne
                        for( i=iHautCol( iRowPoule( ADVERSAIRE2( box), GetnColonne())); 
                            i>= iBasColQ( iRowPoule( ADVERSAIRE2( box), GetnColonne())) && !bMatch; 
                            i --) 
                        {
                            if( i != box && boxes[ i]->isLock()) {
                                bMatch = true;
                                break;
                            }
                        }
                        if( !bMatch)
                            DelockBoite( ADVERSAIRE2(box));
			
                    }

                    this.computeScore(box._draw);
                    //TODO Poule, Unlock
                } else
                if(  ADVERSAIRE1(box) <= iBoiteMax()) {
                    DelockBoite( ADVERSAIRE1(box));
                    DelockBoite( ADVERSAIRE2(box));
                }
            */
            return true;
        }

        //Avec report sur le tableau suivant
        public LockBoite(box: models.Box): boolean {
            ASSERT(!!box);

            if (iDiagonale(box) === box.position) {
                ///TODO box = ADVERSAIRE1(box);
            }

            ASSERT(!!box);
            //ASSERT(box.isJoueur());

            if (box.hidden) {
                return true;
            }

            box.locked = true;

            var prev = this.drawLib.previousGroup(box._draw);
            if (prev) {
                var boxIn = <models.PlayerIn>box;
                if (boxIn.qualifIn) {
                    var boxOut = this.drawLib.groupFindPlayerOut(prev, boxIn.qualifIn);
                    if (boxOut) {
                        boxOut.locked = true;
                    }
                }
            }

            return true;
        }

        //Avec report sur le tableau précédent
        public DelockBoite(box: models.Box): boolean {

            if (box.hidden) {
                return true;
            }

            delete box.locked;

            var prev = this.drawLib.previousGroup(box._draw);
            if (prev) {
                var boxIn = <models.PlayerIn>box;
                if (boxIn.qualifIn) {
                    var boxOut = this.drawLib.groupFindPlayerOut(prev, boxIn.qualifIn);
                    if (boxOut) {
                        delete boxOut.locked;
                    }
                }
            }

            return true;
        }

        //Rempli une boite proprement
        public RempliBoite(box: models.Box, boite: models.Box): boolean {
            //ASSERT(RempliBoiteOk(box, boite));

            var drawLib = this.services.drawLibFor(box._draw);

            var boxIn = <models.PlayerIn>box;
            var boiteIn = <models.PlayerIn>boite;
            var match = isMatch(box) ? <models.Match>box : undefined;
            var boiteMatch = isMatch(boite) ? <models.Match>boite : undefined;

            if (boxIn.qualifIn
                && boxIn.qualifIn != boiteIn.qualifIn) {

                if (!drawLib.setPlayerIn(box)) {	//Enlève
                    throw 'Error';
                }
            } else {
                //Vide la boite écrasée
                if (!this.EnleveJoueur(box)) {	//enlève le joueur, le score
                    throw 'Error';
                }

                delete boxIn.qualifIn;
                delete boxIn.seeded;
                delete match.qualifOut;

                if (this.isCreneau(match)) {
                    if (!this.EnleveCreneau(match)) {
                        throw 'Error';
                    }
                }
            }

            //Rempli avec les nouvelles valeurs
            if (boiteIn.qualifIn) {
                if (!drawLib.setPlayerIn(box, boiteIn.qualifIn, boite._player)) {
                    throw 'Error';
                }
            } else {
                if (boite.playerId) {
                    if (!this.MetJoueur(box, boite._player)) {
                        throw 'Error';
                    }
                    if (match) {
                        match.score = boiteMatch.score;
                    }
                }

                if (!isTypePoule(box._draw) && boiteIn.seeded) {
                    boxIn.seeded = boiteIn.seeded;
                }

                if (match) {
                    if (boiteMatch.qualifOut) {
                        if (!drawLib.setPlayerOut(match, boiteMatch.qualifOut)) {
                            throw 'Error';
                        }
                    }

                    //if( isCreneau( box))
                    //v0998
                    var opponents = drawLib.boxesOpponents(match);
                    if (opponents.box1 && opponents.box2
                        && (boiteMatch.place || boiteMatch.date)
                        ) {
                        if (!this.MetCreneau(match, boiteMatch)) {
                            throw 'Error';
                        }
                    }

                    if (!this.MetPointage(box, boite)) {
                        throw 'Error';
                    }
                    match.matchFormat = boiteMatch.matchFormat;

                    match.note = match.note;
                }
            }

            drawLib.computeScore(box._draw);

            return true;
        }

        public DeplaceJoueur(box: models.Box, boiteSrc: models.Box, pBoite: models.Box): boolean {
            //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));

            boiteSrc = this.drawLib.newBox(box._draw, boiteSrc);

            if (!this.RempliBoite(boiteSrc, pBoite)) {	//Vide la source
                throw 'Error';
            }

            if (!this.RempliBoite(box, boiteSrc)) {	//Rempli la destination
                throw 'Error';
            }

            return true;
        }

        // public boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box } {
        //     return this._drawLibs[match._draw.type].boxesOpponents(match);
        // }
    }

    function isMatch(box: models.Box): boolean {
        return box && ('score' in box);
    }

    function isTypePoule(draw: models.Draw): boolean {
        return draw.type === models.DrawType.PouleSimple || draw.type === models.DrawType.PouleAR;
    }

    function iDiagonale(box: models.Box): number {
        var draw = box._draw;
        return isTypePoule(box._draw) ? (box.position % draw.nbColumn) * (draw.nbColumn + 1) : box.position;
    }
    function isGauchePoule(box: models.Box): boolean {
        return isTypePoule(box._draw) ? (box.position >= (box._draw.nbColumn * box._draw.nbColumn)) : false;
    }

    function ADVERSAIRE1(box: models.Box): number {
        if (isTypePoule(box._draw)) {
            var n = box._draw.nbColumn;
            return box.position % n + n * n;
        } else {
            return (box.position << 1) + 2;
        }
    };
    function ADVERSAIRE2(box: models.Box): number {
        if (isTypePoule(box._draw)) {
            var n = box._draw.nbColumn;
            return Math.floor(box.position / n) + n * n;
        } else {
            return (box.position << 1) + 1;
        }
    };

    function ASSERT(b: boolean, message?: string): void {
        if (!b) {
            debugger;
            throw message || 'Assertion is false';
        }
    }

    // angular.module('jat.services.drawLib', ['jat.services.services', 'jat.services.drawLib', 'jat.services.find', 'jat.services.type', 'jat.services.guid'])
    //     .factory('drawLib', [
    //         'services',
    //         'drawLib', 
    //         'find', 
    //         'rank', 
    //         'guid',
    //         (services: jat.service.Services, find: jat.service.Find, rank: Rank, guid: jat.service.Guid) => {
    //         return new DrawLibBase(services, find, rank, guid);
    //     }]);
}