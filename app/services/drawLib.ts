interface IDrawLib {
    getSize(draw: models.Draw, dimensions: IDrawDimensions): ISize;
    computePositions(draw: models.Draw, dimensions: IDrawDimensions): IPosition[];
    resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void;
    nbColumnForPlayers(draw: models.Draw, nJoueur: number): number;
    generateDraw(draw: models.Draw, generate: models.GenerateType, afterIndex: number): models.Draw[];
    SetQualifieEntrant(box: models.Box, inNumber?: number, player?: models.Player): boolean;    //setPlayerIn
    SetQualifieSortant(box: models.Box, outNumber?: number): boolean;    //setPlayerOut
    FindQualifieEntrant(draw: models.Draw, inNumber: number): models.PlayerIn;  //findPlayerIn
    FindQualifieSortant(draw: models.Draw, outNumber: number): models.Match;    //findPlayerOut
    CalculeScore(draw: models.Draw): boolean;
    boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box };
}

interface IDrawDimensions {
    boxWidth: number;
    boxHeight: number;
    interBoxWidth: number;
    interBoxHeight: number;
}
interface IPosition {
    x: number;
    y: number
};
interface ISize {
    width: number;
    height: number;
}

module jat.service {

    var MAX_TETESERIE = 32,
        MAX_QUALIF_ENTRANT = 32,
        QEMPTY = - 1;

    export class DrawLib implements IDrawLib {

        _drawLibs: { [name: string]: IDrawLib } = {};

        constructor(
            private find: jat.service.Find,
            private rank: ServiceRank,
            private guid: jat.service.Guid
            ) {
        }

        public newDraw(parent: models.Event, source?: models.Draw, after?: models.Draw): models.Draw {
            var draw: models.Draw = <any>{};
            if (angular.isObject(source)) {
                angular.extend(draw, source);
            }
            draw.id = this.guid.create('d');
            delete (<any>draw).$$hashKey;   //remove angular id

            //default values
            draw.type = draw.type || models.DrawType.Normal;
            draw.nbColumn = draw.nbColumn || 3;
            draw.nbOut = draw.nbOut || 1;
            draw._previous = after;
            draw.minRank = after && after.maxRank ? this.rank.next(after.maxRank) : 'NC';

            draw._event = parent;
            return draw;
        }

        public initDraw(draw: models.Draw, parent: models.Event): void {
            draw._event = parent;

            draw.type = draw.type || 0;
            draw.nbColumn = draw.nbColumn || 0;
            draw.nbOut = draw.nbOut || 0;

            //init group linked list
            var i = this.find.indexOf(parent.draws, 'id', draw.id);
            if (i > 0) {
                var d = parent.draws[i - 1];
                draw._previous = d;
                d._next = draw;
            } else {
                draw._previous = null;
            }
            if (i < parent.draws.length - 1) {
                var d = parent.draws[i + 1];
                draw._next = d;
                d._previous = draw;
            }

            //init boxes
            if (!draw.boxes) {
                return;
            }
            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                var box = draw.boxes[i];
                this.initBox(box, draw);
            }
        }

