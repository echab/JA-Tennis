///<reference path="../../../lib/typings/jasmine/jasmine.d.ts"/>
///<reference path="../../../lib/typings/angularjs/angular-mocks.d.ts"/>

'use strict';

describe('services.undo', () => {
    var undo: jat.service.Undo;

    //beforeEach(module('jat.services.undo'));
    //beforeEach(inject((_undo_:jat.service.Undo) => {undo = _undo_;}));    //inject before each "it
    //beforeEach(undo.reset);

    it('should inject undo', () => {
        module('jat.services.undo');
        inject((_undo_: jat.service.Undo) => {
            undo = _undo_;
        });
    });

    function initTest() {
        expect(undo).not.toBe(undefined);
        undo.reset();
        expect(undo.canUndo()).toBe(false);
        expect(undo.canRedo()).toBe(false);
    }

    //*
    describe('testAction', () => {
        var a: any = {
            a: "aa",
            b: "bb"
        };

        it('should reset undo', initTest);

        it('should insert e', () => {
            var r = undo.action((bUndo: boolean) => {
                if (!bUndo) {
                    a.e = 'ee';
                } else {
                    delete a.e;
                }
            }, "Add e");
            expect(a).toEqual({ a: 'aa', b: 'bb', e: 'ee' });
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toEqual("Add e");
            expect(r).toBeUndefined();
        });

        it('should undo insert e', () => {
            var r = undo.undo();
            expect(a).toEqual({ a: 'aa', b: 'bb' });
            expect(undo.canRedo()).toBe(true);
            expect(undo.messageRedo()).toEqual("Add e");
            expect(r).toBeUndefined();
        });

        it('should redo insert e', () => {
            var r = undo.redo();
            expect(a).toEqual({ a: 'aa', b: 'bb', e: 'ee' });
            expect(r).toBeUndefined();
        });
    });

    describe('testArrayAdd', () => {
        var a = ["a", "b", "c", "d"];

        it('should reset undo', initTest);

        it('should insert e', () => {
            undo.insert(a, -1, "e", "Add e");
            expect(a.toString()).toEqual("a,b,c,d,e");
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toEqual("Add e");
        });

        it('should undo insert e', () => {
            var r = undo.undo();
            expect(a.toString()).toEqual("a,b,c,d");
            expect(undo.canRedo()).toBe(true);
            expect(undo.messageRedo()).toEqual("Add e");
            expect(r).toBeUndefined();
        });

        it('should redo insert e', () => {
            var r = undo.redo();
            expect(a.toString()).toEqual("a,b,c,d,e");
            expect(r).toBe('e');
        });
    });

    describe('testArrayInsert', () => {
        var a = ["a", "b", "c", "d"];

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.insert(a, 2, "e", "Insert e");
            expect(a.toString()).toEqual("a,b,e,c,d");

            expect(undo.canUndo());
            expect(undo.messageUndo()).toEqual("Insert e");

            var r = undo.undo();
            expect(a.toString()).toEqual("a,b,c,d");
            expect(r).toBeUndefined();

            expect(undo.canRedo());
            expect(undo.messageRedo()).toEqual("Insert e");

            r = undo.redo();
            expect(a.toString()).toEqual("a,b,e,c,d");
            expect(r).toBe('e');
        });
    });

    describe('testArray2Insert', () => {
        var a = ["a", "b"];

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.insert(a, 0, "c", "Insert c");
            expect(a.toString()).toEqual("c,a,b");

            undo.insert(a, 1, "d", "Insert d");
            expect(a.toString()).toEqual("c,d,a,b");

            undo.insert(a, 1, "e", "Insert e");
            expect(a.toString()).toEqual("c,e,d,a,b");

            expect(undo.canUndo());
            expect(undo.messageUndo()).toEqual("Insert e");

            var r = undo.undo();
            expect(a.toString()).toEqual("c,d,a,b");
            expect(r).toBeUndefined();

            expect(undo.canUndo());
            expect(undo.messageUndo()).toEqual("Insert d");

            r = undo.undo();
            expect(a.toString()).toEqual("c,a,b");
            expect(r).toBeUndefined();

            expect(undo.canRedo());
            expect(undo.messageRedo()).toEqual("Insert d");
            expect(undo.messageUndo()).toEqual("Insert c");

            r = undo.redo();
            expect(a.toString()).toEqual("c,d,a,b");
            expect(r).toBe('d');

            r = undo.redo();
            expect(a.toString()).toEqual("c,e,d,a,b");
            expect(r).toBe('e');

            expect(!undo.canRedo());
        });
    });

    describe('testArrayInsertUndoInsert', () => {
        var a = ["a", "b"];

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.insert(a, -1, "c", "Insert c");
            expect(a.toString()).toEqual("a,b,c");

            undo.insert(a, -1, "d", "Insert d");
            expect(a.toString()).toEqual("a,b,c,d");

            var r = undo.undo();
            expect(a.toString()).toEqual("a,b,c");
            expect(r).toBeUndefined();

            undo.insert(a, -1, "e", "Insert e");
            expect(a.toString()).toEqual("a,b,c,e");

            expect(!undo.canRedo());

            r = undo.undo();
            expect(a.toString()).toEqual("a,b,c");
            expect(r).toBeUndefined();
        });
    });

    describe('testObjectAdd', () => {
        var a = {
            a: "aa",
            b: "bb"
        };

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.insert(a, "e", "ee", 'insert ee');
            expect(a).toEqual({ a: "aa", b: "bb", "e": "ee" });

            expect(undo.canUndo());
            var r = undo.undo();
            expect(a).toEqual({ a: "aa", b: "bb" });
            expect(r).toBeUndefined();

            r = undo.redo();
            expect(a).toEqual({ a: "aa", b: "bb", "e": "ee" });
            expect(r).toBe('ee');
        });
    });

    describe('testArrayDelete', () => {
        var a = ["a", "b", "c"];

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.remove(a, 1, "Remove b");
            expect(a.toString()).toBe('a,c');

            expect(undo.canUndo());
            var r = undo.undo();
            expect(a.toString()).toBe('a,b,c');
            expect(r).toBe('b');

            r = undo.redo();
            expect(a.toString()).toBe('a,c');
            expect(r).toBeUndefined();
        });
    });

    describe('testObjectDelete', () => {
        var a = {
            a: "aa",
            b: "bb",
            c: "cc"
        };

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.remove(a, "b", "Remove b");
            expect(a).toEqual({ a: "aa", c: "cc" });

            expect(undo.canUndo());
            var r = undo.undo();
            //expect( a).toEqual({a:"aa",c:"cc",b:"bb"});
            expect(a).toEqual({ a: "aa", b: "bb", c: "cc" });
            expect(r).toBe('bb');

            r = undo.redo();
            expect(a).toEqual({ a: "aa", c: "cc" });
            expect(r).toBeUndefined();  //?
        });
    });

    describe('testObjectUpdate', () => {
        var a = {
            a: "aa",
            b: "bb",
            c: "cc"
        };

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.update(a, "b", "bbb", "Change b to bbb");
            expect(a).toEqual({ a: "aa", b: "bbb", c: "cc" });

            expect(undo.canUndo());
            var r = undo.undo();
            expect(a).toEqual({ a: "aa", b: "bb", c: "cc" });
            expect(r).toBe('bbb');

            r = undo.redo();
            expect(a).toEqual({ a: "aa", b: "bbb", c: "cc" });
            expect(r).toBe('bb');
        });
    });

    //describe('testObjectUpdateMeta', () => {
    //    var a = {
    //        a: "aa", _a: "_aa",
    //        b: "bb", _b: "_bb"
    //    };

    //    it('should reset undo', initTest);

    //    function postProcess(a: any, member: string) {
    //        a['_' + member] = '_' + a[member];
    //    }

    //    it('should do it', () => {
    //        undo.update(a, "b", "bbb", "Change b to bbb", () => postProcess(a, 'b'));
    //        expect(a).toEqual({ a: "aa", _a: "_aa", b: "bbb", _b: "_bbb" });

    //        expect(undo.canUndo());
    //        var r = undo.undo();
    //        expect(a).toEqual({ a: "aa", _a: "_aa", b: "bb", _b: "_bb" });
    //        expect(r).toBeUndefined();

    //        r = undo.redo();
    //        expect(a).toEqual({ a: "aa", _a: "_aa", b: "bbb", _b: "_bbb" });
    //        expect(r).toBeUndefined();
    //    });
    //});

    describe('testArrayUpdate', () => {
        var a = ["a", "b", "c"];

        it('should reset undo', initTest);

        it('should do it', () => {
            undo.update(a, 1, "bb", "Change b to bb");
            expect(a.toString()).toBe('a,bb,c');

            expect(undo.canUndo());
            var r = undo.undo();
            expect(a.toString()).toBe('a,b,c');
            expect(r).toBe('bb');

            r = undo.redo();
            expect(a.toString()).toBe('a,bb,c');
            expect(r).toBe('b');
        });
    });

    describe('testMaxUndo', () => {
        var a = {
            v: 0
        };

        it('should reset undo', initTest);

        it('should set maxUndo to 3', function t1() {
            undo.setMaxUndo(3);
            expect(undo.canUndo()).toBe(false);
            expect(undo.canRedo()).toBe(false);
        });

        it('should update a.v to 1,2,3', () => {
            undo.update(a, "v", 1, 'update to 1');
            undo.update(a, "v", 2, 'update to 2');
            undo.update(a, "v", 3, 'update to 3');
            expect(a.v).toBe(3);
        });

        it('should undo 3 times', () => {
            var r = undo.undo();
            r = undo.undo();
            r = undo.undo();
            expect(a.v).toBe(0);
            expect(undo.canUndo()).toBe(false);
            expect(r).toBe(1);
        });

        it('should update a.v to 1,2,3,4', () => {
            undo.update(a, "v", 1, 'update to 1');
            undo.update(a, "v", 2, 'update to 2');
            undo.update(a, "v", 3, 'update to 3');
            undo.update(a, "v", 4, 'update to 4');
            expect(a.v).toBe(4);
        });

        it('should undo 3 times', () => {
            var r = undo.undo();
            r = undo.undo();
            r = undo.undo();
            expect(a.v).toBe(1);
            expect(undo.canUndo()).toBe(false);
            expect(r).toBe(2);
        });
    });

    describe('group', () => {
        var a = {
            v: 0,
            w: 1
        };

        it('should reset undo', initTest);

        it('should create a group', () => {
            undo.newGroup("group1");
            expect(undo.canUndo()).toBe(false);
        });

        it('should fill the group', () => {
            undo.update(a, "v", 2, 'update to 2');
            undo.update(a, "w", 3, 'update to 3');
            expect(a.v).toBe(2);
            expect(a.w).toBe(3);
            expect(undo.canUndo()).toBe(false);
        });

        it('should end the group', () => {
            undo.endGroup();
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toBe("group1");
        });

        it('should undo the group', () => {
            var r = undo.undo();
            expect(a.v).toBe(0);
            expect(a.w).toBe(1);
            expect(undo.canUndo()).toBe(false);
            expect(r).toBe(2);
        });

        it('should redo the group', () => {
            var r = undo.redo();
            expect(a.v).toBe(2);
            expect(a.w).toBe(3);
            expect(r).toBe(1);
        });
    });

    describe('group cancel', () => {
        var a = {
            v: 0,
            w: 1
        };

        it('should reset undo', initTest);

        it('should create a group', () => {
            undo.newGroup("group1");
            undo.update(a, "v", 2, 'update to 2');
            undo.update(a, "w", 3, 'update to 3');
            expect(a.v).toBe(2);
            expect(a.w).toBe(3);
            expect(undo.canUndo()).toBe(false);
        });

        it('should cancel the group', () => {
            undo.cancelGroup();
            expect(a.v).toBe(0);
            expect(a.w).toBe(1);
            expect(undo.canUndo()).toBe(false);
        });

        it('should create a empty group', () => {
            undo.newGroup("group1");
            undo.endGroup();
            expect(undo.canUndo()).toBe(false);
        });
    });

    describe('group function', () => {
        var a = {
            v: 0,
            w: 1
        };

        it('should reset undo', initTest);

        it('should create a group', () => {
            undo.newGroup("group1", () => {
                undo.update(a, "v", 2, 'update to 2');
                undo.update(a, "w", 3, 'update to 3');
                return true;
            });
            expect(a.v).toBe(2);
            expect(a.w).toBe(3);
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toBe("group1");
            var r = undo.undo();
            expect(r).toBe(2);
        });

        it('should cancel a group', () => {
            undo.newGroup("group1", () => {
                undo.update(a, "v", 2, 'update to 2');
                undo.update(a, "w", 3, 'update to 3');
                return false;
            });
            expect(a.v).toBe(0);
            expect(a.w).toBe(1);
            expect(undo.canUndo()).toBe(false);
        });

    });

    describe('group function meta', () => {
        var a = {
            v: 0,
            w: 1
        };

        it('should reset undo', initTest);

        it('should create a group', () => {
            undo.newGroup("group1", () => {
                undo.update(a, "v", 2, 'update to 2');
                undo.update(a, "w", 3, 'update to 3');
                return true;
            }, a);
            expect(a.v).toBe(2);
            expect(a.w).toBe(3);
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toBe("group1");
            expect(undo.getMeta()).toBeUndefined();
            var r = undo.undo();
            expect(r).toBe(2);
            expect(undo.getMeta()).toEqual(a);
        });

        it('should cancel a group', () => {
            undo.newGroup("group1", () => {
                undo.update(a, "v", 2, 'update to 2');
                undo.update(a, "w", 3, 'update to 3');
                return false;
            });
            expect(a.v).toBe(0);
            expect(a.w).toBe(1);
            expect(undo.canUndo()).toBe(false);
        });

    });

    describe('group error', () => {
        it('should reset undo', initTest);

        it('should not cancel no group', () => {
            expect(() => undo.cancelGroup()).toThrow('No group defined');
        });

        it('should not end no group', () => {
            expect(() => undo.endGroup()).toThrow('No group defined');
        });

        it('should not imbricate group', () => {
            undo.newGroup('grouping');
            expect(() => undo.newGroup('grouping again')).toThrow("Cannot imbricate group");
            undo.cancelGroup();
        });
    });

    //describe('testSplice multiple', () => {
    //    var a = ["a", "b", "c"];

    //    it('should reset undo', initTest);

    //    it('should remove b and insert d,e', () => {
    //        undo.splice(a, 1, 1, "e", "d", "Remove b and add d,e");
    //        expect(a).toEqual(["a", "e", "d", "c"]);
    //        expect(undo.canUndo()).toBe(true);
    //        expect(undo.messageUndo()).toBe("Remove b and add d,e");
    //    });

    //    it('should undo remove b and insert d,e', () => {
    //        var r = undo.undo();
    //        expect(a).toEqual(["a", "b", "c"]);
    //        expect(undo.canRedo()).toBe(true);
    //        expect(undo.messageRedo()).toBe("Remove b and add d,e");
    //        expect(r).toBeUndefined();
    //    });

    //    it('should redo Remove b and add d,e', () => {
    //        var r = undo.redo();
    //        expect(a).toEqual(["a", "e", "d", "c"]);
    //        expect(r).toBe('ee');
    //    });
    //});

    describe('testSplice array', () => {
        var a = ["a", "b", "c"];

        it('should reset undo', initTest);

        it('should remove b and insert d,e', () => {
            undo.splice(a, 1, 1, ["e", "d"], "Remove b and add d,e");
            expect(a).toEqual(["a", "e", "d", "c"]);
            expect(undo.canUndo()).toBe(true);
            expect(undo.messageUndo()).toBe("Remove b and add d,e");
        });

        it('should undo remove b and insert d,e', () => {
            var r = undo.undo();
            expect(r).toBe('b');
            expect(a).toEqual(["a", "b", "c"]);
            expect(undo.canRedo()).toBe(true);
            expect(undo.messageRedo()).toBe("Remove b and add d,e");
        });

        it('should redo Remove b and add d,e', () => {
            var r = undo.redo();
            expect(a).toEqual(["a", "e", "d", "c"]);
            expect(r).toBe('e'); //?
        });
    });

    //*/
});
