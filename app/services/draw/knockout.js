var jat;
(function (jat) {
    var service;
    (function (service) {
        var MIN_COL = 0, MAX_COL = 9, MAX_QUALIF = 32, QEMPTY = -1, WITH_TDS_HAUTBAS = true;
        /**
    
        ---14---
                >-- 6---.
        ---13---	    |
                        >-- 2---.
        ---12---    	|   	|
                >-- 5---'	    |
        ---11---		        |
                                >-- 0---
        ---10---		        |
                >-- 4---.	    |
        --- 9---	    |   	|
                        >-- 1---'
        --- 8---	    |
                >-- 3---'
        --- 7---
        */
        var Knockout = (function () {
            function Knockout(drawLib, knockoutLib, tournamentLib, rank, find) {
                this.drawLib = drawLib;
                this.knockoutLib = knockoutLib;
                this.tournamentLib = tournamentLib;
                this.rank = rank;
                this.find = find;
                drawLib._drawLibs[models.DrawType.Normal]
                    = drawLib._drawLibs[models.DrawType.Final]
                        = this;
            }
            Knockout.prototype.findBox = function (draw, position, create) {
                var box = this.find.by(draw.boxes, 'position', position);
                if (!box && create) {
                    box = this.drawLib.newBox(draw, undefined, position);
                }
                return box;
            };
            //Override
            Knockout.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                var k = this.knockoutLib;
                var colMin = k.columnMin(draw.nbOut);
                for (var c = colMin + 1; k.countInCol(c, draw.nbOut) < nJoueur && c < MAX_COL; c++) {
                }
                if (MAX_COL <= c) {
                    throw 'Max_COL is reached ' + c;
                }
                return c - colMin + 1;
            };
            //Override
            Knockout.prototype.resize = function (draw, oldDraw, nJoueur) {
                var k = this.knockoutLib;
                if (nJoueur) {
                    draw.nbColumn = this.nbColumnForPlayers(draw, nJoueur);
                }
                //Shift the boxes
                if (oldDraw && draw.nbOut !== oldDraw.nbOut) {
                    var n = k.columnMax(draw.nbColumn, draw.nbOut) - k.columnMax(oldDraw.nbColumn, oldDraw.nbOut);
                    if (n != 0) {
                        var top = k.positionTopCol(n);
                        for (var i = draw.boxes.length - 1; i >= 0; i--) {
                            var box = draw.boxes[i];
                            box.position = this.positionPivotLeft(box.position, top);
                        }
                    }
                }
            };
            //Override
            Knockout.prototype.generateDraw = function (draw, generate, afterIndex) {
                if (generate === models.GenerateType.Create) {
                    var m_nMatchCol = tool.filledArray(MAX_COL, 0);
                    var players = this.tournamentLib.GetJoueursInscrit(draw);
                    //Récupère les qualifiés sortants du tableau précédent
                    var prev = afterIndex >= 0 ? draw._event.draws[afterIndex] : draw._previous; // = this.drawLib.previousGroup(draw);
                    if (prev) {
                        players = players.concat(this.drawLib.findAllPlayerOut(prev, true));
                    }
                    this.drawLib.resetDraw(draw, players.length);
                    this.RempliMatchs(draw, m_nMatchCol, players.length - draw.nbOut);
                }
                else {
                    m_nMatchCol = this.CompteMatchs(draw);
                    if (generate === models.GenerateType.PlusEchelonne) {
                        if (!this.TirageEchelonne(draw, m_nMatchCol)) {
                            return;
                        }
                    }
                    else if (generate === models.GenerateType.PlusEnLigne) {
                        if (!this.TirageEnLigne(draw, m_nMatchCol)) {
                            return;
                        }
                    }
                    players = this.GetJoueursTableau(draw);
                }
                //Tri et Mélange les joueurs de même classement
                this.tournamentLib.TriJoueurs(players);
                draw = this.ConstruitMatch(draw, m_nMatchCol, players);
                return [draw];
            };
            Knockout.prototype.RempliMatchs = function (draw, m_nMatchCol, nMatchRestant, colGauche) {
                var k = this.knockoutLib;
                var colMin = k.columnMin(draw.nbOut);
                colGauche = colGauche || colMin;
                for (var i = colGauche; i <= MAX_COL; i++) {
                    m_nMatchCol[i] = 0;
                }
                //Rempli les autres matches de gauche normalement
                for (var c = Math.max(colGauche, colMin); nMatchRestant && c < MAX_COL; c++) {
                    var iMax = Math.min(nMatchRestant, k.countInCol(c, draw.nbOut));
                    if (colMin < c) {
                        iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
                    }
                    m_nMatchCol[c] = iMax;
                    nMatchRestant -= iMax;
                }
            };
            //Init m_nMatchCol à partir du tableau existant
            Knockout.prototype.CompteMatchs = function (draw) {
                var k = this.knockoutLib;
                var b, c2, n, bColSansMatch;
                var m_nMatchCol = new Array(MAX_COL);
                //Compte le nombre de joueurs entrants ou qualifié de la colonne
                var colMin = k.columnMin(draw.nbOut);
                var c = colMin;
                m_nMatchCol[c] = draw.nbOut;
                var nMatchRestant = -m_nMatchCol[c];
                var colMax = k.columnMax(draw.nbColumn, draw.nbOut);
                for (c++; c <= colMax; c++) {
                    n = 0;
                    var bottom = k.positionBottomCol(c), top = k.positionTopCol(c);
                    for (b = bottom; b <= top; b++) {
                        var box = this.findBox(draw, b);
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
                    var bottom = k.positionBottomCol(c), top = k.positionTopCol(c);
                    for (b = bottom; b <= top; b++) {
                        var box = this.findBox(draw, b);
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
                    var bottom = k.positionBottomCol(c), top = k.positionTopCol(c);
                    for (b = bottom; b <= top; b++) {
                        var box = this.findBox(draw, b);
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
                    }
                    else {
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
            };
            Knockout.prototype.TirageEchelonne = function (draw, m_nMatchCol) {
                var k = this.knockoutLib;
                var colMin = k.columnMin(draw.nbOut);
                var colMax = k.columnMax(draw.nbColumn, draw.nbOut);
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
            };
            Knockout.prototype.TirageEnLigne = function (draw, m_nMatchCol) {
                var k = this.knockoutLib;
                var colMin = k.columnMin(draw.nbOut);
                //Cherche où est-ce qu'on peut ajouter un match en partant de la gauche
                var nMatchRestant = 0;
                for (var c = MAX_COL - 1; c > colMin; c--) {
                    if (undefined === m_nMatchCol[c]) {
                        continue;
                    }
                    var iMax = Math.min(nMatchRestant + m_nMatchCol[c], k.countInCol(c, draw.nbOut));
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
            };
            Knockout.prototype.GetJoueursTableau = function (draw) {
                //Récupère les joueurs du tableau
                var ppJoueur = [];
                for (var i = 0; i < draw.boxes.length; i++) {
                    var boxIn = draw.boxes[i];
                    if (!boxIn) {
                        continue;
                    }
                    //Récupérer les joueurs et les Qualifiés entrants
                    if (boxIn.qualifIn) {
                        ppJoueur.push(boxIn.qualifIn); //no qualifie entrant
                    }
                    else if (this.isJoueurNouveau(boxIn)) {
                        ppJoueur.push(boxIn._player); //no du joueur
                    }
                }
                return ppJoueur;
            };
            //Place les matches dans l'ordre
            Knockout.prototype.ConstruitMatch = function (oldDraw, m_nMatchCol, players) {
                var k = this.knockoutLib;
                var draw = this.drawLib.newDraw(oldDraw._event, oldDraw);
                draw.boxes = [];
                var colMin = k.columnMin(draw.nbOut), colMax = k.columnMax(draw.nbColumn, draw.nbOut);
                //Calcule OrdreInv
                var pOrdreInv = [];
                for (var c = colMin; c <= colMax; c++) {
                    var bottom = k.positionBottomCol(c), top = k.positionTopCol(c);
                    for (var i = bottom; i <= top; i++) {
                        if (WITH_TDS_HAUTBAS) {
                            pOrdreInv[this.iOrdreQhb(i, draw.nbOut)] = i;
                        }
                        else {
                            pOrdreInv[this.iOrdreQ(i, draw.nbOut)] = i;
                        }
                    }
                }
                //Nombre de Tête de série
                var nTeteSerie = draw.nbOut;
                if (nTeteSerie == 1) {
                    nTeteSerie = k.countInCol((colMax - colMin) >> 1);
                }
                var max = k.positionMax(draw.nbColumn, draw.nbOut);
                var pbMatch = new Array(max + 1);
                var iJoueur = 0, m = 0, nj = 0;
                c = -1;
                for (var o = 0; o <= max; o++) {
                    var b = pOrdreInv[o];
                    if (b === -1) {
                        continue;
                    }
                    if (k.column(b) != c) {
                        c = k.column(b);
                        m = m_nMatchCol[c] || 0;
                        nj = c > colMin ? 2 * m_nMatchCol[c - 1] - m : 0;
                    }
                    //fou les joueurs
                    var posMatch = k.positionMatch(b);
                    if (nj > 0) {
                        if (pbMatch[posMatch]) {
                            iJoueur++;
                            nj--;
                            var box = this.drawLib.newBox(draw, draw._event.matchFormat, b);
                            draw.boxes.push(box);
                        }
                    }
                    else {
                        //fou les matches
                        if (m > 0 && (c === colMin || pbMatch[posMatch])) {
                            pbMatch[b] = true;
                            m--;
                            var match = this.drawLib.newBox(draw, draw._event.matchFormat, b);
                            match.score = '';
                            draw.boxes.push(match);
                        }
                    }
                    if (iJoueur >= players.length) {
                        break;
                    }
                }
                //fou les joueurs en commençant par les qualifiés entrants
                iJoueur = 0; //players.length - 1;
                for (; o > 0; o--) {
                    b = pOrdreInv[o];
                    if (b === -1) {
                        continue;
                    }
                    //fou les joueurs
                    if (!pbMatch[b] && pbMatch[k.positionMatch(b)]) {
                        //Qualifiés entrants se rencontrent
                        var qualif = 'number' === typeof players[iJoueur] ? players[iJoueur] : 0;
                        if (qualif) {
                            var boxIn2 = this.findBox(draw, k.positionOpponent(b));
                            if (boxIn2 && boxIn2.qualifIn) {
                                //2 Qualifiés entrants se rencontrent
                                for (var t = iJoueur + 1; t >= nTeteSerie; t--) {
                                    if (angular.isObject(players[t])) {
                                        //switch
                                        var p = players[t];
                                        players[t] = qualif;
                                        players[iJoueur] = p;
                                        qualif = 0;
                                        break;
                                    }
                                }
                            }
                        }
                        var boxIn = this.findBox(draw, b);
                        if (boxIn) {
                            delete boxIn.score; //not a match
                            if (qualif) {
                                this.drawLib.setPlayerIn(boxIn, qualif);
                            }
                            else {
                                this.drawLib.MetJoueur(boxIn, players[iJoueur]);
                                if ((!draw.minRank || !this.rank.isNC(draw.minRank))
                                    || (!draw.maxRank || !this.rank.isNC(draw.maxRank))) {
                                    //Mets les têtes de série (sauf tableau NC)
                                    if (WITH_TDS_HAUTBAS) {
                                        t = this.iTeteSerieQhb(b, draw.nbOut);
                                    }
                                    else {
                                        t = this.iTeteSerieQ(b, draw.nbOut);
                                    }
                                    if (t <= nTeteSerie && !this.drawLib.findSeeded(draw, t)) {
                                        boxIn.seeded = t;
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
                //	for( b=k.positionBottomCol(k.columnMin(draw.nbOut)); b<=k.positionMax(draw.nbColumn, draw.nbOut); b++)
                //		draw.boxes[ b].setLockMatch( false);
                //Mets les qualifiés sortants
                if (draw.type !== models.DrawType.Final) {
                    //Find the first unused qualif number
                    var group = this.drawLib.group(draw);
                    if (group) {
                        for (i = 1; i <= MAX_QUALIF; i++) {
                            if (!this.drawLib.findPlayerOut(group, i)) {
                                break;
                            }
                        }
                    }
                    else {
                        i = 1;
                    }
                    bottom = k.positionBottomCol(colMin);
                    top = k.positionTopCol(colMin);
                    for (var b = top; b >= bottom && i <= MAX_QUALIF; b--, i++) {
                        var boxOut = this.findBox(draw, b);
                        if (boxOut) {
                            this.drawLib.setPlayerOut(boxOut, i);
                        }
                    }
                }
                return draw;
            };
            //Override
            Knockout.prototype.boxesOpponents = function (match) {
                var k = this.knockoutLib;
                var pos1 = k.positionOpponent1(match.position), pos2 = k.positionOpponent2(match.position);
                return {
                    box1: this.find.by(match._draw.boxes, 'position', pos1),
                    box2: this.find.by(match._draw.boxes, 'position', pos2)
                };
            };
            //Override
            Knockout.prototype.getSize = function (draw) {
                var k = this.knockoutLib;
                if (!draw || !draw.nbColumn || !draw.nbOut) {
                    return { width: 1, height: 1 }; //{ width: dimensions.boxWidth, height: dimensions.boxHeight };
                }
                return {
                    width: draw.nbColumn,
                    height: k.countInCol(k.columnMax(draw.nbColumn, draw.nbOut), draw.nbOut)
                };
            };
            //Override
            Knockout.prototype.computePositions = function (draw) {
                var k = this.knockoutLib;
                if (!draw || !draw.nbColumn || !draw.nbOut || !draw.boxes || !draw.boxes.length) {
                    return;
                }
                var positions = [];
                //var heights = <number[]> [];  //TODO variable height
                var minPos = k.positionMin(draw.nbOut), maxPos = k.positionMax(draw.nbColumn, draw.nbOut), c0 = draw.nbColumn - 1 + k.columnMin(draw.nbOut);
                for (var pos = maxPos; pos >= minPos; pos--) {
                    var col = k.column(pos), topPos = k.positionTopCol(col), c = c0 - col, g = k.positionTopCol(c - 1) + 2;
                    positions[pos] = {
                        x: c,
                        y: (topPos - pos) * g + g / 2 - 0.5
                    };
                    var box = this.find.by(draw.boxes, 'position', pos);
                    if (box) {
                        box._x = positions[pos].x;
                        box._y = positions[pos].y;
                    }
                }
                return positions;
            };
            //Override
            Knockout.prototype.computeScore = function (draw) {
                return true;
            };
            Knockout.prototype.isJoueurNouveau = function (box) {
                if (!box) {
                    return false;
                }
                var boxIn = box;
                var opponents = this.boxesOpponents(box);
                return box.playerId
                    &&
                        (!!boxIn.qualifIn
                            ||
                                !((opponents.box1 && opponents.box1.playerId)
                                    ||
                                        (opponents.box2 && opponents.box2.playerId)));
            };
            //Override
            Knockout.prototype.setPlayerIn = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                var draw = box._draw;
                //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));
                if (inNumber) {
                    var prev = this.drawLib.previousGroup(draw);
                    if (!player && prev && prev.length && inNumber !== QEMPTY) {
                        //Va chercher le joueur dans le tableau précédent
                        var boxOut = this.drawLib.findPlayerOut(prev, inNumber);
                        if (angular.isObject(boxOut)) {
                            player = boxOut._player;
                        }
                    }
                    if (box.qualifIn) {
                        if (!this.setPlayerIn(box)) {
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
                        !this.drawLib.findPlayerIn(draw, inNumber)) {
                        box.qualifIn = inNumber;
                        //Cache les boites de gauche
                        this.iBoiteDeGauche(box.position, draw, true, function (box) {
                            box.hidden = true; //TODOjs delete the box from draw.boxes
                        });
                    }
                }
                else {
                    box.qualifIn = 0;
                    if (this.drawLib.previousGroup(draw) && !this.drawLib.EnleveJoueur(box)) {
                        ASSERT(false);
                    }
                    //Réaffiche les boites de gauche
                    this.iBoiteDeGauche(box.position, draw, true, function (box) {
                        delete box.hidden;
                    });
                }
                return true;
            };
            //Override
            Knockout.prototype.setPlayerOut = function (box, outNumber) {
                // outNumber=0 => enlève qualifié
                var next = this.drawLib.nextGroup(box._draw);
                //ASSERT(setPlayerOutOk(iBoite, outNumber));
                if (outNumber) {
                    //Met à jour le tableau suivant
                    if (next && box.playerId && box.qualifOut) {
                        var boxIn = this.drawLib.findPlayerIn(next, outNumber);
                        if (boxIn) {
                            ASSERT(boxIn.playerId === box.playerId);
                            if (!this.drawLib.EnleveJoueur(boxIn)) {
                                throw "Can not remove player";
                            }
                        }
                    }
                    //Enlève le précédent n° de qualifié sortant
                    if (box.qualifOut) {
                        if (!this.setPlayerOut(box)) {
                            ASSERT(false);
                        }
                    }
                    box.qualifOut = outNumber;
                    //Met à jour le tableau suivant
                    if (next && box.playerId && boxIn) {
                        if (!this.drawLib.MetJoueur(boxIn, box._player, true)) {
                        }
                    }
                }
                else {
                    if (next && box.playerId) {
                        //Met à jour le tableau suivant
                        var boxIn = this.drawLib.findPlayerIn(next, box.qualifOut);
                        if (boxIn) {
                            ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                            if (!this.drawLib.EnleveJoueur(boxIn, true)) {
                                throw "Can not remove player";
                            }
                        }
                    }
                    delete box.qualifOut;
                }
                return true;
            };
            //Override
            Knockout.prototype.findPlayerIn = function (draw, iQualifie) {
                ASSERT(0 <= iQualifie);
                if (!draw.boxes) {
                    return;
                }
                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var boxIn = draw.boxes[i];
                    if (!boxIn) {
                        continue;
                    }
                    var e = boxIn.qualifIn;
                    if (e === iQualifie || (!iQualifie && e)) {
                        return boxIn;
                    }
                }
            };
            //Override
            Knockout.prototype.findPlayerOut = function (draw, iQualifie) {
                ASSERT(0 < iQualifie);
                if (iQualifie === QEMPTY || !draw.boxes) {
                    return;
                }
                return this.find.by(draw.boxes, "qualifOut", iQualifie);
            };
            //private box1(match: models.Match): models.Box {
            //    var pos = k.positionOpponent1(match.position);
            //    return <models.Box> this.find.by(match._draw.boxes, 'position', pos);
            //}
            //private box2(match: models.Match): models.Box {
            //    var pos = k.positionOpponent2(match.position);
            //    return <models.Box> this.find.by(match._draw.boxes, 'position', pos);
            //}
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
            Knockout.prototype.iBoiteDeGauche = function (iBoite, draw, bToutesBoites, callback) {
                var b;
                var bOk = false;
                //ASSERT_VALID(pTableau);
                for (var iBoiteCourante = iBoite;;) {
                    var j = iBoiteCourante - iBoite * exp2(log2(iBoiteCourante + 1) - log2(iBoite + 1));
                    do {
                        j++;
                        b = j + iBoite * exp2(log2(j + 1));
                        var box = this.findBox(draw, b);
                        if (!box) {
                            return;
                        }
                        bOk = ((box.playerId) || bToutesBoites);
                    } while (!bOk);
                    if (bOk) {
                        callback(box);
                    }
                    iBoiteCourante = b;
                }
            };
            Knockout.prototype.positionPivotLeft = function (pos, pivot) {
                return pos + pivot * exp2(log2(pos + 1));
            };
            //Têtes de série de bas en haut (FFT)
            //Numéro du tête de série d'une boite (identique dans plusieurs boites)
            Knockout.prototype.iTeteSerieQ = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                if (k.column(i) === k.columnMin(nQualifie)) {
                    //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
                    if (nQualifie === 1 << k.column(nQualifie - 1)) {
                        return i === 0 ? 1 : this.iTeteSerieQ(i, 1); // TODO à corriger
                    }
                    else {
                        return 1 + this.iPartieQ(i, nQualifie);
                    }
                }
                else {
                    //Tête de série précédente (de droite)
                    var t = this.iTeteSerieQ(k.positionMatch(i), nQualifie), v, d, c;
                    if (nQualifie == 1 << k.column(nQualifie - 1)) {
                        d = i;
                    }
                    else {
                        d = this.iDecaleGaucheQ(i, nQualifie);
                    }
                    v = !!(d & 1); //Ok pour demi-partie basse
                    if ((c = k.column(d)) > 1
                        && d > k.positionTopCol(c) - (k.countInCol(c, nQualifie) >> 1)) {
                        v = !v; //Inverse pour le demi-partie haute
                    }
                    return v ?
                        t :
                        1 + k.countInCol(k.column(i), nQualifie) - t; //Nouvelle tête de série complémentaire
                }
            };
            //Ordre de remplissage des boites en partant de la droite
            //et en suivant les têtes de série
            Knockout.prototype.iOrdreQ = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                return this.iTeteSerieQ(i, nQualifie) - 1
                    + k.countInCol(k.column(i), nQualifie)
                    - nQualifie;
            };
            //Partie du tableau de i par rapport au qualifié sortant
            //retour: 0 à nQualifie-1, en partant du bas
            Knockout.prototype.iPartieQ = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                var c = k.column(i);
                return Math.floor((i - k.positionBottomCol(c, nQualifie)) / k.countInCol(c - k.columnMin(nQualifie)));
                // 	return MulDiv( i - k.positionBottomCol(c, nQualifie), 1, k.countInCol(c - k.columnMin( nQualifie)) );
                //TODOjs? pb division entière
            };
            //Numére de boite de la partie de tableau, ramenée à un seul qualifié
            Knockout.prototype.iDecaleGaucheQ = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                var c = k.column(i);
                return i
                    - this.iPartieQ(i, nQualifie) * k.countInCol(c - k.columnMin(nQualifie))
                    - k.positionBottomCol(c, nQualifie)
                    + k.positionBottomCol(c - k.columnMin(nQualifie));
            };
            //Têtes de série de haut en bas (non FFT)
            //Numéro du tête de série d'une boite (identique dans plusieurs boites)
            Knockout.prototype.iTeteSerieQhb = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                if (k.column(i) === k.columnMin(nQualifie)) {
                    //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
                    if (nQualifie === 1 << k.column(nQualifie - 1))
                        return i == 0 ? 1 : this.iTeteSerieQhb(i, 1); // TODO à corriger
                    else
                        return 1 + this.iPartieQhb(i, nQualifie);
                }
                else {
                    //Tête de série précédente (de droite)
                    var t = this.iTeteSerieQhb(k.positionMatch(i), nQualifie), v, d, c;
                    if (nQualifie === 1 << k.column(nQualifie - 1)) {
                        d = i;
                    }
                    else {
                        d = this.iDecaleGaucheQhb(i, nQualifie);
                    }
                    v = !!(d & 1); //Ok pour demi-partie basse
                    if ((c = k.column(d)) > 1
                        && d <= k.positionTopCol(c) - (k.countInCol(c) >> 1)) {
                        v = !v; //Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
                    }
                    return !v ?
                        t :
                        1 + k.countInCol(k.column(i), nQualifie) - t; //Nouvelle tête de série complémentaire
                }
            };
            //Ordre de remplissage des boites en partant de la droite
            //et en suivant les têtes de série
            Knockout.prototype.iOrdreQhb = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                return this.iTeteSerieQhb(i, nQualifie) - 1
                    + k.countInCol(k.column(i), nQualifie)
                    - nQualifie;
            };
            //Partie du tableau de i par rapport au qualifié sortant
            //retour: 0 à nQualifie-1, en partant du bas
            Knockout.prototype.iPartieQhb = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                var c = k.column(i);
                //	return (i - k.positionBottomCol(c, nQualifie) ) / k.countInCol(c - k.columnMin( nQualifie) );  
                return (nQualifie - 1) - Math.floor((i - k.positionBottomCol(c, nQualifie)) / k.countInCol(c - k.columnMin(nQualifie)));
                // 	return MulDiv( i - k.positionBottomCol(c, nQualifie), 1, k.countInCol(c - k.columnMin( nQualifie)) );
                //TODOjs? pb division entière
            };
            Knockout.prototype.iDecaleGaucheQhb = function (i, nQualifie) {
                var k = this.knockoutLib;
                //ASSERT(0 <= i && i < MAX_BOITE);
                ASSERT(1 <= nQualifie && nQualifie <= k.countInCol(k.column(i)));
                var c = k.column(i);
                return i
                    - (nQualifie - 1 - this.iPartieQhb(i, nQualifie)) * k.countInCol(c - k.columnMin(nQualifie))
                    - k.positionBottomCol(c, nQualifie)
                    + k.positionBottomCol(c - k.columnMin(nQualifie));
            };
            return Knockout;
        })();
        service.Knockout = Knockout;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
        function log2(x) {
            ASSERT(x > 0);
            var sh = x;
            for (var i = -1; sh; sh >>= 1, i++)
                ;
            return i;
        }
        function exp2(col) {
            return 1 << col;
        }
        angular.module('jat.services.knockout', ['jat.services.drawLib', 'jat.services.tournamentLib', 'jat.services.type', 'jat.services.find', 'jat.services.knockoutLib'])
            .factory('knockout', [
            'drawLib',
            'knockoutLib',
            'tournamentLib',
            'rank',
            'find',
            function (drawLib, knockoutLib, tournamentLib, rank, find) {
                return new Knockout(drawLib, knockoutLib, tournamentLib, rank, find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
