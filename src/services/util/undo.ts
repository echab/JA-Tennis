//import { computedFrom } from 'aurelia-framework';

const enum ACTION { UPDATE, INSERT, REMOVE, GROUP, ACTION, SPLICE, UPDATE_PROPERTIES };

type IUndoActionProp = {
    type: ACTION.UPDATE | ACTION.INSERT | ACTION.REMOVE,
    obj: any;
    member: string;
    value: any;
    message: string,
    meta: any
}
type IUndoActionGroup = {
    type: ACTION.GROUP,
    stack: IUndoAction[],
    message: string,
    meta: any
}
type IUndoActionFn = {
    type: ACTION.ACTION,
    fnAction: (bUndo?:boolean) => any;
    message: string,
    meta: any
}
type IUndoActionSplice = {
    type: ACTION.SPLICE,
    obj: any;
    index: number;
    howmany: number;
    values?: any,
    message: string,
    meta: any
}
type IUndoActionUpdProp = {
    type: ACTION.UPDATE_PROPERTIES,
    obj: any,
    values: any,
    message: string,
    meta: any
};

type IUndoAction = IUndoActionProp | IUndoActionGroup | IUndoActionFn | IUndoActionSplice | IUndoActionUpdProp;


/**
 * Undo manager for typescript 
*/
export class Undo {

    private _stack: IUndoAction[] = [];
    private _head = -1;
    private _group: IUndoAction | null = null;
    private _maxUndo = 20;
    private _meta: any;

    /**
     * Reset the undo stacks
    */
    reset() {
        this._stack = [];
        this._head = -1;
        this._group = null;
    }

