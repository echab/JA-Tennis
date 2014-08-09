'use strict';
angular.module('jat.services.fft', []).factory('rank', function () {
    var _group = {
        "4e série": "NC,40,30/5,30/4,30/3,30/2,30/1",
        "3e série": "30,15/5,15/4,15/3,15/2,15/1",
        "2e série": "15,5/6,4/6,3/6,2/6,1/6",
        "1e série": "0,-1/6,-2/6,-3/6,-4/6,-5/6",
        "promotion": "-15,-30"
    };

    var _groups = [], _groupOf = {}, _ranks = [], _index = {};
    function _init() {
        for (var i in _group) {
            _groups.push(i);
            var g = _group[i].split(",");
            _ranks = _ranks.concat(g);
            for (var j = g.length - 1; j >= 0; j--) {
                _groupOf[g[j]] = i;
            }
        }
        for (var j = _ranks.length - 1; j >= 0; j--) {
            _index[_ranks[j]] = j;
        }
    }
    _init();

    function list() {
        return _ranks;
    }

    function isValid(rank) {
        return _index[rank] >= 0;
    }

    function next(rank) {
        var i = _index[rank];
        return _ranks[i + 1];
    }

    function previous(rank) {
        var i = _index[rank];
        return _ranks[i - 1];
    }

    function compare(rank1, rank2) {
        var i = _index[rank1], j = _index[rank2];
        return i - j;
    }

    function groups() {
        return _groups;
    }

    function groupOf(rank) {
        return _groupOf[rank];
    }

    return {
        list: list,
        isValid: isValid,
        next: next,
        previous: previous,
        compare: compare,
        groups: groups,
        groupOf: groupOf
    };
}).factory('category', function () {
    //.provider('category', function() {
    // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf
    var _category = {
        "-8ans": { ageMax: 8 },
        "-9ans": { ageMax: 9 },
        "-10ans": { ageMax: 10 },
        "-11ans": { ageMax: 11 },
        "-12ans": { ageMax: 12 },
        "-13ans": { ageMax: 13 },
        "-14ans": { ageMax: 14 },
        "-15ans": { ageMax: 15 },
        "-16ans": { ageMax: 16 },
        "-17ans": { ageMax: 17 },
        "-18ans": { ageMax: 18 },
        "Senior": { ageMin: 18, ageMax: 34 },
        "+35ans": { ageMin: 35 },
        "+45ans": { ageMin: 45 },
        "+55ans": { ageMin: 55 },
        "+65ans": { ageMin: 60 },
        "+70ans": { ageMin: 70 },
        "+75ans": { ageMin: 75 }
    };
    var _now = new Date(), _beginOfTime = new Date(0), currentYear = _now.getMonth() < 10 ? _now.getFullYear() + 1 : _now.getFullYear();

    //refDate = new Date( currentYear, 9, 1);    //1er Octobre
    //    this.refDate = function( date) {
    //        refDate = date;
    //    }
    var _categories = [], _index = {};

    function _init() {
        for (var c in _category) {
            _categories.push(c);
        }
        for (var i = _categories.length - 1; i >= 0; i--) {
            _index[_categories[i]] = i;
        }
    }
    _init();

    function list() {
        return _categories;
    }

    function isValid(category) {
        return _index[category] >= 0;
    }

    function compare(category1, category2) {
        var i = _index[category1], j = _index[category2];
        return i - j;
    }

    function getAge(date) {
        //var age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
        var age = currentYear - date.getFullYear();
        return age;
    }

    function ofDate(date) {
        var age = getAge(date);
        for (var i in _category) {
            var categ = _category[i];

            if (categ.ageMin && age < categ.ageMin) {
                continue;
            }
            if (categ.ageMax && categ.ageMax < age) {
                continue;
            }
            return i;
        }
    }

    //this.$get = function() {
    return {
        currentYear: currentYear,
        list: list,
        isValid: isValid,
        ofDate: ofDate,
        getAge: getAge,
        compare: compare
    };
    //};
}).factory('matchFormat', function () {
    var _matchFormats = {
        "A": { name: "A: traditionnel (3 sets à 6 jeux)" },
        "B": { name: "B: traditionnel (3 sets à 6 jeux) - point décisif" },
        "C": { name: "C: 3 sets à 4 jeux - jeu décisif à 4/4" },
        "D": { name: "D: 3 sets à 4 jeux - jeu décisif à 4/4 - point décisif" },
        "E": { name: "E: 3 sets à 3 jeux - jeu décisif à 2/2" },
        "F": { name: "F: 3 sets à 3 jeux - jeu décisif à 2/2 - point décisif" },
        "G": { name: "G: 3 jeux décisif" },
        "H": { name: "H: 3 sets à 4 jeux - jeu décisif à 3/3 - point décisif" },
        "I": { name: "I: 3 sets à 5 jeux - jeu décisif à 4/4 - point décisif" }
    };

    function list() {
        return _matchFormats;
    }

    return {
        list: list
    };
}).factory('score', function () {
    var reScore = /^(([0-9]{1,2}\/[0-9]{1,2})\s+){2,5}(Ab )?$/;

    function isValid(score) {
        var a = reScore.exec(score + " ");

        if (a === null) {
            return false;
        }

        //check score
        var sets = score.split(/\s+/);
        for (var i = 0; i < sets.length; i++) {
            var games = sets[i].split("/");

            var j1 = parseInt(games[0]);
            var j2 = parseInt(games[1]);
            //TODO check score
        }

        return true;
    }

    return {
        isValid: isValid
    };
}).factory('licence', function () {
    var reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
    var keys = "ABCDEFGHJKLMNPRSTUVWXYZ";

    return {
        isValid: function isValid(licence) {
            var a = reLicence.exec(licence + " ");

            if (a === null) {
                return false;
            }

            //check licence key
            var v = parseInt(a[1]);
            var k = keys.charAt(v % 23);

            return k == a[2];
        }
    };
});
'use strict';
angular.module('jat.event.list', []).directive('listEvents', function () {
    var dir = {
        templateUrl: 'event/listEvents.html',
        //controller: 'listEventsCtrl',
        replace: true,
        restrict: 'EA',
        scope: true,
        link: function postLink(scope, element, attrs, controller) {
            scope.$watch(attrs.listEvents, function (newValue, oldValue, scope) {
                scope.events = newValue;
            });
        }
    };
    return dir;
});
'use strict';
angular.module('jat.draw.list', ['jat.services.math', 'jat.services.fft', 'jat.services.find']).directive('draw2', function (math, find, rank) {
    var boxWidth = 150, boxHeight = 40, interBoxWidth = 10, interBoxHeight = 10;

    var dir = {
        //replace: true,
        restrict: 'EA',
        scope: true,
        controller: function ($scope, math) {
            $scope.getPosition = function (position) {
                if (!$scope.draw) {
                    return { x: 0, y: 0 };
                }
                var col = math.column(position);
                var c = $scope.draw.nbColumn - col - 1;
                var topPos = math.positionTopCol(col);
                var g = math.positionTopCol(c - 1) + 2;
                return {
                    x: c * (boxWidth + interBoxWidth),
                    y: (topPos - position) * (boxHeight + interBoxHeight) * g + (boxHeight + interBoxHeight) * (g / 2 - 0.5)
                };
            };

            $scope.getPlayer = function (id) {
                if ($scope.draw) {
                    return find.byId($scope.draw._event._tournament.players, id);
                }
            };
            $scope.getMatch = function (position) {
                return find.by($scope.draw.boxes, 'position', position);
            };
            $scope.filterPlayer = function (player, index) {
                //var position = index == 0 ? math.positionOpponent1(this.match.position) : math.positionOpponent2(this.match.position);
                //var m = $scope.getMatch(position);
                //return !!m;
                //return find.indexOf($scope.draw.matches, 'position', position) >= 0;
                return true;
            };
        },
        link: function postLink(scope, element, attrs, controller) {
            scope.ranks = rank.list();
            scope.$watch(attrs.draw2, function (newValue, oldValue) {
                scope.draw = newValue;

                //computePositions(scope.draw, scope);
                scope.width = scope.height = 0;
                if (scope.draw) {
                    scope.width = scope.draw.nbColumn * (boxWidth + interBoxWidth) - interBoxWidth;
                    scope.height = math.countInCol(scope.draw.nbColumn - 1, scope.draw.nbOut) * (boxHeight + interBoxHeight) - interBoxHeight;
                }
            });
        }
    };
    return dir;
}).directive('match', function (find, math) {
    var dir = {
        //replace: true,
        restrict: 'EA',
        scope: true,
        require: '^draw2',
        link: function postLink(scope, element, attrs, controller) {
            var draw = scope.match._draw;
            var players = draw._event._tournament.players;

            scope.position = scope.match.position;
            scope.$watch('player1.name', function (newValue) {
                //console.log('Player1 name changed: ' + (newValue ? newValue : '-'));
            });

            var pos = math.positionOpponent1(scope.match.position);
            var box = draw.boxes[pos];
            scope.player1 = math.player1(scope.match);
            scope.player2 = math.player2(scope.match);

            //if (scope.match.winner) {
            //    scope.player = scope.match.winner == 1 ? scope.player1 : scope.player2;
            //}
            scope.player = find.byId(players, box.playerId);

            scope.$watch(attrs.draw2, function (newValue, oldValue) {
                var pos = scope.getPosition(scope.match.position);
                scope.x = pos.x;
                scope.y = pos.y;
            });
        }
    };
    return dir;
}).directive('inPlayer', function (math, find) {
    var dir = {
        //replace: true,
        restrict: 'EA',
        scope: true,
        require: '^draw2',
        link: function postLink(scope, element, attrs, controller) {
            var players = scope.match._draw._event._tournament.players;

            scope.position = scope.$index == 0 ? math.positionOpponent1(scope.match.position) : math.positionOpponent2(scope.match.position);
            scope.player = find.byId(players, scope.player);

            scope.$watch(attrs.draw2, function (newValue, oldValue) {
                var pos = scope.getPosition(scope.position);
                scope.x = pos.x;
                scope.y = pos.y;
            });
        }
    };
    return dir;
});
'use strict';
angular.module('jat.draw.dialog', []).controller('dialogDrawCtrl', function ($scope, rank, category, selection, title, draw) {
    //console.log("Draw controller: cntr");
    $scope.title = title;
    $scope.draw = draw;

    $scope.selection = selection;

    $scope.ranks = rank.list();
    $scope.categories = category.list();
});
'use strict';
angular.module('jat.event.dialog', []).controller('dialogEventCtrl', function ($scope, rank, category, selection, title, event) {
    //console.log("Event controller: cntr");
    $scope.title = title;
    $scope.event = event;

    $scope.selection = selection;

    $scope.ranks = rank.list();
    $scope.categories = category.list();
    //$scope.removeEvent = () => dialog.close('Del');
});
'use strict';
angular.module('jat.match.dialog', []).controller('dialogMatchCtrl', function ($scope, find, math, matchFormat, title, match) {
    $scope.title = title;
    $scope.match = match;

    var tournament = match._draw._event._tournament;

    //$scope.player1 = find.byId(tournament.players, match.player1);
    //$scope.player2 = find.byId(tournament.players, match.player2);
    $scope.player1Id = math.box1(match).playerId;
    $scope.player2Id = math.box2(match).playerId;
    $scope.player1 = math.player1(match);
    $scope.player2 = math.player2(match);

    //$scope.winnerId = match.playerId == $scope.player1Id ? 1 : match.playerId == $scope.player2Id ? ;
    $scope.places = tournament.places;
    $scope.matchFormats = matchFormat.list();
});
'use strict';
angular.module('jat.player.dialog', ['jat.utils.checkList']).controller('dialogPlayerCtrl', function ($scope, rank, category, selection, title, player) {
    //console.log("Player controller: cntr");
    $scope.title = title;
    $scope.player = player;

    $scope.selection = selection;

    $scope.ranks = rank.list();
    $scope.categories = category.list();
});
'use strict';
// Module
var models;
(function (models) {
    function copy(source, destination) {
        if (!destination) {
            destination = source;
            if (source) {
                if (angular.isArray(source)) {
                    destination = copy(source, []);
                } else if (angular.isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (angular.isObject(source)) {
                    destination = copy(source, {});
                }
            }
        } else {
            if (source === destination)
                throw Error("Can't copy equivalent objects or arrays");
            if (angular.isArray(source)) {
                destination.length = 0;
                for (var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                for (var key in source) {
                    if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {
                        destination[key] = copy(source[key]);
                    }
                }
            }
        }
        return destination;
    }
    models.copy = copy;
})(models || (models = {}));
'use strict';
var models;
(function (models) {
    var Box = (function () {
        function Box() {
        }
        Box.init = //constructor(parent: Draw, data?: any) {
        //    copy(data, this);
        //    Box.init(this, parent);
        //}
        function (box, parent) {
            box._draw = parent;
            //var injector = angular.injector(['jat.services.find']);
            //var find = injector.get('find');
            //this._player = find.byId(parent._event._tournament.players,this.playerId);
        };

        Box.prototype.getPlayer = function () {
            var injector = angular.injector(['jat.services.find']);
            var find = injector.get('find');
            return find.byId(this._draw._event._tournament.players, this.playerId);
        };
        return Box;
    })();
    models.Box = Box;
})(models || (models = {}));
'use strict';
var models;
(function (models) {
    var PlayerIn = (function () {
        function PlayerIn(parent, data) {
            models.copy(data, this);
            models.Box.init(this, parent);
        }
        PlayerIn.prototype.getPlayer = function () {
            var injector = angular.injector(['jat.services.find']);
            var find = injector.get('find');
            return find.byId(this._draw._event._tournament.players, this.playerId);
        };
        return PlayerIn;
    })();
    models.PlayerIn = PlayerIn;
})(models || (models = {}));
'use strict';
// Draw directive
angular.module('jat.draw', ['jat.services.math', 'jat.services.fft', 'jat.services.find']).directive('draw', [
    '$compile',
    'math',
    'find',
    function ($compile, math, find) {
        //var boxWidth = 150, boxHeight = 40, interBoxWidth = 10, interBoxHeight = 10;
        var dir = {
            replace: false,
            terminal: true,
            //transclude: 'element',
            scope: true,
            compile: function (element, attr, linker) {
                var fnTemplateBox, fnTemplateIn, fnTemplateEmpty;
                return {
                    pre: function preLink(scope, tElement, tAttr, controller) {
                        //var childBox = angular.element(".box", element);   //jQuery
                        var childBox = getChildByClass(element, 'box');
                        if (childBox.length) {
                            fnTemplateBox = $compile(childBox);
                        }
                        childBox = getChildByClass(element, 'inPlayer');
                        if (childBox.length) {
                            fnTemplateIn = $compile(childBox);
                        }
                        childBox = getChildByClass(element, 'empty');
                        if (childBox.length) {
                            fnTemplateEmpty = $compile(childBox);
                        }
                    },
                    post: function postLink(scope, iElement, iAttr, controller) {
                        scope.getPlayer = function (id) {
                            return id ? find.byId(scope.draw._event._tournament.players, id) : undefined;
                        };

                        var boxWidth = parseInt(iAttr.boxWidth || "150"), boxHeight = parseInt(iAttr.boxHeight || "40"), interBoxWidth = parseInt(iAttr.interBoxWidth || "10"), interBoxHeight = parseInt(iAttr.interBoxHeight || "10");

                        //scope.$watch(iAttr.draw, function (newValue: models.Draw, oldValue: models.Draw) {
                        //    scope.draw = newValue;
                        //    scope.$watchCollection("draw.boxes", function (boxes) {
                        //        computePositions(scope);
                        //        redraw(element, scope);
                        //    });
                        //}, false);
                        var fnUnwatchBoxes = scope.$watchCollection(iAttr.draw + ".boxes", function (boxes, oldBoxes) {
                            scope.draw = boxes && boxes.length ? boxes[0]._draw : undefined;
                            computePositions(scope);
                            redraw(element, scope);
                        });

                        function computePositions(scope) {
                            scope.positions = [];
                            scope.width = scope.height = 0;
                            var draw = scope.draw;
                            if (!draw) {
                                return;
                            }

                            scope.width = draw.nbColumn * (boxWidth + interBoxWidth) - interBoxWidth;
                            scope.height = math.countInCol(draw.nbColumn - 1, draw.nbOut) * (boxHeight + interBoxHeight) - interBoxHeight;

                            if (!draw.boxes || !draw.boxes.length) {
                                return;
                            }

                            //var heights = <number[]> [];
                            var maxPos = math.positionMax(draw.nbColumn, draw.nbOut);
                            for (var pos = maxPos; pos >= 0; pos--) {
                                //var b = box[pos];
                                var col = math.column(pos);
                                var c = draw.nbColumn - col - 1;
                                var topPos = math.positionTopCol(col);
                                var g = math.positionTopCol(c - 1) + 2;
                                var x = c * (boxWidth + interBoxWidth);
                                var y = (topPos - pos) * (boxHeight + interBoxHeight) * g + (boxHeight + interBoxHeight) * (g / 2 - 0.5);
                                scope.positions[pos] = { x: x, y: y };
                            }
                        }

                        function redraw(element, scope) {
                            var draw = scope.draw;
                            if (!draw) {
                                return;
                            }

                            element.children().remove();
                            element.css({ width: scope.width + 'px', height: scope.height + 'px' }).addClass('draw');

                            if (!draw.boxes || !draw.boxes.length) {
                                return;
                            }

                            var canvas = angular.element('<canvas class="draw"/>').attr('width', scope.width).attr('height', scope.height);
                            element.append(canvas);

                            var players = draw._event._tournament.players;

                            //draw the lines...
                            var ctx = ((canvas[0])).getContext('2d');
                            ctx.lineWidth = .5;
                            ctx.translate(.5, .5);
                            var boxHeight2 = boxHeight >> 1;

                            for (var i = draw.boxes.length - 1; i >= 0; i--) {
                                var b = draw.boxes[i];
                                var pt = scope.positions[b.position], x = pt.x, y = pt.y;

                                if (math.isMatch(b)) {
                                    ctx.moveTo(x - interBoxWidth, scope.positions[math.positionOpponent1(b.position)].y + boxHeight2);
                                    ctx.lineTo(x, y + boxHeight2);
                                    ctx.lineTo(x - interBoxWidth, scope.positions[math.positionOpponent2(b.position)].y + boxHeight2);
                                    ctx.stroke();
                                }
                                ctx.moveTo(x, y + boxHeight2);
                                ctx.lineTo(x + boxWidth, y + boxHeight2);
                                ctx.stroke();

                                if (fnTemplateBox || fnTemplateIn || fnTemplateEmpty) {
                                    var scopeBox = scope.$new();
                                    scopeBox.position = b.position;
                                    scopeBox.box = b;
                                    scopeBox.match = b instanceof models.Match ? b : undefined;
                                    scopeBox.playerIn = b instanceof models.PlayerIn ? b : undefined;
                                    scopeBox.player = b.getPlayer();
                                    scopeBox.x = x;
                                    scopeBox.y = y;
                                    var fnUnwatchBox = scopeBox.$watchCollection('box', function (box, oldBox) {
                                        scopeBox.match = box instanceof models.Match ? box : undefined;
                                        scopeBox.playerIn = box instanceof models.PlayerIn ? box : undefined;
                                        scopeBox.player = box.getPlayer();
                                    });

                                    if (fnTemplateBox && scopeBox.match) {
                                        fnTemplateBox(scopeBox, function (clonedElement, scope) {
                                            element.append(clonedElement);
                                        });
                                    } else if (fnTemplateIn && scopeBox.playerIn) {
                                        fnTemplateIn(scopeBox, function (clonedElement, scope) {
                                            element.append(clonedElement);
                                        });
                                    } else if (fnTemplateEmpty) {
                                        fnTemplateEmpty(scopeBox, function (clonedElement, scope) {
                                            element.append(clonedElement);
                                        });
                                    }
                                }
                            }
                        }
                    }
                };
                function getChildByClass(element, classname) {
                    var c = element[0].getElementsByClassName(classname);
                    return angular.element(c && c.length ? c[0] : undefined);
                }
            }
        };

        return dir;
    }
]);
'use strict';
angular.module('jat.main', [
    'jat.services.selection',
    'jat.services.find',
    'jat.services.undo',
    'jat.services.fft',
    'jat.player.dialog',
    'jat.player.list',
    'jat.event.dialog',
    'jat.event.list',
    'jat.draw',
    'jat.draw.dialog',
    'jat.draw.list',
    'jat.match.dialog',
    'ui.bootstrap'
]).controller('mainCtrl', function ($scope, $http, selection, math, undo, find, $modal) {
    //console.info("Main controller: cntr");
    $scope.selection = selection;
    $scope.undo = undo;

    selection.tournament = new models.Tournament();

    //console.info("Loading tournament1...");
    $http.get('/data/tournament1.json').success(function (data) {
        //selection.tournament = new models.Tournament(data);
        models.Tournament.init(data);
        selection.tournament = data;

        selection.event = selection.tournament.events[0];
        selection.draw = selection.event.draws[0];
        //angular.extend( data, models.Tournament.prototype);
        //selection.player = selection.tournament.players[0];
        //console.info("Tournament loaded.");
    });

    //#region player
    $scope.addPlayer = function addPlayer(player) {
        var newPlayer = new models.Player(selection.tournament, player);

        $modal.open({
            templateUrl: 'player/dialogPlayer.html',
            controller: 'dialogPlayerCtrl',
            resolve: {
                title: function () {
                    return "New player";
                },
                player: function () {
                    return newPlayer;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.tournament.players;
                newPlayer.id = 'P' + c.length;

                undo.insert(c, -1, newPlayer, "Add " + newPlayer.name);
            }
        });
    };

    $scope.editPlayer = function editPlayer(player) {
        var editedPlayer = new models.Player(selection.tournament, player);

        $modal.open({
            templateUrl: 'player/dialogPlayer.html',
            controller: 'dialogPlayerCtrl',
            resolve: {
                title: function () {
                    return "Edit player";
                },
                player: function () {
                    return editedPlayer;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.tournament.players;
                var i = find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i);
            } else if ('Del' == result) {
                $scope.removePlayer(player);
            }
        });
    };

    $scope.removePlayer = function removePlayer(player) {
        if (selection.player === player) {
            selection.player = undefined;
        }

        var c = selection.tournament.players;
        var i = find.indexOf(c, "id", player.id, "Player to remove not found");
        undo.remove(c, i, "Delete " + player.name + " " + i);
    };

    //#endregion player
    //#region event
    $scope.addEvent = function addEvent(event) {
        var newEvent = new models.Event(selection.tournament, event);

        $modal.open({
            templateUrl: 'event/dialogEvent.html',
            controller: 'dialogEventCtrl',
            resolve: {
                title: function () {
                    return "New event";
                },
                event: function () {
                    return newEvent;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.tournament.events;
                newEvent.id = 'E' + c.length;
                undo.insert(c, -1, newEvent, "Add " + newEvent.name);
            }
        });
    };

    $scope.editEvent = function editEvent(event) {
        var editedEvent = new models.Event(selection.tournament, event);

        $modal.open({
            templateUrl: 'event/dialogEvent.html',
            controller: 'dialogEventCtrl',
            resolve: {
                title: function () {
                    return "Edit event";
                },
                event: function () {
                    return editedEvent;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.tournament.events;
                var i = find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i);
            } else if ('Del' == result) {
                $scope.removeEvent(event);
            }
        });
    };

    $scope.removeEvent = function (event) {
        if (selection.event && selection.event === event) {
            selection.event = undefined;
        }

        var c = selection.tournament.events;
        var i = find.indexOf(c, "id", event.id, "Event to remove not found");
        undo.remove(c, i, "Delete " + c[i].name + " " + i);
    };

    //#endregion event
    //#region draw
    $scope.addDraw = function addDraw(event, draw) {
        var newDraw = new models.Draw(event, draw);

        $modal.open({
            templateUrl: 'draw/dialogDraw.html',
            controller: 'dialogDrawCtrl',
            resolve: {
                title: function () {
                    return "New draw";
                },
                draw: function () {
                    return newDraw;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.event.draws;
                newDraw.id = 'D' + c.length;
                undo.insert(c, -1, newDraw, "Add " + newDraw.name);
            }
        });
    };

    $scope.editDraw = function editDraw(event, draw) {
        var editedDraw = new models.Draw(event, draw);

        $modal.open({
            templateUrl: 'draw/dialogDraw.html',
            controller: 'dialogDrawCtrl',
            resolve: {
                title: function () {
                    return "Edit draw";
                },
                draw: function () {
                    return editedDraw;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = selection.event.draws;
                var i = find.indexOf(c, "id", editedDraw.id, "Draw to edit not found");
                undo.update(c, i, editedDraw, "Edit " + editedDraw.name + " " + i);
            } else if ('Del' == result) {
                $scope.removeDraw(event, draw);
            }
        });
    };

    $scope.removeDraw = function removeDraw(event, draw) {
        if (selection.draw === draw) {
            selection.draw = undefined;
        }

        var c = event.draws;
        var i = find.indexOf(c, "id", draw.id, "Draw to remove not found");
        undo.remove(c, i, "Delete " + draw.name + " " + i);
    };

    //#endregion draw
    //#region match
    $scope.editMatch = function editMatch(match) {
        var editedMatch = new models.Match(match._draw, match);

        $modal.open({
            templateUrl: 'draw/dialogMatch.html',
            controller: 'dialogMatchCtrl',
            resolve: {
                title: function () {
                    return "Edit match";
                },
                match: function () {
                    return editedMatch;
                }
            }
        }).result.then(function (result) {
            if ('Ok' == result) {
                var c = match._draw.boxes;
                var i = find.indexOf(c, "id", editedMatch.id, "Match to edit not found");
                undo.newGroup("Edit match");
                undo.update(c, i, editedMatch, "Edit " + editedMatch.id + " " + i);

                //if (!match.playerId && editedMatch.playerId) {
                //    var nextMatch = math.positionMatch(match.position);
                //    //TODO
                //}
                undo.endGroup();
            }
        });
    };
    //#endregion match
    //$scope.entityMatch = new Entity($scope, "match", models.Match);
});
'use strict';
angular.module('jat.player.list', []).directive('listPlayers', function () {
    var dir = {
        templateUrl: 'player/listPlayers.html',
        //controller: 'listPlayersCtrl',
        replace: true,
        //transclude: false,
        restrict: 'EA',
        scope: true,
        link: function postLink(scope, element, attrs, controller) {
            scope.$watch(attrs.listPlayers, function (newValue, oldValue, scope) {
                scope.players = newValue;
            });
        }
    };
    return dir;
});
'use strict';
// Declare app level module which depends on filters, and services
angular.module('jat', [
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'jat.services.selection',
    'jat.services.find',
    'jat.services.undo',
    'jat.services.fft',
    'jat.main'
]).constant('appVersion', '0.1').constant('appName', 'JA-Tennis').directive('appVersion', function (appName, appVersion) {
    return {
        template: appName + ' v' + appVersion
    };
});
'use strict';
angular.module('jat.services.selection', []).factory('selection', function () {
    return {
        tournament: undefined,
        event: undefined,
        draw: undefined,
        match: undefined,
        player: undefined
    };
});
angular.module('jat.utils.checkList', []).directive('checkList', function () {
    return {
        scope: {
            list: '=checkList',
            value: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('list', function () {
                if (scope.list) {
                    var index = scope.list.indexOf(scope.value);
                    elem.prop('checked', index != -1);
                }
            }, true);

            function changeHandler() {
                var checked = elem.prop('checked');
                if (!scope.list) {
                    scope.list = [];
                }
                var index = scope.list.indexOf(scope.value);

                if (checked && index == -1) {
                    scope.list.push(scope.value);
                } else if (!checked && index != -1) {
                    scope.list.splice(index, 1);
                }
            }

            elem.bind('change', function () {
                scope.$apply(changeHandler);
            });
        }
    };
});
'use strict';
var models;
(function (models) {
    var Event = (function () {
        function Event(parent, data) {
            models.copy(data, this);
            Event.init(this, parent);
        }
        Event.init = function (me, parent) {
            me._tournament = parent;
            if (me.draws) {
                for (var i = me.draws.length - 1; i >= 0; i--) {
                    //me.draws[i] = new Draw(me, me.draws[i]);
                    models.Draw.init(me.draws[i], me);
                }
            }
        };
        return Event;
    })();
    models.Event = Event;
})(models || (models = {}));
'use strict';
var models;
(function (models) {
    var Draw = (function () {
        function Draw(parent, data) {
            models.copy(data, this);
            Draw.init(this, parent);
        }
        Draw.init = function (draw, parent) {
            draw._event = parent;
            if (draw.boxes) {
                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    //draw.matches[i] = new Match(draw, draw.matches[i]);
                    var box = draw.boxes[i];

                    if ('score' in box) {
                        draw.boxes[i] = new models.Match(draw, box);
                    } else {
                        draw.boxes[i] = new models.PlayerIn(draw, box);
                    }
                    //var box = draw._boxes[i];
                    //Match.init(box, draw);
                    //var posPlayer = math.positionOpponent1(box.position);
                    //if (!draw._boxes[posPlayer]) {
                    //    draw._boxes[posPlayer] = new models.PlayerIn(draw, {
                    //        position: posPlayer,
                    //        playerId: match.pl
                    //    });
                    //}
                }
            }
        };
        return Draw;
    })();
    models.Draw = Draw;
})(models || (models = {}));
'use strict';
var models;
(function (models) {
    var Match = (function () {
        //constructor(parent: Draw, data?: any) {
        //    super(data, this);
        //}
        function Match(parent, data) {
            models.copy(data, this);
            models.Box.init(this, parent);
        }
        Match.prototype.getPlayer = function () {
            var injector = angular.injector(['jat.services.find']);
            var find = injector.get('find');
            return find.byId(this._draw._event._tournament.players, this.playerId);
        };
        return Match;
    })();
    models.Match = Match;
})(models || (models = {}));
'use strict';
angular.module('jat.services.math', ['jat.services.find']).factory('math', function (find) {
    //draw functions
    function column(pos) {
        //TODO, use a table
        var col = -1;
        for (pos++; pos; pos >>= 1, col++)
            ;
        return col;
    }

    function positionTopCol(col) {
        return (1 << (col + 1)) - 2;
    }

    function columnMax(nCol, nQ) {
        return !nQ || nQ === 1 ? nCol - 1 : column(nQ - 2) + nCol;
    }

    function columnMin(nQ) {
        return !nQ || nQ === 1 ? 0 : column(nQ - 2) + 1;
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

    function positionOpponent1(pos) {
        return (pos << 1) + 2;
    }

    function positionOpponent2(pos) {
        return (pos << 1) + 1;
    }

    function positionMatch(pos) {
        return (pos - 1) >> 1;
    }

    function positionOpponent(pos) {
        return pos & 1 ? pos + 1 : pos - 1;
    }

    /*
    function suitePrec(oE:Event, oT:Draw, t: number, q: number): number {
    for (t = (oT.Sui ? t - oT.Sui : t - 1); t > 0; t--) {
    var pT = oE.T[t];
    if (!pT)
    return -1;
    for (var b = 0; b < pT.B.length; b++)
    if (pT.B[b] && pT.B[b].QS == q)
    return t;
    
    if (!(pT.Sui > 1)) break;
    }
    return t;
    }
    
    function suiteSuiv(oE, t, q) {
    for (t++; oE.T[t] && oE.T[t].Sui; t++);
    
    if (!oE.T[t])
    return -1;
    for (; t < oE.T.length; t++) {
    pT = oE.T[t];
    for (b = 0; b < pT.B.length; b++)
    if (pT.B[b] && pT.B[b].QE == q)
    return t;
    if (!oE.T[t].Sui) break;
    }
    return t;
    }
    //*/
    //Seed functions
    function seedColumn(pos, nCol) {
        return Math.floor(pos / nCol);
    }

    function seedRow(pos, nCol) {
        return pos % nCol;
    }

    function seedPositionOpponent1(pos, nCol) {
        return (pos % nCol) + (nCol * nCol);
    }

    function seedPositionOpponent2(pos, nCol) {
        return Math.floor(pos / nCol) + (nCol * nCol);
    }

    function isMatch(box) {
        return box && ('score' in box);
    }
    function box1(match) {
        var pos = positionOpponent1(match.position);
        return find.by(match._draw.boxes, 'position', pos);
    }
    function player1(match) {
        var tournament = match._draw._event._tournament;
        var box = box1(match);
        return find.byId(tournament.players, box.playerId);
    }
    function box2(match) {
        var pos = positionOpponent2(match.position);
        return find.by(match._draw.boxes, 'position', pos);
    }
    function player2(match) {
        var tournament = match._draw._event._tournament;
        var box = box2(match);
        return find.byId(tournament.players, box.playerId);
    }

    return {
        column: column,
        columnMin: columnMin,
        columnMax: columnMax,
        countInCol: countInCol,
        positionTopCol: positionTopCol,
        positionBottomCol: positionBottomCol,
        positionMin: positionMin,
        positionMax: positionMax,
        positionOpponent: positionOpponent,
        positionOpponent1: positionOpponent1,
        positionOpponent2: positionOpponent2,
        positionMatch: positionMatch,
        seedColumn: seedColumn,
        seedRow: seedRow,
        seedPositionOpponent1: seedPositionOpponent1,
        seedPositionOpponent2: seedPositionOpponent2,
        isMatch: isMatch,
        box1: box1,
        player1: player1,
        box2: box2,
        player2: player2
    };
});
'use strict';
angular.module('jat.services.find', []).factory('find', function () {
    function _reindex(array, member) {
        var a = {
            _length: array.length
        };
        for (var i = 0; i < array.length; i++) {
            a[array[i][member]] = i;
        }
        array["_FindBy" + member] = a;
    }

    /**
    * Returns the index of an object in the array. Or -1 if not found.
    */
    function indexOf(array, member, value, error) {
        var i;

        if (null == value) {
            return null;
        }

        var idxName = "_FindBy" + member;
        if (!(idxName in array)) {
            _reindex(array, member);
        }

        var idx = array[idxName];

        if (!(value in idx) || idx._length !== array.length) {
            _reindex(array, member);
            i = array[idxName][value];
        } else {
            i = idx[value];
            if (array[i][member] !== value) {
                _reindex(array, member);
                i = array[idxName][value];
            }
        }

        if (error && i === undefined) {
            throw error;
        }

        return i !== undefined ? i : -1;
    }

    /**
    * Returns an object in the array by member. Or undefined if not found.
    */
    function by(array, member, value, error) {
        var i = indexOf(array, member, value, error);
        return array[i];
    }

    function byId(array, value, error) {
        var i = indexOf(array, "id", value, error);
        return array[i];
    }

    return {
        indexOf: indexOf,
        by: by,
        byId: byId
    };
});
'use strict';
angular.module('jat.services.undo', []).factory('undo', function () {
    var stack = [], head = -1, group, maxUndo = 20, ActionType = { UPDATE: 1, INSERT: 2, REMOVE: 3, GROUP: 4, ACTION: 5, SPLICE: 6 };

    function reset() {
        stack = [];
        head = -1;
        group = null;
    }

    function action(fnDo, fnUndo, message) {
        if ("function" != typeof fnDo) {
            throw "Invalid fnDo";
        }
        if ("function" != typeof fnUndo) {
            throw "Invalid fnUndo";
        }
        var action = {
            type: ActionType.ACTION,
            fnDo: fnDo,
            fnUndo: fnUndo,
            message: message || ""
        };
        fnDo();
        _pushAction(action);
    }

    function update(obj, member, value, message) {
        if ("undefined" == typeof obj) {
            throw "Invalid obj";
        }
        if ("undefined" == typeof member) {
            throw "Invalid member";
        }
        if ("undefined" == typeof value) {
            throw "Invalid value";
        }
        var action = {
            type: ActionType.UPDATE,
            obj: obj,
            member: member,
            value: obj[member],
            message: message || "update"
        };
        if (obj.splice) {
            if ("number" != typeof member || member < 0 || obj.length <= member) {
                throw "Bad array position to update";
            }
        }
        obj[member] = value;
        _pushAction(action);
    }

    function insert(obj, member, value, message) {
        if ("undefined" == typeof obj) {
            throw "Invalid obj";
        }
        if ("undefined" == typeof member) {
            throw "Invalid member";
        }
        if ("undefined" == typeof value) {
            throw "Invalid value";
        }
        if (obj.splice) {
            if ("number" != typeof member || member < 0 || member > obj.length) {
                member = obj.length;
            }
        }
        var action = {
            type: ActionType.INSERT,
            obj: obj,
            member: member,
            value: undefined,
            message: message || (member == obj.length ? "append" : "insert")
        };
        if (obj.splice) {
            obj.splice(member, 0, value);
        } else {
            obj[member] = value;
        }
        _pushAction(action);
    }

    function remove(obj, member, message) {
        if ("undefined" == typeof obj) {
            throw "Invalid obj";
        }
        if ("undefined" == typeof member) {
            throw "Invalid member";
        }
        var action = {
            type: ActionType.REMOVE,
            obj: obj,
            member: member,
            value: obj[member],
            message: message || "remove"
        };
        if (obj.splice) {
            if ("number" != typeof member || member < 0 || obj.length <= member) {
                throw "Bad array position to remove";
            }
            obj.splice(member, 1);
        } else {
            delete obj[member];
        }
        _pushAction(action);
    }

    function splice(obj, index, howmany, itemX, message) {
        if ("undefined" == typeof obj) {
            throw "Invalid obj";
        }
        if ("undefined" == typeof obj.slice) {
            throw "Invalid obj not an array";
        }
        if ("number" != typeof index) {
            throw "Invalid index";
        }
        if (index < 0 || obj.length <= index) {
            throw "Bad array position to remove";
        }

        var action = {
            type: ActionType.SPLICE,
            obj: obj,
            index: index,
            howmany: arguments.length - 4,
            message: arguments[arguments.length - 1] || "splice",
            values: undefined
        };

        var p = Array.prototype.slice.call(arguments, 3, arguments.length - 1);
        p.unshift(index, howmany);
        action.values = Array.prototype.splice.apply(obj, p);

        _pushAction(action);
    }

    function _pushAction(action) {
        if (group) {
            group.stack.push(action);
        } else {
            head++;
            stack.splice(head, stack.length, action);
            _maxUndoOverflow();
        }
    }

    function newGroup(message, fnGroup) {
        if (group) {
            throw "Cannot imbricate group";
        }
        group = {
            type: ActionType.GROUP,
            stack: [],
            message: message || ""
        };
        if ("undefined" != typeof fnGroup) {
            if (fnGroup()) {
                endGroup();
            } else {
                cancelGroup();
            }
        }
    }
    function endGroup() {
        if (!group) {
            throw "No group defined";
        }
        var g = group;
        group = null;
        if (g.stack.length) {
            _pushAction(g);
        }
    }
    function cancelGroup() {
        if (!group) {
            throw "No group defined";
        }
        _do(group, true);
        group = null;
    }

    function _do(action, bUndo) {
        if (action.type == ActionType.GROUP) {
            if (bUndo) {
                for (var i = action.stack.length - 1; i >= 0; i--) {
                    _do(action.stack[i], bUndo);
                }
            } else {
                for (i = 0; i < action.stack.length; i++) {
                    _do(action.stack[i], bUndo);
                }
            }
        } else if (action.type == ActionType.ACTION) {
            if (bUndo) {
                action.fnUndo();
            } else {
                action.fnDo();
            }
        } else if (action.type == ActionType.UPDATE) {
            var temp = action.obj[action.member];
            action.obj[action.member] = action.value;
            action.value = temp;
        } else if (action.type == ActionType.SPLICE) {
            var p = action.values.slice(0, action.values.length);
            p.unshift(action.index, action.howmany);
            action.howmany = p.length - 2;
            action.values = Array.prototype.splice.apply(action.obj, p);
        } else if (bUndo ? action.type == ActionType.INSERT : action.type == ActionType.REMOVE) {
            action.value = action.obj[action.member];
            if (action.obj.splice) {
                action.obj.splice(action.member, 1);
            } else {
                delete action.obj[action.member];
            }
        } else {
            if (action.obj.splice) {
                action.obj.splice(action.member, 0, action.value);
            } else {
                action.obj[action.member] = action.value;
            }
        }
    }

    function undo() {
        if (!canUndo()) {
            throw "Can't undo";
        }
        _do(stack[head], true);
        head--;
    }

    function redo() {
        if (!canRedo()) {
            throw "Can't redo";
        }
        head++;
        _do(stack[head], false);
    }

    function canUndo() {
        return 0 <= head && head < stack.length;
    }

    function canRedo() {
        return -1 <= head && head < stack.length - 1;
    }

    function messageUndo() {
        return canUndo() ? stack[head].message : "";
    }

    function messageRedo() {
        return canRedo() ? stack[head + 1].message : "";
    }

    function setMaxUndo(v) {
        if ("number" != typeof v) {
            throw "Invalid maxUndo value";
        }
        maxUndo = v;
        _maxUndoOverflow();
    }

    function _maxUndoOverflow() {
        if (stack.length > maxUndo) {
            var nOverflow = stack.length - maxUndo;
            head -= nOverflow;
            stack.splice(0, nOverflow);
        }
    }

    function toString() {
        return (group ? "Grouping (" + group.message + "), " : "") + (canUndo() ? (head + 1) + " undo(" + messageUndo() + ")" : "No undo") + ", " + (canRedo() ? (stack.length - head) + " redo(" + messageRedo() + ")" : "No redo") + ", maxUndo=" + maxUndo;
    }

    return {
        reset: reset,
        action: action,
        update: update,
        insert: insert,
        remove: remove,
        splice: splice,
        newGroup: newGroup,
        endGroup: endGroup,
        cancelGroup: cancelGroup,
        undo: undo,
        redo: redo,
        canUndo: canUndo,
        canRedo: canRedo,
        messageUndo: messageUndo,
        messageRedo: messageRedo,
        setMaxUndo: setMaxUndo,
        toString: toString
    };
});
'use strict';
var models;
(function (models) {
    var Player = (function () {
        function Player(parent, data) {
            models.copy(data, this);
            Player.init(this, parent);
        }
        Player.init = function (me, parent) {
            me._tournament = parent;
        };
        return Player;
    })();
    models.Player = Player;
})(models || (models = {}));
'use strict';
// Module
var models;
(function (models) {
    var Tournament = (function () {
        function Tournament(data) {
            models.copy(data, this);
            Tournament.init(this);
        }
        Tournament.init = function (me) {
            if (me.players) {
                for (var i = me.players.length - 1; i >= 0; i--) {
                    //me.players[i] = new Player(me, me.players[i]);
                    models.Player.init(me.players[i], me);
                }
            }
            if (me.events) {
                for (var i = me.events.length - 1; i >= 0; i--) {
                    //me.events[i] = new Event(me, me.events[i]);
                    models.Event.init(me.events[i], me);
                }
            }
        };
        return Tournament;
    })();
    models.Tournament = Tournament;

    var TournamentInfo = (function () {
        function TournamentInfo() {
        }
        return TournamentInfo;
    })();
    models.TournamentInfo = TournamentInfo;
})(models || (models = {}));
//# sourceMappingURL=JATennis.js.map
