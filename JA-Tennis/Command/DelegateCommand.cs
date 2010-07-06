using System;
using System.Windows.Input;

namespace JA_Tennis.Command
{
    public class DelegateCommand<T> : ICommand where T : class
    {
        Func<T, bool> canExecute;
        Action<T> executeAction;
        bool canExecuteCache;

        public DelegateCommand(Action<T> executeAction, Func<T, bool> canExecute)
        {
            this.executeAction = executeAction;
            this.canExecute = canExecute;
        }

        #region ICommand Members

        public bool CanExecute(object parameter)
        {
            bool temp = canExecute(parameter as T);

            if (canExecuteCache != temp)
            {
                canExecuteCache = temp;
                if (CanExecuteChanged != null)
                {
                    CanExecuteChanged(this, new EventArgs());
                }
            }

            return canExecuteCache;
        }

        public event EventHandler CanExecuteChanged;

        public void Execute(object parameter)
        {
            executeAction(parameter as T);
        }

        #endregion
    }

    public class DelegateCommand : DelegateCommand<object>
    {
        public DelegateCommand(Action<object> executeAction, Func<object, bool> canExecute)
            : base(o => executeAction(o), o => canExecute(o))
        {
        }
    }

}