    action(fnAction: (bUndo?: boolean) => any, message: string, meta?: any): any {
        if ("function" !== typeof fnAction) {
            throw new Error( "Undo action: invalid fnAction");
        }
        const action: IUndoAction = {
            type: ACTION.ACTION,
            fnAction,
            message: message || "",
            meta: meta
        };
        const r = fnAction(false);
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
    update(obj: any[], member: number, value: any, message?: string, meta?: any): void;
    update(obj: Object, member: string, value: any, message?: string, meta?: any): void;
    update(obj: any, member: any, value: any, message?: string, meta?: any): void {  //TODO use union type
        if ("undefined" === typeof obj) {
            throw new Error( "Undo update: invalid obj");
        }
        if ("undefined" === typeof member) {
            throw new Error( "Undo update: invalid member");
        }
        if ("undefined" === typeof value) {
            throw new Error( "Undo update: invalid value");
        }
        const action: IUndoAction = {
            type: ACTION.UPDATE,
            obj: obj,
            member: member,
            value: obj[member],
            message: message || "update",
            meta: meta
        };
        if (obj.splice) {
            if ("number" !== typeof member || member < 0 || obj.length <= member) {
                throw new Error( "Bad array position to update");
            }
            obj.splice(member, 1, value);   //to allow aurelia to observe
        } else {
            obj[member] = value;
        }
        this._pushAction(action);
    }

    updateProperties<T>(obj: T, values: T, message?: string, meta?: any): void {
        if ("undefined" === typeof obj) {
            throw new Error("Undo update: invalid obj");
        }
        if ("undefined" === typeof values) {
            throw new Error("Undo update: invalid value");
        }
        const action: IUndoAction = {
            type: ACTION.UPDATE_PROPERTIES,
            obj: obj,
            values: {},
            message: message || "update",
            meta: meta
        };
        for( let prop in values) {
            if( obj[prop] !== values[prop]) {
                action.values[prop] = obj[prop];
                if( 'undefined' === typeof values[prop]) {
                    delete obj[prop];
                } else {
                    obj[prop] = values[prop];
                }
            }
        }
        this._pushAction(action);
    }

    insert(obj: Object, member: string, value: any, message: string, meta?: any): void;
    insert(obj: any[], member: number, value: any, message: string, meta?: any): void;
    insert(obj: any, member: any, value: any, message: string, meta?: any): void {
        if ("undefined" === typeof obj) {
            throw new Error("Undo insert: invalid obj");
        }
        if ("undefined" === typeof member) {
            throw new Error("Undo insert: invalid member");
        }
        if ("undefined" === typeof value) {
            throw new Error("Undo insert: invalid value");
        }
        if (obj.splice) {
            if ("number" !== typeof member || member < 0 || member > obj.length) {
                member = obj.length;
            }
        }
        const action : IUndoAction = {
            type: ACTION.INSERT,
            obj: obj,
            member: member,
            value: undefined as any,
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

    remove(obj: any, member: any, message: string, meta?: any): void {
        if ("undefined" === typeof obj) {
            throw new Error("Undo remove: invalid obj");
        }
        if ("undefined" === typeof member) {
            throw new Error("Undo remove: invalid member");
        }
        const action: IUndoAction = {
            type: ACTION.REMOVE,
            obj: obj,
            member: member,
            value: obj[member],
            message: message || "remove",
            meta: meta
        };
        if (obj.splice) {
            if ("number" !== typeof member || member < 0 || obj.length <= member) {
                throw new Error("Bad array position to remove");
            }
            obj.splice(member, 1);
        } else {
            delete obj[member];
        }
        this._pushAction(action);
    }

    //splice(obj: any[], index: number, howmany: number, itemX: any, itemY: any, message: string): void;
    splice<T>(obj: T[], index: number, howmany: number, itemX: any[], message: string, meta?: any): void {
        if ("undefined" === typeof obj) {
            throw new Error("Undo splice: invalid obj");
        }
        if ("undefined" === typeof obj.slice) {
            throw new Error("Undo splice: invalid obj not an array");
        }
        if ("number" !== typeof index) {
            throw new Error("Undo splice: invalid index");
        }
        if (index < 0 || obj.length < index) {
            throw new Error("Undo splice: bad array position to remove");
        }

        //const isarray = isArray(itemX);

        const action: IUndoAction = {
            type: ACTION.SPLICE,
            obj: obj,
            index: index,
            //howmany: isarray ? itemX.length : arguments.length - 4,
            howmany: itemX.length,
            //message: arguments[arguments.length - 1] || "splice",
            message: message || "splice",
            values: undefined,
            meta: meta
        };

        //const p = isarray ? itemX.slice(0, itemX.length) : Array.prototype.slice.call(arguments, 3, arguments.length - 1);
        const p: any = itemX.slice(0, itemX.length);
        p.unshift(index, howmany);
        action.values = Array.prototype.splice.apply(obj, p);

        this._pushAction(action);
    }

    private _pushAction(action: IUndoAction): void {
        if (this._group?.type === ACTION.GROUP) {
            this._group.stack.push(action);
        } else {
            this._head++;
            this._stack.splice(this._head, this._stack.length, action);
            this._maxUndoOverflow();
        }
    }

    newGroup(message: string, fnGroup?: () => boolean, meta?: any): void {
        if (this._group) {
            throw new Error( "Cannot imbricate group");
        }
        this._group = {
            type: ACTION.GROUP,
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
    endGroup(): void {
        if (!this._group) {
            throw new Error( "No group defined");
        }
        const g = this._group as IUndoActionGroup;
        this._group = null;
        if (g.stack?.length) {
            this._pushAction(g);
        }
    }
    cancelGroup(): void {
        if (!this._group) {
            throw new Error( "No group defined");
        }
        this._do(this._group, true);
        this._group = null;
    }

    private _do(action: IUndoAction, bUndo: boolean): any {
        this._meta = action.meta;
        if (action.type === ACTION.GROUP) {
            let r: any;
            if (bUndo) {
                for (let i = action.stack.length - 1; i >= 0; i--) {
                    r = this._do(action.stack[i], true);
                }
            } else {
                for (let i = 0; i < action.stack.length; i++) {
                    r = this._do(action.stack[i], false);
                }
            }
            this._meta = action.meta;
            return r;

        } else if (action.type === ACTION.ACTION) {
            return action.fnAction(bUndo);

        } else if (action.type === ACTION.UPDATE) {
            const temp = action.obj[action.member];
            if( action.obj.splice) {
                action.obj.splice(action.member, 1, action.value);   //to allow aurelia to observe
            } else {
                action.obj[action.member] = action.value;
            }
            action.value = temp;
            return temp;

        } else if (action.type === ACTION.UPDATE_PROPERTIES) {
            let temp: any = {};
            for( let prop in action.values) {
                if( 'undefined' !== typeof action.obj[prop]) {
                    temp[prop] = action.obj[prop];
                }
                if( 'undefined' === typeof action.values[prop]) {
                    delete action.obj[prop];
                } else {
                    action.obj[prop] = action.values[prop];
                }
                action.values[prop] = temp[prop];
            }
            return action.obj;  //temp;

        } else if (action.type === ACTION.SPLICE) {
            const p = action.values.slice(0, action.values.length);   //copy array
            p.unshift(action.index, action.howmany);
            action.howmany = action.values.length;
            action.values = Array.prototype.splice.apply(action.obj, p);
            return p[2];

        } else if (bUndo ? action.type === ACTION.INSERT : action.type === ACTION.REMOVE) {
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

    undo(): any {
        if (!this.canUndo) {
            throw new Error( "Can't undo");
        }
        const r = this._do(this._stack[this._head], true);
        this._head--;
        return r;
    }

    redo(): any {
        if (!this.canRedo) {
            throw new Error( "Can't redo");
        }
        this._head++;
        return this._do(this._stack[this._head], false);
    }

    //TODO @computedFrom('head', 'stack')
    get canUndo(): boolean {
        return 0 <= this._head && this._head < this._stack.length;
    }

    //TODO @computedFrom('head', 'stack')
    get canRedo(): boolean {
        return -1 <= this._head && this._head < this._stack.length - 1;
    }

    get messageUndo(): string {
        return this.canUndo ? this._stack[this._head].message : "";
    }

    get messageRedo(): string {
        return this.canRedo ? this._stack[this._head + 1].message : "";
    }

    setMaxUndo(v: number): void {
        if ("number" !== typeof v) {
            throw new Error( "Invalid maxUndo value");
        }
        this._maxUndo = v;
        this._maxUndoOverflow();
    }

    private _maxUndoOverflow(): void {
        if (this._stack.length > this._maxUndo) {
            const nOverflow = this._stack.length - this._maxUndo;
            this._head -= nOverflow;
            this._stack.splice(0, nOverflow);
        }
    }

    get meta(): any {
        return this._meta;
    }

    toString(): string {
        return (this._group ? "Grouping (" + this._group.message + "), " : "")
            + (this.canUndo ? (this._head + 1) + " undo(" + this.messageUndo + ")" : "No undo")
            + ", " + (this.canRedo ? (this._stack.length - this._head) + " redo(" + this.messageRedo + ")" : "No redo")
            + ", maxUndo=" + this._maxUndo;
    }
}
//	https://github.com/ArthurClemens/Javascript-Undo-Manager
//	http://alan.dipert.org/post/332027463/lazy-public-definitions-and-undo-in-javascript
//	https://github.com/dsimard/jskata/blob/master/src/jskata.undo.js
//	https://github.com/jscott1989/jsundoable
//	http://www.codeproject.com/Articles/8303/Using-the-Command-pattern-for-undo-functionality
