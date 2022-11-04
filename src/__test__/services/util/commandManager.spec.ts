import {
    Command,
    createCommandManager,
    insertItem,
    removeItem,
    setItem,
} from "../../../services/util/commandManager";

// TODO? requires .babelrc file for typescript

type Counter = { count: number };

describe("commandManager", () => {
    const increment = (counter: { count: number }, nb = 1): Command => {
        const prevCount = counter.count;
        const act = () => { counter.count += nb; };
        const undo = () => { counter.count = prevCount; };
        act();
        return { name: "increment", act, undo };
    };

    const incrementCommand = (counter: Counter, nb = 1): Command => {
        const prevCount = counter.count;
        const act = () => {
            counter.count += nb;
        };
        const undo = () => {
            counter.count = prevCount;
        };
        return { name: "increment", act, undo };
    };

    it("should increment the counter", () => {
        const counter: Counter = { count: 0 };
        increment(counter, 10);
        expect(counter.count).toBe(10);
    });

    it("should undo/redo the increment add", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.add(increment(counter));
        expect(counter.count).toBe(1);

        expect(cmdManager.canUndo).toBe(true);
        expect(cmdManager.undoNames()).toStrictEqual(["increment"]);
        cmdManager.undo();
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        expect(cmdManager.redoNames()).toStrictEqual(["increment"]);
        cmdManager.redo();
        expect(counter.count).toBe(1);
    });

    it("should undo/redo two commands", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.add(increment(counter, 1));
        cmdManager.add(increment(counter, 10));
        expect(counter.count).toBe(11);

        expect(cmdManager.canUndo).toBe(true);
        expect(cmdManager.undoNames(2)).toStrictEqual(["increment", "increment"]);
        cmdManager.undo(2);
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        expect(cmdManager.redoNames(2)).toStrictEqual(["increment", "increment"]);
        cmdManager.redo(2);
        expect(counter.count).toBe(11);
    });

    it("should override old undo", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.add(increment(counter));
        cmdManager.add(increment(counter, 10));
        expect(counter.count).toBe(11);

        cmdManager.undo();
        cmdManager.add(increment(counter, 100));
        expect(counter.count).toBe(101);
    });

    it("should not increment the counter before acting", () => {
        const counter: Counter = { count: 0 };
        const cmd = incrementCommand(counter, 1);
        expect(counter.count).toBe(0);
        cmd.act();
        expect(counter.count).toBe(1);
    });

    it("should undo/redo the increment command", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.do(incrementCommand(counter));
        expect(counter.count).toBe(1);

        expect(cmdManager.canUndo).toBe(true);
        expect(cmdManager.undoNames()).toStrictEqual(["increment"]);
        cmdManager.undo();
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        expect(cmdManager.redoNames()).toStrictEqual(["increment"]);
        cmdManager.redo();
        expect(counter.count).toBe(1);
    });

    it("should lost old undos", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(2);

        cmdManager.add(increment(counter));
        cmdManager.add(increment(counter, 10));
        cmdManager.add(increment(counter, 100));
        expect(counter.count).toBe(111);

        cmdManager.undo();
        cmdManager.undo();
        expect(counter.count).toBe(1);
        expect(cmdManager.canUndo).toBe(false);
    });

    it("should clear the command history", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.add(increment(counter));
        cmdManager.add(increment(counter, 10));
        expect(counter.count).toBe(11);

        cmdManager.clear();

        expect(cmdManager.canUndo).toBe(false);
        expect(cmdManager.canRedo).toBe(false);
    });

    it("should throw if nothing to undo", () => {
        const cmdManager = createCommandManager(5);

        expect(cmdManager.canUndo).toBe(false);

        const t = () => {
            cmdManager.undo();
        };
        expect(t).toThrow("Nothing to undo");
    });

    it("should throw if nothing to redo", () => {
        const cmdManager = createCommandManager(5);

        expect(cmdManager.canRedo).toBe(false);

        const t = () => {
            cmdManager.redo();
        };
        expect(t).toThrow("Nothing to redo");
    });

    it("should manage transaction manually", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.beginTransaction('transac1');

        cmdManager.add(increment(counter, 1));
        cmdManager.add(increment(counter, 10));
        expect(counter.count).toBe(11);
        expect(cmdManager.canUndo).toBe(false);

        cmdManager.commit();

        expect(cmdManager.canUndo).toBe(true);
        expect(cmdManager.undoNames(2)).toStrictEqual(["transac1"]);
        cmdManager.undo();
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        cmdManager.redo();
        expect(counter.count).toBe(11);
    });

    it("should manage transaction with a callback", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.transaction('transac2', () => {
            cmdManager.add(increment(counter, 1));
            cmdManager.add(increment(counter, 10));
            expect(counter.count).toBe(11);
            expect(cmdManager.canUndo).toBe(false);
        });

        expect(counter.count).toBe(11);

        expect(cmdManager.canUndo).toBe(true);
        expect(cmdManager.undoNames(2)).toStrictEqual(["transac2"]);
        cmdManager.undo();
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        cmdManager.redo();
        expect(counter.count).toBe(11);
    });

    it("should ignore empty transaction", () => {
        const cmdManager = createCommandManager(5);

        cmdManager.beginTransaction('transac2');
        cmdManager.commit();

        expect(cmdManager.canUndo).toBe(false);
    });

    it("should abort transaction", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.beginTransaction('transac3');

        cmdManager.add(increment(counter, 1));

        cmdManager.rollback();

        expect(cmdManager.canUndo).toBe(false);
        expect(counter.count).toBe(0); // undone
    });

    it("should abort empty transaction", () => {
        const cmdManager = createCommandManager(5);

        cmdManager.beginTransaction('transac4');
        cmdManager.rollback();

        expect(cmdManager.canUndo).toBe(false);
    });

    it("should throw if end without transaction", () => {
        const cmdManager = createCommandManager(5);

        const t = () => {
            cmdManager.commit();
        };
        expect(t).toThrow("no transaction to end");
    });

    it("should throw to abort without transaction", () => {
        const cmdManager = createCommandManager(5);

        const t = () => {
            cmdManager.rollback();
        };
        expect(t).toThrow("no transaction to abort");
    });

    it("should rollback transaction with a callback", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        const t = () => {
            cmdManager.transaction('transac2', () => {
                cmdManager.add(increment(counter, 1));
                cmdManager.add(increment(counter, 10));
                throw new Error('One error');
            });
        }
        expect(t).toThrow('One error');

        expect(counter.count).toBe(0);

        expect(cmdManager.canUndo).toBe(false);
    });
});

