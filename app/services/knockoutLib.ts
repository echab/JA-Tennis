module jat.service {

    var MIN_COL = 0,
        MAX_COL = 9,
        MAX_QUALIF_ENTRANT = 32,
        QEMPTY = - 1,
        WITH_TDS_HAUTBAS = true;

    export class KnockoutLib implements IDrawLib {

        constructor(
            private drawLib: jat.service.DrawLib,
            private tournamentLib: jat.service.TournamentLib,
            private rank: ServiceRank,
            private find: Find
            ) {
            drawLib._drawLibs[models.DrawType.Normal]
            = drawLib._drawLibs[models.DrawType.Final]
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

            var colMin = columnMin(draw.nbOut);

            for (var c = colMin + 1; countInCol(c, draw.nbOut) < nJoueur && c < MAX_COL; c++) {
            }

            if (MAX_COL <= c) {
                throw 'Max_COL is reached ' + c;
            }

            return c - colMin + 1;
        }

        public resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void {

            if (nJoueur) {    //AgranditTableau to fit all players
                draw.nbColumn = this.nbColumnForPlayers(draw, nJoueur);
                //draw.nbEntry = countInCol(iColMax(draw), draw.nbOut);
            }

            //Shift the boxes
            if (oldDraw && draw.nbOut !== oldDraw.nbOut) {
                var n = columnMax(draw.nbColumn, draw.nbOut) - columnMax(oldDraw.nbColumn, oldDraw.nbOut);
                if (n != 0) {
                    var top = positionTopCol(n);
                    for (var i = draw.boxes.length - 1; i >= 0; i--) {
                        var box = draw.boxes[i];
                        box.position = positionPivotLeft(box.position, top);
                    }
                }
            }
        }

        public generateDraw(draw: models.Draw, generate: number): models.Draw[] {
            if (generate === 1) {   //from registred players
                var m_nMatchCol = filledArray(MAX_COL, 0);

                var players = this.tournamentLib.GetJoueursInscrit(draw);

                //Récupère les qualifiés sortants du tableau précédent
                var prev = this.drawLib.previousGroup(draw);
                if (prev) {
                    players = players.concat(<any>this.drawLib.FindAllQualifieSortant(prev, true));
                }

                this.drawLib.resetDraw(draw, players.length);
                this.RempliMatchs(draw, m_nMatchCol, players.length - draw.nbOut);
            } else {    //from existing players
                m_nMatchCol = this.CompteMatchs(draw);
                if (generate === 2) {
                    if (!this.TirageEchelonne(draw, m_nMatchCol)) {
                        return;
                    }
                } else if (generate === 3) {
                    if (!this.TirageEnLigne(draw, m_nMatchCol)) {
                        return;
                    }
                }
                players = this.GetJoueursTableau(draw);
            }
            draw = this.ConstruitMatch(draw, m_nMatchCol, players);
            return [draw];
        }

        private RempliMatchs(draw: models.Draw, m_nMatchCol: number[], nMatchRestant: number, colGauche?: number): void {

            var colMin = columnMin(draw.nbOut);

            colGauche = colGauche || colMin;

            for (var i = colGauche; i <= MAX_COL; i++) {
                m_nMatchCol[i] = 0;
            }

            //Rempli les autres matches de gauche normalement
            for (var c = Math.max(colGauche, colMin); nMatchRestant && c < MAX_COL; c++) {
                var iMax = Math.min(nMatchRestant, countInCol(c, draw.nbOut));
                if (colMin < c) {
                    iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
                }

                m_nMatchCol[c] = iMax;
                nMatchRestant -= iMax;
            }
        }

        //Init m_nMatchCol à partir du tableau existant
        private CompteMatchs(draw: models.Draw): number[] {

            var b: number, c2: number, n: number, bColSansMatch: boolean;

            var m_nMatchCol: number[] = new Array(MAX_COL);

            //Compte le nombre de joueurs entrants ou qualifié de la colonne
            var colMin = columnMin(draw.nbOut);
            var c = colMin;
            m_nMatchCol[c] = draw.nbOut;
            var nMatchRestant = -m_nMatchCol[c];
            var colMax = columnMax(draw.nbColumn, draw.nbOut);
            for (c++; c <= colMax; c++) {
                n = 0;
                var bottom = positionBottomCol(c),
                    top = positionTopCol(c);
                for (b = bottom; b <= top; b++) {
                    var box = <models.PlayerIn>this.findBox(draw, b);
                    if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
                        n++;
                    }
                }

                //En déduit le nombre de matches de la colonne
                m_nMatchCol[c] = 2 * m_nMatchCol[c - 1] - n;

                nMatchRestant += n - m_nMatchCol[c];
                if (!n) {
                    c2 = c;
                }

                if (!m_nMatchCol[c]) {
                    break;
                }
            }

            //Contrôle si il n'y a pas d'autres joueurs plus à gauche
            for (c++; c <= colMax; c++) {
                n = 0;
                var bottom = positionBottomCol(c),
                    top = positionTopCol(c);
                for (b = bottom; b <= top; b++) {
                    var box = <models.PlayerIn>this.findBox(draw, b);
                    if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
                        n++;
                    }
                }
                //TODO 00/04/13: CTableau, CompteMatch à refaire pour cas tordus		
                //-------.
                //       |---A---.
                //-------'       |
                //               |-------	et un coup de dés...
                //---C---.       |
                //       |---B---'
                //---D---'

                nMatchRestant += n;

                //Ajoute un match par joueur trouvé
                if (n) {
                    this.RempliMatchs(draw, m_nMatchCol, n, c2);
                    break;
                }
            }

            //Compte tous les joueurs entrant ou qualifiés
            c = colMin;
            nMatchRestant = -m_nMatchCol[c];
            for (; c <= colMax; c++) {
                n = 0;
                var bottom = positionBottomCol(c),
                    top = positionTopCol(c);
                for (b = bottom; b <= top; b++) {
                    var box = <models.PlayerIn>this.findBox(draw, b);
                    if (box && (this.isJoueurNouveau(box) || box.qualifIn)) {
                        n++;
                    }
                }
                nMatchRestant += n;
            }

            for (c = colMin; c <= colMax; c++) {

                if (m_nMatchCol[c] > nMatchRestant) {
                    this.RempliMatchs(draw, m_nMatchCol, nMatchRestant, c);
                    break;
                }

                nMatchRestant -= m_nMatchCol[c];
            }

            //Contrôle si il n'y a pas une colonne sans match
            bColSansMatch = false;
            for (nMatchRestant = 0, c = colMin; c < colMax; c++) {
                nMatchRestant += m_nMatchCol[c];

                if (m_nMatchCol[c]) {
                    if (bColSansMatch) {
                        //Refait la répartition tout à droite
                        this.RempliMatchs(draw, m_nMatchCol, nMatchRestant, c + 1);
                        break;
                    }
                } else {
                    bColSansMatch = true;
                }
            }

            ////TODO Contrôle qu'il n'y a pas trop de match pour les joueurs
            //bColSansMatch = false;
            //for( nMatchRestant = 0, c = iColMin( draw); c< colMax; c++) {
            //    nMatchRestant += m_nMatchCol[c];
            //
            //    if( m_nMatchCol[ c]) {
            //        if( bColSansMatch) {
            //            //Refait la répartition tout à droite
            //            this.RempliMatchs(draw, nMatchRestant, c+1);
            //            break; 
            //        }
            //    } else
            //        bColSansMatch = true;
            //}	

            return m_nMatchCol;
        }

        private TirageEchelonne(draw: models.Draw, m_nMatchCol: number[]): boolean {		//Suivant

            var colMin = columnMin(draw.nbOut);
            var colMax = columnMax(draw.nbColumn, draw.nbOut);

            //Enlève le premier match possible en partant de la gauche
            for (var c = MAX_COL - 1; c > colMin; c--) {
                if (undefined === m_nMatchCol[c]) {
                    continue;
                }
                if (m_nMatchCol[c] > 1 && ((c + 1) < colMax)) {

                    if ((m_nMatchCol[c + 1] + 1) > 2 * (m_nMatchCol[c] - 1)) {
                        continue;
                    }

                    m_nMatchCol[c]--;

                    //Remet le match plus à droite
                    c++;
                    m_nMatchCol[c]++;

                    return true;
                }
            }
            return false;
        }

        private TirageEnLigne(draw: models.Draw, m_nMatchCol: number[]): boolean {	//Precedent

            var colMin = columnMin(draw.nbOut);

            //Cherche où est-ce qu'on peut ajouter un match en partant de la gauche
            var nMatchRestant = 0;
            for (var c = MAX_COL - 1; c > colMin; c--) {
                if (undefined === m_nMatchCol[c]) {
                    continue;
                }
                var iMax = Math.min(nMatchRestant + m_nMatchCol[c], countInCol(c, draw.nbOut));
                if (c > colMin) {
                    iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
                }
                if (m_nMatchCol[c] < iMax) {
                    //Ajoute le match en question
                    m_nMatchCol[c]++;
                    nMatchRestant--;

                    //Reset les autres matches de gauche
                    this.RempliMatchs(draw, m_nMatchCol, nMatchRestant, c + 1);
                    return true;
                }

                nMatchRestant += m_nMatchCol[c];
            }
            return false;
        }

        private GetJoueursTableau(draw: models.Draw): models.Player[] {

            //Récupère les joueurs du tableau
            var ppJoueur: models.Player[] = [];
            for (var i = 0; i < draw.boxes.length; i++) {

                var boxIn = <models.PlayerIn>draw.boxes[i];
                if (!boxIn) {
                    continue;
                }
                //Récupérer les joueurs et les Qualifiés entrants
                if (boxIn.qualifIn) {
                    ppJoueur.push(<any>boxIn.qualifIn);	//no qualifie entrant
                } else if (this.isJoueurNouveau(boxIn)) {
                    ppJoueur.push(boxIn._player);	//no du joueur
                }
            }

            return ppJoueur;
        }

        //Place les matches dans l'ordre
        private ConstruitMatch(oldDraw: models.Draw, m_nMatchCol: number[], players: models.Player[]): models.Draw {

            var draw = this.drawLib.newDraw(oldDraw._event, oldDraw);
            draw.boxes = [];

            var colMin = columnMin(draw.nbOut),
                colMax = columnMax(draw.nbColumn, draw.nbOut);

            //Calcule OrdreInv
            var pOrdreInv: number[] = [];
            for (var c = colMin; c <= colMax; c++) {
                var bottom = positionBottomCol(c),
                    top = positionTopCol(c);
                for (var i = bottom; i <= top; i++) {
                    if (WITH_TDS_HAUTBAS) {
                        pOrdreInv[iOrdreQhb(i, draw.nbOut)] = i;
                    } else {
                        pOrdreInv[iOrdreQ(i, draw.nbOut)] = i;
                    }
                }
            }

            this.tournamentLib.TriJoueurs(players);

            //Nombre de Tête de série
            var nTeteSerie = draw.nbOut;
            if (nTeteSerie == 1) {
                nTeteSerie = countInCol((colMax - colMin) >> 1);
            }

            var max = positionMax(draw.nbColumn, draw.nbOut);
            var pbMatch: boolean[] = new Array(max + 1);

            var iJoueur = 0,
                m = 0,
                nj = 0;
            c = -1;
            for (var o = 0; o <= max; o++) {
                var b = pOrdreInv[o];
                if (b === -1) {
                    continue;
                }
                if (column(b) != c) {
                    c = column(b);

                    m = m_nMatchCol[c] || 0;
                    nj = c > colMin ? 2 * m_nMatchCol[c - 1] - m : 0;
                }

                //fou les joueurs
                var posMatch = positionMatch(b);
                if (nj > 0) {
                    if (pbMatch[posMatch]) {
                        iJoueur++;
                        nj--;

                        var box = this.drawLib.newBox(draw, draw._event.matchFormat, b);
                        draw.boxes.push(box);
                    }
                } else {
                    //fou les matches
                    if (m > 0 && (c === colMin || pbMatch[posMatch])) {
                        pbMatch[b] = true;
                        m--;

                        var match = <models.Match> this.drawLib.newBox(draw, draw._event.matchFormat, b);
                        match.score = '';
                        draw.boxes.push(match);
                    }
                }

                if (iJoueur >= players.length) {
                    break;
                }
            }

            //fou les joueurs en commençant par les qualifiés entrants
            iJoueur = 0;    //players.length - 1;
            for (; o > 0; o--) {
                b = pOrdreInv[o];
                if (b === -1) {
                    continue;
                }

                //fou les joueurs
                if (!pbMatch[b] && pbMatch[positionMatch(b)]) {

                    //Qualifiés entrants se rencontrent
                    var qualif: number = 'number' === typeof players[iJoueur] ? <any>players[iJoueur] : 0;
                    if (qualif) {
                        var boxIn2 = <models.PlayerIn>this.findBox(draw, positionOpponent(b));
                        if (boxIn2 && boxIn2.qualifIn) {
                            //2 Qualifiés entrants se rencontrent
                            for (var t = iJoueur + 1; t >= nTeteSerie; t--) {
                                if (angular.isObject(players[t])) {
                                    //switch
                                    var p = players[t];
                                    players[t] = <any> qualif;
                                    players[iJoueur] = p;
                                    break;
                                }
                            }
                        }
                    }

                    var boxIn = <models.PlayerIn>this.findBox(draw, b);
                    if (boxIn) {
                        delete (<models.Match>boxIn).score; //not a match
                        if (qualif) {	//Qualifié entrant
                            this.drawLib.SetQualifieEntrant(boxIn, qualif);
                        } else {	//Joueur
                            this.drawLib.MetJoueur(boxIn, players[iJoueur]);

                            if ((!draw.minRank || !this.rank.isNC(draw.minRank))
                                || (!draw.maxRank || !this.rank.isNC(draw.maxRank))) {
                                //Mets les têtes de série (sauf tableau NC)
                                if (WITH_TDS_HAUTBAS) {
                                    t = iTeteSerieQhb(b, draw.nbOut);
                                } else {
                                    t = iTeteSerieQ(b, draw.nbOut);
                                }
                                if (t <= nTeteSerie && !this.drawLib.FindTeteSerie(draw, t)) {
                                    this.drawLib.SetTeteSerie(boxIn, t);
                                }
                            }
                        }
                        iJoueur++;
                    }
                }

                if (iJoueur > players.length) {
                    break;
                }
            }

            //	for( b=positionBottomCol(columnMin(draw.nbOut)); b<=positionMax(draw.nbColumn, draw.nbOut); b++)
            //		draw.boxes[ b].setLockMatch( false);

            //Mets les qualifiés sortants
            if (draw.type !== models.DrawType.Final) {

                //Find the first unused qualif number
                var group = this.drawLib.currentGroup(draw);
                if (group) {
                    for (i = 1; i <= MAX_QUALIF_ENTRANT; i++) {
                        if (!this.drawLib.FindQualifieSortant(group, i)) {
                            break;
                        }
                    }
                } else {
                    i = 1;
                }

                bottom = positionBottomCol(colMin);
                top = positionTopCol(colMin);
                for (var b = top; b >= bottom && i <= MAX_QUALIF_ENTRANT; b--, i++) {
                    var box = this.findBox(draw, b);
                    if (box) {
                        this.drawLib.SetQualifieSortant(box, i);
                    }
                }
            }

            return draw;
        }

        public boxesOpponents(match: models.Match): { box1: models.Box; box2: models.Box } {
            var pos1 = positionOpponent1(match.position),
                pos2 = positionOpponent2(match.position);
            return {
                box1: < models.Box > this.find.by(match._draw.boxes, 'position', pos1),
                box2: <models.Box> this.find.by(match._draw.boxes, 'position', pos2)
            };
        }

        public getSize(draw: models.Draw, dimensions: IDrawDimensions): ISize {

            if (!draw || !draw.nbColumn || !draw.nbOut) {
                return { width: 10, height: 10 };
            }

            return {
                width: draw.nbColumn * (dimensions.boxWidth + dimensions.interBoxWidth) - dimensions.interBoxWidth,
                height: countInCol(columnMax(draw.nbColumn, draw.nbOut))
                * (dimensions.boxHeight + dimensions.interBoxHeight) - dimensions.interBoxHeight
            };
        }

        public computePositions(draw: models.Draw, dimensions: IDrawDimensions): IPosition[] {

            if (!draw || !draw.nbColumn || !draw.nbOut || !draw.boxes || !draw.boxes.length) {
                return;
            }

            var positions: IPosition[] = [];

            //var heights = <number[]> [];  //TODO variable height

            var minPos = positionMin(draw.nbOut),
                maxPos = positionMax(draw.nbColumn, draw.nbOut),
                colMin = columnMin(draw.nbOut);
            for (var pos = maxPos; pos >= minPos; pos--) {
                //var b = box[pos];
                var col = column(pos);
                var c = draw.nbColumn - col - 1 + colMin;
                var topPos = positionTopCol(col);
                var g = positionTopCol(c - 1) + 2;
                var x = c * (dimensions.boxWidth + dimensions.interBoxWidth);
                var y = (topPos - pos) * (dimensions.boxHeight + dimensions.interBoxHeight) * g + (dimensions.boxHeight + dimensions.interBoxHeight) * (g / 2 - 0.5);
                positions[pos] = { x: x, y: y };
            }

            //to refresh lines
            (<any>(positions))._refresh = new Date();

            return positions;
        }

        public CalculeScore(draw: models.Draw): boolean {
            return true;
        }

        private isJoueurNouveau(box: models.Box): boolean {	//Première apparition du joueur dans le tableau
            if (!box) {
                return false;
            }
            var boxIn = <models.PlayerIn>box;
            var box1: models.Box, box2: models.Box;
            return box.playerId
                &&
                (
                !!boxIn.qualifIn
                ||
                !(
                ((box1 = this.box1(<models.Match> box)) && box1.playerId)
                ||
                ((box2 = this.box2(<models.Match> box)) && box2.playerId)
                )
                );
        }

        public SetQualifieEntrant(box: models.Box, inNumber?: number, player?: models.Player): boolean { //setPlayerIn
            // inNumber=0 => enlève qualifié

            var draw = box._draw;
            //ASSERT(SetQualifieEntrantOk(iBoite, inNumber, iJoueur));
            var boxIn = <models.PlayerIn> box;

            if (inNumber) {	//Ajoute un qualifié entrant
                var prev = this.drawLib.previousGroup(draw);
                if (!player && prev && inNumber !== QEMPTY) {
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
                if (inNumber === QEMPTY ||
                    !this.drawLib.FindQualifieEntrant(draw, inNumber)) {

                    boxIn.qualifIn = inNumber;

                    //Cache les boites de gauche
                    this.iBoiteDeGauche(box.position, draw, true, (box) => {
                        box.hidden = true;  //TODOjs delete the box from draw.boxes
                    });
                }
            } else {	// Enlève un qualifié entrant

                boxIn.qualifIn = 0;

                if (this.drawLib.previousGroup(draw) && !this.drawLib.EnleveJoueur(box)) {
                    ASSERT(false);
                }

                //Réaffiche les boites de gauche
                this.iBoiteDeGauche(box.position, draw, true, (box) => {
                    delete box.hidden;
                });
            }

            return true;
        }

        public SetQualifieSortant(box: models.Box, outNumber?: number): boolean { //setPlayerOut
            // outNumber=0 => enlève qualifié

            var next = this.drawLib.nextGroup(box._draw);

            //ASSERT(SetQualifieSortantOk(iBoite, outNumber));

            if (outNumber) {	//Ajoute un qualifié sortant
                var boxOut = <models.Match>box;

                //Met à jour le tableau suivant
                if (next && boxOut.playerId && boxOut.qualifOut) {
                    var boxIn = this.drawLib.FindQualifieEntrant(next, outNumber);
                    if (boxIn) {
                        ASSERT(boxIn.playerId === box.playerId);
                        if (!this.drawLib.EnleveJoueur(boxIn)) {
                            throw "Can not remove player";
                        }
                    }
                }

                //Enlève le précédent n° de qualifié sortant
                if (boxOut.qualifOut) {
                    if (!this.SetQualifieSortant(boxOut)) {	//Enlève le qualifié
                        ASSERT(false);
                    }
                }

                boxOut.qualifOut = outNumber;

                //Met à jour le tableau suivant
                if (next && box.playerId && boxIn) {
                    if (!this.drawLib.MetJoueur(boxIn, box._player, true)) {
                    }
                }

            } else {	//Enlève un qualifié sortant
                var boxOut = <models.Match>box;
                if (next && box.playerId) {
                    //Met à jour le tableau suivant
                    var boxIn = this.drawLib.FindQualifieEntrant(next, boxOut.qualifOut);
                    if (boxIn) {
                        ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                        if (!this.drawLib.EnleveJoueur(boxIn, true)) {
                            throw "Can not remove player";
                        }
                    }
                }

                delete boxOut.qualifOut;
            }

            return true;
        }

        public FindQualifieEntrant(draw: models.Draw, iQualifie: number): models.PlayerIn {

            ASSERT(iQualifie >= 0);

            if (!draw.boxes) {
                return;
            }

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
        }

        public FindQualifieSortant(draw: models.Draw, iQualifie: number): models.Match {

            ASSERT(0 < iQualifie);

            if (iQualifie === QEMPTY || !draw.boxes) {
                return;
            }

            var boxOut = <models.Match>this.find.by(draw.boxes, "qualifOut", iQualifie);
            if (boxOut) {
                return boxOut;
            }
        }

        private box1(match: models.Match): models.Box {
            var pos = positionOpponent1(match.position);
            return <models.Box> this.find.by(match._draw.boxes, 'position', pos);
        }
        private box2(match: models.Match): models.Box {
            var pos = positionOpponent2(match.position);
            return <models.Box> this.find.by(match._draw.boxes, 'position', pos);
        }

        //formule de décalage à droite:
        //
        // iNew = i - pivot * 2 ^ (log2(i+1) -log2(pivot+1))
        //
        //   pivot: iBoite qui devient 0
        //   i    : une case à gauche du pivot
        //   iNew : la même case après décalage
        //
        //formule de décalage à gauche:
        //
        // iNew = i + pivot * 2 ^ Log2(i + 1)
        //
        //   pivot: iBoite qui est remplacée par 0
        //   i    : une case à gauche du pivot
        //   iNew : la même case après décalage

        private iBoiteDeGauche(iBoite: number, draw: models.Draw, bToutesBoites: boolean, callback: (box: models.Box) => void): void {

            var b: number;
            var bOk: boolean = false;

            //ASSERT_VALID(pTableau);

            for (var iBoiteCourante = iBoite; ;) {
                var j = iBoiteCourante - iBoite * exp2(log2(iBoiteCourante + 1) - log2(iBoite + 1));
                do {
                    j++;
                    b = j + iBoite * exp2(log2(j + 1));

                    var box = this.findBox(draw, b);
                    if (!box) {
                        return;
                    }
                    bOk = (<any>(box.playerId) || bToutesBoites);
                } while (!bOk);

                if (bOk) {
                    callback(box);
                }
                iBoiteCourante = b;
            }
        }
    }

    function filledArray(size: number, value: number): number[] {
        var a = new Array(size);
        for (var i = size - 1; i >= 0; i--) {
            a[i] = 0;
        }
        return a;
    }

    function ASSERT(b: boolean, message?: string): void {
        if (!b) {
            debugger;
            throw message || 'Assertion is false';
        }
    }

    function column(pos: number): number {    //iCol
        //TODO, use a table
        var col = -1;
        for (pos++; pos; pos >>= 1, col++) { }
        return col;
    }

    function columnMax(nCol: number, nQ?: number): number { //iColMaxQ
        return !nQ || nQ === 1
            ? nCol - 1
            : column(nQ - 2) + nCol;
    }

    function columnMin(nQ?: number): number {   //iColMinQ
        return !nQ || nQ === 1
            ? 0
            : column(nQ - 2) + 1;
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

    function positionMin(nQ?: number): number { //iBoiteMinQ
        return !nQ || nQ === 1
            ? 0
            : positionBottomCol(columnMin(nQ), nQ);
    }

    function positionMax(nCol: number, nQ?: number): number {   //iBoiteMaxQ
        return !nQ || nQ === 1
            ? (1 << nCol) - 2  //iHautCol
            : positionTopCol(columnMax(nCol, nQ));
    }

    function positionMatch(pos: number): number { //IMATCH
        return (pos - 1) >> 1;
    }

    function positionOpponent(pos: number): number {  //IAUTRE
        return pos & 1 ? pos + 1 : pos - 1;
    }

    function positionOpponent1(pos: number): number { //ADVERSAIRE1
        return (pos << 1) + 2;
    }
    function positionOpponent2(pos: number): number { //ADVERSAIRE2
        return (pos << 1) + 1;
    }

    function positionPivotLeft(pos: number, pivot: number): number {    //iBoitePivotGauche
        return pos + pivot * exp2(log2(pos + 1));
    }

    function log2(x: number): number {
        ASSERT(x > 0);
        var sh = x;
        for (var i = -1; sh; sh >>= 1, i++);
        return i;
    }

    function exp2(col: number): number {
        return 1 << col;
    }

    //Têtes de série de bas en haut (FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    function iTeteSerieQ(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

        if (column(i) === columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << column(nQualifie - 1)) { 	//Puissance de deux ?
                return i === 0 ? 1 : iTeteSerieQ(i, 1);	// TODO à corriger
            } else {
                return 1 + iPartieQ(i, nQualifie);
            }
        } else {
            //Tête de série précédente (de droite)
            var t = iTeteSerieQ(positionMatch(i), nQualifie),
                v: boolean,
                d: number,
                c: number;

            if (nQualifie == 1 << column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = iDecaleGaucheQ(i, nQualifie);
            }

            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = column(d)) > 1
                && d > positionTopCol(c) - (countInCol(c, nQualifie) >> 1)) {
                v = !v;		//Inverse pour le demi-partie haute
            }

            return v ?
                t :			//La même tête de série se propage
                1 + countInCol(column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    function iOrdreQ(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        return iTeteSerieQ(i, nQualifie) - 1
            + countInCol(column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    function iPartieQ(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        var c = column(i);
        return (i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie));
        // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    //Numére de boite de la partie de tableau, ramenée à un seul qualifié
    function iDecaleGaucheQ(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        var c: number = column(i);
        return i
            - iPartieQ(i, nQualifie) * countInCol(c - columnMin(nQualifie))
            - positionBottomCol(c, nQualifie)
            + positionBottomCol(c - columnMin(nQualifie));
    }


    //Têtes de série de haut en bas (non FFT)

    //Numéro du tête de série d'une boite (identique dans plusieurs boites)
    function iTeteSerieQhb(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

        if (column(i) === columnMin(nQualifie)) {
            //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
            if (nQualifie === 1 << column(nQualifie - 1)) 	//Puissance de deux ?
                return i == 0 ? 1 : iTeteSerieQhb(i, 1);	// TODO à corriger
            else
                return 1 + iPartieQhb(i, nQualifie);
        } else {
            //Tête de série précédente (de droite)
            var t: number = iTeteSerieQhb(positionMatch(i), nQualifie),
                v: boolean,
                d: number,
                c: number;

            if (nQualifie === 1 << column(nQualifie - 1)) {	//Puissance de deux ?
                d = i;
            } else {
                d = iDecaleGaucheQhb(i, nQualifie);
            }
            v = !!(d & 1);	//Ok pour demi-partie basse

            if ((c = column(d)) > 1
                && d <= positionTopCol(c) - (countInCol(c) >> 1)) {
                v = !v;		//Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
            }
            return !v ?		//seul différence haut-bas !
                t :			//La même tête de série se propage
                1 + countInCol(column(i), nQualifie) - t;	//Nouvelle tête de série complémentaire
        }
    }

    //Ordre de remplissage des boites en partant de la droite
    //et en suivant les têtes de série
    function iOrdreQhb(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        return iTeteSerieQhb(i, nQualifie) - 1
            + countInCol(column(i), nQualifie)
            - nQualifie;
    }

    //Partie du tableau de i par rapport au qualifié sortant
    //retour: 0 à nQualifie-1, en partant du bas
    function iPartieQhb(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        var c: number = column(i);
        //	return (i - positionBottomCol(c, nQualifie) ) / countInCol(c - columnMin( nQualifie) );  
        return (nQualifie - 1) - ((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
        // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
        //TODOjs? pb division entière
    }

    function iDecaleGaucheQhb(i: number, nQualifie: number): number {
        //ASSERT(0 <= i && i < MAX_BOITE);
        ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
        var c: number = column(i);
        return i
            - (nQualifie - 1 - iPartieQhb(i, nQualifie)) * countInCol(c - columnMin(nQualifie))
            - positionBottomCol(c, nQualifie)
            + positionBottomCol(c - columnMin(nQualifie));
    }

    angular.module('jat.services.knockoutLib', ['jat.services.drawLib', 'jat.services.type', 'jat.services.find'])
        .factory('knockoutLib', (drawLib: jat.service.DrawLib, tournamentLib: jat.service.TournamentLib, rank: ServiceRank, find: Find) => {
            return new KnockoutLib(drawLib, tournamentLib, rank, find);
        });
}