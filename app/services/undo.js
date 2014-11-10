'use strict';

var jat;
(function (jat) {
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

            Undo.prototype.action = function (fnDo, fnUndo, message, meta) {
                if ("public" !== typeof fnDo) {
                    throw "Undo action: invalid fnDo";
                }
                if ("public" !== typeof fnUndo) {
                    throw "Undo action: invalid fnUndo";
                }
                var action = {
                    type: Undo.ActionType.ACTION,
                    fnDo: fnDo,
                    fnUndo: fnUndo,
                    message: message || "",
                    meta: meta
                };
                var r = fnDo();
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
                } else {
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
                } else {
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
                } else {
                    this.head++;
                    this.stack.splice(this.head, this.stack.length, action);
                    this._maxUndoOverflow();
                }
                if ("function" === typeof action.meta) {
                    action.meta();
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
                    } else {
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
                    } else {
                        for (i = 0; i < action.stack.length; i++) {
                            r = this._do(action.stack[i], false);
                        }
                    }
                    this.meta = action.meta;
                    return r;
                } else if (action.type === Undo.ActionType.ACTION) {
                    if (bUndo) {
                        return action.fnUndo();
                    } else {
                        return action.fnDo();
                    }
                } else if (action.type === Undo.ActionType.UPDATE) {
                    var temp = action.obj[action.member];
                    action.obj[action.member] = action.value;
                    action.value = temp;
                    return temp;
                } else if (action.type === Undo.ActionType.SPLICE) {
                    var p = action.values.slice(0, action.values.length);
                    p.unshift(action.index, action.howmany);
                    action.howmany = action.values.length;
                    action.values = Array.prototype.splice.apply(action.obj, p);
                    return p[2];
                } else if (bUndo ? action.type === Undo.ActionType.INSERT : action.type === Undo.ActionType.REMOVE) {
                    action.value = action.obj[action.member];
                    if (action.obj.splice) {
                        action.obj.splice(action.member, 1);
                    } else {
                        delete action.obj[action.member];
                    }
                } else if (action.obj.splice) {
                    action.obj.splice(action.member, 0, action.value);
                    return action.value;
                } else {
                    action.obj[action.member] = action.value;
                    return action.value;
                }
            };

            Undo.prototype.undo = function () {
                if (!this.canUndo()) {
                    throw "Can't undo";
                }
                var meta = this.stack[this.head].meta;
                var r = this._do(this.stack[this.head], true);
                this.head--;
                return "function" === typeof meta ? meta() : r;
            };

            Undo.prototype.redo = function () {
                if (!this.canRedo()) {
                    throw "Can't redo";
                }
                this.head++;
                var meta = this.stack[this.head].meta;
                var r = this._do(this.stack[this.head], false);
                return "function" === typeof meta ? meta() : r;
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
                return (this.group ? "Grouping (" + this.group.message + "), " : "") + (this.canUndo() ? (this.head + 1) + " undo(" + this.messageUndo() + ")" : "No undo") + ", " + (this.canRedo() ? (this.stack.length - this.head) + " redo(" + this.messageRedo() + ")" : "No redo") + ", maxUndo=" + this.maxUndo;
            };
            Undo.ActionType = { UPDATE: 1, INSERT: 2, REMOVE: 3, GROUP: 4, ACTION: 5, SPLICE: 6 };
            return Undo;
        })();
        service.Undo = Undo;

        angular.module('jat.services.undo', []).service('undo', Undo);
    })(jat.service || (jat.service = {}));
    var service = jat.service;
})(jat || (jat = {}));
//# sourceMappingURL=undo.js.map