describe("setItem", () => {
    it("should set value of object", () => {
        const obj = { a: 1, b: "Foo", c: { d: "bar" } } as const;

        const cmd = setItem(obj, "b", "John");

        expect(obj.b).toBe("John");

        cmd.undo();
        expect(obj.b).toBe("Foo");

        cmd.act();
        expect(obj.b).toBe("John");
    });

    it("should set undefined value of object", () => {
        const obj = { a: 1 } as { a: number, b?: string };

        const cmd = setItem(obj, "b", "John");

        expect(obj.b).toBe("John");

        cmd.undo();
        expect(obj.b).toBe(undefined);
    });

    it("should set undefined in object", () => {
        const obj = { a: 1, b: "Foo" };

        const cmd = setItem(obj, "b", undefined);

        expect(obj).toStrictEqual({a:1});

        cmd.undo();
        expect(obj).toStrictEqual({ a: 1, b: "Foo" });
    });

    it("should set value of array", () => {
        const array = [1, "Foo", { d: "bar" }] as const;

        const cmd = setItem(array, 1, "John");

        expect(array[1]).toBe("John");

        cmd.undo();
        expect(array[1]).toBe("Foo");
    });

    it("should throw setting negative index for array", () => {
        const array = [1, "Foo", { d: "bar" }] as const;

        const t = () => {
            setItem(array, -2, "John");
        }
        expect(t).toThrow('Index out of range');
    });

    it("should set undefined value of array", () => {
        const array = [1, "Foo"];

        const cmd = setItem(array, 2, "John");

        expect(array).toStrictEqual([1, "Foo", "John"]);
        // expect(array.length).toBe(3);

        cmd.undo();
        // expect(array).toStrictEqual([1, "Foo", ]);
        expect(array[2]).toBe(undefined);
        expect(array.length).toBe(3);

        cmd.act();
        expect(array).toStrictEqual([1, "Foo", "John"]);
    });
});

