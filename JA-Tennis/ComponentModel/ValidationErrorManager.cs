using System;
using System.Collections.Generic;
using System.ComponentModel;
using JA_Tennis.Helpers;
using System.Linq.Expressions;

// http://www.damonpayne.com/2010/06/17/GreatFeaturesForMVVMFriendlyObjectsPart0FavorCompositionOverInheritance.aspx

namespace JA_Tennis.ComponentModel
{
    public class ValidationErrorManager
    {
        public ValidationErrorManager(INotifyDataErrorInfo client, Action<string> errorsChangedAction)
        {
            //Requires.NotNull(client, "Must specify target client");
            if (client == null) { throw new ArgumentNullException("Must specify target client"); }

            //Requires.NotNull(errorsChangedAction, "errorsChangedAction: callback must be specified");
            if (errorsChangedAction == null) { throw new ArgumentNullException(Member.Of(() => errorsChangedAction), "callback must be specified"); }

            _client = client;
            ErrorsChanged = errorsChangedAction;
        }

        INotifyDataErrorInfo _client;
        Dictionary<string, List<string>> _errors;   //Dictionnary of <propName, error messages>

        /// <summary>
        /// 
        /// </summary>
        public Action<string> ErrorsChanged { get; set; }

        /// <summary>
        /// Clear errors for the given property and fire ErrorsChanged for that property
        /// </summary>
        /// <param name="propName"></param>
        public void ClearErrors(string propName)
        {
            if (null != _errors && _errors.ContainsKey(propName))
            {
                _errors[propName].Clear();
            }
            ErrorsChanged(propName);
        }

        /// <summary>
        /// Add an error for the given property and fire ErrorsChanged for that property
        /// </summary>
        /// <param name="propName"></param>
        /// <param name="error"></param>
        public void AddError(string propName, string error)
        {
            EnsureErrorContainer(propName);
            _errors[propName].Add(error);
            ErrorsChanged(propName);
        }

        public bool Validate(string propName, params Check[] checks)
        {
            bool isOk = true;

            foreach (Check check in checks)
            {
                if (!check.Condition)
                {
                    isOk = false;
                    AddError(propName, check.Message);
                }
            }

            if (isOk)
            {
                ClearErrors(propName);
            }

            return isOk;
        }
        public bool Validate(Expression<Func<object>> member, params Check[] checks)
        {
            return Validate(Member.Of(member), checks);
        }


        /// <summary>
        /// 
        /// </summary>
        protected void EnsureErrorContainer()
        {
            if (null == _errors) { _errors = new Dictionary<string, List<string>>(); }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="propName"></param>
        protected void EnsureErrorContainer(string propName)
        {
            EnsureErrorContainer();
            if (!_errors.ContainsKey(propName))
            {
                _errors[propName] = new List<string>();
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        public System.Collections.IEnumerable GetErrors(string propertyName)
        {
            if (null == _errors
                || !_errors.ContainsKey(propertyName))
            {
                return null;
            }
            return _errors[propertyName];
        }

        /// <summary>
        /// 
        /// </summary>
        public bool HasErrors
        {
            get
            {
                if (null == _errors) { return false; }
                int propsWithErrCount = _errors.Values.Where(l => l.Count > 0).Count();   //WPF only ?
                //int propsWithErrCount = 0; foreach (var messages in _errors.Values) { propsWithErrCount += messages.Count; }
                return (propsWithErrCount > 0);
            }
        }

    }

    public class Check
    {
        public bool Condition;
        public string Message;

        public Check(bool condition, string message)
        {
            this.Condition = condition;
            this.Message = message;
        }
    }
}
