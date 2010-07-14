using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq.Expressions;
using System;
using JA_Tennis.Helpers;
using System.Xml.Serialization;
using System.Collections.Specialized;
using JA_Tennis.Model;
using System.Linq;

namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/06/17/GreatFeaturesForMVVMFriendlyObjectsPart0FavorCompositionOverInheritance.aspx

    /// <summary>
    /// A handy base class for classes that want to participate in data binding
    /// </summary>
    public class BindableType : INotifyPropertyChanged
    {
        public BindableType() : this(null)
        {
        }
        public BindableType(BindableType parent)
        {
            SuspendChangeNotification = false;
            ChangeBehaviors = new List<IPropertyChangedBehavior> { 
                new NotifyPropertyBehavior(this, s => OnPropertyChanged(s)) 
            };
            if (parent != null)
            {
                parent.ChangeBehaviors.ForEach(b => ChangeBehaviors.Add(b));
            }
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
            Set(ref local, newVal, Member.Of(member));
        }
        private void Set<T>(ref T local, T newVal, string name)
        {
            T localCopy = local;

            //if( typeof(T).GetCustomAttributes(true).Count(a=> a is IdAttribute) >= 1) //TODO use IdAttribute
            if (name == "Id" && typeof(T) == typeof(string) && !newVal.Equals(local))
            {
                IdManager.FreeId(localCopy as string);
                IdManager.DeclareId(newVal as string);
            }

            local = newVal;

            CallChangeBehaviors(localCopy, newVal, name);
            //if (null != ChangeBehaviors)
            //{
            //    foreach (var behavior in ChangeBehaviors)
            //    {
            //        bool @continue = behavior.PropertyChanged(this, localCopy, newVal, name);
            //        if (!@continue) { break; }
            //    }
            //}
            //else
            //{
            //    //no behaviors, just carry on with the old way
            //    OnPropertyChanged(name);
            //}
        }

        protected void RaisePropertyChanged<T>(T oldVal, T newVal, Expression<Func<object>> member)
        {
            CallChangeBehaviors(oldVal, newVal, Member.Of(member));
        }
        private void CallChangeBehaviors<T>(T oldVal, T newVal, string name)
        {
            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.PropertyChanged(this, oldVal, newVal, name);
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
            local.Add(newItem);

            if (null != ChangeBehaviors)
            {
                foreach (var behavior in ChangeBehaviors)
                {
                    bool @continue = behavior.CollectionChanged(this, NotifyCollectionChangedAction.Add, newItem, name);
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