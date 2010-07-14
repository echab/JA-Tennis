using System.Reflection;
using System.Diagnostics;
using System;

namespace JA_Tennis.Command
{
    // http://www.codeproject.com/Articles/55937/Undoing-MVVM.aspx

    /// <summary>
    /// This class encapsulates a single undoable property.
    /// </summary>
    /// <typeparam name="T"></typeparam>
    public class UndoableProperty<T, TValue> : IUndoRedo where T : class
    {
        #region Member
        private TValue _oldValue;
        private TValue _newValue;
        private T _instance;
        private PropertyInfo _propInfo;
        #endregion

        /// <summary>
        /// Initialize a new instance of <see cref="UndoableProperty"/>.
        /// </summary>
        /// <param name="property">The name of the property.</param>
        /// <param name="instance">The instance of the property.</param>
        /// <param name="oldValue">The pre-change property.</param>
        /// <param name="newValue">The post-change property.</param>
        public UndoableProperty(T instance, string property,
                TValue oldValue, TValue newValue)
            : this(instance, property, oldValue, newValue, property)
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
        public UndoableProperty(T instance, string property,
            TValue oldValue, TValue newValue, string description)
        {
            if (instance == null) { throw new ArgumentException("instance"); }

            _instance = instance;
            _oldValue = oldValue;
            _newValue = newValue;
            _propInfo = _instance.GetType().GetProperty(property);

            if (_propInfo == null) { throw new ArgumentException(property, "property"); }

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
            _propInfo.SetValue(_instance, _oldValue, null);
        }

        public void Redo()
        {
            _propInfo.SetValue(_instance, _newValue, null);
        }

#if DEBUG
        public override string ToString()
        {
            return string.Format("{0}={1}>{2}", _propInfo.Name, _oldValue, _newValue);
        }
#endif //DEBUG
    }
}
