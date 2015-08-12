var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MIN_COL = 0, MAX_COL_POULE = 22, MAX_JOUEUR = 8191, MAX_TABLEAU = 63, QEMPTY = -1;
        /**
          box positions example for nbColumn=3:
    
                |  11   |  10   |   9   |   row:
         -------+-------+-------+-------+
            11  |-- 8 --|   5   |   2   |     2
         -------+-------+-------+-------+
            10  |   7   |-- 4 --|   1   |     1
         -------+-------+-------+-------+
             9  |   6   |   3   |-- 0 --|     0
         -------+-------+-------+-------+
    
        col: 3      2       1       0
        */
        var Roundrobin = (function (_super) {
            __extends(Roundrobin, _super);
            function Roundrobin(services, drawLib, tournamentLib, ranking, rank, find, guid) {
                _super.call(this, services, drawLib, find, rank, guid);
                this.tournamentLib = tournamentLib;
                this.ranking = ranking;
                services.registerDrawlib(this);
            }
            //Override
            Roundrobin.prototype.manage = function (draw) {
                return draw.type === models.DrawType.PouleSimple || draw.type === models.DrawType.PouleAR;
            };
            Roundrobin.prototype.findBox = function (draw, position, create) {
                var box = this.find.by(draw.boxes, 'position', position);
                if (!box && create) {
                    box = this.drawLib.newBox(draw, undefined, position);
                }
                return box;
            };
            //Override
            Roundrobin.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                return nJoueur;
            };
            //Override
            Roundrobin.prototype.boxesOpponents = function (match) {
                var n = match._draw.nbColumn;
                var pos1 = seedPositionOpponent1(match.position, n), pos2 = seedPositionOpponent2(match.position, n);
                return {
                    box1: this.find.by(match._draw.boxes, 'position', pos1),
                    box2: this.find.by(match._draw.boxes, 'position', pos2)
                };
            };
            //Override
            Roundrobin.prototype.getSize = function (draw) {
                if (!draw.nbColumn) {
                    return { width: 1, height: 1 };
                }
                var n = draw.nbColumn;
                return {
                    width: (n + 1),
                    height: n // * (dimensions.boxHeight + dimensions.interBoxHeight) - dimensions.interBoxHeight
                };
            };
            //Override
            Roundrobin.prototype.computePositions = function (draw) {
                //nothing to do for round robin
                return;
            };
            //Override
            Roundrobin.prototype.resize = function (draw, oldDraw, nJoueur) {
                if (nJoueur) {
                    throw "Not implemnted";
                }
                if (oldDraw && draw.nbColumn !== oldDraw.nbColumn) {
                    var nOld = oldDraw.nbColumn, nCol = draw.nbColumn, maxPos = nCol * (nCol + 1) - 1;
                    //Shift the boxes positions
                    for (var i = draw.boxes.length - 1; i >= 0; i--) {
                        var box = draw.boxes[i];
                        var b = positionResize(box.position, nOld, nCol);
                        var diag = iDiagonalePos(nCol, b);
                        if (b < 0 || maxPos < b
                            || b === diag || (b < diag && draw.type === models.DrawType.PouleSimple)) {
                            draw.boxes.splice(i, 1); //remove the exceeding box
                            continue;
                        }
                        box.position = b;
                    }
                    //Append new in players and matches
                    if (nCol > nOld) {
                        for (var i = nCol - nOld - 1; i >= 0; i--) {
                            var b = ADVERSAIRE1(draw, i);
                            var boxIn = this.drawLib.newBox(draw, undefined, b);
                            draw.boxes.push(boxIn);
                            //Append the matches
                            var diag = iDiagonalePos(nCol, b);
                            for (b -= nCol; b >= 0; b -= nCol) {
                                if (b === diag || (b < diag && draw.type === models.DrawType.PouleSimple)) {
                                    continue;
                                }
                                var match = this.drawLib.newBox(draw, undefined, b);
                                match.score = '';
                                draw.boxes.push(match);
                            }
                        }
                    }
                }
            };
            //Override
            Roundrobin.prototype.findPlayerIn = function (draw, iQualifie) {
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
            //Override
            Roundrobin.prototype.findPlayerOut = function (draw, iQualifie) {
                ASSERT(0 < iQualifie);
                if (iQualifie === QEMPTY || !draw.boxes) {
                    return;
                }
                for (var i = 0; i < draw.boxes.length; i++) {
                    var boxOut = draw.boxes[i];
                    if (boxOut && boxOut.qualifOut === iQualifie) {
                        return boxOut;
                    }
                }
            };
            //Override
            Roundrobin.prototype.setPlayerIn = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                var draw = box._draw;
                //ASSERT(setPlayerInOk(iBoite, inNumber, iJoueur));
                if (inNumber) {
                    var prev = this.drawLib.previousGroup(draw);
                    if (!player && prev && inNumber != QEMPTY) {
                        //Va chercher le joueur dans le tableau précédent
                        var boxOut = this.drawLib.groupFindPlayerOut(prev, inNumber);
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
                        if (!this.MetJoueur(box, player)) {
                            ASSERT(false);
                        }
                    }
                    //Qualifié entrant pas déjà pris
                    if (inNumber == QEMPTY ||
                        !this.findPlayerIn(draw, inNumber)) {
                        this.setPlayerIn(box, inNumber);
                    }
                }
                else {
                    box.qualifIn = 0;
                    if (this.drawLib.previousGroup(draw) && !this.EnleveJoueur(box)) {
                        ASSERT(false);
                    }
                }
                return true;
            };
            //Override
            Roundrobin.prototype.setPlayerOut = function (box, outNumber) {
                // outNumber=0 => enlève qualifié
                //ASSERT(setPlayerOutOk(iBoite, outNumber));
                var next = this.drawLib.nextGroup(box._draw);
                //TODOjs findBox()
                var diag = box._draw.boxes[iDiagonale(box)];
                var box1 = box._draw.boxes[ADVERSAIRE1(box._draw, box.position)];
                if (outNumber) {
                    //Met à jour le tableau suivant
                    if (next && box.playerId && box.qualifOut) {
                        var boxIn = this.findPlayerIn(box._draw, outNumber);
                        if (boxIn) {
                            ASSERT(boxIn.playerId === box.playerId);
                            if (!this.EnleveJoueur(boxIn)) {
                                ASSERT(false);
                            }
                        }
                    }
                    //Enlève le précédent n° de qualifié sortant
                    if (box.qualifOut)
                        if (!this.setPlayerOut(box)) {
                            ASSERT(false);
                        }
                    this.setPlayerOut(box, outNumber);
                    diag.playerId = box1.playerId;
                    this.drawLib.initBox(diag, box._draw);
                    if (next && box.playerId) {
                        //Met à jour le tableau suivant
                        var boxIn = this.drawLib.groupFindPlayerIn(next, outNumber);
                        if (boxIn) {
                            ASSERT(!boxIn.playerId);
                            if (!this.MetJoueur(boxIn, box._player, true)) {
                                ASSERT(false);
                            }
                        }
                    }
                }
                else {
                    var match = box;
                    if (next && box.playerId) {
                        //Met à jour le tableau suivant
                        var boxIn = this.drawLib.groupFindPlayerIn(next, match.qualifOut);
                        if (boxIn) {
                            ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                            if (!this.EnleveJoueur(boxIn, true)) {
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
                //		computeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());
                //#endif //WITH_POULE
                return true;
            };
            Roundrobin.prototype.GetJoueursTableau = function (draw) {
                //Récupère les joueurs du tableau
                var ppJoueur = [];
                var draws = this.drawLib.group(draw);
                for (var j = 0; j < draws.length; j++) {
                    var d = draws[j];
                    var first = positionFirstIn(d.nbColumn), last = positionLastIn(d.nbColumn);
                    for (var b = last; b <= first; b++) {
                        var boxIn = this.findBox(d, b);
                        if (!boxIn) {
                            continue;
                        }
                        //Récupérer les joueurs et les Qualifiés entrants
                        if (boxIn.qualifIn) {
                            ppJoueur.push(boxIn.qualifIn); //no qualifie entrant
                        }
                        else if (boxIn.playerId) {
                            ppJoueur.push(boxIn._player); //a player
                        }
                    }
                }
                return ppJoueur;
            };
            //Override
            Roundrobin.prototype.generateDraw = function (refDraw, generate, afterIndex) {
                var oldDraws = this.drawLib.group(refDraw);
                var iTableau = this.find.indexOf(refDraw._event.draws, 'id', oldDraws[0].id);
                if (iTableau === -1) {
                    iTableau = refDraw._event.draws.length; //append the draws at the end of the event
                }
                var players = this.tournamentLib.GetJoueursInscrit(refDraw);
                //Récupère les qualifiés sortants du tableau précédent
                var prev = afterIndex >= 0 ? draw._event.draws[afterIndex] : undefined; // = this.drawLib.previousGroup(refDraw);
                if (prev) {
                    players = players.concat(this.drawLib.groupFindAllPlayerOut(prev, true));
                }
                //Tri et Mélange les joueurs de même classement
                this.tournamentLib.TriJoueurs(players);
                var event = refDraw._event;
                var nDraw = Math.floor((players.length + (refDraw.nbColumn - 1)) / refDraw.nbColumn);
                if (!nDraw) {
                    nDraw = 1;
                }
                if ((event.draws.length + nDraw) >= MAX_TABLEAU) {
                    throw ('Maximum refDraw count is reached'); //TODOjs
                    return;
                }
                var draws = [];
                //Créé les poules
                var name = refDraw.name;
                for (var t = 0; t < nDraw; t++) {
                    if (t === 0) {
                        var draw = refDraw;
                    }
                    else {
                        draw = this.drawLib.newDraw(event, refDraw);
                        draw.suite = true;
                    }
                    draw.boxes = [];
                    draw.name = name + (nDraw > 1 ? ' (' + (t + 1) + ')' : '');
                    for (var i = draw.nbColumn - 1; i >= 0 && players.length; i--) {
                        var b = ADVERSAIRE1(draw, i);
                        var j = t + (draw.nbColumn - i - 1) * nDraw;
                        var boxIn = this.drawLib.newBox(draw, undefined, b);
                        draw.boxes.push(boxIn);
                        if (j < players.length) {
                            var qualif = 'number' === typeof players[j] ? players[j] : 0;
                            if (qualif) {
                                if (!this.setPlayerIn(boxIn, qualif)) {
                                    return;
                                }
                            }
                            else if (!this.MetJoueur(boxIn, players[j])) {
                                return;
                            }
                        }
                        //Append the matches
                        var diag = iDiagonalePos(draw.nbColumn, b);
                        for (b -= draw.nbColumn; b >= 0; b -= draw.nbColumn) {
                            if (b === diag || (b < diag && draw.type === models.DrawType.PouleSimple)) {
                                continue;
                            }
                            var match = this.drawLib.newBox(draw, undefined, b);
                            match.score = '';
                            draw.boxes.push(match);
                        }
                    }
                    //Ajoute 1 tête de série
                    var boxT = this.findBox(draw, ADVERSAIRE1(draw, draw.nbColumn - 1));
                    boxT.seeded = t + 1;
                    draws.push(draw);
                }
                return draws;
            };
            //Calcul classement des poules
            //Override
            Roundrobin.prototype.computeScore = function (draw) {
                //TODO
                throw "Not implemented";
                var m_pOrdrePoule; //classement de chaque joueur de la poule
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
            };
            return Roundrobin;
        })(service.DrawLibBase);
        service.Roundrobin = Roundrobin;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
        function column(pos, nCol) {
            return Math.floor(pos / nCol);
        }
        function row(pos, nCol) {
            return pos % nCol;
        }
        function positionFirstIn(nCol) {
            return nCol * (nCol + 1);
        }
        function positionLastIn(nCol) {
            return nCol * nCol + 1;
        }
        function seedPositionOpponent1(pos, nCol) {
            return (pos % nCol) + (nCol * nCol);
        }
        function seedPositionOpponent2(pos, nCol) {
            return Math.floor(pos / nCol) + (nCol * nCol);
        }
        function positionMatchPoule(row, col, nCol) {
            return (col * nCol) + row;
        }
        function positionResize(pos, nColOld, nCol) {
            var r = row(pos, nColOld), col = column(pos, nColOld);
            return (nCol - nColOld + r) + nCol * (nCol - nColOld + col);
        }
        function iDiagonale(box) {
            var n = box._draw.nbColumn;
            return (box.position % n) * (n + 1);
        }
        function iDiagonalePos(nbColumn, pos) {
            return (pos % nbColumn) * (nbColumn + 1);
        }
        function ADVERSAIRE1(draw, pos) {
            var n = draw.nbColumn;
            return pos % n + n * n;
        }
        ;
        angular.module('jat.services.roundrobin', ['jat.services.services', 'jat.services.tournamentLib', 'jat.services.drawLib', 'jat.services.type', 'jat.services.find'])
            .factory('roundrobin', [
            'services',
            'drawLib',
            'tournamentLib',
            'ranking',
            'rank',
            'find',
            'guid',
            function (services, drawLib, tournamentLib, ranking, rank, find, guid) {
                return new Roundrobin(services, drawLib, tournamentLib, ranking, rank, find, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