describe("insertItem", () => {
    it("should insert item in the middle", () => {
        const array = [1, "Foo"];

        const cmd = insertItem(array, 1, "Bar");
        expect(array).toStrictEqual([1, "Bar", "Foo"]);

        cmd.undo();
        expect(array).toStrictEqual([1, "Foo"]);

        cmd.act();
        expect(array).toStrictEqual([1, "Bar", "Foo"]);
    });

    it("should insert item in empty array", () => {
        const array: Array<number | string> = [];

        const cmd = insertItem(array, 0, "Bar");
        expect(array).toStrictEqual(["Bar"]);

        cmd.undo();
        expect(array).toStrictEqual([]);

        cmd.act();
        expect(array).toStrictEqual(["Bar"]);
    });

    it("should insert item at the end", () => {
        const array = [1, "Foo"];

        const cmd = insertItem(array, 2, "Bar");
        expect(array).toStrictEqual([1, "Foo", "Bar"]);

        cmd.undo();
        expect(array).toStrictEqual([1, "Foo"]);

        cmd.act();
        expect(array).toStrictEqual([1, "Foo", "Bar"]);
    });

    it("should throw if out of range", () => {
        const array = [1, "Foo"];

        insertItem(array, 2, "Bar");
        expect(array).toStrictEqual([1, "Foo", "Bar"]);

        const t = () => {
            insertItem(array, 4, "Bar");
        }
        expect(t).toThrow('Index out of range')
    });

    it("should insert item if negative", () => {
        const array = [1, "Foo", 2];

        const cmd = insertItem(array, -2, "Bar");
        expect(array).toStrictEqual([1, "Bar", "Foo", 2]);

        cmd.undo();
        expect(array).toStrictEqual([1, "Foo", 2]);

        cmd.act();
        expect(array).toStrictEqual([1, "Bar", "Foo", 2]);
    });

    it("should throw if out of range negative", () => {
        const array = [1, "Foo", 2];

        insertItem(array, -3, "Bar");
        expect(array).toStrictEqual(["Bar", 1, "Foo", 2]);

        const t = () => {
            insertItem(array, -5, "Bar2");
        }
        expect(t).toThrow('Index out of range')
    });
});

describe("removeItem", () => {
    it("should remove existing item", () => {
        const array = [1, "Foo", 2];

        const cmd = removeItem(array, 1);
        expect(array).toStrictEqual([1, 2]);

        cmd.undo();
        expect(array).toStrictEqual([1, "Foo", 2]);

        cmd.act();
        expect(array).toStrictEqual([1, 2]);
    });

    it("should remove item with negative index", () => {
        const array = [1, "Foo", 2];

        const cmd = removeItem(array, -2);
        expect(array).toStrictEqual([1, 2]);

        cmd.undo();
        expect(array).toStrictEqual([1, "Foo", 2]);

        cmd.act();
        expect(array).toStrictEqual([1, 2]);
    });

    it("should throw on invalid index", () => {
        const array = [1, "Foo"];

        const t = () => {
            removeItem(array, 2);
        }
        expect(t).toThrow('Index out of range');
    });

    it("should throw on invalid negative index", () => {
        const array = [1, "Foo"];

        const t = () => {
            removeItem(array, -3);
        }
        expect(t).toThrow('Index out of range');
    });
});
