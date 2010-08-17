using System;

namespace JA_Tennis.ComponentModel
{
    public interface INotifyPropertyChanging
    {
        // Summary:
        //     Occurs when a property value changes.
        event PropertyChangingEventHandler PropertyChanging;

    }


    /// <summary>
    /// Represents the method that will handle the INotifyPropertyChanging.PropertyChanging
    /// event.
    /// </summary>
    /// <param name="sender">The source of the event.</param>
    /// <param name="e">A PropertyChangingEventArgs that contains the event data.</param>
    public delegate void PropertyChangingEventHandler(object sender, PropertyChangingEventArgs e);


    /// <summary>
    /// Provides data for the INotifyPropertyChanging.PropertyChanging event.
    /// </summary>
    public class PropertyChangingEventArgs : EventArgs
    {
        /// <summary>
        /// Initializes a new instance of the PropertyChangingEventArgs class.
        /// </summary>
        /// <param name="propertyName">The name of the property that changed.</param>
        public PropertyChangingEventArgs(string propertyName, object oldValue, object newValue)
        {
            PropertyName = propertyName;
            OldValue = oldValue;
            NewValue = newValue;
        }

        // Summary:
        //     Gets the name of the property that changed.
        //
        // Returns:
        //     The name of the property that changed; System.String.Empty or null if all
        //     of the properties have changed.

        /// <summary>
        /// Gets the name of the property that changed.
        /// Returns the name of the property that changed; System.String.Empty or null 
        /// if all of the properties have changed.
        /// </summary>
        public string PropertyName { get; private set; }

        public object OldValue { get; private set; }

        public object NewValue { get; private set; }
    }

}
