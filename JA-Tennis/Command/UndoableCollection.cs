using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Reflection;
using System.Collections.Specialized;

namespace JA_Tennis.Command
{
    public class UndoableCollection<T, TValue> : IUndoRedo where T : class
    {
        #region Member
        private T _instance;
        private NotifyCollectionChangedAction _change;
        private TValue _item;
        private PropertyInfo _propInfo;
        private MethodInfo _methodAdd;
        private MethodInfo _methodRemove;
        #endregion

        /// <summary>
        /// Initialize a new instance of <see cref="UndoableProperty"/>.
        /// </summary>
        /// <param name="property">The name of the property.</param>
        /// <param name="instance">The instance of the property.</param>
        /// <param name="oldValue">The pre-change property.</param>
        /// <param name="newValue">The post-change property.</param>
        public UndoableCollection(T instance, string property,
                NotifyCollectionChangedAction change,
                TValue newItem)
            : this(instance, property, change, newItem, property)
        {
        }

        /// <summary>
        /// Initialize a new instance of <see cref="UndoableProperty"/>.
        /// </summary>
        /// <param name="property">The name of the property.</param>
        /// <param name="instance">The instance of the property.</param>
        /// <param name="oldValue">The pre-change property.</param>
        /// <param name="newValue">The post-change property.</param>
        /// <param name="description">The name of the undo operation.</param>
        public UndoableCollection(T instance, string property,
                NotifyCollectionChangedAction change,
                TValue newItem, string description)
        {
            if (instance == null) { throw new ArgumentException("instance"); }

            _instance = instance;
            _change = change;
            _item = newItem;
            _propInfo = _instance.GetType().GetProperty(property);

            if (_propInfo == null) { throw new ArgumentException(property); }

            _methodAdd = _propInfo.PropertyType.GetMethod("Add");
            _methodRemove = _propInfo.PropertyType.GetMethod("Remove");

            //Check property is a collection
            if (_methodAdd == null || !_methodAdd.IsPublic) { throw new ArgumentException("Cannot Add to collection", property); }
            if (_methodRemove == null || !_methodRemove.IsPublic) { throw new ArgumentException("Cannot Remove from collection", property); }

            Description = description;

            // Notify the calling application that this should be added to the undo list.
            //UndoManager.Add(this);    //TODO?
        }

        /// <summary>
        /// The property name.
        /// </summary>
        public string Description { get; private set; }

        /// <summary>
        /// Undo the property change.
        /// </summary>
        public void Undo()
        {
            if (_change == NotifyCollectionChangedAction.Add)
            {
                //Remove
                _methodRemove.Invoke(_propInfo.GetValue(_instance, null), new Object[] { _item });
            }
            else if (_change == NotifyCollectionChangedAction.Remove)
            {
                //Add
                _methodAdd.Invoke(_propInfo.GetValue(_instance, null), new Object[] { _item });
            }
        }

        public void Redo()
        {
            if (_change == NotifyCollectionChangedAction.Add)
            {
                //Add
                _methodAdd.Invoke(_propInfo.GetValue(_instance, null), new Object[] { _item });
            }
            else if (_change == NotifyCollectionChangedAction.Add)
            {
                //Remove
                _methodRemove.Invoke(_propInfo.GetValue(_instance, null), new Object[] { _item });
            }
        }

#if DEBUG
        public override string ToString()
        {
            return string.Format("{0}:{1}({2})", _propInfo.Name, _change.ToString("G"), _item.ToString());
        }
#endif //DEBUG
    }
}
