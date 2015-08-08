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
'use strict';
// Declare app level module which depends on filters, and services
angular.module('jat', [
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'jat.services.selection',
    'jat.services.find',
    'jat.services.undo',
    'jat.services.type',
    'jat.main'
])
    .constant('appName', 'JA-Tennis')
    .constant('appVersion', '0.1')
    .directive('appVersion', ['appName', 'appVersion',
    function (appName, appVersion) {
        return {
            template: appName + ' v' + appVersion
        };
    }]);
/*
.config([<any>'$routeProvider', ( $routeProvider: ng.IRouteProviderProvider) => {
    //routes
    $routeProvider.when('/players', {
        templateUrl: 'players.html',
        controller: controllers.Players
    });
    $routeProvider.when('/player/:id', {
        templateUrl: 'player.html',
        controller: controllers.Player
    });
    $routeProvider.otherwise({
        redirectTo: '/players'
    });
}])
//*/
'use strict';
var jat;
(function (jat) {
    var draw;
    (function (draw_1) {
        var dialogDrawCtrl = (function () {
            function dialogDrawCtrl(title, draw, 
                //private selection: jat.service.Selection,
                rank, category, drawLib, tournamentLib, $scope) {
                var _this = this;
                this.title = title;
                this.draw = draw;
                this.rank = rank;
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.drawTypes = [];
                for (var i = 0; i < 4; i++) {
                    this.drawTypes[i] = { value: i, label: models.DrawType[i] };
                }
                this.ranks = rank.list();
                this.categories = category.list();
                //Force minRank <= maxRank
                $scope.$watch('dlg.draw.minRank', function (minRank) {
                    if (!_this.draw.maxRank || _this.rank.compare(minRank, _this.draw.maxRank) > 0) {
                        _this.draw.maxRank = minRank;
                    }
                });
                $scope.$watch('dlg.draw.maxRank', function (maxRank) {
                    if (maxRank && _this.draw.minRank && _this.rank.compare(_this.draw.minRank, maxRank) > 0) {
                        _this.draw.minRank = maxRank;
                    }
                });
            }
            dialogDrawCtrl.prototype.getRegisteredCount = function () {
                var n = this.tournamentLib.GetJoueursInscrit(this.draw).length;
                var previous = this.drawLib.previousGroup(this.draw);
                if (previous) {
                    var qualifs = this.drawLib.FindAllQualifieSortant(previous);
                    if (qualifs) {
                        n += qualifs.length;
                    }
                }
                return n;
            };
            //getNbEntry(): number {
            //    return this.drawLib.countInCol(iColMax(draw), draw.nbOut);
            //}
            dialogDrawCtrl.$inject = [
                'title',
                'draw',
                //'selection',
                'rank',
                'category',
                'drawLib',
                'tournamentLib',
                '$scope'];
            return dialogDrawCtrl;
        })();
        angular.module('jat.draw.dialog', [])
            .controller('dialogDrawCtrl', dialogDrawCtrl);
    })(draw = jat.draw || (jat.draw = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var match;
    (function (match_1) {
        var dialogMatchCtrl = (function () {
            function dialogMatchCtrl(title, match, find, drawLib, matchFormat) {
                this.title = title;
                this.match = match;
                var tournament = match._draw._event._tournament;
                var opponents = drawLib.boxesOpponents(match);
                this.player1 = find.byId(tournament.players, opponents.box1.playerId);
                this.player2 = find.byId(tournament.players, opponents.box2.playerId);
                this.places = tournament.places;
                this.matchFormats = matchFormat.list();
            }
            dialogMatchCtrl.$inject = [
                'title',
                'match',
                'find',
                'drawLib',
                'matchFormat'
            ];
            return dialogMatchCtrl;
        })();
        angular.module('jat.match.dialog', ['jat.services.drawLib', 'jat.services.find', 'jat.services.type'])
            .controller('dialogMatchCtrl', dialogMatchCtrl);
    })(match = jat.match || (jat.match = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var draw;
    (function (draw) {
        var boxCtrl = (function () {
            function boxCtrl() {
            }
            boxCtrl.prototype.isPlayed = function () {
                return this.isMatch && !!this.box.score;
            };
            return boxCtrl;
        })();
        function drawBoxDirective(validation) {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'draw/drawBox.html',
                controller: boxCtrl,
                controllerAs: 'ctrlBox',
                link: function (scope, element, attrs, ctrlBox) {
                    scope.$watch(attrs.drawBox, function (box) {
                        ctrlBox.box = box;
                        ctrlBox.isMatch = isMatch(box);
                        ctrlBox.error = validation.getErrorBox(box);
                    });
                }
            };
        }
        function isMatch(box) {
            return box && ('score' in box);
        }
        angular.module('jat.draw.box', ['jat.services.find'])
            .directive('drawBox', ['validation', drawBoxDirective]);
    })(draw = jat.draw || (jat.draw = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var draw;
    (function (draw_1) {
        var drawCtrl = (function () {
            function drawCtrl(drawLib, 
                //private knockout: jat.service.Knockout, //for dependencies
                //private roundrobin: jat.service.Roundrobin, //for dependencies
                tournamentLib, find, undo, selection) {
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.find = find;
                this.undo = undo;
                this.selection = selection;
                this.boxWidth = 150;
                this.boxHeight = 40;
                this.interBoxWidth = 10;
                this.interBoxHeight = 10;
                this.simple = false;
            }
            drawCtrl.prototype.init = function () {
                if (!this.draw || this.simple) {
                    return;
                }
                this.players = this.tournamentLib.GetJoueursInscrit(this.draw);
                //qualifs in
                var prev = this.drawLib.previousGroup(this.draw);
                this.qualifsIn = prev ? this.drawLib.FindAllQualifieSortantBox(prev) : undefined;
                //qualifs out
                this.qualifsOut = [];
                for (var i = 1; i <= this.draw.nbOut; i++) {
                    this.qualifsOut.push(i);
                }
            };
            drawCtrl.prototype.computeCoordinates = function () {
                if (!this.draw) {
                    return;
                }
                var draw = this.draw;
                var size = this.drawLib.getSize(draw);
                this.width = size.width * this.boxWidth - this.interBoxWidth;
                this.height = size.height * this.boxHeight;
                draw._points = this.drawLib.computePositions(draw); //TODO to be moved into drawLib when draw changes
                this._refresh = new Date(); //to refresh lines
                if (!this.isKnockout) {
                    //for roundrobin, fill the list of rows/columns for the view
                    var n = draw.nbColumn;
                    this.rows = new Array(n);
                    for (var r = 0; r < n; r++) {
                        var cols = new Array(n + 1);
                        var b = (n + 1) * n - r - 1;
                        for (var c = 0; c <= n; c++) {
                            cols[c] = b;
                            b -= n;
                        }
                        this.rows[r] = cols;
                    }
                }
            };
            drawCtrl.prototype.drawLines = function (canvas) {
                canvas.attr('width', this.width).attr('height', this.height);
                var draw = this.draw;
                if (!draw || !draw.boxes || !draw.boxes.length || 2 <= draw.type) {
                    return;
                }
                //draw the lines...
                var _canvas = canvas[0];
                var ctx = useVML ? new vmlContext(canvas, this.width, this.height) : _canvas.getContext('2d');
                ctx.lineWidth = .5;
                ctx.translate(.5, .5);
                var boxHeight2 = this.boxHeight >> 1;
                for (var i = draw.boxes.length - 1; i >= 0; i--) {
                    var box = draw.boxes[i];
                    var x = box._x * this.boxWidth, y = box._y * this.boxHeight;
                    if (this.isMatch(box)) {
                        var opponent = positionOpponents(box.position);
                        var p1 = draw._points[opponent.pos1], p2 = draw._points[opponent.pos2];
                        if (p1 && p2) {
                            ctx.moveTo(x - this.interBoxWidth, p1.y * this.boxHeight + boxHeight2);
                            ctx.lineTo(x, y + boxHeight2);
                            ctx.lineTo(x - this.interBoxWidth, p2.y * this.boxHeight + boxHeight2);
                            ctx.stroke();
                        }
                    }
                    ctx.moveTo(x, y + boxHeight2);
                    ctx.lineTo(x + this.boxWidth - this.interBoxWidth, y + boxHeight2);
                    ctx.stroke();
                }
                if (ctx.done) {
                    ctx.done(); //VML
                }
            };
            drawCtrl.prototype.getBox = function (position) {
                if (this.draw && this.draw.boxes) {
                    return this.find.by(this.draw.boxes, 'position', position);
                }
            };
            drawCtrl.prototype.isDiag = function (position) {
                if (this.draw) {
                    var n = this.draw.nbColumn;
                    return (position % n) * (n + 1) === position;
                }
            };
            drawCtrl.prototype.range = function (min, max, step) {
                step = step || 1;
                var a = [];
                for (var i = min; i <= max; i += step) {
                    a.push(i);
                }
                return a;
            };
            drawCtrl.prototype.getQualifsIn = function () {
                return this.qualifsIn;
            };
            drawCtrl.prototype.getQualifsOut = function () {
                return this.qualifsOut;
            };
            drawCtrl.prototype.getPlayers = function () {
                return this.players;
            };
            drawCtrl.prototype.findQualifIn = function (qualifIn) {
                return this.draw && !!this.find.by(this.draw.boxes, 'qualifIn', qualifIn);
            };
            drawCtrl.prototype.findPlayer = function (playerId) {
                return this.draw && playerId && !!this.find.by(this.draw.boxes, 'playerId', playerId);
            };
            drawCtrl.prototype.setPlayer = function (box, player, qualifIn) {
                var _this = this;
                var prevPlayer = box._player;
                var prevQualif = box.qualifIn;
                this.undo.action(function (bUndo) {
                    if (prevQualif || qualifIn) {
                        _this.drawLib.SetQualifieEntrant(box, bUndo ? prevQualif : qualifIn, bUndo ? prevPlayer : player);
                    }
                    else {
                        box.playerId = bUndo ? (prevPlayer ? prevPlayer.id : undefined) : (player ? player.id : undefined);
                        _this.drawLib.initBox(box, box._draw);
                    }
                    _this.selection.select(box, models.ModelType.Box);
                }, player ? 'Set player' : 'Erase player');
            };
            drawCtrl.prototype.swapPlayer = function (box) {
                //TODO
            };
            drawCtrl.prototype.eraseScore = function (match) {
                var _this = this;
                this.undo.newGroup("Erase score", function () {
                    _this.undo.update(match, 'score', ''); //box.score = '';
                    return true;
                }, match);
            };
            drawCtrl.prototype.isMatch = function (box) {
                return box && ('score' in box);
            };
            drawCtrl.$inject = [
                'drawLib',
                //'knockout',
                //'roundrobin',
                'tournamentLib',
                'find',
                'undo',
                'selection'];
            return drawCtrl;
        })();
        function positionOpponents(pos) {
            return {
                pos1: (pos << 1) + 2,
                pos2: (pos << 1) + 1
            };
        }
        function drawDirective() {
            return {
                restrict: 'EA',
                scope: true,
                templateUrl: 'draw/drawDraw.html',
                controller: drawCtrl,
                controllerAs: 'ctrlDraw',
                link: function (scope, element, attrs, ctrlDraw) {
                    var doRefresh = function (draw, oldValue) {
                        ctrlDraw.draw = draw;
                        ctrlDraw.isKnockout = draw && draw.type < 2;
                        ctrlDraw.boxWidth = scope.$eval(attrs.boxWidth) || 150;
                        ctrlDraw.boxHeight = scope.$eval(attrs.boxHeight) || 40;
                        ctrlDraw.interBoxWidth = scope.$eval(attrs.interBoxWidth) || 10;
                        ctrlDraw.interBoxHeight = scope.$eval(attrs.interBoxHeight) || 10;
                        ctrlDraw.simple = scope.$eval(attrs.simple);
                        ctrlDraw.init();
                        ctrlDraw.computeCoordinates();
                        //IE8 patch
                        if (ctrlDraw.isKnockout && useVML) {
                            ctrlDraw.drawLines(element);
                        }
                    };
                    scope.$watch(attrs.draw, doRefresh);
                    scope.$watch(attrs.draw + '._refresh', function (refesh, oldRefresh) {
                        if (refesh !== oldRefresh) {
                            doRefresh(ctrlDraw.draw);
                        }
                    });
                }
            };
        }
        //IE8 patch to use VML instead of canvas
        var useVML = !window.HTMLCanvasElement;
        var vmlContext;
        function initVml() {
            if (!useVML) {
                return;
            }
            // create xmlns and stylesheet
            //document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
            //document.createStyleSheet().cssText = 'v\\:shape{behavior:url(#default#VML)}';
            //emulate canvas context using VML
            vmlContext = function (element, width, height) {
                this._width = width;
                this._height = height;
                this.beginPath();
                this._element = element;
                this._element.find('shape').remove();
                //this._element = element.find('shape');
                //this._element.css({ width: this._width + 'px', height: this._height + 'px' });
                debugger;
            };
            vmlContext.prototype = {
                _path: [], _tx: 0, _ty: 0,
                translate: function (tx, ty) {
                    //this._tx = tx;
                    //this._ty = ty;
                },
                beginPath: function () {
                    this._path.length = 0;
                    this.lineWidth = 1;
                    this.strokeStyle = 'black';
                },
                moveTo: function (x, y) {
                    this._path.push('m', (this._tx + x), ',', (this._ty + y));
                },
                lineTo: function (x, y) {
                    this._path.push('l', (this._tx + x), ',', (this._ty + y));
                },
                stroke: function () {
                    //this._path.push('e');
                },
                done: function () {
                    var shape = angular.element('<v:shape'
                        + ' coordsize="' + this._width + ' ' + this._height + '"'
                        + ' style="position:absolute; left:0px; top:0px; width:' + this._width + 'px; height:' + this._height + 'px;"'
                        + ' filled="0" stroked="1" strokecolor="' + this.strokeStyle + '" strokeweight="' + this.lineWidth + 'px"'
                        + ' path="' + this._path.join('') + '" />');
                    this._element.append(shape);
                    //this._element.attr('coordsize', this._width + ' ' + this._height)
                    //    .attr('filled', 0)
                    //    .attr('stroked', 1)
                    //    .attr('strokecolor', this.strokeStyle)
                    //    .attr('strokeweight', this.lineWidth + 'px')
                    //    .attr('path', this._path.join(''));
                }
            };
        }
        function drawLinesDirective() {
            return {
                restrict: 'A',
                require: '^draw',
                link: function (scope, element, attrs, ctrlDraw) {
                    //attrs.$observe( 'drawLines', () => {
                    scope.$watch(attrs.drawLines, function () {
                        ctrlDraw.drawLines(element);
                    });
                }
            };
        }
        angular.module('jat.draw.list', [
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.tournamentLib',
            'jat.services.find',
            'jat.services.undo',
            'jat.services.selection'])
            .directive('draw', drawDirective)
            .directive('drawLines', drawLinesDirective)
            .run(initVml);
    })(draw = jat.draw || (jat.draw = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var event;
    (function (event_1) {
        var dialogEventCtrl = (function () {
            function dialogEventCtrl(selection, title, event, tournamentLib, rank, category) {
                this.selection = selection;
                this.title = title;
                this.event = event;
                this.tournamentLib = tournamentLib;
                this.ranks = rank.list();
                this.categories = category.list();
                this.registred = tournamentLib.getRegistred(event);
            }
            dialogEventCtrl.$inject = [
                'selection',
                'title',
                'event',
                'tournamentLib',
                'rank',
                'category'
            ];
            return dialogEventCtrl;
        })();
        angular.module('jat.event.dialog', [])
            .controller('dialogEventCtrl', dialogEventCtrl);
    })(event = jat.event || (jat.event = {}));
})(jat || (jat = {}));
/// <reference path="../../lib/typescript/angular/angular.d.ts" />
/// <reference path="../../lib/declarations.d.ts" />
/// <reference path="../../services/selection.ts" />
/// <reference path="../../services/fft.ts" />
/// <reference path="../../models/event.ts" />
'use strict';
angular.module('jat.views.dialogs.eventDialog', []).directive('event', function () {
    var dir = {
        templateUrl: 'views/event.html',
        replace: true,
        restrict: //transclude: false,
        'E',
        scope: {
            show: "=",
            title: "@",
            event: "=",
            ok: "&",
            removeEvent: "&"
        },
        link: function postLink(scope, element, attrs, ctrl) {
            //console.info("event directive: link");
            scope.close = function () {
                scope.show = false;
            };
        }
    };
    return dir;
});
//@ sourceMappingURL=eventDialog.js.map
'use strict';
var jat;
(function (jat) {
    var event;
    (function (event) {
        function listEventsDirective() {
            var dir = {
                templateUrl: 'event/listEvents.html',
                controller: 'listEventsCtrl',
                controllerAs: 'list',
                restrict: 'EA',
                scope: true,
                link: function (scope, element, attrs, controller) {
                    scope.$watch(attrs.listEvents, function (newValue, oldValue, scope) {
                        controller.events = newValue;
                    });
                }
            };
            return dir;
        }
        var listEventsCtrl = (function () {
            function listEventsCtrl() {
            }
            return listEventsCtrl;
        })();
        angular.module('jat.event.list', [])
            .directive('listEvents', listEventsDirective)
            .controller('listEventsCtrl', listEventsCtrl);
    })(event = jat.event || (jat.event = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var main;
    (function (main) {
        /** Main controller for the application */
        var mainCtrl = (function () {
            function mainCtrl($modal, selection, mainLib, tournamentLib, drawLib, validation, undo, $window, $timeout) {
                var _this = this;
                this.$modal = $modal;
                this.selection = selection;
                this.mainLib = mainLib;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.validation = validation;
                this.undo = undo;
                this.$window = $window;
                this.$timeout = $timeout;
                this.GenerateType = models.GenerateType;
                this.ModelType = models.ModelType;
                this.Mode = models.Mode;
                this.selection.tournament = this.tournamentLib.newTournament();
                var filename = '/data/tournament8.json';
                //var filename = '/data/to2006.json';
                //Load saved tournament if exists
                //this.mainLib.loadTournament().then((data) => {
                //}, (reason) => {
                this.mainLib.loadTournament(filename).then(function (data) {
                });
                //});
                //Auto save tournament on exit
                var onBeforeUnloadHandler = function (event) {
                    _this.mainLib.saveTournament(_this.selection.tournament);
                };
                if ($window.addEventListener) {
                    $window.addEventListener('beforeunload', onBeforeUnloadHandler);
                }
                else {
                    $window.onbeforeunload = onBeforeUnloadHandler;
                }
            }
            //#region tournament
            mainCtrl.prototype.newTournament = function () {
                //TODO confirmation
                //TODO undo
                this.mainLib.newTournament();
                this.editTournament(this.selection.tournament);
            };
            mainCtrl.prototype.loadTournament = function (file) {
                this.mainLib.loadTournament(file);
            };
            mainCtrl.prototype.saveTournament = function () {
                this.mainLib.saveTournament(this.selection.tournament, '');
            };
            mainCtrl.prototype.editTournament = function (tournament) {
                var _this = this;
                var editedInfo = this.tournamentLib.newInfo(this.selection.tournament.info);
                this.$modal.open({
                    templateUrl: 'tournament/dialogInfo.html',
                    controller: 'dialogInfoCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit info"; },
                        info: function () { return editedInfo; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        //this.mainLib.editInfo(editedInfo, this.selection.tournament.info);
                        var c = _this.selection.tournament;
                        _this.undo.update(_this.selection.tournament, 'info', editedInfo, "Edit info"); //c.info = editedInfo;
                    }
                });
            };
            //#endregion tournament
            mainCtrl.prototype.select = function (item, type) {
                var _this = this;
                if (item && type) {
                    //first unselect any item to close the actions dropdown
                    this.selection.select(undefined, type);
                    //then select the new box
                    this.$timeout(function () { return _this.selection.select(item, type); }, 0);
                    return;
                }
                this.selection.select(item, type);
            };
            //#region player
            mainCtrl.prototype.addPlayer = function () {
                var _this = this;
                var newPlayer = this.tournamentLib.newPlayer(this.selection.tournament);
                this.$modal.open({
                    templateUrl: 'player/dialogPlayer.html',
                    controller: 'dialogPlayerCtrl as dlg',
                    resolve: {
                        title: function () { return "New player"; },
                        player: function () { return newPlayer; },
                        events: function () { return _this.selection.tournament.events; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.addPlayer(_this.selection.tournament, newPlayer);
                    }
                });
            };
            mainCtrl.prototype.editPlayer = function (player) {
                var _this = this;
                var editedPlayer = this.tournamentLib.newPlayer(this.selection.tournament, player);
                this.$modal.open({
                    templateUrl: 'player/dialogPlayer.html',
                    controller: 'dialogPlayerCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit player"; },
                        player: function () { return editedPlayer; },
                        events: function () { return _this.selection.tournament.events; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editPlayer(editedPlayer, player);
                    }
                    else if ('Del' === result) {
                        _this.mainLib.removePlayer(player);
                    }
                });
            };
            mainCtrl.prototype.removePlayer = function (player) {
                this.mainLib.removePlayer(player);
            };
            //#endregion player
            //#region event
            mainCtrl.prototype.addEvent = function (after) {
                var _this = this;
                var newEvent = this.tournamentLib.newEvent(this.selection.tournament);
                this.$modal.open({
                    templateUrl: 'event/dialogEvent.html',
                    controller: 'dialogEventCtrl as dlg',
                    resolve: {
                        title: function () { return "New event"; },
                        event: function () { return newEvent; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.addEvent(_this.selection.tournament, newEvent, after); //TODO add event after selected event
                    }
                });
            };
            mainCtrl.prototype.editEvent = function (event) {
                var _this = this;
                var editedEvent = this.tournamentLib.newEvent(this.selection.tournament, event);
                this.$modal.open({
                    templateUrl: 'event/dialogEvent.html',
                    controller: 'dialogEventCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit event"; },
                        event: function () { return editedEvent; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editEvent(editedEvent, event);
                    }
                    else if ('Del' === result) {
                        _this.mainLib.removeEvent(event);
                    }
                });
            };
            mainCtrl.prototype.removeEvent = function (event) {
                this.mainLib.removeEvent(event);
            };
            //#endregion event
            //#region draw
            mainCtrl.prototype.addDraw = function (after) {
                var _this = this;
                var newDraw = this.drawLib.newDraw(this.selection.event, undefined, after);
                this.$modal.open({
                    templateUrl: 'draw/dialogDraw.html',
                    controller: 'dialogDrawCtrl as dlg',
                    resolve: {
                        title: function () { return "New draw"; },
                        draw: function () { return newDraw; }
                    }
                }).result.then(function (result) {
                    //TODO add event after selected draw
                    if ('Ok' === result) {
                        _this.mainLib.addDraw(newDraw, 0, after);
                    }
                    else if ('Generate' === result) {
                        _this.mainLib.addDraw(newDraw, 1, after);
                    }
                });
            };
            mainCtrl.prototype.editDraw = function (draw) {
                var _this = this;
                var editedDraw = this.drawLib.newDraw(draw._event, draw);
                this.$modal.open({
                    templateUrl: 'draw/dialogDraw.html',
                    controller: 'dialogDrawCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit draw"; },
                        draw: function () { return editedDraw; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw);
                    }
                    else if ('Generate' === result) {
                        _this.mainLib.updateDraw(editedDraw, draw, 1);
                    }
                    else if ('Del' === result) {
                        _this.mainLib.removeDraw(draw);
                    }
                });
            };
            mainCtrl.prototype.validateDraw = function (draw) {
                this.mainLib.validateDraw(draw);
            };
            mainCtrl.prototype.generateDraw = function (draw, generate) {
                this.mainLib.updateDraw(draw, undefined, generate || models.GenerateType.Create);
            };
            mainCtrl.prototype.updateQualif = function (draw) {
                this.mainLib.updateQualif(draw);
            };
            mainCtrl.prototype.removeDraw = function (draw) {
                this.mainLib.removeDraw(draw);
            };
            //#endregion draw
            //#region match
            mainCtrl.prototype.isMatch = function (box) {
                return box && 'score' in box;
            };
            mainCtrl.prototype.editMatch = function (match) {
                var _this = this;
                var editedMatch = this.drawLib.newBox(match._draw, match);
                this.$modal.open({
                    templateUrl: 'draw/dialogMatch.html',
                    controller: 'dialogMatchCtrl as dlg',
                    resolve: {
                        title: function () { return "Edit match"; },
                        match: function () { return editedMatch; }
                    }
                }).result.then(function (result) {
                    if ('Ok' === result) {
                        _this.mainLib.editMatch(editedMatch, match);
                    }
                });
            };
            //#endregion match
            mainCtrl.prototype.doUndo = function () {
                this.selection.select(this.undo.undo(), this.undo.getMeta());
            };
            mainCtrl.prototype.doRedo = function () {
                this.selection.select(this.undo.redo(), this.undo.getMeta());
            };
            mainCtrl.$inject = [
                '$modal',
                'selection',
                'mainLib',
                'tournamentLib',
                'drawLib',
                'validation',
                'undo',
                '$window',
                '$timeout',
            ];
            return mainCtrl;
        })();
        main.mainCtrl = mainCtrl;
        angular.module('jat.main', [
            'jat.services.mainLib',
            'jat.services.selection',
            'jat.services.undo',
            'jat.services.tournamentLib',
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.validation',
            'jat.services.validation.knockout',
            'jat.services.validation.roundrobin',
            'jat.services.validation.fft',
            'jat.tournament.dialog',
            'jat.player.dialog',
            'jat.player.list',
            'jat.event.dialog',
            'jat.event.list',
            'jat.draw.dialog',
            'jat.draw.list',
            'jat.draw.box',
            'jat.match.dialog',
            'ec.panels',
            'ec.inputFile',
            //'polyfill',
            'ui.bootstrap'])
            .controller('mainCtrl', mainCtrl);
    })(main = jat.main || (jat.main = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var player;
    (function (player_1) {
        var dialogPlayerCtrl = (function () {
            function dialogPlayerCtrl(title, player, events, rank, category) {
                this.title = title;
                this.player = player;
                this.events = events;
                this.ranks = rank.list();
                this.categories = category.list();
            }
            dialogPlayerCtrl.$inject = [
                'title',
                'player',
                'events',
                'rank',
                'category'
            ];
            return dialogPlayerCtrl;
        })();
        player_1.dialogPlayerCtrl = dialogPlayerCtrl;
        angular.module('jat.player.dialog', ['jat.utils.checkList'])
            .controller('dialogPlayerCtrl', dialogPlayerCtrl);
    })(player = jat.player || (jat.player = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var player;
    (function (player) {
        function listPlayersDirective() {
            var dir = {
                templateUrl: 'player/listPlayers.html',
                controller: 'listPlayersCtrl',
                controllerAs: 'list',
                restrict: 'EA',
                scope: true,
                link: function (scope, element, attrs, controller) {
                    scope.$watch(attrs.listPlayers, function (newValue, oldValue, scope) {
                        controller.players = newValue;
                    });
                }
            };
            return dir;
        }
        var listPlayersCtrl = (function () {
            function listPlayersCtrl(selection, find) {
                this.selection = selection;
                this.find = find;
            }
            //eventById: { [id: string]: models.Event };
            listPlayersCtrl.prototype.eventById = function (id) {
                if (this.selection.tournament && this.selection.tournament.events) {
                    return this.find.byId(this.selection.tournament.events, id);
                }
            };
            listPlayersCtrl.$inject = [
                'selection',
                'find'
            ];
            return listPlayersCtrl;
        })();
        angular.module('jat.player.list', ['jat.services.selection', 'jat.services.find'])
            .directive('listPlayers', listPlayersDirective)
            .controller('listPlayersCtrl', listPlayersCtrl);
    })(player = jat.player || (jat.player = {}));
})(jat || (jat = {}));
;
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MAX_TETESERIE = 32, MAX_QUALIF = 32, QEMPTY = -1;
        var DrawLib = (function () {
            function DrawLib(find, rank, guid) {
                this.find = find;
                this.rank = rank;
                this.guid = guid;
                this._drawLibs = {};
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
            DrawLib.prototype.resetDraw = function (draw, nPlayer) {
                //remove qualif out
                var next = this.nextGroup(draw);
                if (next && draw.boxes) {
                    for (var i = 0; i < next.length; i++) {
                        var boxes = next[i].boxes;
                        if (boxes) {
                            for (var b = 0; b < boxes.length; b++) {
                                var box = boxes[b];
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
            DrawLib.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                return this._drawLibs[draw.type].nbColumnForPlayers(draw, nJoueur);
            };
            DrawLib.prototype.getSize = function (draw) {
                return this._drawLibs[draw.type].getSize(draw);
            };
            DrawLib.prototype.computePositions = function (draw) {
                return this._drawLibs[draw.type].computePositions(draw);
            };
            DrawLib.prototype.resize = function (draw, oldDraw, nJoueur) {
                this._drawLibs[draw.type].resize(draw, oldDraw, nJoueur);
            };
            DrawLib.prototype.generateDraw = function (draw, generate, afterIndex) {
                return this._drawLibs[draw.type].generateDraw(draw, generate, afterIndex);
            };
            DrawLib.prototype.refresh = function (draw) {
                draw._refresh = new Date(); //force angular refresh
            };
            DrawLib.prototype.updateQualif = function (draw) {
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
                    this.SetQualifieEntrant(qualifs[i], 0);
                }
                //assign new qualif number
                for (i = qualifs.length - 1; i >= 0; i--) {
                    this.SetQualifieEntrant(qualifs[i], i + 1);
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
                return box && ('score' in box) && ((box.place) || box.date);
            };
            DrawLib.prototype.FindTeteSerie = function (origin, iTeteSerie) {
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
            DrawLib.prototype.FindQualifieEntrant = function (origin, iQualifie) {
                ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
                var group = angular.isArray(origin) ? origin : this.group(origin);
                for (var i = 0; i < group.length; i++) {
                    var d = group[i];
                    var playerIn = this._drawLibs[d.type].FindQualifieEntrant(d, iQualifie);
                    if (playerIn) {
                        return playerIn;
                    }
                }
            };
            DrawLib.prototype.FindQualifieSortant = function (origin, iQualifie) {
                ASSERT(1 <= iQualifie && iQualifie <= MAX_QUALIF);
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
                    return -2; //TODO
                }
                return null;
            };
            DrawLib.prototype.FindAllQualifieSortant = function (origin, hideNumbers) {
                //Récupère les qualifiés sortants du tableau
                var group = angular.isArray(origin) ? origin : this.group(origin);
                if (group) {
                    var a = [];
                    for (var i = 1; i <= MAX_QUALIF; i++) {
                        if (this.FindQualifieSortant(group, i)) {
                            a.push(hideNumbers ? QEMPTY : i);
                        }
                    }
                    return a;
                }
            };
            DrawLib.prototype.FindAllQualifieSortantBox = function (origin) {
                //Récupère les qualifiés sortants du tableau
                var group = angular.isArray(origin) ? origin : this.group(origin);
                if (group) {
                    var a = [], m;
                    for (var i = 1; i <= MAX_QUALIF; i++) {
                        if (m = this.FindQualifieSortant(group, i)) {
                            a.push(m);
                        }
                    }
                    return a;
                }
            };
            /**
              * Fill or erase a box with qualified in and/or player
              * setPlayerIn
              *
              * @param box
              * @param inNumber (optional)
              * @param player   (optional)
              */
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
                    var next = this.nextGroup(box._draw);
                    if (next) {
                        var boxIn = this.FindQualifieEntrant(next, boxOut.qualifOut);
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
                }
                else if (!this.EnleveJoueur(box)) {
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
                var match = isMatch(box) ? box : undefined;
                var boiteMatch = isMatch(boite) ? boite : undefined;
                if (boxIn.qualifIn
                    && boxIn.qualifIn != boiteIn.qualifIn) {
                    if (!this.SetQualifieEntrant(box)) {
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
                    if (!this.SetQualifieEntrant(box, boiteIn.qualifIn, boite._player)) {
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
                            if (!this.SetQualifieSortant(match, boiteMatch.qualifOut)) {
                                throw 'Error';
                            }
                        }
                        //if( isCreneau( box))
                        //v0998
                        var opponents = this.boxesOpponents(match);
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
        angular.module('jat.services.drawLib', ['jat.services.find', 'jat.services.type', 'jat.services.guid'])
            .factory('drawLib', [
            'find', 'rank', 'guid',
            function (find, rank, guid) {
                return new DrawLib(find, rank, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Category = (function () {
            function Category() {
                // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf
                this._category = {
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
                //    this.refDate = function( date) {
                //        refDate = date;
                //    }
                this._categories = [];
                this._index = {};
                var now = new Date();
                var refDate = new Date(now.getFullYear(), 9, 1); //1er Octobre
                this.currentYear = now.getFullYear() + (now > refDate ? 1 : 0);
                for (var c in this._category) {
                    this._categories.push(c);
                }
                for (var i = this._categories.length - 1; i >= 0; i--) {
                    this._index[this._categories[i]] = i;
                }
            }
            Category.prototype.list = function () {
                return this._categories;
            };
            Category.prototype.isValid = function (category) {
                return this._index[category] >= 0;
            };
            Category.prototype.compare = function (category1, category2) {
                var i = this._index[category1], j = this._index[category2];
                return i - j;
            };
            Category.prototype.getAge = function (date) {
                //var age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
                var age = this.currentYear - date.getFullYear();
                return age;
            };
            Category.prototype.ofDate = function (date) {
                var age = this.getAge(date), i, prev;
                for (i in this._category) {
                    var categ = this._category[i];
                    if (categ.ageMax && categ.ageMax < age) {
                        continue; //too old
                    }
                    if (categ.ageMin) {
                        if (categ.ageMin <= age) {
                            prev = i;
                            continue;
                        }
                        else {
                            return prev;
                        }
                    }
                    return i;
                }
            };
            Category.prototype.isCompatible = function (eventCategory, playerCategory) {
                if (playerCategory || !eventCategory) {
                    return true;
                }
                //TODO,2006/12/31: comparer l'age du joueur au 31 septembre avec la date de début de l'épreuve.
                var idxSenior = this._index['Senior'];
                var idxEvent = this._index[eventCategory];
                //Epreuve senior
                if (idxEvent === idxSenior) {
                    return true;
                }
                var catEvent = this._category[eventCategory];
                var catPlayer = this._category[playerCategory];
                if (idxEvent < idxSenior) {
                    //Epreuve jeunes
                    if (catPlayer.ageMax <= catEvent.ageMax) {
                        return true;
                    }
                }
                else {
                    //Epreuve vétérans
                    if (catEvent.ageMin <= catPlayer.ageMin) {
                        return true;
                    }
                }
                return false;
                //TODO? 2006/08/28	AgeMin() < playerCategory.AgeMin()	//vétéran
                //	return playerCategory.isVide() || isVide()
                //		(playerCategory.AgeMin() <= AgeMax() 
                //		&& AgeMin() <= playerCategory.AgeMax() );
            };
            return Category;
        })();
        fft.Category = Category;
        angular.module('jat.services.fft.category', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        angular.module('jat.services.type', [
            'jat.services.fft.score',
            'jat.services.fft.category',
            'jat.services.fft.licence',
            'jat.services.fft.matchFormat',
            'jat.services.fft.rank',
            'jat.services.fft.ranking'
        ])
            .service('score', fft.Score)
            .service('category', fft.Category)
            .service('licence', fft.Licence)
            .service('matchFormat', fft.MatchFormat)
            .service('rank', fft.Rank)
            .service('ranking', ['score', fft.Ranking]);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Licence = (function () {
            function Licence() {
            }
            Licence.prototype.isValid = function (licence) {
                var a = Licence.reLicence.exec(licence + " ");
                if (a === null) {
                    return false;
                }
                //check licence key
                var v = parseInt(a[1]);
                var k = Licence.keys.charAt(v % 23);
                return k == a[2];
            };
            Licence.reLicence = /^([0-9]{7})([A-HJ-NPR-Z])$/;
            Licence.keys = "ABCDEFGHJKLMNPRSTUVWXYZ";
            return Licence;
        })();
        fft.Licence = Licence;
        angular.module('jat.services.fft.licence', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var MatchFormat = (function () {
            function MatchFormat() {
                this._matchFormats = {
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
            }
            MatchFormat.prototype.list = function () {
                return this._matchFormats;
            };
            return MatchFormat;
        })();
        fft.MatchFormat = MatchFormat;
        angular.module('jat.services.fft.matchFormat', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Rank = (function () {
            function Rank() {
                this._group = {
                    "4e série": "NC,40,30/5,30/4,30/3,30/2,30/1",
                    "3e série": "30,15/5,15/4,15/3,15/2,15/1",
                    "2e série": "15,5/6,4/6,3/6,2/6,1/6",
                    "1e série": "0,-1/6,-2/6,-3/6,-4/6,-5/6",
                    "promotion": "-15,-30"
                };
                this._groups = [];
                this._groupOf = {};
                this._ranks = [];
                this._index = {};
                var i;
                for (i in this._group) {
                    this._groups.push(i);
                    var g = this._group[i].split(",");
                    this._ranks = this._ranks.concat(g);
                    for (var j = g.length - 1; j >= 0; j--) {
                        this._groupOf[g[j]] = i;
                    }
                }
                for (var j = this._ranks.length - 1; j >= 0; j--) {
                    this._index[this._ranks[j]] = j;
                }
            }
            Rank.prototype.list = function () {
                return this._ranks;
            };
            Rank.prototype.isValid = function (rank) {
                return this._index[rank] >= 0;
            };
            Rank.prototype.isNC = function (rank) {
                return rank === "NC";
            };
            Rank.prototype.next = function (rank) {
                var i = this._index[rank];
                return this._ranks[i + 1];
            };
            Rank.prototype.previous = function (rank) {
                var i = this._index[rank];
                return this._ranks[i - 1];
            };
            Rank.prototype.compare = function (rank1, rank2) {
                var i = this._index[rank1], j = this._index[rank2];
                return i - j;
            };
            Rank.prototype.within = function (rank, rank1, rank2) {
                return (!rank1 || this.compare(rank1, rank) <= 0)
                    && (!rank2 || this.compare(rank, rank2) <= 0);
            };
            Rank.prototype.groups = function () {
                return this._groups;
            };
            Rank.prototype.groupOf = function (rank) {
                return this._groupOf[rank];
            };
            return Rank;
        })();
        fft.Rank = Rank;
        angular.module('jat.services.fft.rank', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Ranking = (function () {
            function Ranking(score) {
                this._champs = [
                    "Points:",
                    "Différence de Sets:",
                    "Différence de Jeux:"
                ];
                this.Points = 0;
                this._serviceScore = score;
            }
            //- le nombre de sets des matchs (3 ou 5)
            //art52               |  Points  |   Sets   |   Jeux   |
            //- Vainqueur         |    +2    |Différence|Différence|
            //- Battu             |    +1    |Différence|Différence|
            //- Vainqueur abandon |    +2    |          |          |
            //- Battu abandon     |    +1    |          |          |
            //- Vainqueur WO      |    +2    |   +1,5   |    +5    |
            //- Battu WO          |     0    |   -1,5   |    -5    |
            //- Match nul         |     0    |          |          |
            Ranking.prototype.Empty = function () {
                this.Points = 0;
            };
            Ranking.prototype.isVide = function () {
                return this.Points === 0;
            };
            Ranking.prototype.NomChamp = function (iChamp) {
                return this._champs[iChamp];
            };
            Ranking.prototype.ValeurChamp = function (iChamp) {
                switch (iChamp) {
                    case 0: return this.dPoint.toString();
                    case 1: return Math.floor(this.dSet2 / 2).toString();
                    case 2: return this.dJeu.toString();
                }
            };
            Ranking.prototype.AddResultat = function (bVictoire, score, fm) {
                //bVictoire: -1=défaite, 0=nul, 1=victoire
                var sc = new fft.ScoreFFT(score, fm);
                //Compte la différence de Set
                this.dPoint += sc.deltaPoint(bVictoire > 0); //TODO bEquipe ???
                this.dSet2 += sc.deltaSet(bVictoire > 0); //TODO bEquipe ???
                this.dJeu += sc.deltaJeu(bVictoire > 0); //TODO bEquipe ???
                return true;
            };
            Ranking.prototype.Ordre = function () {
                return ((this.dPoint + 0x80) << 24) + ((this.dSet2 + 0x80) << 16) + (this.dJeu + 0x8000);
            };
            return Ranking;
        })();
        fft.Ranking = Ranking;
        angular.module('jat.services.fft.ranking', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Score = (function () {
            function Score() {
            }
            Score.prototype.isValid = function (score) {
                var a = Score.reScore.exec(score + " ");
                if (a === null) {
                    return false;
                }
                //check score
                var sets = score.split(/\s+/);
                var nSet1 = 0, nSet2 = 0;
                for (var i = 0; i < sets.length; i++) {
                    var games = sets[i].split("/");
                    var j1 = parseInt(games[0]);
                    var j2 = parseInt(games[1]);
                    if (j1 > j2 && j1 >= 6) {
                        if (j1 >= 7 && j2 < 5) {
                            return false;
                        }
                        nSet1++;
                    }
                    else if (j2 > j1 && j2 >= 6) {
                        if (j2 >= 7 && j1 < 5) {
                            return false;
                        }
                        nSet2++;
                    }
                }
                return true;
            };
            Score.reScore = /^(([0-9]{1,2}\/[0-9]{1,2})\s+){2,5}(Ab )?$/;
            return Score;
        })();
        fft.Score = Score;
        var MAX_SET = 5;
        var ScoreFFT = (function () {
            function ScoreFFT(score, fm) {
                //TODO parse
                return;
            }
            ScoreFFT.prototype.getnSet = function () {
                var i = 0;
                while (i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2)) {
                    i++;
                }
                return i - 1;
            };
            ScoreFFT.prototype.deltaSet = function (bVainqueur /*, BOOL bEquipe */) {
                throw "Not implemented";
                var n = 0;
                for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                    n += (this.m_Jeu[i].j1 > this.m_Jeu[i].j2) ? 1 : this.m_Jeu[i].j1 < this.m_Jeu[i].j2 ? -1 : 0;
                }
                var dSet;
                //        if (isWO())
                //            return bVainqueur ? 3 : -3;	//dSet2
                //        if (isAbandon()) {
                //	//Calcul différence de set et de jeu abandon poule
                //	int nSetGagne = ((const CFormatMatch&)fm).isCinqSets() ? 3 : 2;
                //	int nJeuGagne = ((const CFormatMatch&)fm).nbJeuxParSet();	//((const CFormatMatch&)fm).isSetQuatreJeux() ? 4 : 6;
                //	int nSetV = 0, nSetD = 0;
                //	CScore score = *this;	//m_pBoite[ b]->m_Score;
                //            score.Abandon = FALSE;
                //	//Passe les sets joués
                //	var set;
                //            for (set = 0; set < MAX_SET; set++) {
                //		if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
                //                && (set + 1 == (nSetGagne << 1) - 1)) {
                //                    //Dernier set en jeu décisif
                //                    if (!((score.this.m_Jeu[set].j1 >= 7
                //                        || score.this.m_Jeu[set].j2 >= 7)
                //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)) {
                //                        score.this.m_Jeu[set].j1 = score.this.m_Jeu[set].j2 = 0;
                //                        break;
                //                    }
                //		} else {
                //                    //Set normal
                //                    if (!((score.this.m_Jeu[set].j1 >= nJeuGagne
                //                        || score.this.m_Jeu[set].j2 >= nJeuGagne)
                //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)
                //                        && !(score.this.m_Jeu[set].j1 >= nJeuGagne
                //                        && score.this.m_Jeu[set].j2 >= nJeuGagne
                //                        && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) == 1)
                //                        )
                //                        break;	//6/0, 6/1, 6/2, 6/3, 6/4, 7/5 ou 7/6 ou l'inverse
                //                }
                //                if (score.this.m_Jeu[set].j1 > score.this.m_Jeu[set].j2)
                //                    nSetV++;
                //                else
                //                    nSetD++;
                //                if ((nSetGagne <= nSetV && nSetD < nSetV) || (nSetGagne <= nSetD && nSetV < nSetD)) {	//Victoire acquise
                //                    //ASSERT( FALSE);	//TODO
                //                    //pDoc->Erreur( IDS_ERR_SCORE_BAD, -1, e, pDoc->FindTableau( this), b);
                //                    break;
                //                }
                //            }
                //            for (; !(nSetGagne <= nSetV && nSetD < nSetV) && set < MAX_SET; set++) {	//Pas victoire acquise
                //		if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
                //                && (set + 1 == (nSetGagne << 1) - 1)) {
                //                    //Dernier set en jeu décisif
                //                    ;	//Ne compte pas de jeu
                //		} else {
                //                    score.this.m_Jeu[set].j1 = nJeuGagne;
                //                    if (score.this.m_Jeu[set].j2 == nJeuGagne || score.this.m_Jeu[set].j2 + 1 == nJeuGagne)	//7/5, ou 7/6
                //                        score.this.m_Jeu[set].j1++;
                //                }
                //                nSetV++;
                //            }
                //            dSet = score.deltaSet(bVainqueur, fm /*, bEquipe */);
                //        } else {
                //            dSet = (bVainqueur ? n : -n) << 1;
                //            if (!isVide() && !dSet && !deltaJeu(bVainqueur, fm /*, bEquipe */))
                //                return 0;	//Match nul //TODO Poule
                //        }
                return dSet;
            };
            ScoreFFT.prototype.deltaJeu = function (bVainqueur /*, BOOL bEquipe */) {
                throw "Not implemented";
                var n = 0;
                for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                    n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
                }
                var dJeu;
                //    if (isWO())
                //        return bVainqueur ? 5 : -5;
                //    if (isAbandon()) {
                ////Calcul différence de set et de jeu abandon poule
                //int nSetGagne = ((const CFormatMatch&)fm).isCinqSets() ? 3 : 2;
                //int nJeuGagne = ((const CFormatMatch&)fm).nbJeuxParSet();	//((const CFormatMatch&)fm).isSetQuatreJeux() ? 4 : 6;
                //int nSetV = 0, nSetD = 0;
                //CScore score = *this;	//m_pBoite[ b]->m_Score;
                //        score.Abandon = FALSE;
                ////Passe les sets joués
                //int set;
                //        for (set = 0; set < MAX_SET; set++) {
                //	if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
                //            && (set + 1 == (nSetGagne << 1) - 1)) {
                //                //Dernier set en jeu décisif
                //                if (!((score.this.m_Jeu[set].j1 >= 7
                //                    || score.this.m_Jeu[set].j2 >= 7)
                //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)) {
                //                    score.this.m_Jeu[set].j1 = score.this.m_Jeu[set].j2 = 0;
                //                    break;
                //                }
                //	} else {
                //                //Set normal
                //                if (!((score.this.m_Jeu[set].j1 >= nJeuGagne
                //                    || score.this.m_Jeu[set].j2 >= nJeuGagne)
                //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) >= 2)
                //                    && !(score.this.m_Jeu[set].j1 >= nJeuGagne
                //                    && score.this.m_Jeu[set].j2 >= nJeuGagne
                //                    && abs(score.this.m_Jeu[set].j1 - score.this.m_Jeu[set].j2) == 1)
                //                    )
                //                    break;	//6/0, 6/1, 6/2, 6/3, 6/4, 7/5 ou 7/6 ou l'inverse
                //            }
                //            if (score.this.m_Jeu[set].j1 > score.this.m_Jeu[set].j2)
                //                nSetV++;
                //            else
                //                nSetD++;
                //            if ((nSetGagne <= nSetV && nSetD < nSetV) || (nSetGagne <= nSetD && nSetV < nSetD)) {	//Victoire acquise
                //                //ASSERT( FALSE);	//TODO
                //                //pDoc->Erreur( IDS_ERR_SCORE_BAD, -1, e, pDoc->FindTableau( this), b);
                //                break;
                //            }
                //        }
                //        for (; !(nSetGagne <= nSetV && nSetD < nSetV) && set < MAX_SET; set++) {	//Pas victoire acquise
                //	if( ((const CFormatMatch&)fm).isJeuDecisifDernierSet()
                //            && (set + 1 == (nSetGagne << 1) - 1)) {
                //                //Dernier set en jeu décisif
                //                ;	//Ne compte pas de jeu
                //	} else {
                //                score.this.m_Jeu[set].j1 = nJeuGagne;
                //                if (score.this.m_Jeu[set].j2 == nJeuGagne || score.this.m_Jeu[set].j2 + 1 == nJeuGagne)	//7/5, ou 7/6
                //                    score.this.m_Jeu[set].j1++;
                //            }
                //            nSetV++;
                //        }
                //        dJeu = score.deltaJeu(bVainqueur, fm /*, bEquipe */);
                //    } else {
                //        dJeu = bVainqueur ? n : -n;
                //        if (!isVide() && !deltaSet(bVainqueur, fm /*, bEquipe */) && !dJeu)
                //            return 0;		//Match nul //TODO Poule
                //    }
                return dJeu;
            };
            ScoreFFT.prototype.deltaPoint = function (bVainqueur /*, BOOL bEquipe */) {
                throw "Not implemented";
                var n = 0;
                for (var i = 0; i < MAX_SET && (this.m_Jeu[i].j1 || this.m_Jeu[i].j2); i++) {
                    n += (this.m_Jeu[i].j1 - this.m_Jeu[i].j2);
                }
                var dSet, dJeu;
                //    if (isWO())
                //        return bVainqueur ? 2 : 0;
                //    else
                //        if (isAbandon())
                //            return bVainqueur ? 2 : 1;
                //        else {
                //            dSet = deltaSet(bVainqueur, fm /*, bEquipe */);
                //            dJeu = deltaJeu(bVainqueur, fm /*, bEquipe */);
                //            if (isVide() || dSet || dJeu)
                //                return bVainqueur ? 2 : 1;		//Résultat normal
                //            else
                //                return 0;	//Match nul //TODO Poule
                //        }
                return n;
            };
            return ScoreFFT;
        })();
        fft.ScoreFFT = ScoreFFT;
        angular.module('jat.services.fft.score', []);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
'use strict';
// FFT validation services
var jat;
(function (jat) {
    var service;
    (function (service) {
        var FFTValidation = (function () {
            function FFTValidation(validation, drawLib, knockout, find) {
                this.validation = validation;
                this.drawLib = drawLib;
                this.knockout = knockout;
                this.find = find;
                validation.addValidator(this);
            }
            FFTValidation.prototype.validatePlayer = function (player) {
                var bRes = true;
                //if (player.sexe == 'F'
                //    && player.rank
                //    && !player.rank.Division()
                //    //&& ((CClassement( N50) <= player.rank) && (player.rank < CClassement( N35)))
                //    ) {
                //    this.validation.errorDraw('IDS_ERR_CLAST_1SERIE', player);
                //    bRes = false;
                //}
                return bRes;
            };
            FFTValidation.prototype.validateDraw = function (draw) {
                var bRes = true;
                var isTypePoule = draw.type >= 2;
                var pColClast = {};
                var nqe = 0;
                //TODOjs
                for (var i = 0; i < draw.boxes.length; i++) {
                    var box = draw.boxes[i];
                    var boxIn = !isMatch(box) ? box : undefined;
                    var match = isMatch(box) ? box : undefined;
                    var player = box._player;
                    //VERIFIE //1   //progression des classements
                    //rank progress, no more than two ranks difference into a column
                    if (player && !isTypePoule) {
                        var c = column(box.position);
                        var colRank = pColClast[player.rank];
                        if (!colRank) {
                            pColClast[player.rank] = c;
                        }
                        else if (Math.abs(colRank - c) > 1) {
                            this.validation.errorDraw('IDS_ERR_CLAST_PROGR2', draw, box, player.rank);
                            bRes = false;
                        }
                    }
                    if (isTypePoule) {
                    }
                    //VERIFIE	//3
                    //DONE 00/03/04: CTableau, Deux qualifiés entrants se rencontrent
                    if (!isTypePoule && match) {
                        var opponent = this.knockout.boxesOpponents(match);
                        if (opponent.box1.qualifIn
                            && opponent.box2.qualifIn) {
                            this.validation.errorDraw('IDS_ERR_ENTRANT_MATCH', draw, opponent.box1);
                            bRes = false;
                        }
                    }
                    //VERIFIE	//4
                    if (boxIn && boxIn.qualifIn) {
                        nqe++;
                    }
                    if (isTypePoule && nqe > 1) {
                        this.validation.errorDraw('IDS_ERR_POULE_ENTRANT_OVR', draw, box);
                        bRes = false;
                    }
                }
                if (draw.type === models.DrawType.Final) {
                    //VERIFIE	//5
                    var boxT = this.drawLib.FindTeteSerie(draw, 1);
                    if (!boxT) {
                        var boxMax = this.find.by(draw.boxes, 'position', positionMax(draw.nbColumn, draw.nbOut));
                        this.validation.errorDraw('IDS_ERR_TAB_TETESERIE_FINAL_NO', draw, boxMax);
                        bRes = false;
                    }
                }
                //******************SAME old code using lpfn******************
                //ST_EPREUVE epreuve;
                //ST_TABLEAU tableau;
                //ST_BOITE boite, boite1, boite2;
                //ST_JOUEUR joueur;
                //ST_SELECTION sel;
                //short e, t, b, b2, m;
                //short	nqe = 0;
                //short nTeteDeSerie = 0;
                //ICOL c;
                //IBOITE bMin;
                //IBOITE bMax;
                //ICOL colMax;
                //ICOL colMin;
                //CMapWordToPtr pColClast;
                //            memset( &sel, -1, sizeof(ST_SELECTION));
                //            sel.size = PosAfter(sel, nMessage);	//sizeof( ST_SELECTION);
                //            for (e = (iEpreuve != -1 ? iEpreuve : 0); e < 32; e++) {
                //                epreuve.size = sizeof(ST_EPREUVE);
                //                if (!glpfn.GetEpreuve(pDoc, e, &epreuve))
                //                    break;
                //                sel.iEpreuve = e;
                //                if (iEpreuve != -1 && iTableau == -1) {
                //			//Check seulement l'épreuve
                //	#ifdef _DEBUG
                ////				wsprintf( gszBuf, "FFT: VerifieEpreuve( \"%s\")", epreuve.Nom);
                ////				glpfn.AddMessage( pDoc, gszBuf, &sel);
                //	#endif //_DEBUG
                //		} else {
                //                    //Check les tableaux
                //                    for (t = (iTableau != -1 && iEpreuve != -1 ? iTableau : 0); t < 64; t++) {
                //                        tableau.size = sizeof(ST_TABLEAU);
                //                        if (!glpfn.GetTableau(pDoc, e, t, &tableau))
                //                            break;
                //                        sel.iTableau = t;
                //	#ifdef _DEBUG
                ////				wsprintf( gszBuf, "FFT: VerifieTableau( \"%s\", \"%s\")", epreuve.Nom, tableau.Nom);
                ////				glpfn.AddMessage( pDoc, gszBuf, &sel);
                //	#endif //_DEBUG
                //				if (tableau.Type == 1) {	//Tableau Final(bonus)
                //                            if (epreuve.Consolante) {
                //                                LOADSTRING(IDS_ERR_TAB_FINAL_CONSOLATION, gszBuf, sizeof(gszBuf));
                //                                glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                bRes = -1;
                //                            }
                //                        }
                //                        if (ISPOULE(tableau)) {	//Poule
                //	#ifdef WITH_POULE
                //					bMin = 0;
                //                            bMax = tableau.nColonne * (tableau.nColonne + 1) - 1;
                //                            nqe = 0;
                //                            for (b = bMax; b >= bMin; b--) {
                //                                if (!glpfn.GetBoite(pDoc, e, t, b, &boite))
                //                                    break;
                //                                sel.iBoite = b;
                //                                if (boite.QualifieEntrant)
                //                                    nqe++;
                //                                //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur
                //                                //Un match
                //                                //Match avec une date
                //                                //Poule
                //                                //2================
                //                                //matches précédents de la colonne
                //                                for (b2 = iHautColPoule(iColPoule(b, (ICOL) tableau.nColonne), (ICOL) tableau.nColonne); b2 > b; b2--) {
                //                                    if (!glpfn.GetBoite(pDoc, e, t, b2, &boite2))
                //                                        break;
                //                                    if (iColPoule(b2, (ICOL) tableau.nColonne) < tableau.nColonne	//isMatch( b2)
                //                                        && !boite2.bCache
                //                                        && * boite2.Date
                //                                        && !_strcmpi(boite.Date, boite2.Date)
                //                                        ) {
                //                                        if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE2_POULE(b, (ICOL) tableau.nColonne), &boite2))
                //                                            sel.iJoueur = boite2.idJoueur;
                //                                        LOADSTRING(IDS_ERR_POULE_DATE_MATCH, gszBuf, sizeof(gszBuf));
                //                                        glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                        sel.iJoueur = -1;
                //                                        bRes = -1;
                //                                        break;
                //                                    }
                //                                }
                //                                if (b2 <= b) {
                //                                    //matches précédents de la ligne
                //                                    for (b2 = ADVERSAIRE1_POULE(b, (ICOL) tableau.nColonne) - tableau.nColonne; b2 > b; b2 -= tableau.nColonne) {
                //                                        if (!glpfn.GetBoite(pDoc, e, t, b2, &boite2))
                //                                            break;
                //                                        if (iColPoule(b2, (ICOL) tableau.nColonne) < tableau.nColonne	//isMatch( b2)
                //                                            && !boite2.bCache
                //                                            && * boite2.Date
                //                                            && !_strcmpi(boite.Date, boite2.Date)
                //                                            ) {
                //                                            if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE1_POULE(b, (ICOL) tableau.nColonne), &boite2))
                //                                                sel.iJoueur = boite2.idJoueur;
                //                                            LOADSTRING(IDS_ERR_POULE_DATE_MATCH, gszBuf, sizeof(gszBuf));
                //                                            glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                            sel.iJoueur = -1;
                //                                            bRes = -1;
                //                                            break;
                //                                        }
                //                                    }
                //                                }
                //                            }
                //                            sel.iBoite = -1;
                //                            //Poule
                //                            //4================
                //                            if (nqe > 1) {
                //                                LOADSTRING(IDS_ERR_POULE_ENTRANT_OVR, gszBuf, sizeof(gszBuf));
                //                                glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                bRes = -1;
                //					}
                //	#endif //WITH_POULE
                //				}
                //                        else {	//Normal ou Final
                //                            bMin = iBoiteMinQ(tableau.nSortant);
                //                            bMax = iBoiteMaxQ((ICOL) tableau.nColonne, tableau.nSortant);
                //                            colMax = iColMaxQ((ICOL) tableau.nColonne, tableau.nSortant);
                //                            colMin = iColMinQ(tableau.nSortant);
                //                            //				const IObjectFactory* pFactOld = GET_APP.m_pFactA;
                //                            //				GET_APP.m_pFactA = m_pFactT;	//Utilisé par le constructeur de CClassement
                //                            CClassement * pClastMaxCol = new CClassement[colMax + 1];
                //                            pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();	//NC
                //                            //				GET_APP.m_pFactA = pFactOld;
                //                            //Match avec deux joueurs gagné par un des deux joueurs
                //                            for (b = bMax; b >= bMin; b--) {
                //                                if (!glpfn.GetBoite(pDoc, e, t, b, &boite))
                //                                    break;
                //                                if (boite.TeteDeSerie)
                //                                    nTeteDeSerie++;
                //                                //Un match
                //                                //3================
                //                                //DONE 00/03/04: CTableau, Deux qualifiés entrants se rencontrent
                //                                if (glpfn.GetBoite(pDoc, e, t, ADVERSAIRE1(b), &boite1)
                //                                    && glpfn.GetBoite(pDoc, e, t, ADVERSAIRE2(b), &boite2)) {
                //                                    if (boite1.QualifieEntrant
                //                                        && boite2.QualifieEntrant) {
                //                                        LOADSTRING(IDS_ERR_ENTRANT_MATCH, gszBuf, sizeof(gszBuf));
                //                                        sel.iBoite = ADVERSAIRE1(b);
                //                                        glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                        sel.iBoite = -1;
                //                                        bRes = -1;
                //                                    }
                //                                }
                //                                if (boite.idJoueur != -1) {	//un joueur
                //                                    if (!glpfn.GetJoueur(pDoc, boite.idJoueur, &joueur))
                //                                        break;
                //							CClassement clast; clast.Init(joueur.ClastSimpl, joueur.Sexe == 'F');
                //                                    c = iCol(b);
                //                                    if (b == iHautCol(c)) {
                //                                        if (c < colMax) {
                //                                            pClastMaxCol[c] = pClastMaxCol[c + 1];
                //                                            //					pClastMinCol[ c] = pClastMinCol[ c+1];
                //                                        }
                //                                    }
                //                                    //Un joueur nouveau avec un classement
                //                                    if (boite.iOrdre > 0
                //                                        && !clast.isVide()
                //                                    //	 && !joueur.Etranger
                //                                        ) {
                //                                        if (pClastMaxCol[c] < clast)
                //                                            pClastMaxCol[c] = clast;
                //                                        //1================
                //                                        m = clast.GetId();
                //								LPVOID cc;
                //                                        if (!pColClast.Lookup(m, cc))
                //                                            pColClast[m] = c;
                //								else if (abs( ((short)(long) cc) - c) > 1)
                //								{
                //                                            LOADSTRING(IDS_ERR_CLAST_PROGR2, gszBuf, sizeof(gszBuf));
                //                                            sel.iBoite = b;
                //                                            glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                            bRes = -1;
                //                                        }
                //                                    }
                //                                }
                //                            }
                //                            pColClast.RemoveAll();
                //                            delete []pClastMaxCol;
                //                            if (tableau.Type == 1) {	//Tableau Final(bonus)
                //                                //Tableau final
                //                                //5================
                //                                if (nTeteDeSerie == 0) {
                //                                    LOADSTRING(IDS_ERR_TAB_TETESERIE_FINAL_NO, gszBuf, sizeof(gszBuf));
                //                                    sel.iBoite = bMax;
                //                                    glpfn.AddMessage(pDoc, gszBuf, &sel);
                //                                    sel.iBoite = -1;
                //                                    bRes = -1;
                //                                }
                //                            }
                //                        }
                //                        if (iTableau != -1)
                //                            break;
                //                    }
                //                    if (iEpreuve != -1)
                //                        break;
                //                }
                //            }
                return bRes;
            };
            return FFTValidation;
        })();
        service.FFTValidation = FFTValidation;
        function isMatch(box) {
            return 'score' in box;
        }
        function column(pos) {
            //TODO, use a table
            var col = -1;
            for (pos++; pos; pos >>= 1, col++) { }
            return col;
        }
        function columnMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? nCol - 1
                : column(nQ - 2) + nCol;
        }
        function positionTopCol(col) {
            return (1 << (col + 1)) - 2;
        }
        function positionMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? (1 << nCol) - 2 //iHautCol
                : positionTopCol(columnMax(nCol, nQ));
        }
        angular.module('jat.services.validation.fft', ['jat.services.validation'])
            .factory('fftValidation', [
            'validation',
            'drawLib',
            'knockout',
            'find',
            function (validation, drawLib, knockout, find) {
                return new FFTValidation(validation, drawLib, knockout, find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
// Find service
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Find = (function () {
            function Find() {
            }
            Find._reindex = function (array, member) {
                var idx = {
                    _length: array.length
                };
                for (var i = 0; i < array.length; i++) {
                    var a = array[i], j = a[member];
                    if (j !== undefined) {
                        idx[j] = i;
                    }
                }
                array["_FindBy" + member] = idx;
            };
            /**
              * Returns the index of an object in the array. Or -1 if not found.
              */
            Find.prototype.indexOf = function (array, member, value, error) {
                var i, a;
                if (null == value) {
                    return null;
                }
                var idxName = "_FindBy" + member;
                if (!(idxName in array)) {
                    Find._reindex(array, member);
                }
                var idx = array[idxName];
                if (!(value in idx) || idx._length !== array.length) {
                    Find._reindex(array, member);
                    a = array[idxName];
                    i = a[value];
                }
                else {
                    i = idx[value];
                    a = array[i];
                    if (a[member] !== value) {
                        Find._reindex(array, member);
                        a = array[idxName];
                        i = a[value];
                    }
                }
                if (error && i === undefined) {
                    throw error;
                }
                return i !== undefined ? i : -1;
            };
            /**
              * Returns an object in the array by member. Or undefined if not found.
              */
            Find.prototype.by = function (array, member, value, error) {
                var i = this.indexOf(array, member, value, error);
                return array[i];
            };
            Find.prototype.byId = function (array, value, error) {
                var i = this.indexOf(array, "id", value, error);
                return array[i];
            };
            return Find;
        })();
        service.Find = Find;
        angular.module('jat.services.find', [])
            .service('find', Find);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Guid = (function () {
            function Guid() {
            }
            /** Create an unique identifier */
            Guid.prototype.create = function (prefix) {
                return (prefix || '') + Math.round(Math.random() * 999);
            };
            return Guid;
        })();
        service.Guid = Guid;
        angular.module('jat.services.guid', [])
            .service('guid', Guid);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
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
            function Knockout(drawLib, tournamentLib, rank, find) {
                this.drawLib = drawLib;
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
            Knockout.prototype.generateDraw = function (draw, generate, afterIndex) {
                if (generate === models.GenerateType.Create) {
                    var m_nMatchCol = tool.filledArray(MAX_COL, 0);
                    var players = this.tournamentLib.GetJoueursInscrit(draw);
                    //Récupère les qualifiés sortants du tableau précédent
                    var prev = afterIndex >= 0 ? draw._event.draws[afterIndex] : draw._previous; // = this.drawLib.previousGroup(draw);
                    if (prev) {
                        players = players.concat(this.drawLib.FindAllQualifieSortant(prev, true));
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
                //Contrôle si il n'y a pas d'autres joueurs plus à gauche
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
                    }
                    else if (this.isJoueurNouveau(boxIn)) {
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
                        }
                        else {
                            pOrdreInv[iOrdreQ(i, draw.nbOut)] = i;
                        }
                    }
                }
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
                    if (!pbMatch[b] && pbMatch[positionMatch(b)]) {
                        //Qualifiés entrants se rencontrent
                        var qualif = 'number' === typeof players[iJoueur] ? players[iJoueur] : 0;
                        if (qualif) {
                            var boxIn2 = this.findBox(draw, positionOpponent(b));
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
                                this.drawLib.SetQualifieEntrant(boxIn, qualif);
                            }
                            else {
                                this.drawLib.MetJoueur(boxIn, players[iJoueur]);
                                if ((!draw.minRank || !this.rank.isNC(draw.minRank))
                                    || (!draw.maxRank || !this.rank.isNC(draw.maxRank))) {
                                    //Mets les têtes de série (sauf tableau NC)
                                    if (WITH_TDS_HAUTBAS) {
                                        t = iTeteSerieQhb(b, draw.nbOut);
                                    }
                                    else {
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
                    var group = this.drawLib.group(draw);
                    if (group) {
                        for (i = 1; i <= MAX_QUALIF; i++) {
                            if (!this.drawLib.FindQualifieSortant(group, i)) {
                                break;
                            }
                        }
                    }
                    else {
                        i = 1;
                    }
                    bottom = positionBottomCol(colMin);
                    top = positionTopCol(colMin);
                    for (var b = top; b >= bottom && i <= MAX_QUALIF; b--, i++) {
                        var boxOut = this.findBox(draw, b);
                        if (boxOut) {
                            this.drawLib.SetQualifieSortant(boxOut, i);
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
            Knockout.prototype.getSize = function (draw) {
                if (!draw || !draw.nbColumn || !draw.nbOut) {
                    return { width: 1, height: 1 }; //{ width: dimensions.boxWidth, height: dimensions.boxHeight };
                }
                return {
                    width: draw.nbColumn,
                    height: countInCol(columnMax(draw.nbColumn, draw.nbOut), draw.nbOut)
                };
            };
            Knockout.prototype.computePositions = function (draw) {
                if (!draw || !draw.nbColumn || !draw.nbOut || !draw.boxes || !draw.boxes.length) {
                    return;
                }
                var positions = [];
                //var heights = <number[]> [];  //TODO variable height
                var minPos = positionMin(draw.nbOut), maxPos = positionMax(draw.nbColumn, draw.nbOut), c0 = draw.nbColumn - 1 + columnMin(draw.nbOut);
                for (var pos = maxPos; pos >= minPos; pos--) {
                    var col = column(pos), topPos = positionTopCol(col), c = c0 - col, g = positionTopCol(c - 1) + 2;
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
            Knockout.prototype.CalculeScore = function (draw) {
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
            Knockout.prototype.SetQualifieEntrant = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                var draw = box._draw;
                //ASSERT(SetQualifieEntrantOk(iBoite, inNumber, iJoueur));
                if (inNumber) {
                    var prev = this.drawLib.previousGroup(draw);
                    if (!player && prev && prev.length && inNumber !== QEMPTY) {
                        //Va chercher le joueur dans le tableau précédent
                        var boxOut = this.drawLib.FindQualifieSortant(prev, inNumber);
                        if (angular.isObject(boxOut)) {
                            player = boxOut._player;
                        }
                    }
                    if (box.qualifIn) {
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
                    if (inNumber === QEMPTY ||
                        !this.drawLib.FindQualifieEntrant(draw, inNumber)) {
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
            Knockout.prototype.SetQualifieSortant = function (box, outNumber) {
                // outNumber=0 => enlève qualifié
                var next = this.drawLib.nextGroup(box._draw);
                //ASSERT(SetQualifieSortantOk(iBoite, outNumber));
                if (outNumber) {
                    //Met à jour le tableau suivant
                    if (next && box.playerId && box.qualifOut) {
                        var boxIn = this.drawLib.FindQualifieEntrant(next, outNumber);
                        if (boxIn) {
                            ASSERT(boxIn.playerId === box.playerId);
                            if (!this.drawLib.EnleveJoueur(boxIn)) {
                                throw "Can not remove player";
                            }
                        }
                    }
                    //Enlève le précédent n° de qualifié sortant
                    if (box.qualifOut) {
                        if (!this.SetQualifieSortant(box)) {
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
                        var boxIn = this.drawLib.FindQualifieEntrant(next, box.qualifOut);
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
            Knockout.prototype.FindQualifieEntrant = function (draw, iQualifie) {
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
            Knockout.prototype.FindQualifieSortant = function (draw, iQualifie) {
                ASSERT(0 < iQualifie);
                if (iQualifie === QEMPTY || !draw.boxes) {
                    return;
                }
                return this.find.by(draw.boxes, "qualifOut", iQualifie);
            };
            //private box1(match: models.Match): models.Box {
            //    var pos = positionOpponent1(match.position);
            //    return <models.Box> this.find.by(match._draw.boxes, 'position', pos);
            //}
            //private box2(match: models.Match): models.Box {
            //    var pos = positionOpponent2(match.position);
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
            return Knockout;
        })();
        service.Knockout = Knockout;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
        function column(pos) {
            //TODO, use a table
            var col = -1;
            for (pos++; pos; pos >>= 1, col++) { }
            return col;
        }
        function columnMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? nCol - 1
                : column(nQ - 2) + nCol;
        }
        function columnMin(nQ) {
            return !nQ || nQ === 1
                ? 0
                : column(nQ - 2) + 1;
        }
        function positionTopCol(col) {
            return (1 << (col + 1)) - 2;
        }
        function positionBottomCol(col, nQ) {
            return !nQ || nQ === 1
                ? (1 << col) - 1 //iBasCol
                : (positionTopCol(col) - countInCol(col, nQ) + 1);
        }
        function countInCol(col, nQ) {
            return !nQ || nQ === 1
                ? (1 << col) //countInCol
                : nQ * countInCol(col - columnMin(nQ), 1);
        }
        function positionMin(nQ) {
            return !nQ || nQ === 1
                ? 0
                : positionBottomCol(columnMin(nQ), nQ);
        }
        function positionMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? (1 << nCol) - 2 //iHautCol
                : positionTopCol(columnMax(nCol, nQ));
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
                    return i === 0 ? 1 : iTeteSerieQ(i, 1); // TODO à corriger
                }
                else {
                    return 1 + iPartieQ(i, nQualifie);
                }
            }
            else {
                //Tête de série précédente (de droite)
                var t = iTeteSerieQ(positionMatch(i), nQualifie), v, d, c;
                if (nQualifie == 1 << column(nQualifie - 1)) {
                    d = i;
                }
                else {
                    d = iDecaleGaucheQ(i, nQualifie);
                }
                v = !!(d & 1); //Ok pour demi-partie basse
                if ((c = column(d)) > 1
                    && d > positionTopCol(c) - (countInCol(c, nQualifie) >> 1)) {
                    v = !v; //Inverse pour le demi-partie haute
                }
                return v ?
                    t :
                    1 + countInCol(column(i), nQualifie) - t; //Nouvelle tête de série complémentaire
            }
        }
        //Ordre de remplissage des boites en partant de la droite
        //et en suivant les têtes de série
        function iOrdreQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            return iTeteSerieQ(i, nQualifie) - 1
                + countInCol(column(i), nQualifie)
                - nQualifie;
        }
        //Partie du tableau de i par rapport au qualifié sortant
        //retour: 0 à nQualifie-1, en partant du bas
        function iPartieQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return Math.floor((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
            // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
            //TODOjs? pb division entière
        }
        service.iPartieQ = iPartieQ;
        //Numére de boite de la partie de tableau, ramenée à un seul qualifié
        function iDecaleGaucheQ(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return i
                - iPartieQ(i, nQualifie) * countInCol(c - columnMin(nQualifie))
                - positionBottomCol(c, nQualifie)
                + positionBottomCol(c - columnMin(nQualifie));
        }
        //Têtes de série de haut en bas (non FFT)
        //Numéro du tête de série d'une boite (identique dans plusieurs boites)
        function iTeteSerieQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            if (column(i) === columnMin(nQualifie)) {
                //Colonne de droite, numéroter 1 à n en partant du bas (OK!)
                if (nQualifie === 1 << column(nQualifie - 1))
                    return i == 0 ? 1 : iTeteSerieQhb(i, 1); // TODO à corriger
                else
                    return 1 + iPartieQhb(i, nQualifie);
            }
            else {
                //Tête de série précédente (de droite)
                var t = iTeteSerieQhb(positionMatch(i), nQualifie), v, d, c;
                if (nQualifie === 1 << column(nQualifie - 1)) {
                    d = i;
                }
                else {
                    d = iDecaleGaucheQhb(i, nQualifie);
                }
                v = !!(d & 1); //Ok pour demi-partie basse
                if ((c = column(d)) > 1
                    && d <= positionTopCol(c) - (countInCol(c) >> 1)) {
                    v = !v; //Inverse pour le demi-partie basse		//v1.11.0.1 (décommenté)
                }
                return !v ?
                    t :
                    1 + countInCol(column(i), nQualifie) - t; //Nouvelle tête de série complémentaire
            }
        }
        //Ordre de remplissage des boites en partant de la droite
        //et en suivant les têtes de série
        function iOrdreQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            return iTeteSerieQhb(i, nQualifie) - 1
                + countInCol(column(i), nQualifie)
                - nQualifie;
        }
        //Partie du tableau de i par rapport au qualifié sortant
        //retour: 0 à nQualifie-1, en partant du bas
        function iPartieQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            //	return (i - positionBottomCol(c, nQualifie) ) / countInCol(c - columnMin( nQualifie) );  
            return (nQualifie - 1) - Math.floor((i - positionBottomCol(c, nQualifie)) / countInCol(c - columnMin(nQualifie)));
            // 	return MulDiv( i - positionBottomCol(c, nQualifie), 1, countInCol(c - columnMin( nQualifie)) );
            //TODOjs? pb division entière
        }
        function iDecaleGaucheQhb(i, nQualifie) {
            //ASSERT(0 <= i && i < MAX_BOITE);
            ASSERT(1 <= nQualifie && nQualifie <= countInCol(column(i)));
            var c = column(i);
            return i
                - (nQualifie - 1 - iPartieQhb(i, nQualifie)) * countInCol(c - columnMin(nQualifie))
                - positionBottomCol(c, nQualifie)
                + positionBottomCol(c - columnMin(nQualifie));
        }
        angular.module('jat.services.knockout', ['jat.services.drawLib', 'jat.services.tournamentLib', 'jat.services.type', 'jat.services.find'])
            .factory('knockout', [
            'drawLib', 'tournamentLib', 'rank', 'find',
            function (drawLib, tournamentLib, rank, find) {
                return new Knockout(drawLib, tournamentLib, rank, find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MAX_TETESERIE = 32, MAX_QUALIF = 32, QEMPTY = -1, MAX_MATCHJOUR = 16;
        var KnockoutValidation = (function () {
            function KnockoutValidation(validation, knockout, drawLib, tournamentLib, rank, category, score, find) {
                this.validation = validation;
                this.knockout = knockout;
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.rank = rank;
                this.category = category;
                this.score = score;
                this.find = find;
                validation.addValidator(this);
            }
            KnockoutValidation.prototype.validatePlayer = function (player) {
                return true;
            };
            KnockoutValidation.prototype.validateGroup = function (draw) {
                var bRes = true;
                if (draw.suite) {
                    var iTableau = this.find.indexOf(draw._event.draws, 'id', draw.id);
                    if (iTableau === 0 || !draw._previous) {
                        this.validation.errorDraw('IDS_ERR_TAB_SUITE_PREMIER', draw);
                        bRes = false;
                    }
                    var group = this.drawLib.group(draw);
                    if (group) {
                        if (draw.type !== group[0].type) {
                            this.validation.errorDraw('IDS_ERR_TAB_SUITE_TYPE', draw);
                            bRes = false;
                        }
                        if (draw.minRank != group[0].minRank) {
                            this.validation.errorDraw('IDS_ERR_TAB_SUITE_MIN', draw);
                            bRes = false;
                        }
                        if (draw.maxRank != group[0].maxRank) {
                            this.validation.errorDraw('IDS_ERR_TAB_SUITE_MAX', draw);
                            bRes = false;
                        }
                    }
                }
                var prevGroup = this.drawLib.previousGroup(draw);
                if (prevGroup) {
                    if (prevGroup[0].type !== models.DrawType.Final && draw.minRank && prevGroup[0].maxRank) {
                        if (this.rank.compare(draw.minRank, prevGroup[0].maxRank) < 0) {
                            this.validation.errorDraw('IDS_ERR_TAB_CLASSMAX_OVR', draw);
                            bRes = false;
                        }
                    }
                }
                var nextGroup = this.drawLib.nextGroup(draw);
                if (nextGroup) {
                    if (draw.type !== models.DrawType.Final && draw.maxRank && nextGroup[0].minRank) {
                        if (this.rank.compare(nextGroup[0].minRank, draw.maxRank) < 0) {
                            this.validation.errorDraw('IDS_ERR_TAB_CLASSMAX_NEXT_OVR', draw);
                            bRes = false;
                        }
                    }
                }
                var e = MAX_QUALIF;
                if (!draw.suite) {
                    //Trouve le plus grand Qsortant
                    for (e = MAX_QUALIF; e >= 1; e--) {
                        if (this.drawLib.FindQualifieSortant(group, e)) {
                            break;
                        }
                    }
                    for (var e2 = 1; e2 <= e; e2++) {
                        if (!this.drawLib.FindQualifieSortant(group, e2)) {
                            this.validation.errorDraw('IDS_ERR_TAB_SORTANT_NO', draw, undefined, 'Q' + e2);
                            bRes = false;
                        }
                    }
                }
                return bRes;
            };
            KnockoutValidation.prototype.validateMatches = function (draw) {
                var bRes = true;
                return bRes;
            };
            KnockoutValidation.prototype.validateDraw = function (draw) {
                var bRes = true;
                var nqe = 0;
                var nqs = 0;
                var tournament = draw._event._tournament;
                var isTypePoule = draw.type >= 2;
                //Interdits:
                // - De faire rencontrer 2 Qualifiés entre eux
                // - D'avoir plus de Qualifiés que de joueurs admis directement
                // - De prévoir plus d'un tour d'écart entre deux joueurs de même classement
                // - De faire entrer un joueur plus loin qu'un joueur de classement supérieur au sien
                //Buts à atteindre:
                // Faire jouer chaque joueur
                // - Une première fois à classement inférieur
                // - Eventuellement à égalité de classement
                // - Ensuite à un classement supérieur au sien
                // - Ecart maximal souhaité DEUX échelons
                if (draw.minRank && draw.maxRank && this.rank.compare(draw.maxRank, draw.minRank) < 0) {
                    this.validation.errorDraw('IDS_ERR_TAB_CLAST_INV', draw);
                    bRes = false;
                }
                //DONE 00/05/10: CTableau contrôle progression des classements
                if (draw._event.maxRank && this.rank.compare(draw._event.maxRank, draw.maxRank) < 0) {
                    this.validation.errorDraw('IDS_ERR_TAB_CLASSLIM_OVR', draw);
                    bRes = false;
                }
                bRes = bRes && this.validateGroup(draw);
                bRes = bRes && this.validateMatches(draw);
                var colMax = columnMax(draw.nbColumn, draw.nbOut);
                var pClastMaxCol = new Array(colMax + 1);
                pClastMaxCol[colMax] = 'NC'; //pClastMaxCol[colMax].Start(); pClastMaxCol[colMax].Next();
                //Match avec deux joueurs gagné par un des deux joueurs
                for (var i = 0; i < draw.boxes.length; i++) {
                    var box = draw.boxes[i];
                    var boxIn = !isMatch(box) ? box : undefined;
                    var match = isMatch(box) ? box : undefined;
                    var b = box.position;
                    //ASSERT(-1 <= box.playerId && box.playerId < tournament.players.length);
                    //Joueur inscrit au tableau ?
                    var c = column(b);
                    if (b === positionTopCol(c)) {
                        if (c < colMax) {
                            pClastMaxCol[c] = pClastMaxCol[c + 1];
                        }
                    }
                    if (boxIn
                        && boxIn.order < 0
                        && !boxIn.qualifIn
                        && !box.hidden) {
                        this.validation.errorDraw('IDS_ERR_TAB_DUPLI', draw, boxIn);
                        bRes = false;
                    }
                    var player = box._player;
                    //if( boxes[ i].order >= 0 && player) 
                    if (player && boxIn && this.knockout.isJoueurNouveau(boxIn) && !boxIn.qualifIn) {
                        //DONE 00/03/07: Tableau, joueur sans classement
                        //DONE 00/03/04: Tableau, Classement des joueurs correspond au limites du tableau
                        if (!player.rank) {
                            this.validation.errorDraw('IDS_ERR_CLAST_NO', draw, boxIn);
                            bRes = false;
                        }
                        else {
                            //Players rank within draw min and max ranks
                            if (!this.rank.within(player.rank, draw.minRank, draw.maxRank)) {
                                this.validation.errorDraw('IDS_ERR_CLAST_MIS', draw, boxIn, player.rank);
                                bRes = false;
                            }
                            //DONE: 01/07/15 (00/05/11): CTableau, isValide revoir tests progression des classements
                            //if (!isTypePoule) {
                            if (pClastMaxCol[c] < player.rank) {
                                pClastMaxCol[c] = player.rank;
                            }
                            //if( player.rank < pClastMinCol[ c])
                            //	pClastMinCol[ c] = player.rank;
                            if (c < colMax
                                && pClastMaxCol[c + 1]
                                && this.rank.compare(player.rank, pClastMaxCol[c + 1]) < 0) {
                                this.validation.errorDraw('IDS_ERR_CLAST_PROGR', draw, boxIn, player.rank);
                                bRes = false;
                            }
                        }
                        //Check inscriptions
                        if (!this.tournamentLib.isSexeCompatible(draw._event, player.sexe)) {
                            this.validation.errorDraw('IDS_ERR_EPR_SEXE', draw, boxIn);
                        }
                        else if (!this.tournamentLib.isRegistred(draw._event, player)) {
                            this.validation.errorDraw('IDS_ERR_INSCR_NO', draw, boxIn);
                        }
                        //DONE 00/05/11: CTableau, check categorie
                        //Check Categorie
                        if (!this.category.isCompatible(draw._event.category, player.category)) {
                            this.validation.errorDraw('IDS_ERR_CATEG_MIS', draw, boxIn);
                        }
                    }
                    //if (!isMatch(box) && match.score) {
                    //    //DONE 01/07/13: CTableau, isValid score sans match
                    //    this.validation.errorDraw('IDS_ERR_SCORE_MATCH_NO', draw, box);
                    //    bRes = false;
                    //}
                    if (match) {
                        //DONE 00/01/10: 2 joueurs du même club
                        //DONE 00/03/03: Test de club identique même si le club est vide
                        //TODO 00/07/27: Test de club identique avec des matches joués
                        ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));
                        //TODO this.drawLib.boxesOpponents(match)
                        var opponent = this.knockout.boxesOpponents(match);
                        ASSERT(!!opponent.box1 && !!opponent.box2);
                        if (!match.score) {
                            if (match.playerId) {
                                this.validation.errorDraw('IDS_ERR_VAINQ_SCORE_NO', draw, match, match._player.name);
                                bRes = false;
                            }
                        }
                        else {
                            ASSERT(b < positionBottomCol(draw.nbColumn, draw.nbOut)); //Pas de match colonne de gauche
                            if (!match.playerId) {
                                this.validation.errorDraw('IDS_ERR_SCORE_VAINQ_NO', draw, match);
                                bRes = false;
                            }
                            if (!this.score.isValid(match.score)) {
                                this.validation.errorDraw('IDS_ERR_SCORE_BAD', draw, match, match.score);
                                bRes = false;
                            }
                            //ASSERT( boxes[ i].playerId==-1 || player.isInscrit( tournament.FindEpreuve( this)) );
                            ASSERT(column(b) < colMax);
                            if (!opponent.box1.playerId || !opponent.box2.playerId) {
                                this.validation.errorDraw('IDS_ERR_MATCH_JOUEUR_NO', draw, match);
                                bRes = false;
                            }
                            else if (opponent.box1.playerId != match.playerId
                                && opponent.box2.playerId != match.playerId) {
                                this.validation.errorDraw('IDS_ERR_VAINQUEUR_MIS', draw, match);
                                bRes = false;
                            }
                        }
                        if (!this.isMatchJoue(match)) {
                            //match before opponent 2
                            var opponent1 = this.drawLib.boxesOpponents(opponent.box1);
                            var opponent2 = this.drawLib.boxesOpponents(opponent.box2);
                            if (opponent.box1.playerId) {
                                if (opponent.box2.playerId) {
                                    if (!CompString(opponent.box1._player.club, opponent.box2._player.club)) {
                                        this.validation.errorDraw('IDS_ERR_MEME_CLUB1', draw, match, opponent.box1._player.club);
                                        bRes = false;
                                    }
                                }
                                else if (this.isMatchJouable(opponent.box2)) {
                                    if (!CompString(opponent.box1._player.club, opponent2.box1._player.club)) {
                                        this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box1._player.club);
                                        bRes = false;
                                    }
                                    else if (!CompString(opponent.box1._player.club, opponent2.box2._player.club)) {
                                        this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box1._player.club);
                                        bRes = false;
                                    }
                                }
                            }
                            else if (isTypePoule) {
                            }
                            else if (opponent.box2.playerId) {
                                if (this.isMatchJouable(opponent.box1)) {
                                    if (!CompString(opponent.box2._player.club, opponent1.box1._player.club)) {
                                        this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box2._player.club);
                                        bRes = false;
                                    }
                                    else if (!CompString(opponent.box2._player.club, opponent1.box2._player.club)) {
                                        this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent.box2._player.club);
                                        bRes = false;
                                    }
                                }
                            }
                            else if (this.isMatchJouable(opponent.box1) && this.isMatchJouable(opponent.box2)) {
                                if (!CompString(opponent1.box1._player.club, opponent2.box1._player.club)
                                    || !CompString(opponent1.box1._player.club, opponent2.box2._player.club)) {
                                    this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent1.box1._player.club);
                                    bRes = false;
                                }
                                if (!CompString(opponent1.box2._player.club, opponent2.box1._player.club)
                                    || !CompString(opponent1.box2._player.club, opponent2.box2._player.club)) {
                                    this.validation.errorDraw('IDS_ERR_MEME_CLUB2', draw, match, opponent1.box2._player.club);
                                    bRes = false;
                                }
                            }
                        }
                        //DONE 01/08/01 (00/07/27): Date d'un match entre dates de l'épreuve
                        if (match.date) {
                            if (draw._event.start
                                && match.date < draw._event.start) {
                                this.validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, match.date.toDateString());
                                bRes = false;
                            }
                            if (draw._event.end
                                && draw._event.end < match.date) {
                                this.validation.errorDraw('IDS_ERR_DATE_MATCH_EPREUVE', draw, match, match.date.toDateString());
                                bRes = false;
                            }
                            tournament._dayCount = dateDiff(tournament.info.start, tournament.info.end, UnitDate.Day) + 1;
                            if (tournament._dayCount) {
                                var iDay = dateDiff(match.date, tournament.info.start, UnitDate.Day);
                                if (0 <= iDay && iDay < tournament._dayCount) {
                                    var dayMatches = tournament._day[iDay];
                                    ASSERT(dayMatches.length <= MAX_MATCHJOUR);
                                    for (var m = dayMatches.length - 1; m >= 0; m--) {
                                        var match2 = dayMatches[m];
                                        if (match2.position != match.position
                                            && match2.place == match.place
                                            && Math.abs(match.date.getTime() - match2.date.getTime()) < tournament.info.slotLength) {
                                            this.validation.errorDraw('IDS_ERR_PLN_OVERLAP', draw, match, match.date.toDateString());
                                            bRes = false;
                                        }
                                    }
                                }
                                else {
                                    //Match en dehors du planning
                                    this.validation.errorDraw('IDS_ERR_DATE_MATCH_TOURNOI', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                            }
                            //TODO 00/07/27: Date d'un match après les matches précédents (au moins 3 heures) ça test pas bien à tous les coups
                            //TODO 00/12/20: Dans tous les tableaux où le joueur est inscrit, date des matches différentes pour un même joueur
                            ASSERT(positionOpponent1(b) <= positionMax(draw.nbColumn, draw.nbOut));
                            //DONE 01/08/19 (00/12/20): Dans Poule, date des matches différentes pour un même joueur
                            //if (!isTypePoule) {
                            var match1 = opponent.box1;
                            var match2 = opponent.box2;
                            if (isMatch(opponent.box1)
                                && match1.date) {
                                if (match.date < match1.date) {
                                    this.validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                                else if (match.date.getTime() < (match1.date.getTime() + (tournament.info.slotLength << 1))) {
                                    this.validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                            }
                            if (isMatch(opponent.box2) && match2.date) {
                                if (match.date < match2.date) {
                                    this.validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                                else if (match.date.getTime() < (match2.date.getTime() + (tournament.info.slotLength << 1))) {
                                    this.validation.errorDraw('IDS_ERR_DATE_MATCHS', draw, match, match.date.toDateString());
                                    bRes = false;
                                }
                            }
                            //}
                            if (match.date) {
                                if (!match.playerId && !match.place && tournament.places.length && tournament._dayCount) {
                                    this.validation.errorDraw('IDS_ERR_PLN_COURT_NO', draw, match);
                                    bRes = false;
                                }
                            }
                        }
                    }
                    if (boxIn) {
                        var e = boxIn.qualifIn;
                        if (e && e != QEMPTY) {
                            nqe++;
                            ASSERT(!isTypePoule || (b >= positionBottomCol(draw.nbColumn, draw.nbOut))); //Qe que dans colonne de gauche
                            var iTableau = this.find.indexOf(draw._event.draws, 'id', draw.id);
                            if (iTableau == 0) {
                                this.validation.errorDraw('IDS_ERR_TAB_ENTRANT_TAB1', draw, boxIn);
                                bRes = false;
                            }
                            //ASSERT( iTableau != 0);
                            //DONE 00/03/07: CTableau, qualifié entrant en double
                            var j;
                            if (!draw.suite && (j = this.drawLib.FindQualifieEntrant(draw, e)) && (j.position != b || j._draw.id != draw.id)) {
                                this.validation.errorDraw('IDS_ERR_TAB_ENTRANT_DUP', draw, boxIn);
                                bRes = false;
                            }
                            var group = this.drawLib.previousGroup(draw);
                            if (group) {
                                //DONE 00/03/07: CTableau, les joueurs qualifiés entrant et sortant correspondent
                                j = this.drawLib.FindQualifieSortant(group, e);
                                if (!j) {
                                    this.validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_NO', draw, boxIn);
                                    bRes = false;
                                }
                                else if (j.playerId != boxIn.playerId) {
                                    this.validation.errorDraw('IDS_ERR_TAB_ENTRANT_PREC_MIS', draw, boxIn);
                                    bRes = false;
                                }
                            }
                        }
                    }
                    if (match) {
                        var e = match.qualifOut;
                        if (e) {
                            nqs++;
                            //ASSERT(!isTypePoule || (b == iDiagonale(b)));	//Qs que dans diagonale des poules
                            //DONE 00/03/07: CTableau, qualifié sortant en double
                            j = this.drawLib.FindQualifieSortant(draw, e);
                            if (j && (j.position != b || j._draw.id != draw.id)) {
                                this.validation.errorDraw('IDS_ERR_TAB_SORTANT_DUP', draw, match);
                                bRes = false;
                            }
                            if (draw.type === models.DrawType.Final) {
                                this.validation.errorDraw('IDS_ERR_TAB_SORTANT_FINAL', draw, box);
                                bRes = false;
                            }
                        }
                    }
                }
                //Check Têtes de série
                //	if( !isTypePoule)
                if (!draw.suite) {
                    for (var e2 = 0, e = 1; e <= MAX_TETESERIE; e++) {
                        boxIn = this.drawLib.FindTeteSerie(draw, e);
                        if (boxIn) {
                            if (e > e2 + 1) {
                                this.validation.errorDraw('IDS_ERR_TAB_TETESERIE_NO', boxIn._draw, boxIn, 'Seeded ' + e);
                                bRes = false;
                            }
                            if (isMatch(boxIn)) {
                                this.validation.errorDraw('IDS_ERR_TAB_TETESERIE_ENTRANT', boxIn._draw, boxIn, 'Seeded ' + e);
                                bRes = false;
                            }
                            for (var i = 0; i < draw.boxes.length; i++) {
                                var boxIn2 = draw.boxes[i];
                                if (boxIn2.seeded == e && boxIn2.position !== boxIn.position) {
                                    this.validation.errorDraw('IDS_ERR_TAB_TETESERIE_DUP', boxIn._draw, boxIn, 'Seeded ' + e);
                                    bRes = false;
                                }
                            }
                            e2 = e;
                        }
                    }
                }
                //Tous les qualifiés sortants du tableau précédent sont utilisés
                if (!draw.suite) {
                    var pT = this.drawLib.previousGroup(draw);
                    if (pT && pT.length) {
                        for (var e = 1; e <= MAX_QUALIF; e++) {
                            var boxOut = this.drawLib.FindQualifieSortant(pT, e);
                            boxIn = this.drawLib.FindQualifieEntrant(draw, e);
                            if (boxOut && !boxIn) {
                                this.validation.errorDraw('IDS_ERR_TAB_SORTANT_PREC_NO', draw, undefined, 'Q' + boxOut.qualifOut);
                                bRes = false;
                            }
                        }
                    }
                }
                if (isTypePoule && nqs < draw.nbOut) {
                    this.validation.errorDraw('IDS_ERR_POULE_SORTANT_NO', draw);
                    bRes = false;
                }
                if (draw.type === models.DrawType.Final) {
                    if (draw.suite || group[group.length - 1].id !== draw.id) {
                        this.validation.errorDraw('IDS_ERR_TAB_SUITE_FINAL', draw);
                        bRes = false;
                    }
                    if (draw.nbOut != 1) {
                        this.validation.errorDraw('IDS_ERR_TAB_FINAL_NQUAL', draw);
                        bRes = false;
                    }
                }
                return bRes;
            };
            //private boxOpponent1(match: models.Match): models.Box {
            //    return this.find.by(match._draw.boxes, 'position', positionOpponent1(match.position));
            //}
            //private boxOpponent2(match: models.Match): models.Box {
            //    return this.find.by(match._draw.boxes, 'position', positionOpponent2(match.position));
            //}
            KnockoutValidation.prototype.isMatchJoue = function (match) {
                var opponent = this.drawLib.boxesOpponents(match);
                return !!match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
            };
            KnockoutValidation.prototype.isMatchJouable = function (match) {
                if (!isMatch(match)) {
                    return false;
                }
                var opponent = this.drawLib.boxesOpponents(match);
                return !match.playerId && !!opponent.box1.playerId && !!opponent.box2.playerId;
            };
            return KnockoutValidation;
        })();
        service.KnockoutValidation = KnockoutValidation;
        function ASSERT(b, message) {
            if (!b) {
                debugger;
                throw message || 'Assertion is false';
            }
        }
        function isMatch(box) {
            return 'score' in box;
        }
        function column(pos) {
            //TODO, use a table
            var col = -1;
            for (pos++; pos; pos >>= 1, col++) { }
            return col;
        }
        function columnMin(nQ) {
            return !nQ || nQ === 1
                ? 0
                : column(nQ - 2) + 1;
        }
        function columnMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? nCol - 1
                : column(nQ - 2) + nCol;
        }
        function positionTopCol(col) {
            return (1 << (col + 1)) - 2;
        }
        function positionBottomCol(col, nQ) {
            return !nQ || nQ === 1
                ? (1 << col) - 1 //iBasCol
                : (positionTopCol(col) - countInCol(col, nQ) + 1);
        }
        function countInCol(col, nQ) {
            return !nQ || nQ === 1
                ? (1 << col) //countInCol
                : nQ * countInCol(col - columnMin(nQ), 1);
        }
        function positionMax(nCol, nQ) {
            return !nQ || nQ === 1
                ? (1 << nCol) - 2 //iHautCol
                : positionTopCol(columnMax(nCol, nQ));
        }
        function positionOpponent1(pos) {
            return (pos << 1) + 2;
        }
        function positionOpponent2(pos) {
            return (pos << 1) + 1;
        }
        function CompString(a, b) {
            var u = (a || '').toUpperCase(), v = (b || '').toUpperCase();
            return u === v ? 0 : u < v ? -1 : 1;
        }
        var UnitDate;
        (function (UnitDate) {
            UnitDate[UnitDate["Day"] = 86400000] = "Day";
            UnitDate[UnitDate["Hour"] = 3600000] = "Hour";
        })(UnitDate || (UnitDate = {}));
        function dateDiff(first, second, unit) {
            // Copy date parts of the timestamps, discarding the time parts.
            var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
            var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());
            return Math.floor((two.getTime() - one.getTime()) / unit);
        }
        angular.module('jat.services.validation.knockout', ['jat.services.validation', 'jat.services.type'])
            .factory('knockoutValidation', [
            'validation',
            'knockout',
            'drawLib',
            'tournamentLib',
            'rank',
            'category',
            'score',
            'find',
            function (validation, knockout, drawLib, tournamentLib, rank, category, score, find) {
                return new KnockoutValidation(validation, knockout, drawLib, tournamentLib, rank, category, score, find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MainLib = (function () {
            function MainLib($log, $http, $q, $window, selection, tournamentLib, drawLib, validation, 
                //private rank: ServiceRank,
                undo, find, guid) {
                this.$log = $log;
                this.$http = $http;
                this.$q = $q;
                this.$window = $window;
                this.selection = selection;
                this.tournamentLib = tournamentLib;
                this.drawLib = drawLib;
                this.validation = validation;
                this.undo = undo;
                this.find = find;
                this.guid = guid;
            }
            MainLib.prototype.newTournament = function () {
                var tournament = {
                    id: this.guid.create('T'),
                    info: {
                        name: ''
                    },
                    players: [],
                    events: []
                };
                this.selection.select(tournament, models.ModelType.Tournament);
                return tournament;
            };
            MainLib.prototype.loadTournament = function (file_url) {
                var _this = this;
                var deferred = this.$q.defer();
                if (!file_url) {
                    var data = this.$window.localStorage['tournament'];
                    if (data) {
                        var tournament = angular.fromJson(data);
                        this.tournamentLib.initTournament(tournament);
                        this.selection.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    }
                    else {
                        deferred.reject('nothing in storage');
                    }
                }
                else if ('string' === typeof file_url) {
                    this.$http.get(file_url)
                        .success(function (tournament, status) {
                        tournament._url = file_url;
                        _this.tournamentLib.initTournament(tournament);
                        _this.selection.select(tournament, models.ModelType.Tournament);
                        deferred.resolve(tournament);
                    })
                        .error(function (data, status) {
                        deferred.reject(data);
                    });
                }
                else {
                    var reader = new FileReader();
                    reader.addEventListener('loadend', function () {
                        try {
                            var tournament = angular.fromJson(reader.result);
                            tournament._url = file_url;
                            _this.tournamentLib.initTournament(tournament);
                            _this.selection.select(tournament, models.ModelType.Tournament);
                            deferred.resolve(tournament);
                        }
                        catch (ex) {
                            deferred.reject(ex.message);
                        }
                    });
                    reader.addEventListener('onerror', function () {
                        return deferred.reject(reader.error.name);
                    });
                    reader.addEventListener('onabort', function () {
                        return deferred.reject('aborted');
                    });
                    reader.readAsText(file_url);
                }
                return deferred.promise;
            };
            MainLib.prototype.saveTournament = function (tournament, url) {
                var data = {};
                tool.copy(tournament, data);
                if (!url) {
                    //this.$log.info(angular.toJson(data, true));
                    this.$window.localStorage['tournament'] = angular.toJson(data);
                    return;
                }
                this.$http.post(url || tournament._url, data)
                    .success(function (data, status) {
                    //TODO
                })
                    .error(function (data, status) {
                    //TODO
                });
            };
            //#region player
            MainLib.prototype.addPlayer = function (tournament, newPlayer) {
                var c = tournament.players;
                newPlayer.id = this.guid.create('p');
                this.undo.insert(c, -1, newPlayer, "Add " + newPlayer.name, models.ModelType.Player); //c.push( newPlayer);
                this.selection.select(newPlayer, models.ModelType.Player);
            };
            MainLib.prototype.editPlayer = function (editedPlayer, player) {
                var isSelected = this.selection.player === player;
                var c = editedPlayer._tournament.players;
                var i = this.find.indexOf(c, "id", editedPlayer.id, "Player to update not found");
                this.undo.update(c, i, editedPlayer, "Edit " + editedPlayer.name + " " + i, models.ModelType.Player); //c[i] = editedPlayer;
                if (isSelected) {
                    this.selection.select(editedPlayer, models.ModelType.Player);
                }
            };
            MainLib.prototype.removePlayer = function (player) {
                var c = player._tournament.players;
                var i = this.find.indexOf(c, "id", player.id, "Player to remove not found");
                this.undo.remove(c, i, "Delete " + player.name + " " + i, models.ModelType.Player); //c.splice( i, 1);
                if (this.selection.player === player) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Player); //select next or previous
                }
            };
            //#endregion player
            //#region event
            MainLib.prototype.addEvent = function (tournament, newEvent, afterEvent) {
                var c = tournament.events;
                var index = afterEvent ? this.find.indexOf(c, 'id', afterEvent.id) + 1 : c.length;
                newEvent.id = this.guid.create('e');
                this.undo.insert(c, index, newEvent, "Add " + newEvent.name, models.ModelType.Event); //c.push( newEvent);
                this.selection.select(newEvent, models.ModelType.Event);
            };
            MainLib.prototype.editEvent = function (editedEvent, event) {
                var isSelected = this.selection.event === event;
                var c = editedEvent._tournament.events;
                var i = this.find.indexOf(c, "id", editedEvent.id, "Event to edit not found");
                this.undo.update(c, i, editedEvent, "Edit " + editedEvent.name + " " + i, models.ModelType.Event); //c[i] = editedEvent;
                if (isSelected) {
                    this.selection.select(editedEvent, models.ModelType.Event);
                }
            };
            MainLib.prototype.removeEvent = function (event) {
                var c = event._tournament.events;
                var i = this.find.indexOf(c, "id", event.id, "Event to remove not found");
                this.undo.remove(c, i, "Delete " + c[i].name + " " + i, models.ModelType.Event); //c.splice( i, 1);
                if (this.selection.event === event) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Event);
                }
            };
            //#endregion event
            //#region draw
            MainLib.prototype.addDraw = function (draw, generate, afterDraw) {
                var c = draw._event.draws;
                var afterIndex = afterDraw ? this.find.indexOf(c, 'id', afterDraw.id) : c.length - 1;
                if (generate) {
                    var draws = this.drawLib.generateDraw(draw, generate, afterIndex);
                    if (!draws || !draws.length) {
                        return;
                    }
                    this.undo.splice(c, afterIndex + 1, 0, draws, "Add " + draw.name, models.ModelType.Draw); //c.splice( i, 1, draws);
                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    this.selection.select(draws[0], models.ModelType.Draw);
                }
                else {
                    draw.id = this.guid.create('d');
                    this.undo.insert(c, afterIndex + 1, draw, "Add " + draw.name, models.ModelType.Draw); //c.push( draw);
                    this.selection.select(draw, models.ModelType.Draw);
                }
            };
            MainLib.prototype.updateDraw = function (draw, oldDraw, generate) {
                var isSelected = this.selection.draw === oldDraw;
                var group = this.drawLib.group(oldDraw || draw);
                if (generate) {
                    var draws = this.drawLib.generateDraw(draw, generate, -1);
                    if (!draws || !draws.length) {
                        return;
                    }
                }
                else {
                    this.drawLib.resize(draw, oldDraw);
                }
                var c = draw._event.draws;
                if (generate && draws && group && draws.length) {
                    var i = this.find.indexOf(c, "id", group[0].id, "Draw to edit not found");
                    this.undo.splice(c, i, group.length, draws, "Generate " + models.GenerateType[generate] + ' ' + draw.name, models.ModelType.Draw);
                    for (var i = 0; i < draws.length; i++) {
                        this.drawLib.initDraw(draws[i], draw._event);
                    }
                    draw = draws[0];
                }
                else {
                    var i = this.find.indexOf(c, "id", draw.id, "Draw to edit not found");
                    this.undo.update(c, i, draw, "Edit " + draw.name + " " + i, models.ModelType.Draw); //c[i] = draw;
                }
                if (isSelected || generate) {
                    this.selection.select(draw, models.ModelType.Draw);
                    this.drawLib.refresh(draw); //force angular refresh
                }
            };
            MainLib.prototype.updateQualif = function (draw) {
                var _this = this;
                this.undo.newGroup('Update qualified', function () {
                    _this.drawLib.updateQualif(draw);
                    return true;
                }, draw);
            };
            MainLib.prototype.removeDraw = function (draw) {
                var c = draw._event.draws;
                var i = this.find.indexOf(c, "id", draw.id, "Draw to remove not found");
                this.undo.remove(c, i, "Delete " + draw.name + " " + i, models.ModelType.Draw); //c.splice( i, 1);
                if (this.selection.draw === draw) {
                    this.selection.select(c[i] || c[i - 1], models.ModelType.Draw); //select next or previous
                }
            };
            MainLib.prototype.validateDraw = function (draw) {
                this.validation.resetDraw(draw);
                this.validation.validateDraw(draw);
                if (this.selection.draw === draw) {
                    this.drawLib.refresh(draw); //force angular refresh
                }
            };
            //#endregion draw
            //#region match
            MainLib.prototype.editMatch = function (editedMatch, match) {
                var _this = this;
                this.drawLib.initBox(editedMatch, editedMatch._draw);
                var c = match._draw.boxes;
                var i = this.find.indexOf(c, "position", editedMatch.position, "Match to edit not found");
                this.undo.newGroup("Edit match", function () {
                    _this.undo.update(c, i, editedMatch, "Edit " + editedMatch.position + " " + i, models.ModelType.Match); //c[i] = editedMatch;
                    if (editedMatch.qualifOut) {
                        //report qualified player to next draw
                        var nextGroup = _this.drawLib.nextGroup(editedMatch._draw);
                        if (nextGroup) {
                            var boxIn = _this.drawLib.FindQualifieEntrant(nextGroup, editedMatch.qualifOut);
                            if (boxIn) {
                                //this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player');  //boxIn.playerId = editedMatch.playerId;
                                //this.undo.update(boxIn, '_player', editedMatch._player, 'Set player');  //boxIn._player = editedMatch._player;
                                _this.undo.update(boxIn, 'playerId', editedMatch.playerId, 'Set player', function () { return _this.drawLib.initBox(boxIn, boxIn._draw); }); //boxIn.playerId = editedMatch.playerId;
                            }
                        }
                    }
                    return true;
                });
            };
            //erasePlayer(box: models.Box): void {
            //    //this.undo.newGroup("Erase player", () => {
            //    //    this.undo.update(box, 'playerId', null);  //box.playerId = undefined;
            //    //    this.undo.update(box, '_player', null);  //box._player = undefined;
            //    //    return true;
            //    //}, box);
            //    //this.undo.update(box, 'playerId', null, "Erase player",     //box.playerId = undefined;
            //    //    () => this.drawLib.initBox(box, box._draw)
            //    //    );  
            //    var prev = box.playerId;
            //    this.undo.action((bUndo: boolean) => {
            //        box.playerId = bUndo ? prev : undefined;
            //        this.drawLib.initBox(box, box._draw)
            //        this.selection.select(box, models.ModelType.Box);
            //    }, "Erase player");
            //}
            //eraseScore(match: models.Match): void {
            //    this.undo.newGroup("Erase score", () => {
            //        this.undo.update(match, 'score', '');  //box.score = '';
            //        return true;
            //    }, match);
            //}
            MainLib.prototype.erasePlanning = function (match) {
                var _this = this;
                this.undo.newGroup("Erase player", function () {
                    _this.undo.update(match, 'place', null); //match.place = undefined;
                    _this.undo.update(match, 'date', null); //match.date = undefined;
                    return true;
                }, match);
            };
            return MainLib;
        })();
        service.MainLib = MainLib;
        angular.module('jat.services.mainLib', [
            'jat.services.selection',
            'jat.services.find',
            'jat.services.undo',
            'jat.services.guid',
            'jat.services.type',
            'jat.services.tournamentLib',
            'jat.services.drawLib',
            'jat.services.knockout',
            'jat.services.roundrobin',
            'jat.services.validation',
            'jat.services.validation.knockout',
            'jat.services.validation.roundrobin',
            'jat.services.validation.fft'
        ])
            .factory('mainLib', [
            '$log',
            '$http',
            '$q',
            '$window',
            'selection',
            'tournamentLib',
            'drawLib',
            'knockout',
            'roundrobin',
            'validation',
            'knockoutValidation',
            'roundrobinValidation',
            'fftValidation',
            //'rank',
            'undo',
            'find',
            'guid',
            function ($log, $http, $q, $window, selection, tournamentLib, drawLib, knockout, roundrobin, validation, knockoutValidation, roundrobinValidation, fftValidation, 
                //rank: ServiceRank,
                undo, find, guid) {
                return new MainLib($log, $http, $q, $window, selection, tournamentLib, drawLib, validation, undo, find, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
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
        var Roundrobin = (function () {
            function Roundrobin(drawLib, tournamentLib, ranking, find) {
                this.drawLib = drawLib;
                this.tournamentLib = tournamentLib;
                this.ranking = ranking;
                this.find = find;
                drawLib._drawLibs[models.DrawType.PouleSimple]
                    = drawLib._drawLibs[models.DrawType.PouleAR]
                        = this;
            }
            Roundrobin.prototype.findBox = function (draw, position, create) {
                var box = this.find.by(draw.boxes, 'position', position);
                if (!box && create) {
                    box = this.drawLib.newBox(draw, undefined, position);
                }
                return box;
            };
            Roundrobin.prototype.nbColumnForPlayers = function (draw, nJoueur) {
                return nJoueur;
            };
            Roundrobin.prototype.boxesOpponents = function (match) {
                var n = match._draw.nbColumn;
                var pos1 = seedPositionOpponent1(match.position, n), pos2 = seedPositionOpponent2(match.position, n);
                return {
                    box1: this.find.by(match._draw.boxes, 'position', pos1),
                    box2: this.find.by(match._draw.boxes, 'position', pos2)
                };
            };
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
            Roundrobin.prototype.computePositions = function (draw) {
                //nothing to do for round robin
                return;
            };
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
            Roundrobin.prototype.FindQualifieEntrant = function (draw, iQualifie) {
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
            Roundrobin.prototype.FindQualifieSortant = function (draw, iQualifie) {
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
            Roundrobin.prototype.SetQualifieEntrant = function (box, inNumber, player) {
                // inNumber=0 => enlève qualifié
                var draw = box._draw;
                //ASSERT(SetQualifieEntrantOk(iBoite, inNumber, iJoueur));
                if (inNumber) {
                    var prev = this.drawLib.previousGroup(draw);
                    if (!player && prev && inNumber != QEMPTY) {
                        //Va chercher le joueur dans le tableau précédent
                        var boxOut = this.drawLib.FindQualifieSortant(prev, inNumber);
                        if (angular.isObject(boxOut)) {
                            player = boxOut._player;
                        }
                    }
                    if (box.qualifIn) {
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
                    if (inNumber == QEMPTY ||
                        !this.drawLib.FindQualifieEntrant(draw, inNumber)) {
                        this.SetQualifieEntrant(box, inNumber);
                    }
                }
                else {
                    box.qualifIn = 0;
                    if (this.drawLib.previousGroup(draw) && !this.drawLib.EnleveJoueur(box)) {
                        ASSERT(false);
                    }
                }
                return true;
            };
            Roundrobin.prototype.SetQualifieSortant = function (box, outNumber) {
                // outNumber=0 => enlève qualifié
                //ASSERT(SetQualifieSortantOk(iBoite, outNumber));
                var next = this.drawLib.nextGroup(box._draw);
                //TODOjs findBox()
                var diag = box._draw.boxes[iDiagonale(box)];
                var box1 = box._draw.boxes[ADVERSAIRE1(box._draw, box.position)];
                if (outNumber) {
                    //Met à jour le tableau suivant
                    if (next && box.playerId && box.qualifOut) {
                        var boxIn = this.drawLib.FindQualifieEntrant(box._draw, outNumber);
                        if (boxIn) {
                            ASSERT(boxIn.playerId === box.playerId);
                            if (!this.drawLib.EnleveJoueur(boxIn)) {
                                ASSERT(false);
                            }
                        }
                    }
                    //Enlève le précédent n° de qualifié sortant
                    if (box.qualifOut)
                        if (!this.SetQualifieSortant(box)) {
                            ASSERT(false);
                        }
                    this.SetQualifieSortant(box, outNumber);
                    diag.playerId = box1.playerId;
                    this.drawLib.initBox(diag, box._draw);
                    if (next && box.playerId) {
                        //Met à jour le tableau suivant
                        var boxIn = this.drawLib.FindQualifieEntrant(next, outNumber);
                        if (boxIn) {
                            ASSERT(!boxIn.playerId);
                            if (!this.drawLib.MetJoueur(boxIn, box._player, true)) {
                                ASSERT(false);
                            }
                        }
                    }
                }
                else {
                    var match = box;
                    if (next && box.playerId) {
                        //Met à jour le tableau suivant
                        var boxIn = this.drawLib.FindQualifieEntrant(next, match.qualifOut);
                        if (boxIn) {
                            ASSERT(boxIn.playerId && boxIn.playerId === box.playerId);
                            if (!this.drawLib.EnleveJoueur(boxIn, true)) {
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
                //		CalculeScore( (CDocJatennis*)((CFrameTennis*)AfxGetMainWnd()).GetActiveDocument());
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
                    players = players.concat(this.drawLib.FindAllQualifieSortant(prev, true));
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
                                if (!this.drawLib.SetQualifieEntrant(boxIn, qualif)) {
                                    return;
                                }
                            }
                            else if (!this.drawLib.MetJoueur(boxIn, players[j])) {
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
            Roundrobin.prototype.CalculeScore = function (draw) {
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
        })();
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
        angular.module('jat.services.roundrobin', ['jat.services.drawLib', 'jat.services.tournamentLib', 'jat.services.type', 'jat.services.find'])
            .factory('roundrobin', [
            'drawLib', 'tournamentLib', 'ranking', 'find',
            function (drawLib, tournamentLib, ranking, find) {
                return new Roundrobin(drawLib, tournamentLib, ranking, find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var service;
    (function (service) {
        var RoundrobinValidation = (function () {
            function RoundrobinValidation(validation) {
                this.validation = validation;
                validation.addValidator(this);
            }
            RoundrobinValidation.prototype.validatePlayer = function (player) {
                return true;
            };
            RoundrobinValidation.prototype.validateDraw = function (draw) {
                var bRes = true;
                bRes = bRes && this.validatePoule(draw);
                bRes = bRes && this.validateMatches(draw);
                return bRes;
            };
            RoundrobinValidation.prototype.validatePoule = function (draw) {
                var bRes = true;
                //TODOjs
                ////Compte le nombre de Qs de la poule (et pas dans suite)
                //var e = 0;
                //for (var i = draw.nbColumn - 1; i >= 0; i--) {
                //    if (boxes[iDiagonale(i)].isQualifieSortant())
                //        e++;
                //}
                //for (i = draw.nbColumn - 1; i >= 0; i--) {
                //    j = ADVERSAIRE1(i);
                //    //comparer les Qs avec le classement de CalculeScore
                //    if (e) {
                //        if (boxes[j].m_iClassement
                //            && boxes[iDiagonale(j)].isQualifieSortant()) {
                //		if(boxes[j].m_iClassement > (char)e) {
                //                this.validation.errorDraw('IDS_ERR_POU_QSORTANT', draw, j);
                //                bRes = false;
                //            }
                //        }
                //    }
                //}
                //for (i = draw.nbColumn - 1; i >= 0; i--) {
                //    j = ADVERSAIRE1(i);
                //    //Poule complète, avec assez de joueurs
                //    if (boxes[j].playerId == -1
                //        && !boxes[j].isQualifieEntrant()) {
                //        this.validation.errorDraw('IDS_ERR_POU_JOUEUR_NO', draw, j);
                //        bRes = false;
                //        break;
                //    }
                //}
                //date des matches différentes pour un même joueur
                //TODO Poule, isValide
                return bRes;
            };
            RoundrobinValidation.prototype.validateMatches = function (draw) {
                var bRes = true;
                //Match avec deux joueurs gagné par un des deux joueurs
                for (var i = 0; i < draw.boxes.length; i++) {
                    var box = draw.boxes[i];
                    var boxIn = !isMatch(box) ? box : undefined;
                    var match = isMatch(box) ? box : undefined;
                    //ASSERT(-1 <= box.playerId && box.playerId < pDoc.m_nJoueur);
                    //Joueur inscrit au tableau ?
                    //Rien sur les croix (sauf les qualifiés sortants)
                    //ASSERT( !isTypePoule() || !boxes[ i].isCache() || boxes[ i].isVide() );
                    if (box.playerId) {
                    }
                }
                return bRes;
            };
            return RoundrobinValidation;
        })();
        service.RoundrobinValidation = RoundrobinValidation;
        function isMatch(box) {
            return 'score' in box;
        }
        angular.module('jat.services.validation.roundrobin', ['jat.services.validation'])
            .factory('roundrobinValidation', [
            'validation',
            function (validation) {
                return new RoundrobinValidation(validation);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
// Selection service
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Selection = (function () {
            function Selection() {
            }
            Selection.prototype.select = function (r, type) {
                if (r) {
                    if (type === models.ModelType.Box || ('_player' in r && r._draw)) {
                        this.tournament = r._draw._event._tournament;
                        this.event = r._draw._event;
                        this.draw = r._draw;
                        this.box = r;
                    }
                    else if (type === models.ModelType.Draw || r._event) {
                        this.tournament = r._event._tournament;
                        this.event = r._event;
                        this.draw = r;
                        this.box = undefined;
                    }
                    else if (type === models.ModelType.Event || (r.draws && r._tournament)) {
                        this.tournament = r._tournament;
                        this.event = r;
                        this.draw = r.draws ? r.draws[0] : undefined;
                        this.box = undefined;
                    }
                    else if (type === models.ModelType.Player || (r.name && r._tournament)) {
                        this.tournament = r._tournament;
                        this.player = r;
                    }
                    else if (type === models.ModelType.Tournament || (r.players && r.events)) {
                        this.tournament = r;
                        if (this.tournament.events[0]) {
                            this.event = this.tournament.events[0];
                            this.draw = this.event && this.event.draws ? this.event.draws[this.event.draws.length - 1] : undefined;
                        }
                        else {
                            this.event = undefined;
                            this.draw = undefined;
                        }
                        this.box = undefined;
                        if (this.player && this.player._tournament !== this.tournament) {
                            this.player = undefined;
                        }
                    }
                }
                else if (type) {
                    switch (type) {
                        case models.ModelType.Tournament:
                            this.tournament = undefined;
                            this.player = undefined;
                        case models.ModelType.Event:
                            this.event = undefined;
                        case models.ModelType.Draw:
                            this.draw = undefined;
                        case models.ModelType.Box:
                            this.box = undefined;
                            break;
                        case models.ModelType.Player:
                            this.player = undefined;
                    }
                }
            };
            return Selection;
        })();
        service.Selection = Selection;
        angular.module('jat.services.selection', [])
            .service('selection', Selection);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var service;
    (function (service) {
        var MINUTES = 60000, DAYS = 24 * 60 * MINUTES;
        var TournamentLib = (function () {
            function TournamentLib(drawLib, rank, guid) {
                this.drawLib = drawLib;
                this.rank = rank;
                this.guid = guid;
            }
            TournamentLib.prototype.newTournament = function (source) {
                var tournament = {};
                if (angular.isObject(source)) {
                    angular.extend(tournament, source);
                }
                this.initTournament(tournament);
                return tournament;
            };
            TournamentLib.prototype.newInfo = function (source) {
                var info = {};
                if (angular.isObject(source)) {
                    angular.extend(info, source);
                }
                return info;
            };
            TournamentLib.prototype.initTournament = function (tournament) {
                if (tournament.players) {
                    for (var i = tournament.players.length - 1; i >= 0; i--) {
                        //tournament.players[i] = new Player(tournament, tournament.players[i]);
                        this.initPlayer(tournament.players[i], tournament);
                    }
                }
                if (tournament.events) {
                    for (var i = tournament.events.length - 1; i >= 0; i--) {
                        //tournament.events[i] = new Event(tournament, tournament.events[i]);
                        this.initEvent(tournament.events[i], tournament);
                    }
                }
                tournament.info = tournament.info || { name: '' };
                tournament.info.slotLength = tournament.info.slotLength || 90 * MINUTES;
                if (tournament.info.start && tournament.info.end) {
                    tournament._dayCount = Math.floor((tournament.info.end.getTime() - tournament.info.start.getTime()) / DAYS + 1);
                }
            };
            TournamentLib.prototype.newPlayer = function (parent, source) {
                var player = {};
                if (angular.isObject(source)) {
                    angular.extend(player, source);
                }
                player.id = player.id || this.guid.create('p');
                delete player.$$hashKey; //remove angular id
                this.initPlayer(player, parent);
                return player;
            };
            TournamentLib.prototype.initPlayer = function (player, parent) {
                player._tournament = parent;
                //player.toString = function () {
                //    return this.name + ' ' + this.rank;
                //};
            };
            TournamentLib.prototype.newEvent = function (parent, source) {
                var event = {};
                if (angular.isObject(source)) {
                    angular.extend(event, source);
                }
                event.id = event.id || this.guid.create('e');
                delete event.$$hashKey; //remove angular id
                this.initEvent(event, parent);
                return event;
            };
            TournamentLib.prototype.initEvent = function (event, parent) {
                event._tournament = parent;
                var c = event.draws = event.draws || [];
                if (c) {
                    for (var i = c.length - 1; i >= 0; i--) {
                        var draw = c[i];
                        this.drawLib.initDraw(draw, event);
                        //init draws linked list
                        draw._previous = c[i - 1];
                        draw._next = c[i + 1];
                    }
                }
            };
            TournamentLib.prototype.isRegistred = function (event, player) {
                return player.registration && player.registration.indexOf(event.id) !== -1;
            };
            TournamentLib.prototype.getRegistred = function (event) {
                var a = [];
                var c = event._tournament.players;
                for (var i = 0, n = c.length; i < n; i++) {
                    var player = c[i];
                    if (this.isRegistred(event, player)) {
                        a.push(player);
                    }
                }
                return a;
            };
            TournamentLib.prototype.TriJoueurs = function (players) {
                var _this = this;
                //Tri les joueurs par classement
                var comparePlayersByRank = function (p1, p2) {
                    //if numbers, p1 or p2 are PlayerIn
                    var isNumber1 = 'number' === typeof p1, isNumber2 = 'number' === typeof p2;
                    if (isNumber1 && isNumber2) {
                        return 0;
                    }
                    if (isNumber1) {
                        return -1;
                    }
                    if (isNumber2) {
                        return 1;
                    }
                    return _this.rank.compare(p1.rank, p2.rank);
                };
                players.sort(comparePlayersByRank);
                //Mélange les joueurs de même classement
                for (var r0 = 0, r1 = 1; r0 < players.length; r1++) {
                    if (r1 === players.length || comparePlayersByRank(players[r0], players[r1])) {
                        //nouvelle plage de classement
                        //r0: premier joueur de l'intervalle
                        //r1: premier joueur de l'intervalle suivant
                        tool.shuffle(players, r0, r1);
                        r0 = r1;
                    }
                }
            };
            TournamentLib.prototype.GetJoueursInscrit = function (draw) {
                //Récupère les joueurs inscrits
                var players = draw._event._tournament.players, ppJoueur = [], nPlayer = 0;
                for (var i = 0; i < players.length; i++) {
                    var pJ = players[i];
                    if (this.isRegistred(draw._event, pJ)) {
                        if (!pJ.rank
                            || this.rank.within(pJ.rank, draw.minRank, draw.maxRank)) {
                            ppJoueur.push(pJ); //no du joueur
                        }
                    }
                }
                return ppJoueur;
            };
            TournamentLib.prototype.isSexeCompatible = function (event, sexe) {
                return event.sexe === sexe //sexe épreuve = sexe joueur
                    || (event.sexe === 'M' && !event.typeDouble); //ou simple mixte
            };
            return TournamentLib;
        })();
        service.TournamentLib = TournamentLib;
        angular.module('jat.services.tournamentLib', ['jat.services.drawLib', 'jat.services.type', 'jat.services.guid'])
            .factory('tournamentLib', ['drawLib', 'rank', 'guid',
            function (drawLib, rank, guid) {
                return new TournamentLib(drawLib, rank, guid);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
var jat;
(function (jat) {
    var service;
    (function (service) {
        /**
          * Undo manager for typescript models.
          */
        var Undo = (function () {
            function Undo() {
                this.stack = [];
                this.head = -1;
                this.maxUndo = 20;
            }
            /**
              * Reset the undo stacks
              */
            Undo.prototype.reset = function () {
                this.stack = [];
                this.head = -1;
                this.group = null;
            };
            Undo.prototype.action = function (fnAction, message, meta) {
                if ("function" !== typeof fnAction) {
                    throw "Undo action: invalid fnAction";
                }
                var action = {
                    type: Undo.ActionType.ACTION,
                    fnAction: fnAction,
                    message: message || "",
                    meta: meta
                };
                var r = fnAction(false);
                this._pushAction(action);
                return r;
            };
            Undo.prototype.update = function (obj, member, value, message, meta) {
                if ("undefined" === typeof obj) {
                    throw "Undo update: invalid obj";
                }
                if ("undefined" === typeof member) {
                    throw "Undo update: invalid member";
                }
                if ("undefined" === typeof value) {
                    throw "Undo update: invalid value";
                }
                var action = {
                    type: Undo.ActionType.UPDATE,
                    obj: obj,
                    member: member,
                    value: obj[member],
                    message: message || "update",
                    meta: meta
                };
                if (obj.splice) {
                    if ("number" !== typeof member || member < 0 || obj.length <= member) {
                        throw "Bad array position to update";
                    }
                }
                obj[member] = value;
                this._pushAction(action);
            };
            Undo.prototype.insert = function (obj, member, value, message, meta) {
                if ("undefined" === typeof obj) {
                    throw "Undo insert: invalid obj";
                }
                if ("undefined" === typeof member) {
                    throw "Undo insert: invalid member";
                }
                if ("undefined" === typeof value) {
                    throw "Undo insert: invalid value";
                }
                if (obj.splice) {
                    if ("number" !== typeof member || member < 0 || member > obj.length) {
                        member = obj.length;
                    }
                }
                var action = {
                    type: Undo.ActionType.INSERT,
                    obj: obj,
                    member: member,
                    value: undefined,
                    message: message || (member === obj.length ? "append" : "insert"),
                    meta: meta
                };
                if (obj.splice) {
                    obj.splice(member, 0, value);
                }
                else {
                    obj[member] = value;
                }
                this._pushAction(action);
            };
            Undo.prototype.remove = function (obj, member, message, meta) {
                if ("undefined" === typeof obj) {
                    throw "Undo remove: invalid obj";
                }
                if ("undefined" === typeof member) {
                    throw "Undo remove: invalid member";
                }
                var action = {
                    type: Undo.ActionType.REMOVE,
                    obj: obj,
                    member: member,
                    value: obj[member],
                    message: message || "remove",
                    meta: meta
                };
                if (obj.splice) {
                    if ("number" !== typeof member || member < 0 || obj.length <= member) {
                        throw "Bad array position to remove";
                    }
                    obj.splice(member, 1);
                }
                else {
                    delete obj[member];
                }
                this._pushAction(action);
            };
            //public splice(obj: any[], index: number, howmany: number, itemX: any, itemY: any, message: string): void;
            Undo.prototype.splice = function (obj, index, howmany, itemX, message, meta) {
                if ("undefined" === typeof obj) {
                    throw "Undo splice: invalid obj";
                }
                if ("undefined" === typeof obj.slice) {
                    throw "Undo splice: invalid obj not an array";
                }
                if ("number" !== typeof index) {
                    throw "Undo splice: invalid index";
                }
                if (index < 0 || obj.length < index) {
                    throw "Undo splice: bad array position to remove";
                }
                //var isarray = angular.isArray(itemX);
                var action = {
                    type: Undo.ActionType.SPLICE,
                    obj: obj,
                    index: index,
                    //howmany: isarray ? itemX.length : arguments.length - 4,
                    howmany: itemX.length,
                    //message: arguments[arguments.length - 1] || "splice",
                    message: message || "splice",
                    values: undefined,
                    meta: meta
                };
                //var p = isarray ? itemX.slice(0, itemX.length) : Array.prototype.slice.call(arguments, 3, arguments.length - 1);
                var p = itemX.slice(0, itemX.length);
                p.unshift(index, howmany);
                action.values = Array.prototype.splice.apply(obj, p);
                this._pushAction(action);
            };
            Undo.prototype._pushAction = function (action) {
                if (this.group) {
                    this.group.stack.push(action);
                }
                else {
                    this.head++;
                    this.stack.splice(this.head, this.stack.length, action);
                    this._maxUndoOverflow();
                }
            };
            Undo.prototype.newGroup = function (message, fnGroup, meta) {
                if (this.group) {
                    throw "Cannot imbricate group";
                }
                this.group = {
                    type: Undo.ActionType.GROUP,
                    stack: [],
                    message: message || "",
                    meta: meta
                };
                if ("undefined" !== typeof fnGroup) {
                    if (fnGroup()) {
                        this.endGroup();
                    }
                    else {
                        this.cancelGroup();
                    }
                }
            };
            Undo.prototype.endGroup = function () {
                if (!this.group) {
                    throw "No group defined";
                }
                var g = this.group;
                this.group = null;
                if (g.stack.length) {
                    this._pushAction(g);
                }
            };
            Undo.prototype.cancelGroup = function () {
                if (!this.group) {
                    throw "No group defined";
                }
                this._do(this.group, true);
                this.group = null;
            };
            Undo.prototype._do = function (action, bUndo) {
                this.meta = action.meta;
                if (action.type === Undo.ActionType.GROUP) {
                    var r;
                    if (bUndo) {
                        for (var i = action.stack.length - 1; i >= 0; i--) {
                            r = this._do(action.stack[i], true);
                        }
                    }
                    else {
                        for (i = 0; i < action.stack.length; i++) {
                            r = this._do(action.stack[i], false);
                        }
                    }
                    this.meta = action.meta;
                    return r;
                }
                else if (action.type === Undo.ActionType.ACTION) {
                    return action.fnAction(bUndo);
                }
                else if (action.type === Undo.ActionType.UPDATE) {
                    var temp = action.obj[action.member];
                    action.obj[action.member] = action.value;
                    action.value = temp;
                    return temp;
                }
                else if (action.type === Undo.ActionType.SPLICE) {
                    var p = action.values.slice(0, action.values.length); //copy array
                    p.unshift(action.index, action.howmany);
                    action.howmany = action.values.length;
                    action.values = Array.prototype.splice.apply(action.obj, p);
                    return p[2];
                }
                else if (bUndo ? action.type === Undo.ActionType.INSERT : action.type === Undo.ActionType.REMOVE) {
                    action.value = action.obj[action.member];
                    if (action.obj.splice) {
                        action.obj.splice(action.member, 1);
                    }
                    else {
                        delete action.obj[action.member];
                    }
                }
                else if (action.obj.splice) {
                    action.obj.splice(action.member, 0, action.value);
                    return action.value;
                }
                else {
                    action.obj[action.member] = action.value;
                    return action.value;
                }
            };
            Undo.prototype.undo = function () {
                if (!this.canUndo()) {
                    throw "Can't undo";
                }
                var r = this._do(this.stack[this.head], true);
                this.head--;
                return r;
            };
            Undo.prototype.redo = function () {
                if (!this.canRedo()) {
                    throw "Can't redo";
                }
                this.head++;
                return this._do(this.stack[this.head], false);
            };
            Undo.prototype.canUndo = function () {
                return 0 <= this.head && this.head < this.stack.length;
            };
            Undo.prototype.canRedo = function () {
                return -1 <= this.head && this.head < this.stack.length - 1;
            };
            Undo.prototype.messageUndo = function () {
                return this.canUndo() ? this.stack[this.head].message : "";
            };
            Undo.prototype.messageRedo = function () {
                return this.canRedo() ? this.stack[this.head + 1].message : "";
            };
            Undo.prototype.setMaxUndo = function (v) {
                if ("number" !== typeof v) {
                    throw "Invalid maxUndo value";
                }
                this.maxUndo = v;
                this._maxUndoOverflow();
            };
            Undo.prototype._maxUndoOverflow = function () {
                if (this.stack.length > this.maxUndo) {
                    var nOverflow = this.stack.length - this.maxUndo;
                    this.head -= nOverflow;
                    this.stack.splice(0, nOverflow);
                }
            };
            Undo.prototype.getMeta = function () {
                return this.meta;
            };
            Undo.prototype.toString = function () {
                return (this.group ? "Grouping (" + this.group.message + "), " : "")
                    + (this.canUndo() ? (this.head + 1) + " undo(" + this.messageUndo() + ")" : "No undo")
                    + ", " + (this.canRedo() ? (this.stack.length - this.head) + " redo(" + this.messageRedo() + ")" : "No redo")
                    + ", maxUndo=" + this.maxUndo;
            };
            Undo.ActionType = { UPDATE: 1, INSERT: 2, REMOVE: 3, GROUP: 4, ACTION: 5, SPLICE: 6 };
            return Undo;
        })();
        service.Undo = Undo;
        angular.module('jat.services.undo', [])
            .service('undo', Undo);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
var jat;
(function (jat) {
    var service;
    (function (service) {
        var Validation = (function () {
            function Validation(find) {
                this.find = find;
                this._validLibs = [];
                this._errorsDraw = {};
                this._errorsPlayer = {};
            }
            Validation.prototype.addValidator = function (validator) {
                this._validLibs.push(validator);
            };
            Validation.prototype.validatePlayer = function (player) {
                var res = true;
                for (var i = 0; i < this._validLibs.length; i++) {
                    res = res && this._validLibs[i].validatePlayer(player);
                }
                return res;
            };
            Validation.prototype.validateDraw = function (draw) {
                var res = true;
                for (var i = 0; i < this._validLibs.length; i++) {
                    res = res && this._validLibs[i].validateDraw(draw);
                }
                return res;
            };
            Validation.prototype.errorPlayer = function (message, player, detail) {
                var a = [];
                a.push('Validation error on', player.name);
                if (detail) {
                    a.push('(' + detail + ')');
                }
                a.push(':', message);
                console.warn(a.join(' '));
                var c = this._errorsPlayer[player.id];
                if (!c) {
                    c = this._errorsPlayer[player.id] = [];
                }
                c.push({ message: message, player: player, detail: detail });
            };
            Validation.prototype.errorDraw = function (message, draw, box, detail) {
                var a = [];
                a.push('Validation error on', draw.name);
                if (box && box._player) {
                    a.push('for', box._player.name);
                }
                if (detail) {
                    a.push('(' + detail + ')');
                }
                a.push(':', message);
                console.warn(a.join(' '));
                var c = this._errorsDraw[draw.id];
                if (!c) {
                    c = this._errorsDraw[draw.id] = [];
                }
                c.push({ message: message, player: box ? box._player : undefined, position: box ? box.position : undefined, detail: detail });
            };
            Validation.prototype.hasErrorDraw = function (draw) {
                var c = draw && this._errorsDraw[draw.id];
                return c && c.length > 0;
            };
            Validation.prototype.hasErrorBox = function (box) {
                var c = box && this._errorsDraw[box._draw.id];
                if (c) {
                    var e = this.find.by(c, 'position', box.position);
                }
                return !!e;
            };
            Validation.prototype.getErrorDraw = function (draw) {
                return draw && this._errorsDraw[draw.id];
            };
            Validation.prototype.getErrorBox = function (box) {
                var c = box && this._errorsDraw[box._draw.id];
                if (c) {
                    return this.find.by(c, 'position', box.position);
                }
            };
            Validation.prototype.resetPlayer = function (player) {
                if (player) {
                    delete this._errorsPlayer[player.id];
                }
                else {
                    this._errorsPlayer = {};
                }
            };
            Validation.prototype.resetDraw = function (draw) {
                if (draw) {
                    delete this._errorsDraw[draw.id];
                }
                else {
                    this._errorsDraw = {};
                }
            };
            return Validation;
        })();
        service.Validation = Validation;
        angular.module('jat.services.validation', ['jat.services.find'])
            .factory('validation', [
            'find',
            function (find) {
                return new Validation(find);
            }]);
    })(service = jat.service || (jat.service = {}));
})(jat || (jat = {}));
'use strict';
/* Services */
//*
// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('jat.services', []).
    value('version', '0.1');
//*/ 
'use strict';
var jat;
(function (jat) {
    var tournament;
    (function (tournament) {
        var dialogInfoCtrl = (function () {
            function dialogInfoCtrl(title, info) {
                this.title = title;
                this.info = info;
            }
            dialogInfoCtrl.$inject = [
                'title',
                'info'
            ];
            return dialogInfoCtrl;
        })();
        angular.module('jat.tournament.dialog', [])
            .controller('dialogInfoCtrl', dialogInfoCtrl);
    })(tournament = jat.tournament || (jat.tournament = {}));
})(jat || (jat = {}));
'use strict';
var ec;
(function (ec) {
    var ui;
    (function (ui) {
        function ecInputFileDirective() {
            return {
                restrict: 'EA',
                //replace: true,
                templateUrl: 'template/inputFile.html',
                transclude: true,
                scope: {
                    onloaded: '&'
                },
                link: function postLink(scope, elm, attrs) {
                    elm.css({ position: 'relative' });
                    elm.find('input').on('change', function (event) {
                        scope.onloaded({ file: event.target.files[0] });
                    });
                }
            };
        }
        function templateCache($templateCache) {
            $templateCache.put("template/inputFile.html", 
            //"<span style='position: relative;'>"
            "<input type='file' accept='application/json,text/plain'"
                + " style='position: relative; text-align: right; -webkit-opacity:0; -moz-opacity:0; filter: alpha(opacity: 0); opacity: 0; z-index: 2; width: 80px;'>"
                + "<button style='position:absolute; left:0px; width:100%; z-index:1;' class='btn' ng-transclude></button>");
            /*
            <span class="fileinputs">
               <input type="file" id="inputFile" accept="text/plain,application/json">
                <button class="fakefile">Load</button>
            </span>
            */
        }
        angular.module('ec.inputFile', [])
            .directive('ecInputFile', ecInputFileDirective)
            .run(["$templateCache", templateCache]);
    })(ui = ec.ui || (ec.ui = {}));
})(ec || (ec = {}));
/*
<!DOCTYPE html>
<html>
    <head>
        <title>Test upload</title>
        <style>
            .dropable {
                background-color: lightgreen;
                cursor: move;
            }
            .fileinputs {
                position: relative;
            }
            .fakefile {
                position: absolute;
                left: 0px;
                width: 100%;
                z-index: 1;
            }

            input[type="file"] {
                position: relative;
                text-align: right;
                -webkit-opacity:0 ;
                -moz-opacity:0 ;
                filter:alpha(opacity: 0);
                opacity: 0;
                z-index: 2;
                
                width: 56px;
            }
        </style>
    </head>
    <body>
        .<span class="fileinputs"><input type="file" id="inputFile" accept="text/plain,application/json"><button class="fakefile">Load</button></span>.<br/>
        <textarea id="fileContent" rows="5" cols="60"></textarea><br/>
        <input id="filename" type="text" value="myfile.txt"><button id="btnSave">Save</button>
        <script>
            (function() {
                'use strict';

                var fi = document.getElementById('inputFile');
                var fc = document.getElementById('fileContent');

                fi.addEventListener('change', function(event) {
                    loadFile(event.target.files[0]);
                });
                fi.addEventListener("dragenter", dragover, false);
                fi.addEventListener("dragover", dragover, false);
                document.addEventListener("dragleave", dragover, false);
                fi.addEventListener("drop", drop, false);
                fc.addEventListener("dragenter", dragover, false);
                fc.addEventListener("dragover", dragover, false);
                fc.addEventListener("drop", drop, false);

                function dragover(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    var target = event.target;
                    target.className = /enter|over/.test(event.type) ? 'dropable' : '';
                }
                function drop(event) {
                    dragover(event);
                    loadFile(event.dataTransfer.files[0]);
                }

                function loadFile(file) {
                    console && console.info(file);

                    var reader = new FileReader();
                    reader.addEventListener("loadend", function() {
                        console && console.info(reader.result);
                        fileContent.value = reader.result;
                    });
                    reader.readAsText(file);
                }

                var bSave = document.getElementById('btnSave');
                var filename = document.getElementById('filename');
                bSave.addEventListener('click', function(event) {
                    var blob = new Blob([fc.value], {type: 'text/plain'});
                    saveAs(blob, filename.value);
                });

                var saveAs = saveAs || function(blob, filename) {
                    var a = document.createElement('a');
                    a.download = filename;
                    a.href = URL.createObjectURL(blob);
                    a.textContent = filename;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    a = null;
                    //document.body.appendChild(a);
                }

            })();
        </script>
    </body>
</html>
*/ 
'use strict';
var ec;
(function (ec) {
    var ui;
    (function (ui) {
        /**
         * @ngdoc directive
         * @name ec.panels.directive:panelset
         * @restrict EA
         *
         * @description
         * Panelset is the outer container for the panels directive
         *
         * @param {boolean=} vertical Whether or not to use vertical styling for the panels.
         *
         * @example
        <example module="ec">
          <file name="index.html">
            <ec-panelset>
              <ec-badge>A</ec-badge><panel heading="Vertical Panel 1"><b>First</b> Content!</panel>
              <panel heading="Vertical Panel 2"><i>Second</i> Content!</panel>
            </panelset>
            <hr />
            <panelset vertical="true">
              <panel heading="Vertical Panel 1"><b>First</b> Vertical Content!</panel>
              <panel heading="Vertical Panel 2"><i>Second</i> Vertical Content!</panel>
            </panelset>
          </file>
        </example>
         */
        var PanelsetController = (function () {
            //static $inject = [];
            function PanelsetController() {
                this.panels = [];
                this.badges = [];
                this.selectCount = 0;
            }
            PanelsetController.prototype.select = function (panel, select) {
                //if (panel.isOpen) {
                //    panel.onSelect();
                //} else {
                //    panel.onDeselect();
                //}
                //compute margins
                this.selectCount = 0;
                for (var i = 0; i < this.panels.length; i++) {
                    this.panels[i].marginLeft = i;
                    if (this.panels[i].isOpen) {
                        this.selectCount++;
                        break;
                    }
                }
                var firstActive = i;
                var n = 0;
                for (i = this.panels.length - 1; i > firstActive; i--) {
                    if (this.panels[i].isOpen) {
                        this.selectCount++;
                        n = 0;
                    }
                    else {
                        n--;
                    }
                    this.panels[i].marginLeft = n;
                }
            };
            PanelsetController.prototype.addBadge = function (badge) {
                var _this = this;
                this.badges.push(badge);
                badge.$on('$destroy', function () {
                    return _this.removeBadge(badge);
                });
            };
            PanelsetController.prototype.addPanel = function (panel) {
                var _this = this;
                var badge = this.badges[this.panels.length];
                badge.panel = panel;
                panel.badge = badge;
                panel.marginLeft = 0;
                this.panels.push(panel);
                if (panel.isOpen) {
                    this.selectCount++;
                }
                panel.$on('$destroy', function () {
                    return _this.removePanel(panel);
                });
            };
            PanelsetController.prototype.removePanel = function (panel) {
                var index = this.panels.indexOf(panel);
                if (panel.isOpen) {
                    this.selectCount--;
                }
                if (panel.badge) {
                    delete panel.badge.panel;
                }
                this.panels.splice(index, 1);
            };
            PanelsetController.prototype.removeBadge = function (badge) {
                var index = this.badges.indexOf(badge);
                if (badge.panel) {
                    delete badge.panel.badge;
                }
                this.badges.splice(index, 1);
            };
            return PanelsetController;
        })();
        var PanelController = (function () {
            function PanelController($scope) {
                this.scope = $scope;
            }
            PanelController.$inject = [
                '$scope'
            ];
            return PanelController;
        })();
        function ecPanelsetDirective() {
            return {
                restrict: 'EA',
                transclude: true,
                replace: true,
                scope: {},
                controller: 'PanelsetController',
                templateUrl: 'template/panels/panelset.html'
            };
        }
        //ecPanelDirective.$inject = ['$parse'];
        function ecPanelDirective() {
            return {
                require: '^ecPanelset',
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/panels/panel.html',
                transclude: true,
                scope: {
                    //heading: '@',
                    isOpen: '=?',
                    isDisabled: '=?'
                },
                controller: 'PanelController',
                link: function postLink(scope, elm, attrs, panelsetCtrl) {
                    //scope.isOpen = scope.isOpen == 'true';
                    panelsetCtrl.addPanel(scope);
                    scope.$watch('isOpen', function (value) {
                        return panelsetCtrl.select(scope, !!value);
                    });
                    scope.toggleOpen = function () {
                        if (!scope.isDisabled) {
                            scope.isOpen = !scope.isOpen;
                        }
                    };
                    scope.getWidth = function () {
                        return panelsetCtrl.selectCount ? (Math.floor(100 / panelsetCtrl.selectCount) + '%') : 'auto';
                    };
                }
            };
        }
        function ecBadgeDirective() {
            return {
                require: '^ecPanelset',
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/panels/badge.html',
                transclude: true,
                scope: {},
                link: function postLink(scope, elm, attrs, panelsetCtrl) {
                    scope.panel = null;
                    panelsetCtrl.addBadge(scope);
                }
            };
        }
        function ecHeaderDirective() {
            return {
                require: '^ecPanel',
                restrict: 'EA',
                replace: true,
                templateUrl: 'template/panels/header.html',
                transclude: true //implies a new scope
                ,
                link: function postLink(scope, elm, attrs, panelCtrl) {
                    scope.panel = panelCtrl.scope;
                }
            };
        }
        function templateCache($templateCache) {
            $templateCache.put("template/panels/panelset.html", "<div class='panels'"
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/badge.html", "<div class='panelbadge' ng-class='{active: panel.isOpen, disabled: panel.isDisabled}'"
                + " ng-style=\"{'margin-left': (panel.marginLeft) * 3 +'em'}\""
                + " ng-click='panel.toggleOpen()' ng-dblclick='panel.toggleOpen(true)'"
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/panel.html", "<div class='panel' ng-class='{active: isOpen, disabled: isDisabled}'"
                + " ng-style=\"{'width': isOpen ? getWidth() : 0}\""
                + " ng-transclude>"
                + "</div>");
            $templateCache.put("template/panels/header.html", "<div class='header'"
                + " ng-style=\"{'margin-left': (1 + panel.marginLeft) * 3 +'em'}\""
                + " ng-transclude>"
                + "</div>");
        }
        angular.module('ec.panels', [])
            .controller('PanelsetController', PanelsetController)
            .controller('PanelController', PanelController)
            .directive('ecPanelset', ecPanelsetDirective)
            .directive('ecPanel', ecPanelDirective)
            .directive('ecBadge', ecBadgeDirective)
            .directive('ecHeader', ecHeaderDirective)
            .run(["$templateCache", templateCache]);
    })(ui = ec.ui || (ec.ui = {}));
})(ec || (ec = {}));
var polyfill;
(function (polyfill) {
    //TODO autofocus directive
    if (!('console' in window)) {
        window.console = {
            info: angular.noop,
            log: angular.noop,
            warn: angular.noop,
            error: angular.noop
        };
    }
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement, fromIndex) {
            var k;
            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var O = Object(this);
            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;
            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }
            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;
            if (Math.abs(n) === Infinity) {
                n = 0;
            }
            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }
            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
            // 9. Repeat, while k < len
            while (k < len) {
                var kValue;
                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the
                //    HasProperty internal method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                //    i.  Let elementK be the result of calling the Get
                //        internal method of O with the argument ToString(k).
                //   ii.  Let same be the result of applying the
                //        Strict Equality Comparison Algorithm to
                //        searchElement and elementK.
                //  iii.  If same is true, return k.
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
})(polyfill || (polyfill = {}));
angular.module('jat.utils.checkList', [])
    .directive('checkList', function () {
    return {
        scope: {
            list: '=checkList',
            value: '@'
        },
        link: function (scope, elem, attrs) {
            scope.$watch('list', function (list) {
                if (list) {
                    var index = list.indexOf(scope.value);
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
                }
                else if (!checked && index != -1) {
                    scope.list.splice(index, 1);
                }
            }
            elem.bind('change', function () {
                scope.$apply(changeHandler);
            });
        }
    };
});
/*
.directive('checkedArray', () => {
    return {
        restrict: 'A',
        require: '?ngModel', // get a hold of NgModelController
        scope: {
            array: '=checkedArray',
            value: '@'
        },
        link: (scope, element, attrs, ngModel) => {

            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = () => {
                //console.log("render:" + ngModel.$viewValue);
                var index = scope.array.indexOf( element.val());
                element.prop('checked', index !== -1);
            };

            // Listen for change events to enable binding
            element.bind('change', (event) => {
                console.log("change, event:" + event.target.checked);
                scope.$apply(read);
            });
            read(); // initialize
            //ngModel.$setViewValue(true);

            // Write data to the model
            function read() {
                //console.log("read:");
                //ngModel.$setViewValue(element.prop('checked'));
                var index = scope.array.indexOf( element.val());
                ngModel.$setViewValue( index !== -1);
            }
        }
    };
});
//*/ 
var tool;
(function (tool) {
    function copy(source, destination) {
        if (!destination) {
            destination = source;
            if (source) {
                if (angular.isArray(source)) {
                    destination = copy(source, []);
                }
                else if (angular.isDate(source)) {
                    destination = new Date(source.getTime());
                }
                else if (angular.isObject(source)) {
                    destination = copy(source, {});
                }
            }
        }
        else {
            if (source === destination)
                throw Error("Can't copy equivalent objects or arrays");
            if (angular.isArray(source)) {
                destination.length = 0;
                for (var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            }
            else {
                for (var key in source) {
                    if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {
                        destination[key] = copy(source[key]);
                    }
                }
            }
        }
        return destination;
    }
    tool.copy = copy;
    function shuffle(array, from, toExlusive) {
        from = from || 0;
        if (arguments.length < 3) {
            toExlusive = array.length;
        }
        var n = toExlusive - from;
        if (n == 2) {
            //if only two elements, swap them
            var tmp = array[0];
            array[0] = array[1];
            array[1] = tmp;
        }
        else {
            for (var i = toExlusive - 1; i > from; i--) {
                var t = from + Math.floor(n * Math.random());
                var tmp = array[t];
                array[t] = array[i];
                array[i] = tmp;
            }
        }
        return array;
    }
    tool.shuffle = shuffle;
    function filledArray(size, value) {
        var a = new Array(size);
        for (var i = size - 1; i >= 0; i--) {
            a[i] = 0;
        }
        return a;
    }
    tool.filledArray = filledArray;
    function hashById(array) {
        if (!array) {
            return;
        }
        var a = {};
        for (var i = array.length - 1; i >= 0; i--) {
            var elem = array[i];
            if (elem.id) {
                a[elem.id] = elem;
            }
        }
        return a;
    }
    tool.hashById = hashById;
})(tool || (tool = {}));
