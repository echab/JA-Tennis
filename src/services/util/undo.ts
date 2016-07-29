import { computedFrom } from 'aurelia-framework';

interface IUndoAction {
    type: number;
    fnAction? (bUndo?:boolean): any;
    obj?: any;
    index?: number;
    message: string;
    howmany?: number;
    values?: any;
    member?: string;
    value?: any;
    stack?: IUndoAction[];  //group
    meta: any;
}

/**
 * Undo manager for typescript 
*/
export class Undo {

    private stack: IUndoAction[] = [];
    private head = -1;
    private group: IUndoAction;
    private maxUndo = 20;
    private static ActionType = { UPDATE: 1, INSERT: 2, REMOVE: 3, GROUP: 4, ACTION: 5, SPLICE: 6 };
    private meta: any;

    /**
     * Reset the undo stacks
    */
    public reset() {
        this.stack = [];
        this.head = -1;
        this.group = null;
    }

    public action(fnAction: (bUndo?: boolean) => any, message: string, meta?: any): any {
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
    }

    /**
         * Update an item of an array or the member of an object..
        *
        * @param obj      an array or an object.
        * @param member   an item number if obj is an array, a member name is obj is an object.
        * @param value    the new value to be set.
        * @param message  (optional).
        * @param meta     (optional).
        */
    public update(obj: any[], member: number, value: any, message?: string, meta?: any): void;
    public update(obj: Object, member: string, value: any, message?: string, meta?: any): void;
    public update(obj: any, member: any, value: any, message?: string, meta?: any): void {  //TODO use union type
        if ("undefined" === typeof obj) {
            throw "Undo update: invalid obj";   //TODO use throw new Error(...) to get stack trace
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
    }

    public insert(obj: Object, member: string, value: any, message: string, meta?: any): void;
    public insert(obj: any[], member: number, value: any, message: string, meta?: any): void;
    public insert(obj: any, member: any, value: any, message: string, meta?: any): void {
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
            value: <any>undefined,
            message: message || (member === obj.length ? "append" : "insert"),
            meta: meta
        };
        if (obj.splice) {
            obj.splice(member, 0, value);
        } else {
            obj[member] = value;
        }
        this._pushAction(action);
    }

    public remove(obj: any, member: any, message: string, meta?: any): void {
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
    }

    //public splice(obj: any[], index: number, howmany: number, itemX: any, itemY: any, message: string): void;
    public splice(obj: any[], index: number, howmany: number, itemX: any[], message: string, meta?: any): void {
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

        //var isarray = isArray(itemX);

        var action: IUndoAction = {
            type: Undo.ActionType.SPLICE,
            obj: obj,
            index: index,
            //howmany: isarray ? itemX.length : arguments.length - 4,
            howmany: itemX.length,
            //message: arguments[arguments.length - 1] || "splice",
            message: message || "splice",
            values: <any[]>undefined,
            meta: meta
        };

        //var p = isarray ? itemX.slice(0, itemX.length) : Array.prototype.slice.call(arguments, 3, arguments.length - 1);
        var p = itemX.slice(0, itemX.length);
        p.unshift(index, howmany);
        action.values = Array.prototype.splice.apply(obj, p);

        this._pushAction(action);
    }

    public _pushAction(action: IUndoAction): void {
        if (this.group) {
            this.group.stack.push(action);
        } else {
            this.head++;
            this.stack.splice(this.head, this.stack.length, action);
            this._maxUndoOverflow();
        }
    }

    public newGroup(message: string, fnGroup?: () => boolean, meta?: any): void {
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
    }
    public endGroup(): void {
        if (!this.group) {
            throw "No group defined";
        }
        var g = this.group;
        this.group = null;
        if (g.stack.length) {
            this._pushAction(g);
        }
    }
    public cancelGroup(): void {
        if (!this.group) {
            throw "No group defined";
        }
        this._do(this.group, true);
        this.group = null;
    }

    private _do(action: IUndoAction, bUndo: boolean): any {
        this.meta = action.meta;
        if (action.type === Undo.ActionType.GROUP) {
            var r: any;
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
            return action.fnAction(bUndo);

        } else if (action.type === Undo.ActionType.UPDATE) {
            var temp = action.obj[action.member];
            action.obj[action.member] = action.value;
            action.value = temp;
            return temp;

        } else if (action.type === Undo.ActionType.SPLICE) {
            var p = action.values.slice(0, action.values.length);   //copy array
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
    }

    public undo(): any {
        if (!this.canUndo) {
            throw "Can't undo";
        }
        var r = this._do(this.stack[this.head], true);
        this.head--;
        return r;
    }

    public redo(): any {
        if (!this.canRedo) {
            throw "Can't redo";
        }
        this.head++;
        return this._do(this.stack[this.head], false);
    }

    //TODO @computedFrom('head', 'stack')
    get canUndo(): boolean {
        return 0 <= this.head && this.head < this.stack.length;
    }

    //TODO @computedFrom('head', 'stack')
    get canRedo(): boolean {
        return -1 <= this.head && this.head < this.stack.length - 1;
    }

    get messageUndo(): string {
        return this.canUndo ? this.stack[this.head].message : "";
    }

    get messageRedo(): string {
        return this.canRedo ? this.stack[this.head + 1].message : "";
    }

    public setMaxUndo(v: number): void {
        if ("number" !== typeof v) {
            throw "Invalid maxUndo value";
        }
        this.maxUndo = v;
        this._maxUndoOverflow();
    }

    private _maxUndoOverflow(): void {
        if (this.stack.length > this.maxUndo) {
            var nOverflow = this.stack.length - this.maxUndo;
            this.head -= nOverflow;
            this.stack.splice(0, nOverflow);
        }
    }

    public getMeta(): any {
        return this.meta;
    }

    public toString(): string {
        return (this.group ? "Grouping (" + this.group.message + "), " : "")
            + (this.canUndo ? (this.head + 1) + " undo(" + this.messageUndo + ")" : "No undo")
            + ", " + (this.canRedo ? (this.stack.length - this.head) + " redo(" + this.messageRedo + ")" : "No redo")
            + ", maxUndo=" + this.maxUndo;
    }
}
//	https://github.com/ArthurClemens/Javascript-Undo-Manager
//	http://alan.dipert.org/post/332027463/lazy-public-definitions-and-undo-in-javascript
//	https://github.com/dsimard/jskata/blob/master/src/jskata.undo.js
//	https://github.com/jscott1989/jsundoable
//	http://www.codeproject.com/Articles/8303/Using-the-Command-pattern-for-undo-functionality
