using System;
using System.Collections.Generic;
using System.Windows.Input;
using JA_Tennis.Command;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.Command
{
    public class UndoManager : BindableType
    {
        Stack<UndoRedoActions> UndoStack = new Stack<UndoRedoActions>();
        Stack<UndoRedoActions> RedoStack = new Stack<UndoRedoActions>();

        public UndoManager()
        {
            //Init commands
            UndoCommand = new DelegateCommand(Undo, CanUndo);
            RedoCommand = new DelegateCommand(Redo, CanRedo);
        }

        public void Do(Action doAction, Action undoAction, string description, bool IsAllreadyDone)
        {
            Do(new UndoRedoActions(doAction, undoAction, description), IsAllreadyDone);
        }

        public void Do(UndoRedoActions actions, bool IsAllreadyDone)
        {
            UndoStack.Push(actions);

            if (!IsAllreadyDone)
            {
                actions.DoAction();
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
            UndoRedoActions undoredo = UndoStack.Pop();
            undoredo.UndoAction();

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
            UndoRedoActions undoredo = RedoStack.Pop();
            undoredo.DoAction();

            UndoStack.Push(undoredo);
        }
        private bool CanRedo(object param)
        {
            return RedoStack.Count > 0;
        }
        #endregion RedoCommand

    }

    public class UndoRedoActions
    {
        public Action DoAction;
        public Action UndoAction;
        public string Description;

        internal UndoRedoActions()
        {
        }

        public UndoRedoActions(Action doAction, Action undoAction, string description)
        {
            this.DoAction = doAction;
            this.UndoAction = undoAction;
            this.Description = description;
        }
    }
}
