using System;
using System.Reflection;
using JA_Tennis.Command;
using JA_Tennis.Helpers;
using System.Collections.Specialized;
using System.Collections;

namespace JA_Tennis.ComponentModel
{
    public class UndoPropertyBehavior : IPropertyChangedBehavior
    {
        UndoManager _undoManager;

        public UndoPropertyBehavior(UndoManager undoManager)
        {
            _undoManager = undoManager;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="owningInstance"></param>
        /// <param name="oldVal"></param>
        /// <param name="newVal"></param>
        /// <param name="propertyPath">Property name or porperty path <example>My.Component.Name</example>.</param>
        /// <returns></returns>
        public bool PropertyChanged<T>(object owningInstance, T oldVal, T newVal, string propertyPath)
        {
            object obj;
            PropertyInfo property;

            //Prevent recursive call
            if (_undoManager.IsUndoing)
            {
                return true;
            }

            PropertyHelper.GetPropertyByPath(owningInstance, propertyPath, out obj, out property);

            if (property.CanWrite)
            {
                _undoManager.Do(new UndoableProperty<object, object>(obj, property.Name, oldVal, newVal), true);
            }
            //throw new ArgumentException("Cannot write to "+ property.Name);

            return true;
        }

        public bool CollectionChanged<T>(object owningInstance, NotifyCollectionChangedAction changedAction, T item, string propertyPath)
        {
            object obj;
            PropertyInfo property;

            //Prevent recursive call
            if (_undoManager.IsUndoing)
            {
                return true;
            }

            PropertyHelper.GetPropertyByPath(owningInstance, propertyPath, out obj, out property);

            _undoManager.Do(new UndoableCollection<object, T>(obj, property.Name, changedAction, item), true);
            
            return true;
        }

    }
}
