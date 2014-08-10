var jat;
(function (jat) {
    (function (service) {
        var MIN_COL = 0, MAX_COL = 9, MAX_QUALIF_ENTRANT = 32, QEMPTY = -1, WITH_TDS_HAUTBAS = true;

        var Knockout = (function () {
            function Knockout(drawLib, tournamentLib, rank, find) {
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.rank = rank;
                this.find = find;
                drawLib._drawLibs[models.DrawType.Normal] = drawLib._drawLibs[models.DrawType.Final] = this;
            }
            Knockout.prototype.findBox = function (draw, position, create) {
                var box = this.find.by(draw.boxes, 'position', position);
                if (!box && create) {
                    box = this.drawLib.newBox(draw, undefined, position);
                }
                return box;
            };

            Knockout.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                var colMin = columnMin(draw.nbOut);

                for (var c = colMin + 1; countInCol(c, draw.nbOut) < nJoueur && c < MAX_COL; c++) {
                }

                if (MAX_COL <= c) {
                    throw 'Max_COL is reached ' + c;
                }

                return c - colMin + 1;
            };

            Knockout.prototype.resize = function (draw, oldDraw, nJoueur) {
                if (nJoueur) {
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
            };

            Knockout.prototype.generateDraw = function (draw, generate) {
                if (generate === 1) {
                    var m_nMatchCol = filledArray(MAX_COL, 0);

                    var players = this.tournamentLib.GetJoueursInscrit(draw);

                    //Récupère les qualifiés sortants du tableau précédent
                    var prev = this.drawLib.previousGroup(draw);
                    if (prev) {
                        players = players.concat(this.drawLib.FindAllQualifieSortant(prev, true));
                    }

                    this.drawLib.resetDraw(draw, players.length);
                    this.RempliMatchs(draw, m_nMatchCol, players.length - draw.nbOut);
                } else {
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
            };

            Knockout.prototype.RempliMatchs = function (draw, m_nMatchCol, nMatchRestant, colGauche) {
                var colMin = columnMin(draw.nbOut);

                colGauche = colGauche || colMin;

                for (var i = colGauche; i <= MAX_COL; i++) {
                    m_nMatchCol[i] = 0;
                }

                for (var c = Math.max(colGauche, colMin); nMatchRestant && c < MAX_COL; c++) {
                    var iMax = Math.min(nMatchRestant, countInCol(c, draw.nbOut));
                    if (colMin < c) {
                        iMax = Math.min(iMax, 2 * m_nMatchCol[c - 1]);
                    }

                    m_nMatchCol[c] = iMax;
                    nMatchRestant -= iMax;
                }
            };

            //Init m_nMatchCol à partir du tableau existant
            Knockout.prototype.CompteMatchs = function (draw) {
                var b, c2, n, bColSansMatch;

                var m_nMatchCol = new Array(MAX_COL);

                //Compte le nombre de joueurs entrants ou qualifié de la colonne
                var colMin = columnMin(draw.nbOut);
                var c = colMin;
                m_nMatchCol[c] = draw.nbOut;
                var nMatchRestant = -m_nMatchCol[c];
                var colMax = columnMax(draw.nbColumn, draw.nbOut);
                for (c++; c <= colMax; c++) {
                    n = 0;
                    var bottom = positionBottomCol(c), top = positionTopCol(c);
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

                for (c++; c <= colMax; c++) {
                    n = 0;
                    var bottom = positionBottomCol(c), top = positionTopCol(c);
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
                    var bottom = positionBottomCol(c), top = positionTopCol(c);
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
            };

            Knockout.prototype.TirageEchelonne = function (draw, m_nMatchCol) {
                var colMin = columnMin(draw.nbOut);
                var colMax = columnMax(draw.nbColumn, draw.nbOut);

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
                    } else if (this.isJoueurNouveau(boxIn)) {
                        ppJoueur.push(boxIn._player); //no du joueur
                    }
                }

                return ppJoueur;
            };

            //Place les matches dans l'ordre
            Knockout.prototype.ConstruitMatch = function (oldDraw, m_nMatchCol, players) {
                var draw = this.drawLib.newDraw(oldDraw._event, oldDraw);
                draw.boxes = [];

                var colMin = columnMin(draw.nbOut), colMax = columnMax(draw.nbColumn, draw.nbOut);

                //Calcule OrdreInv
                var pOrdreInv = [];
                for (var c = colMin; c <= colMax; c++) {
                    var bottom = positionBottomCol(c), top = positionTopCol(c);
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
                var pbMatch = new Array(max + 1);

                var iJoueur = 0, m = 0, nj = 0;
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
                    if (!pbMatch[b] && pbMatch[positionMatch(b)]) {
                        //Qualifiés entrants se rencontrent
                        var qualif = 'number' === typeof players[iJoueur] ? players[iJoueur] : 0;
                        if (qualif) {
                            var boxIn2 = this.findBox(draw, positionOpponent(b));
                            if (boxIn2 && boxIn2.qualifIn) {
                                for (var t = iJoueur + 1; t >= nTeteSerie; t--) {
                                    if (angular.isObject(players[t])) {
                                        //switch
                                        var p = players[t];
                                        players[t] = qualif;
                                        players[iJoueur] = p;
                                        break;
                                    }
                                }
                            }
                        }

                        var boxIn = this.findBox(draw, b);
                        if (boxIn) {
                            delete boxIn.score; //not a match
                            if (qualif) {
                                this.drawLib.SetQualifieEntrant(boxIn, qualif);
                            } else {
                                this.drawLib.MetJoueur(boxIn, players[iJoueur]);

                                if ((!draw.minRank || !this.rank.isNC(draw.minRank)) || (!draw.maxRank || !this.rank.isNC(draw.maxRank))) {
                                    //Mets les têtes de série (sauf tableau NC)
                                    if (WITH_TDS_HAUTBAS) {
                                        t = iTeteSerieQhb(b, draw.nbOut);
                                    } else {
                                        t = iTeteSerieQ(b, draw.nbOut);
                                    }
                                    if (t <= nTeteSerie && !this.drawLib.FindTeteSerie(draw, t)) {
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
            };

            Knockout.prototype.boxesOpponents = function (match) {
                var pos1 = positionOpponent1(match.position), pos2 = positionOpponent2(match.position);
                return {
                    box1: this.find.by(match._draw.boxes, 'position', pos1),
                    box2: this.find.by(match._draw.boxes, 'position', pos2)
                };
            };

            Knockout.prototype.getSize = function (draw, dimensions) {
                if (!draw || !draw.nbColumn || !draw.nbOut) {
                    return { width: 10, height: 10 };
                }

                return {
                    width: draw.nbColumn * (dimensions.boxWidth + dimensions.interBoxWidth) - dimensions.interBoxWidth,
                    height: countInCol(columnMax(draw.nbColumn, draw.nbOut)) * (dimensions.boxHeight + dimensions.interBoxHeight) - dimensions.interBoxHeight
                };
            };

            Knockout.prototype.computePositions = function (draw, dimensions) {
                if (!draw || !draw.nbColumn || !draw.nbOut || !draw.boxes || !draw.boxes.length) {
                    return;
                }

                var positions = [];

                //var heights = <number[]> [];  //TODO variable height
                var minPos = positionMin(draw.nbOut), maxPos = positionMax(draw.nbColumn, draw.nbOut), colMin = columnMin(draw.nbOut);
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
                (positions)._refresh = new Date();

                return positions;
            };

            Knockout.prototype.CalculeScore = function (draw) {
                return true;
            };

            Knockout.prototype.isJoueurNouveau = function (box) {
                if (!box) {
                    return false;
                }
                var boxIn = box;
                var box1, box2;
                return box.playerId && (!!boxIn.qualifIn || !(((box1 = this.box1(box)) && box1.playerId) || ((box2 = this.box2(box)) && box2.playerId)));
            };

            Knockout.prototype.SetQualifieEntrant = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                var draw = box._draw;

                //ASSERT(SetQualifieEntrantOk(iBoite, inNumber, iJoueur));
                var boxIn = box;

                if (inNumber) {
                    var prev = this.drawLib.previousGroup(draw);
                    if (!player && prev && inNumber !== QEMPTY) {
                        //Va chercher le joueur dans le tableau précédent
                        var boxOut = this.drawLib.FindQualifieSortant(prev, inNumber);
                        if (angular.isObject(boxOut)) {
                            player = boxOut._player;
                        }
                    }

                    if (boxIn.qualifIn) {
                        if (!this.SetQualifieEntrant(box)) {
                            ASSERT(false);
                        }
                    }

                    if (player) {
                        if (!this.drawLib.MetJoueur(box, player)) {
                            ASSERT(false);
                        }
                    }

                    //Qualifié entrant pas déjà pris
                    if (inNumber === QEMPTY || !this.drawLib.FindQualifieEntrant(draw, inNumber)) {
                        boxIn.qualifIn = inNumber;

                        //Cache les boites de gauche
                        this.iBoiteDeGauche(box.position, draw, true, function (box) {
                            box.hidden = true; //TODOjs delete the box from draw.boxes
                        });
                    }
                } else {
                    boxIn.qualifIn = 0;

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

            Knockout.prototype.SetQualifieSortant = function (box, outNumber) {
                // outNumber=0 => enlève qualifié
                var next = this.drawLib.nextGroup(box._draw);

                //ASSERT(SetQualifieSortantOk(iBoite, outNumber));
                if (outNumber) {
                    var boxOut = box;

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
                        if (!this.SetQualifieSortant(boxOut)) {
                            ASSERT(false);
                        }
                    }

                    boxOut.qualifOut = outNumber;

                    //Met à jour le tableau suivant
                    if (next && box.playerId && boxIn) {
                        if (!this.drawLib.MetJoueur(boxIn, box._player, true)) {
                        }
                    }
                } else {
                    var boxOut = box;
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
            };

            Knockout.prototype.FindQualifieEntrant = function (draw, iQualifie) {
                ASSERT(iQualifie >= 0);

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

            Knockout.prototype.FindQualifieSortant = function (draw, iQualifie) {
                ASSERT(0 < iQualifie);

                if (iQualifie === QEMPTY || !draw.boxes) {
                    return;
                }

                var boxOut = this.find.by(draw.boxes, "qualifOut", iQualifie);
                if (boxOut) {
                    return boxOut;
                }
            };

            Knockout.prototype.box1 = function (match) {
                var pos = positionOpponent1(match.position);
                return this.find.by(match._draw.boxes, 'position', pos);
            };
            Knockout.prototype.box2 = function (match) {
                var pos = positionOpponent2(match.position);
                return this.find.by(match._draw.boxes, 'position', pos);
            };

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

                for (var iBoiteCourante = iBoite; ;) {
                    var j = iBoiteCourante - iBoite * exp2(log2(iBoiteCourante + 1) - log2(iBoite + 1));
                    do {
                        j++;
                        b = j + iBoite * exp2(log2(j + 1));

                        var box = this.findBox(draw, b);
                        if (!box) {
                            return;
                        }
                        bOk = ((box.playerId) || bToutesBoites);
                    } while(!bOk);

                    if (bOk) {
                        callback(box);
                    }
                    iBoiteCourante = b;
                }
            };
            return Knockout;
        })();
        service.Knockout = Knockout;

        function filledArray(size, value) {
            var a = new Array(size);
            for (var i = size - 1; i >= 0; i--) {
                a[i] = 0;
            }
            return a;
        }

        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }

        function column(pos) {
            //TODO, use a table
            var col = -1;
            for (pos++; pos; pos >>= 1, col++) {
            }
            return col;
        }

        function columnMax(nCol, nQ) {
            return !nQ || nQ === 1 ? nCol - 1 : column(nQ - 2) + nCol;
        }

        function columnMin(nQ) {
            return !nQ || nQ === 1 ? 0 : column(nQ - 2) + 1;
        }

        function positionTopCol(col) {
            return (1 << (col + 1)) - 2;
        }

        function positionBottomCol(col, nQ) {
            return !nQ || nQ === 1 ? (1 << col) - 1 : (positionTopCol(col) - countInCol(col, nQ) + 1);
        }

        function countInCol(col, nQ) {
            return !nQ || nQ === 1 ? (1 << col) : nQ * countInCol(col - columnMin(nQ), 1);
        }

        function positionMin(nQ) {
            return !nQ || nQ === 1 ? 0 : positionBottomCol(columnMin(nQ), nQ);
        }

        function positionMax(nCol, nQ) {
            return !nQ || nQ === 1 ? (1 << nCol) - 2 : positionTopCol(columnMax(nCol, nQ));
        }

        function positionMatch(pos) {
            return (pos - 1) >> 1;
        }

        function positionOpponent(pos) {
            return pos & 1 ? pos + 1 : pos - 1;
        }

        function positionOpponent1(pos) {
            return (pos << 1) + 2;
        }
        function positionOpponent2(pos) {
            return (pos << 1) + 1;
        }

        function positionPivotLeft(pos, pivot) {
            return pos + pivot * exp2(log2(pos + 1));
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

        //Têtes de série de bas en haut (FFT)
        //Numéro du tête de série d'une boite (identique dans plusieurs boites)
        function iTeteSerieQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

            if (column(i) === columnMin(nQualifie)) {
                //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
                if (nQualifie === 1 << column(nQualifie - 1)) {
                    return i === 0 ? 1 : iTeteSerieQ(i, 1);
                } else {
                    return 1 + iPartieQ(i, nQualifie);
                }
            } else {
                //Tête de série précédente (de droite)
                var t = iTeteSerieQ(positionMatch(i), nQualifie), v, d, c;

                if (nQualifie == 1 << column(nQualifie - 1)) {
                    d = i;
                } else {
                    d = iDecaleGaucheQ(i, nQualifie);
                }

                v = !!(d & 1); //Ok pour demi-partie basse

                if ((c = column(d)) > 1 && d > positionTopCol(c) - (countInCol(c, nQualifie) >> 1)) {
                    v = !v; //Inverse pour le demi-partie haute
                }

                return v ? t : 1 + countInCol(column(i), nQualifie) - t;
            }
        }

        //Ordre de remplissage des boites en partant de la droite
        //et en suivant les têtes de série
        function iOrdreQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            return iTeteSerieQ(i, nQualifie) - 1 + countInCol(column(i), nQualifie) - nQualifie;
        }

        //Partie du tableau de i par rapport au qualifié sortant
        //retour: 0 à nQualifie-1, en partant du bas
        function iPartieQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return (i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie));
            // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
            //TODOjs? pb division entière
        }

        //Numére de boite de la partie de tableau, ramenée à un seul qualifié
        function iDecaleGaucheQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return i - iPartieQ(i, nQualifie) * countInCol(c - columnMin(nQualifie)) - positionBottomCol(c, nQualifie) + positionBottomCol(c - columnMin(nQualifie));
        }

        //Têtes de série de haut en bas (non FFT)
        //Numéro du tête de série d'une boite (identique dans plusieurs boites)
        function iTeteSerieQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));

            if (column(i) === columnMin(nQualifie)) {
                //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
                if (nQualifie === 1 << column(nQualifie - 1))
                    return i == 0 ? 1 : iTeteSerieQhb(i, 1);
                else
                    return 1 + iPartieQhb(i, nQualifie);
            } else {
                //Tête de série précédente (de droite)
                var t = iTeteSerieQhb(positionMatch(i), nQualifie), v, d, c;

                if (nQualifie === 1 << column(nQualifie - 1)) {
                    d = i;
                } else {
                    d = iDecaleGaucheQhb(i, nQualifie);
                }
                v = !!(d & 1); //Ok pour demi-partie basse

                if ((c = column(d)) > 1 && d <= positionTopCol(c) - (countInCol(c) >> 1)) {
                    v = !v; //Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
                }
                return !v ? t : 1 + countInCol(column(i), nQualifie) - t;
            }
        }

        //Ordre de remplissage des boites en partant de la droite
        //et en suivant les têtes de série
        function iOrdreQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            return iTeteSerieQhb(i, nQualifie) - 1 + countInCol(column(i), nQualifie) - nQualifie;
        }

        //Partie du tableau de i par rapport au qualifié sortant
        //retour: 0 à nQualifie-1, en partant du bas
        function iPartieQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);

            //	return (i - positionBottomCol(c, nQualifie) ) / countInCol(c - columnMin( nQualifie) );
            return (nQualifie - 1) - ((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
            // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
            //TODOjs? pb division entière
        }

        function iDecaleGaucheQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return i - (nQualifie - 1 - iPartieQhb(i, nQualifie)) * countInCol(c - columnMin(nQualifie)) - positionBottomCol(c, nQualifie) + positionBottomCol(c - columnMin(nQualifie));
        }

        angular.module('jat.services.knockout', ['jat.services.drawLib', 'jat.services.type', 'jat.services.find']).factory('knockout', function (drawLib, tournamentLib, rank, find) {
            return new Knockout(drawLib, tournamentLib, rank, find);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=knockout.js.map