        public resetDraw(draw: models.Draw, nPlayer: number): void {
            //remove qualif out
            var next = this.nextGroup(draw);
            if (next && draw.boxes) {
                for (var i = 0; i < next.length; i++) {
                    var boxes = next[i].boxes;
                    if (boxes) {
                        for (var b = 0; b < boxes.length; b++) {
                            var box = <models.Match> boxes[b];
                            if (box && box.qualifOut) {
                                this.SetQualifieSortant(box);
                            }
                        }
                    }
                }
            }

            //reset boxes
            draw.boxes = [];
            draw.nbColumn = this._drawLibs[draw.type].nbColumnForPlayers(draw, nPlayer);
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

        public nbColumnForPlayers(draw: models.Draw, nJoueur: number): number {
            return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
        }
        public getSize(draw: models.Draw, dimensions: IDrawDimensions): ISize {
            return this._drawLibs[draw.type].getSize(draw, dimensions);
        }
        public computePositions(draw: models.Draw, dimensions: IDrawDimensions): IPosition[] {
            return this._drawLibs[draw.type].computePositions(draw, dimensions);
        }
        public resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void {
            this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
        }

        public generateDraw(draw: models.Draw, generate: models.GenerateType, afterIndex: number): models.Draw[] {
            return this._drawLibs[draw.type].generateDraw(draw, generate, afterIndex);
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
            //var c = draw._event.draws;
            //if (c && c.length) {
            //    var t = this.find.indexOf(c, 'id', draw.id, 'Draw ' + draw.id + ' not found');
            //    for (var iBegin = t; c[iBegin].suite && iBegin >= 0; iBegin--) {
            //    }
            //    for (var iEnd = t; c[iEnd].suite && iEnd < c.length; iEnd++) {
            //    }
            //    for (var i = iBegin; i <= iEnd; i++) {
            //        draws.push(c[i]);
            //    }
            //} else {
            //    draws.push(draw);
            //}
            return draws;
        }

        //** return the draws of the previous group. */
        public previousGroup(draw: models.Draw): models.Draw[] {	//getPrecedent
            var p = this.groupBegin(draw);
            return p && p._previous ? this.group(p._previous) : null;
            //var c = draw._event.draws;
            //if (c && c.length) {
            //    var t = this.find.indexOf(c, 'id', draw.id, 'Draw ' + draw.id + ' not found');
            //    for (var iBegin = t; c[iBegin].suite && iBegin >= 0; iBegin--) {
            //    }
            //    t = iBegin - 1;
            //    if (0 <= t) {
            //        return this.group(c[t]);
            //    }
            //}
        }

        //** return the draws of the next group. */
        public nextGroup(draw: models.Draw): models.Draw[] {	    //getSuivant
            var p = this.groupEnd(draw);
            return p ? this.group(p) : null;
            //var c = draw._event.draws;
            //if (c && c.length) {
            //    var t = this.find.indexOf(c, 'id', draw.id, 'Draw ' + draw.id + ' not found');
            //    for (var iEnd = t; c[iEnd].suite && iEnd < c.length; iEnd++) {
            //    }
            //    if (t < c.length) {
            //        return this.group(c[t]);
            //    }
            //}
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
            return box && ('score' in box) && (<any>(box.place) || box.date);
        }

        public FindTeteSerie(group: models.Draw[], iTeteSerie: number): models.PlayerIn;
        public FindTeteSerie(draw: models.Draw, iTeteSerie: number): models.PlayerIn;
        public FindTeteSerie(origin: any, iTeteSerie: number): models.PlayerIn {
            ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
            var group = angular.isArray(origin) ? origin : this.group(origin);
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

        public FindQualifieEntrant(group: models.Draw[], iQualifie: number): models.PlayerIn;
        public FindQualifieEntrant(draw: models.Draw, iQualifie: number): models.PlayerIn;
        public FindQualifieEntrant(origin: any, iQualifie: number): models.PlayerIn {
            ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF_ENTRANT);
            var group: models.Draw[] = angular.isArray(origin) ? origin : this.group(origin);
            for (var i = 0; i < group.length; i++) {
                var d = group[i];
                var playerIn = this._drawLibs[d.type].FindQualifieEntrant(d, iQualifie);
                if (playerIn) {
                    return playerIn;
                }
            }
        }

        public FindQualifieSortant(group: models.Draw[], iQualifie: number): models.Match;
        public FindQualifieSortant(draw: models.Draw, iQualifie: number): models.Match;
        public FindQualifieSortant(origin: any, iQualifie: number): models.Match {
            ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF_ENTRANT);
            var group = angular.isArray(origin) ? origin : this.group(origin);
            for (var i = 0; i < group.length; i++) {
                var d = group[i];
                var boxOut = this._drawLibs[d.type].FindQualifieSortant(d, iQualifie);
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

        public FindAllQualifieSortant(group: models.Draw[], hideNumbers?: boolean): number[];
        public FindAllQualifieSortant(draw: models.Draw, hideNumbers?: boolean): number[];
        public FindAllQualifieSortant(origin: any, hideNumbers?: boolean): number[] {
            //Récupère les qualifiés sortants du tableau
            var group = angular.isArray(origin) ? origin : this.group(origin);
            if (group) {
                var a: number[] = [];
                for (var i = 1; i <= MAX_QUALIF_ENTRANT; i++) {
                    if (this.FindQualifieSortant(group, i)) {
                        a.push(hideNumbers ? QEMPTY : i);
                    }
                }
                return a;
            }
        }

        public SetQualifieEntrant(box: models.Box, inNumber?: number, player?: models.Player): boolean {
            // inNumber=0 => enlève qualifié
            return this._drawLibs[box._draw.type].SetQualifieEntrant(box, inNumber, player);
        }

        public SetQualifieSortant(box: models.Box, outNumber?: number): boolean { //setPlayerOut
            // iQualifie=0 => enlève qualifié
            return this._drawLibs[box._draw.type].SetQualifieSortant(box, outNumber);
        }

        public CalculeScore(draw: models.Draw): boolean {
            return this._drawLibs[draw.type].CalculeScore(draw);
        }

        //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
        public MetJoueur(box: models.Box, player: models.Player, bForce?: boolean): boolean {

            //ASSERT(MetJoueurOk(box, iJoueur, bForce));

            if (box.playerId !== player.id && box.playerId) {
                if (!this.EnleveJoueur(box)) {		//Enlève le joueur précédent
                    throw 'Error';
                }
            }

            var boxIn = <models.PlayerIn>box;
            var match = <models.Match>box;
            box.playerId = player.id;
            this.initBox(box, box._draw);
            //boxIn.order = 0;
            //match.score = '';

            if (isGauchePoule(box)) {
                //TODO boxIn.rank = 0;   //classement de la poule
            } else if ('score' in match) {
                match.date = undefined;
                match.place = undefined;
            }

            var next = this.nextGroup(box._draw);
            var boxOut = <models.Match>box;
            var e: number;
            if ((e = boxOut.qualifOut) && next) {
                var boxIn = this.FindQualifieEntrant(next, e);
                if (boxIn) {
                    if (!boxIn.playerId
                        && !this.MetJoueur(boxIn, player, true)) {
                        throw 'Error';
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
            //    CalculeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd())->GetActiveDocument());
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

            this.CalculeScore(box._draw);

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

            var next = this.nextGroup(box._draw);
            var boxOut = <models.Match> box;
            var i: number;
            if ((i = boxOut.qualifOut) && next) {
                var boxIn = this.FindQualifieEntrant(next, i);
                if (boxIn) {
                    if (!this.EnleveJoueur(boxIn, true)) {
                        throw 'Error';
                    }
                }
            }

            box.playerId = undefined;
            this.initBox(box, box._draw);
            match.score = '';

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

                    this.CalculeScore(box._draw);
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

            var prev = this.previousGroup(box._draw);
            if (prev) {
                var boxIn = <models.PlayerIn>box;
                if (boxIn.qualifIn) {
                    var boxOut = this.FindQualifieSortant(prev, boxIn.qualifIn);
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

            var prev = this.previousGroup(box._draw);
            if (prev) {
                var boxIn = <models.PlayerIn>box;
                if (boxIn.qualifIn) {
                    var boxOut = this.FindQualifieSortant(prev, boxIn.qualifIn);
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

            var boxIn = <models.PlayerIn>box;
            var boiteIn = <models.PlayerIn>boite;
            var match = <models.Match>box;
            var boiteMatch = <models.Match>boite;

            if (boxIn.qualifIn
                && boxIn.qualifIn != boiteIn.qualifIn) {

                if (!this.SetQualifieEntrant(box)) {	//Enlève
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
                if (!this.SetQualifieEntrant(box, boiteIn.qualifIn, boite._player)) {
                    throw 'Error';
                }
            } else {
                if (boite.playerId) {
                    if (!this.MetJoueur(box, boite._player)) {
                        throw 'Error';
                    }
                    match.score = boiteMatch.score;
                }

                if (boiteMatch.qualifOut) {
                    if (!this.SetQualifieSortant(box, boiteMatch.qualifOut)) {
                        throw 'Error';
                    }
                }
                if (!isTypePoule(box._draw) && boiteIn.seeded) {
                    boxIn.seeded = boiteIn.seeded;
                }

                //if( isCreneau( box))
                //v0998
                var m = box._draw.boxes.length;
                if (ADVERSAIRE1(box) < m
                    && ADVERSAIRE2(box) < m
                    && (boiteMatch.place || boiteMatch.date)
                    ) {
                    if (!this.MetCreneau(match, boiteMatch)) {
                        throw 'Error';
                    }
                }

                if (isMatch(box)) {
                    if (!this.MetPointage(box, boite)) {
                        throw 'Error';
                    }
                }

                match.matchFormat = boiteMatch.matchFormat;

                match.note = match.note;
            }

            this.CalculeScore(box._draw);

            return true;
        }

        public DeplaceJoueur(box: models.Box, boiteSrc: models.Box, pBoite: models.Box): boolean {
            //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));

            boiteSrc = this.newBox(box._draw, boiteSrc);

            if (!this.RempliBoite(boiteSrc, pBoite)) {	//Vide la source
                throw 'Error';
            }

            if (!this.RempliBoite(box, boiteSrc)) {	//Rempli la destination
                throw 'Error';
            }

            return true;
        }

        public boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box } {
            return this._drawLibs[match._draw.type].boxesOpponents(match);
        }
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
            return box.position / n + n * n;
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

    angular.module('jat.services.drawLib', ['jat.services.find'])
        .factory('drawLib', (find: jat.service.Find, rank: ServiceRank, guid: jat.service.Guid) => {
            return new DrawLib(find, rank, guid);
        });
}