;

var jat;
(function (jat) {
    (function (service) {
        var MAX_TETESERIE = 32, MAX_QUALIF_ENTRANT = 32, QEMPTY = -1;

        var DrawLib = (function () {
            function DrawLib(find) {
                this.find = find;
                this._drawLibs = {};
            }
            DrawLib.prototype.newDraw = function (parent, source) {
                var draw = {};
                if (angular.isObject(source)) {
                    angular.extend(draw, source);
                }

                draw.id = 'd' + Math.round(Math.random() * 999); //TODOjs guid service

                //default values
                draw.nbColumn = draw.nbColumn || 3;
                draw.nbOut = draw.nbOut || 1;
                draw.minRank = draw.minRank || 'NC'; //TODO init depending of previous draw

                this.initDraw(draw, parent);
                return draw;
            };

            DrawLib.prototype.initDraw = function (draw, parent) {
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
            };

            DrawLib.prototype.resetDraw = function (draw, nPlayer) {
                var _this = this;
                //remove qualif out
                var next = this.nextGroup(draw);
                if (next && draw.boxes) {
                    angular.forEach(next, function (d) {
                        if (d.boxes) {
                            angular.forEach(next, function (box) {
                                if (box && box.qualifOut) {
                                    _this.SetQualifieSortant(box);
                                }
                            });
                        }
                    });
                }

                //if (next && next.boxes && draw.boxes) {
                //    for (var i = draw.boxes.length - 1; i >= 0; i--) {
                //        var box = <models.Match> draw.boxes[i];
                //        if (box && box.qualifOut) {
                //            this.SetQualifieSortant(box);
                //        }
                //    }
                //}
                //reset boxes
                draw.boxes = [];
                draw.nbColumn = this._drawLibs[draw.type].nbColumnForPlayers(draw, nPlayer);
            };

            DrawLib.prototype.newBox = function (parent, source, position) {
                var box = {};
                if (angular.isObject(source)) {
                    angular.extend(box, source);
                    //box.id = undefined;
                    //box.position= undefined;
                } else if (angular.isString(source)) {
                    var match = box;
                    match.score = undefined;
                    match.matchFormat = source;
                }
                if (angular.isNumber(position)) {
                    box.position = position;
                }
                this.initBox(box, parent);
                return box;
            };

            DrawLib.prototype.initBox = function (box, parent) {
                box._draw = parent;
                box._player = this.getPlayer(box);
            };

            DrawLib.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
            };
            DrawLib.prototype.getSize = function (draw, dimensions) {
                return this._drawLibs[draw.type].getSize(draw, dimensions);
            };
            DrawLib.prototype.computePositions = function (draw, dimensions) {
                return this._drawLibs[draw.type].computePositions(draw, dimensions);
            };
            DrawLib.prototype.resize = function (draw, oldDraw, nJoueur) {
                this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
            };

            DrawLib.prototype.generateDraw = function (draw, generate) {
                return this._drawLibs[draw.type].generateDraw(draw, generate);
            };

            DrawLib.prototype.getPlayer = function (box) {
                return this.find.byId(box._draw._event._tournament.players, box.playerId);
            };

            //Group functions
            DrawLib.prototype.groupBegin = function (draw) {
                //return the first Draw of the suite
                var p = draw;
                while (p && p.suite) {
                    if (!p._previous)
                        break;
                    p = p._previous;
                }
                return p;
            };

            DrawLib.prototype.groupEnd = function (draw) {
                //return the last Draw of the suite
                var p = this.groupBegin(draw);
                while (p && p._next && p._next.suite)
                    p = p._next;
                return p;
            };

            DrawLib.prototype.currentGroup = function (draw) {
                var draws = [];
                var d = this.groupBegin(draw);
                while (d) {
                    draws.push(d);
                    d = d._next;
                    if (d && !d.suite) {
                        break;
                    }
                }
                return draws;
            };

            DrawLib.prototype.previousGroup = function (draw) {
                //return the draws of the previous suite
                var p = this.groupBegin(draw);
                return p && p._previous ? this.currentGroup(p._previous) : null;
            };

            DrawLib.prototype.nextGroup = function (draw) {
                //return the draws of the next suite
                var p = this.groupEnd(draw);
                return p ? this.currentGroup(p) : null;
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
            DrawLib.prototype.isCreneau = function (box) {
                return box && ('score' in box) && ((box.place) || box.date);
            };

            DrawLib.prototype.FindTeteSerie = function (draw, iTeteSerie) {
                ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);

                for (var i = 0; i <= draw.boxes.length; i++) {
                    var boxIn = draw.boxes[i];
                    if (!boxIn) {
                        continue;
                    }
                    var e = boxIn.seeded;
                    if (e === iTeteSerie || (!iTeteSerie && e)) {
                        return boxIn;
                    }

                    if (draw._next && draw._next.suite) {
                        boxIn = this.FindTeteSerie(draw._next, iTeteSerie);
                        if (boxIn) {
                            return boxIn;
                        }
                    }
                }
            };

            DrawLib.prototype.FindQualifieEntrant = function (origin, iQualifie) {
                var _this = this;
                var group = angular.isArray(origin) ? origin : this.currentGroup(origin);
                angular.forEach(group, function (d) {
                    var playerIn = _this._drawLibs[d.type].FindQualifieEntrant(d, iQualifie);
                    if (playerIn) {
                        return playerIn;
                    }
                });
                return null;
            };

            DrawLib.prototype.FindQualifieSortant = function (origin, iQualifie) {
                var _this = this;
                var group = angular.isArray(origin) ? origin : this.currentGroup(origin);
                angular.forEach(group, function (d) {
                    var boxOut = _this._drawLibs[d.type].FindQualifieSortant(d, iQualifie);
                    if (boxOut) {
                        return boxOut;
                    }
                });

                //Si iQualifie pas trouvé, ok si < somme des nSortant du groupe
                var outCount = 0;
                angular.forEach(group, function (d) {
                    if (d.type >= 2) {
                        outCount += d.nbOut;
                    }
                });
                if (iQualifie <= outCount) {
                    return -2;
                }
                return null;
            };

            DrawLib.prototype.FindAllQualifieSortant = function (origin, hideNumbers) {
                //Récupère les qualifiés sortants du tableau
                var group = angular.isArray(origin) ? origin : this.currentGroup(origin);
                if (group) {
                    var a = [];
                    for (var i = 1; i <= MAX_QUALIF_ENTRANT; i++) {
                        if (this.FindQualifieSortant(group, i)) {
                            a.push(hideNumbers ? QEMPTY : i);
                        }
                    }
                    return a;
                }
            };

            DrawLib.prototype.SetQualifieEntrant = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                return this._drawLibs[box._draw.type].SetQualifieEntrant(box, inNumber, player);
            };

            DrawLib.prototype.SetQualifieSortant = function (box, outNumber) {
                // iQualifie=0 => enlève qualifié
                return this._drawLibs[box._draw.type].SetQualifieSortant(box, outNumber);
            };

            DrawLib.prototype.CalculeScore = function (draw) {
                return this._drawLibs[draw.type].CalculeScore(draw);
            };

            //Programme un joueur, gagnant d'un match ou (avec bForce) report d'un qualifié entrant
            DrawLib.prototype.MetJoueur = function (box, player, bForce) {
                //ASSERT(MetJoueurOk(box, iJoueur, bForce));
                if (box.playerId !== player.id && box.playerId) {
                    if (!this.EnleveJoueur(box)) {
                        throw 'Error';
                    }
                }

                var boxIn = box;
                var match = box;
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
                var boxOut = box;
                var e;
                if ((e = boxOut.qualifOut) && next) {
                    var boxIn = this.FindQualifieEntrant(next, e);
                    if (boxIn) {
                        if (!boxIn.playerId && !this.MetJoueur(boxIn, player, true)) {
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
            };

            //Résultat d'un match : met le gagnant (ou le requalifié) et le score dans la boite
            DrawLib.prototype.SetResultat = function (box, boite) {
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
            };

            //Planification d'un match : met le court, la date et l'heure
            DrawLib.prototype.MetCreneau = function (box, boite) {
                ASSERT(isMatch(box));

                //ASSERT(MetCreneauOk(box, boite));
                box.place = boite.place;
                box.date = boite.date;

                return true;
            };

            DrawLib.prototype.EnleveCreneau = function (box) {
                ASSERT(isMatch(box));

                //ASSERT(EnleveCreneauOk(box));
                box.place = undefined;
                box.date = undefined;

                return true;
            };

            DrawLib.prototype.MetPointage = function (box, boite) {
                //ASSERT(MetPointageOk(box, boite));
                //TODO
                //box.setPrevenu(box, boite.isPrevenu(box));
                //box.setPrevenu(box + 1, boite.isPrevenu(box + 1));
                //box.setRecoit(box, boite.isRecoit(box));
                return true;
            };

            //Déprogramme un joueur, enlève le gagnant d'un match ou (avec bForce) enlève un qualifié entrant
            DrawLib.prototype.EnleveJoueur = function (box, bForce) {
                var match = box;
                if (!match.playerId && !match.score) {
                    return true;
                }

                //ASSERT(EnleveJoueurOk(box, bForce));
                var next = this.nextGroup(box._draw);
                var boxOut = box;
                var i;
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
                
                this.CalculeScore(box._draw);
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
            DrawLib.prototype.LockBoite = function (box) {
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
                    var boxIn = box;
                    if (boxIn.qualifIn) {
                        var boxOut = this.FindQualifieSortant(prev, boxIn.qualifIn);
                        if (boxOut) {
                            boxOut.locked = true;
                        }
                    }
                }

                return true;
            };

            //Avec report sur le tableau précédent
            DrawLib.prototype.DelockBoite = function (box) {
                if (box.hidden) {
                    return true;
                }

                delete box.locked;

                var prev = this.previousGroup(box._draw);
                if (prev) {
                    var boxIn = box;
                    if (boxIn.qualifIn) {
                        var boxOut = this.FindQualifieSortant(prev, boxIn.qualifIn);
                        if (boxOut) {
                            delete boxOut.locked;
                        }
                    }
                }

                return true;
            };

            //Rempli une boite proprement
            DrawLib.prototype.RempliBoite = function (box, boite) {
                //ASSERT(RempliBoiteOk(box, boite));
                var boxIn = box;
                var boiteIn = boite;
                var match = box;
                var boiteMatch = boite;

                if (boxIn.qualifIn && boxIn.qualifIn != boiteIn.qualifIn) {
                    if (!this.SetQualifieEntrant(box)) {
                        throw 'Error';
                    }
                } else {
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
                    if (ADVERSAIRE1(box) < m && ADVERSAIRE2(box) < m && (boiteMatch.place || boiteMatch.date)) {
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
            };

            DrawLib.prototype.DeplaceJoueur = function (box, boiteSrc, pBoite) {
                //ASSERT(DeplaceJoueurOk(box, iBoiteSrc, pBoite));
                boiteSrc = this.newBox(box._draw, boiteSrc);

                if (!this.RempliBoite(boiteSrc, pBoite)) {
                    throw 'Error';
                }

                if (!this.RempliBoite(box, boiteSrc)) {
                    throw 'Error';
                }

                return true;
            };

            DrawLib.prototype.boxesOpponents = function (match) {
                return this._drawLibs[match._draw.type].boxesOpponents(match);
            };
            return DrawLib;
        })();
        service.DrawLib = DrawLib;

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
            } else {
                return (box.position << 1) + 2;
            }
        }
        ;
        function ADVERSAIRE2(box) {
            if (isTypePoule(box._draw)) {
                var n = box._draw.nbColumn;
                return box.position / n + n * n;
            } else {
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

        angular.module('jat.services.drawLib', ['jat.services.find']).factory('drawLib', function (find) {
            return new DrawLib(find);
        });
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=drawLib.js.map
