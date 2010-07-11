using System;
using System.Reflection;
using JA_Tennis.Command;
using JA_Tennis.Helpers;

namespace JA_Tennis.ComponentModel
{
    public class UndoPropertyBehavior : IPropertyChangedBehavior
    {
        IUndoAware _owner;
        UndoManager _undoManager;

        public UndoPropertyBehavior(IUndoAware owningInstance, UndoManager undoManager)
        {
            _owner = owningInstance;
            _undoManager = undoManager;
        }

        public bool PropertyChanged<T>(object owningInstance, T oldVal, T newVal, string propertyPath)
        {
            object obj = owningInstance;

            string[] elements = propertyPath.Split('.');

            for (var i = 0; i < elements.Length - 1; i++)
            {
                string propName = elements[i];

                Type objType = obj.GetType();
                PropertyInfo prop = objType.GetProperty(propName);
                if (prop == null)
                {
                    throw new ArgumentException(propName);
                }

                obj = objType.GetProperty(propName);
            }

            string propertyName = elements[elements.Length - 1];

            Type objectType = obj.GetType();
            PropertyInfo property = objectType.GetProperty(propertyName);
            if (property == null)
            {
                throw new ArgumentException(propertyName);
            }

            if (property.CanWrite)
            {
                _undoManager.Do(() => property.SetValue(obj, newVal, null),
                    () => property.SetValue(obj, oldVal, null),
                    "Set " + propertyName,
                    true
                );
            }

            return true;
        }
    }

    public interface IUndoAware
    {
        UndoManager UndoManager { get; }
    }
}
