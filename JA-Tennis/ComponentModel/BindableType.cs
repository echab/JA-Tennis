using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq.Expressions;
using System;
using JA_Tennis.Helpers;
using System.Xml.Serialization;
using System.Collections.Specialized;

namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/06/17/GreatFeaturesForMVVMFriendlyObjectsPart0FavorCompositionOverInheritance.aspx

    /// <summary>
    /// A handy base class for classes that want to participate in data binding
    /// </summary>
    public class BindableType : INotifyPropertyChanged
    {
        public BindableType()
        {
            SuspendChangeNotification = false;
            ChangeBehaviors = new List<IPropertyChangedBehavior> { 
                new NotifyPropertyBehavior(this, s => OnPropertyChanged(s)) 
            };
        }

        protected List<IPropertyChangedBehavior> ChangeBehaviors;

        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary>
        /// 
        /// </summary>
        /// <param name="propName"></param>
        //[DebuggerStepThrough]
        protected void OnPropertyChanged(string propName)
        {
            var handler = PropertyChanged;
            if (null != handler && !SuspendChangeNotification)
            {
                handler(this, new PropertyChangedEventArgs(propName));
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="propName"></param>
        [DebuggerStepThrough]
        protected void OnPropertyChanged(Expression<Func<object>> member)
        {
            OnPropertyChanged(Member.Of(member));
        }

        /// <summary>
        /// Allow turning of change notification
        /// </summary>
        [XmlIgnore]
        public bool SuspendChangeNotification { get; set; }


        [DebuggerStepThrough]
        protected void Set<T>(ref T local, T newVal, Expression<Func<object>> member)
        {
            Set<T>(ref local, newVal, Member.Of(member));
        }
        private void Set<T>(ref T local, T newVal, string name)
        {
            T localCopy = local;
            local = newVal;

            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.PropertyChanged<T>(this, localCopy, newVal, name);
                    if (!@continue) { break; }
                }
            }
            else
            {
                //no behaviors, just carry on with the old way
                OnPropertyChanged(name);
            }
        }

        #region CollectionChange
        protected void Add<T>(ref ICollection<T> local, T newItem, string name)
        {
            local.Add( newItem);

            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.CollectionChanged( this, NotifyCollectionChangedAction.Add, newItem, name);
                    if (!@continue) { break; }
                }
            }
        }

        protected void Remove<T>(ref ICollection<T> local, T item, string name)
        {
            local.Remove(item);

            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.CollectionChanged(this, NotifyCollectionChangedAction.Remove, item, name);
                    if (!@continue) { break; }
                }
            }
        }

        protected void Clear<T>(ref ICollection<T> local, T item, string name)
        {
            T[] oldCollection = new T[local.Count];
            local.CopyTo(oldCollection, 0);

            local.Clear();

            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.CollectionChanged(this, NotifyCollectionChangedAction.Reset, oldCollection, name);
                    if (!@continue) { break; }
                }
            }
        }
        #endregion CollectionChange
    }
}