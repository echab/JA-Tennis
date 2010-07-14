using System.Collections.Generic;
using System.Linq;
using System.Windows.Input;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.Command
{
    public class UndoManager : BindableType
    {
        Stack<IUndoRedo> UndoStack = new Stack<IUndoRedo>();
        Stack<IUndoRedo> RedoStack = new Stack<IUndoRedo>();

        public bool IsUndoing { get; protected set; }

        public UndoManager()
        {
            //Init commands
            UndoCommand = new DelegateCommand(Undo, CanUndo);
            RedoCommand = new DelegateCommand(Redo, CanRedo);
        }

        public void Do(IUndoRedo actions, bool IsAllreadyDone)
        {
            UndoStack.Push(actions);
            RedoStack.Clear();

            if (!IsAllreadyDone)
            {
                actions.Redo();
            }

            OnPropertyChanged(() => UndoDescription);

            //TODO ?: raise UndoCommand.CanExecuteChanged and RedoCommand.CanExecuteChanged
        }

        public string UndoDescription
        {
            get
            {
                return CanUndo(null) ? UndoStack.Peek().Description : null;
            }
        }

        public string RedoDescription
        {
            get
            {
                return CanRedo(null) ? RedoStack.Peek().Description : null;
            }
        }

        #region UndoCommand
        public ICommand UndoCommand { get; private set; }

        private void Undo(object param)
        {
            IUndoRedo undoredo = UndoStack.Pop();

            IsUndoing = true;
            undoredo.Undo();
            IsUndoing = false;

            RedoStack.Push(undoredo);
        }
        private bool CanUndo(object param)
        {
            return UndoStack.Count > 0;
        }
        #endregion UndoCommand


        #region RedoCommand
        public ICommand RedoCommand { get; private set; }

        private void Redo(object param)
        {
            IUndoRedo undoredo = RedoStack.Pop();

            IsUndoing = true;
            undoredo.Redo();
            IsUndoing = false;

            UndoStack.Push(undoredo);
        }
        private bool CanRedo(object param)
        {
            return RedoStack.Count > 0;
        }
        #endregion RedoCommand


        public void Clear()
        {
            UndoStack.Clear();
            RedoStack.Clear();
        }

#if DEBUG
        public override string ToString()
        {
            return "Undo=[" + (UndoStack.Count > 0 ? UndoStack.Select(a => a.ToString()).Aggregate((a, b) => a + ", " + b) : "") + "]"
                + " Redo=[" + (RedoStack.Count > 0 ? RedoStack.Select(a => a.ToString()).Aggregate((a, b) => a + ", " + b) : "") + "]";
        }
#endif //DEBUG
    }
}