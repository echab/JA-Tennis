var jat;
(function (jat) {
    var service;
    (function (service) {
        var MAX_TETESERIE = 32, MAX_QUALIF = 32, QEMPTY = -1;
        var DrawLib = (function () {
            function DrawLib(services, find, rank, guid) {
                this.services = services;
                this.find = find;
                this.rank = rank;
                this.guid = guid;
            }
            DrawLib.prototype.newDraw = function (parent, source, after) {
                var draw = {};
                if (angular.isObject(source)) {
                    angular.extend(draw, source);
                }
                draw.id = draw.id || this.guid.create('d');
                delete draw.$$hashKey; //remove angular id
                //default values
                draw.type = draw.type || models.DrawType.Normal;
                draw.nbColumn = draw.nbColumn || 3;
                draw.nbOut = draw.nbOut || 1;
                if (after) {
                    draw._previous = after;
                }
                if (!draw.minRank) {
                    draw.minRank = after && after.maxRank ? this.rank.next(after.maxRank) : 'NC';
                }
                if (draw.maxRank && this.rank.compare(draw.minRank, draw.maxRank) > 0) {
                    draw.maxRank = draw.minRank;
                }
                draw._event = parent;
                return draw;
            };
            DrawLib.prototype.initDraw = function (draw, parent) {
                draw._event = parent;
                draw.type = draw.type || 0;
                draw.nbColumn = draw.nbColumn || 0;
                draw.nbOut = draw.nbOut || 0;
                //init boxes
                if (!draw.boxes) {
                    return;
                }
                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var box = draw.boxes[i];
                    this.initBox(box, draw);
                }
            };
            DrawLib.prototype.newBox = function (parent, source, position) {
                var box = {};
                if (angular.isObject(source)) {
                    angular.extend(box, source);
                }
                else if (angular.isString(source)) {
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
            //         public abstract nbColumnForPlayers(draw: models.Draw, nJoueur: number): number {
            //             return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
            //         }
            //         public getSize(draw: models.Draw): ISize {
            //             return this._drawLibs[draw.type].getSize(draw);
            //         }
            //         public computePositions(draw: models.Draw): IPoint[] {
            //             return this._drawLibs[draw.type].computePositions(draw);
            //         }
            //         public resize(draw: models.Draw, oldDraw?: models.Draw, nJoueur?: number): void {
            //             this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
            //         }
            // 
            //         public generateDraw(draw: models.Draw, generate: models.GenerateType, afterIndex: number): models.Draw[] {
            //             return this._drawLibs[draw.type].generateDraw(draw, generate, afterIndex);
            //         }
            DrawLib.prototype.refresh = function (draw) {
                draw._refresh = new Date(); //force angular refresh
            };
            DrawLib.prototype.updateQualif = function (draw) {
                var drawLib = this.services.drawLibFor(draw);
                //retreive qualifIn box
                var qualifs = [];
                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var boxIn = draw.boxes[i];
                    if (boxIn.qualifIn) {
                        qualifs.push(boxIn);
                    }
                }
                tool.shuffle(qualifs);
                //remove old qualif numbers
                for (i = qualifs.length - 1; i >= 0; i--) {
                    drawLib.setPlayerIn(qualifs[i], 0);
                }
                //assign new qualif number
                for (i = qualifs.length - 1; i >= 0; i--) {
                    drawLib.setPlayerIn(qualifs[i], i + 1);
                }
            };
            DrawLib.prototype.getPlayer = function (box) {
                return this.find.byId(box._draw._event._tournament.players, box.playerId);
            };
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
            //** return the group of draw of the given draw (mainly for group of round robin). */
            DrawLib.prototype.group = function (draw) {
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
            //** return the draws of the previous group. */
            DrawLib.prototype.previousGroup = function (draw) {
                var p = this.groupBegin(draw);
                return p && p._previous ? this.group(p._previous) : null;
            };
            //** return the draws of the next group. */
            DrawLib.prototype.nextGroup = function (draw) {
                var p = this.groupEnd(draw);
                return p && p._next ? this.group(p._next) : null;
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
                return box && ('score' in box) && (!!box.place || !!box.date);
            };
            DrawLib.prototype.findSeeded = function (origin, iTeteSerie) {
                ASSERT(1 <= iTeteSerie && iTeteSerie <= MAX_TETESERIE);
                var group = angular.isArray(origin) ? origin : this.group(origin);
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
            DrawLib.prototype.groupFindPlayerIn = function (group, iQualifie) {
                ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
                //var group = angular.isArray(group) ? <models.Draw[]>group : this.group(<models.Draw>group);
                for (var i = 0; i < group.length; i++) {
                    var d = group[i];
                    var drawLib = this.services.drawLibFor(d);
                    var playerIn = drawLib.findPlayerIn(d, iQualifie);
                    if (playerIn) {
                        return playerIn;
                    }
                }
            };
            DrawLib.prototype.groupFindPlayerOut = function (group, iQualifie) {
                ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
                //var group = angular.isArray(origin) ? <models.Draw[]>origin : this.group(<models.Draw>origin);
                for (var i = 0; i < group.length; i++) {
                    var d = group[i];
                    var drawLib = this.services.drawLibFor(d);
                    var boxOut = drawLib.findPlayerOut(d, iQualifie);
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
                    return -2; //TODO
                }
                return null;
            };
            DrawLib.prototype.groupFindAllPlayerOut = function (origin, hideNumbers) {
                //Récupère les qualifiés sortants du tableau
                var group = angular.isArray(origin) ? origin : this.group(origin);
                if (group) {
                    var a = [];
                    for (var i = 1; i <= MAX_QUALIF; i++) {
                        if (this.groupFindPlayerOut(group, i)) {
                            a.push(hideNumbers ? QEMPTY : i);
                        }
                    }
                    return a;
                }
            };
            DrawLib.prototype.findAllPlayerOutBox = function (origin) {
                //Récupère les qualifiés sortants du tableau
                var group = angular.isArray(origin) ? origin : this.group(origin);
                if (group) {
                    var a = [], m;
                    for (var i = 1; i <= MAX_QUALIF; i++) {
                        if (m = this.groupFindPlayerOut(group, i)) {
                            a.push(m);
                        }
                    }
                    return a;
                }
            };
            return DrawLib;
        })();
        service.DrawLib = DrawLib;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
        angular.module('jat.services.drawLib', ['jat.services.services', 'jat.services.find', 'jat.services.type', 'jat.services.guid'])
            .factory('drawLib', [
            'services',
            'find',
            'rank',
            'guid',
            function (services, find, rank, guid) {
                return new DrawLib(services, find, rank, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
