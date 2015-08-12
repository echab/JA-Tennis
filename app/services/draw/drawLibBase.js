;
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MAX_TETESERIE = 32, MAX_QUALIF = 32, QEMPTY = -1;
        var DrawLibBase = (function () {
            function DrawLibBase(services, drawLib, find, rank, guid) {
                this.services = services;
                this.drawLib = drawLib;
                this.find = find;
                this.rank = rank;
                this.guid = guid;
            }
            DrawLibBase.prototype.resetDraw = function (draw, nPlayer) {
                //remove qualif out
                var next = this.drawLib.nextGroup(draw);
                if (next && draw.boxes) {
                    for (var i = 0; i < next.length; i++) {
                        var boxes = next[i].boxes;
                        if (boxes) {
                            var drawLibNext = this.services.drawLibFor(next[i]);
                            for (var b = 0; b < boxes.length; b++) {
                                var box = boxes[b];
                                if (box && box.qualifOut) {
                                    drawLibNext.setPlayerOut(box);
                                }
                            }
                        }
                    }
                }
                //reset boxes
                var drawLib = this.services.drawLibFor(draw);
                draw.boxes = [];
                draw.nbColumn = drawLib.nbColumnForPlayers(draw, nPlayer);
            };
            DrawLibBase.prototype.getPlayer = function (box) {
                return this.find.byId(box._draw._event._tournament.players, box.playerId);
            };
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
            DrawLibBase.prototype.isCreneau = function (box) {
                return box && ('score' in box) && (!!box.place || !!box.date);
            };
            DrawLibBase.prototype.findSeeded = function (origin, iTeteSerie) {
                ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
                var group = angular.isArray(origin) ? origin : this.drawLib.group(origin);
                for (var i = 0; i < group.length; i++) {
                    var boxes = group[i].boxes;
                    for (var j = 0; j < boxes.length; j++) {
                        var boxIn = boxes[j];
                        if (boxIn.seeded === iTeteSerie) {
                            return boxIn;
                        }
                    }
                }
                return null;
            };
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
            DrawLibBase.prototype.MetJoueur = function (box, player, bForce) {
                //ASSERT(MetJoueurOk(box, iJoueur, bForce));
                if (box.playerId !== player.id && box.playerId) {
                    if (!this.EnleveJoueur(box)) {
                        throw 'Error';
                    }
                }
                var boxIn = box;
                var match = isMatch(box) ? box : undefined;
                box.playerId = player.id;
                box._player = player;
                //boxIn.order = 0;
                //match.score = '';
                if (isGauchePoule(box)) {
                }
                else if (match) {
                    match.date = undefined;
                    match.place = undefined;
                }
                var boxOut = box;
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
            };
            //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
            DrawLibBase.prototype.SetResultat = function (box, boite) {
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
                }
                else if (!this.EnleveJoueur(box)) {
                    throw 'Error';
                }
                box.score = boite.score;
                var drawLib = this.services.drawLibFor(box._draw);
                drawLib.computeScore(box._draw);
                return true;
            };
            //Planification d'un match : met le court, la date et l'heure
            DrawLibBase.prototype.MetCreneau = function (box, boite) {
                ASSERT(isMatch(box));
                //ASSERT(MetCreneauOk(box, boite));
                box.place = boite.place;
                box.date = boite.date;
                return true;
            };
            DrawLibBase.prototype.EnleveCreneau = function (box) {
                ASSERT(isMatch(box));
                //ASSERT(EnleveCreneauOk(box));
                box.place = undefined;
                box.date = undefined;
                return true;
            };
            DrawLibBase.prototype.MetPointage = function (box, boite) {
                //ASSERT(MetPointageOk(box, boite));
                //TODO
                //box.setPrevenu(box, boite.isPrevenu(box));
                //box.setPrevenu(box + 1, boite.isPrevenu(box + 1));
                //box.setRecoit(box, boite.isRecoit(box));
                return true;
            };
            //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
            DrawLibBase.prototype.EnleveJoueur = function (box, bForce) {
                var match = box;
                if (!match.playerId && !match.score) {
                    return true;
                }
                //ASSERT(EnleveJoueurOk(box, bForce));
                var next = this.drawLib.nextGroup(box._draw);
                var boxOut = box;
                var i;
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
                var boxIn = box;
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
            };
            //Avec report sur le tableau suivant
            DrawLibBase.prototype.LockBoite = function (box) {
                ASSERT(!!box);
                if (iDiagonale(box) === box.position) {
                }
                ASSERT(!!box);
                //ASSERT(box.isJoueur());
                if (box.hidden) {
                    return true;
                }
                box.locked = true;
                var prev = this.drawLib.previousGroup(box._draw);
                if (prev) {
                    var boxIn = box;
                    if (boxIn.qualifIn) {
                        var boxOut = this.drawLib.groupFindPlayerOut(prev, boxIn.qualifIn);
                        if (boxOut) {
                            boxOut.locked = true;
                        }
                    }
                }
                return true;
            };
            //Avec report sur le tableau précédent
            DrawLibBase.prototype.DelockBoite = function (box) {
                if (box.hidden) {
                    return true;
                }
                delete box.locked;
                var prev = this.drawLib.previousGroup(box._draw);
                if (prev) {
                    var boxIn = box;
                    if (boxIn.qualifIn) {
                        var boxOut = this.drawLib.groupFindPlayerOut(prev, boxIn.qualifIn);
                        if (boxOut) {
                            delete boxOut.locked;
                        }
                    }
                }
                return true;
            };
            //Rempli une boite proprement
            DrawLibBase.prototype.RempliBoite = function (box, boite) {
                //ASSERT(RempliBoiteOk(box, boite));
                var drawLib = this.services.drawLibFor(box._draw);
                var boxIn = box;
                var boiteIn = boite;
                var match = isMatch(box) ? box : undefined;
                var boiteMatch = isMatch(boite) ? boite : undefined;
                if (boxIn.qualifIn
                    && boxIn.qualifIn != boiteIn.qualifIn) {
                    if (!drawLib.setPlayerIn(box)) {
                        throw 'Error';
                    }
                }
                else {
                    //Vide la boite écrasée
                    if (!this.EnleveJoueur(box)) {
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
                }
                else {
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
                            && (boiteMatch.place || boiteMatch.date)) {
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
            };
            DrawLibBase.prototype.DeplaceJoueur = function (box, boiteSrc, pBoite) {
                //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));
                boiteSrc = this.drawLib.newBox(box._draw, boiteSrc);
                if (!this.RempliBoite(boiteSrc, pBoite)) {
                    throw 'Error';
                }
                if (!this.RempliBoite(box, boiteSrc)) {
                    throw 'Error';
                }
                return true;
            };
            return DrawLibBase;
        })();
        service.DrawLibBase = DrawLibBase;
        function isMatch(box) {
            return box && ('score' in box);
        }
        function isTypePoule(draw) {
            return draw.type === models.DrawType.PouleSimple || draw.type === models.DrawType.PouleAR;
        }
        function iDiagonale(box) {
            var draw = box._draw;
            return isTypePoule(box._draw) ? (box.position % draw.nbColumn) * (draw.nbColumn + 1) : box.position;
        }
        function isGauchePoule(box) {
            return isTypePoule(box._draw) ? (box.position >= (box._draw.nbColumn * box._draw.nbColumn)) : false;
        }
        function ADVERSAIRE1(box) {
            if (isTypePoule(box._draw)) {
                var n = box._draw.nbColumn;
                return box.position % n + n * n;
            }
            else {
                return (box.position << 1) + 2;
            }
        }
        ;
        function ADVERSAIRE2(box) {
            if (isTypePoule(box._draw)) {
                var n = box._draw.nbColumn;
                return Math.floor(box.position / n) + n * n;
            }
            else {
                return (box.position << 1) + 1;
            }
        }
        ;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
