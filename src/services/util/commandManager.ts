import { createSignal } from "solid-js";

export interface Command {
  name: string;
  act: () => void;
  undo: () => void;
  toString?: () => string; // for debug purpose
}

/*
commandManager.add(incrementCounter(quinnCounter, "inc1"));

commandManager.do(incrementCounterCommand(quinnCounter, "inc1"));
*/

export const commandManager = createCommandManager(100);

export function createCommandManager(maxHistory = 100) {
  const history: Command[] = [];
  const [position, setPosition] = createSignal(-1);
  return {
    /**
     * Add a command to be undone on the stack. Act is already called into the command
     *
     * Example:
     * ```ts
     *   const increment = (counter: { count: number }, nb = 1): Command => {
     *     const prevCount = counter.count;
     *     const act = () => {
     *       counter.count += nb;
     *     };
     *     act(); // here the command is called
     *     return {
     *        name: "increment",
     *        act,
     *        undo:() => { counter.count = prevCount; }
     *     };
     *   };
     *   // ...
     *   cmdManager.add(increment(counter));
     * ```
     */
    add(action: Command) {
      if (position() < history.length - 1) {
        history.splice(position() + 1);
      } else if (history.length + 1 > maxHistory) {
        // console.log("too many", history.length + 1, maxHistory);
        history.splice(0, history.length + 1 - maxHistory);
        setPosition((pos) => history.length + 1 - maxHistory);
      }

      history.push(action);
      setPosition((pos) => pos + 1);
    },
    /** */
    do(command: Command) {
      this.add(command);
      command.act();
    },
    get canUndo() {
      return position() >= 0;
    },
    undoNames(nb = 1): string[] {
      return history.slice(Math.max(0, position() + 1 - nb), position() + 1)
        .map((
          { name },
        ) => name).reverse();
    },
    undo(nb = 1) {
      if (position() < 0) {
        throw new Error("Nothing to undo");
      }
      while (position() >= 0 && nb-- > 0) {
        history[position()].undo();
        setPosition((pos) => pos - 1);
      }
    },
    get canRedo() {
      return position() < history.length - 1;
    },
    redoNames(nb = 1): string[] {
      return history.slice(position() + 1, position() + nb + 1).map((
        { name },
      ) => name).reverse();
    },
    redo(nb = 1) {
      if (position() >= history.length - 1) {
        throw new Error("Nothing to redo");
      }
      while (position() < history.length - 1 && nb-- > 0) {
        setPosition((pos) => pos + 1);
        history[position()].act();
      }
    },
    clear() {
      history.splice(0);
      setPosition(-1);
    },
  };
}