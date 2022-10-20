import {
    Command,
    createCommandManager,
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
        expect(cmdManager.undoNames(2)).toStrictEqual(["increment","increment"]);
        cmdManager.undo(2);
        expect(counter.count).toBe(0);

        expect(cmdManager.canRedo).toBe(true);
        expect(cmdManager.redoNames(2)).toStrictEqual(["increment","increment"]);
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

    it("should manage transaction", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.transaction('transac1');

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

    it("should ignore empty transaction", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.transaction('transac2');
        cmdManager.commit();

        expect(cmdManager.canUndo).toBe(false);
    });

    it("should abort transaction", () => {
        const counter: Counter = { count: 0 };
        const cmdManager = createCommandManager(5);

        cmdManager.transaction('transac3');

        cmdManager.add(increment(counter, 1));

        cmdManager.rollback();

        expect(cmdManager.canUndo).toBe(false);
        expect(counter.count).toBe(0); // undone
    });

    it("should abort empty transaction", () => {
        const cmdManager = createCommandManager(5);

        cmdManager.transaction('transac4');
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
});
