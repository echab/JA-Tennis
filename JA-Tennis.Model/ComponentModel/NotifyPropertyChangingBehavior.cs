
using System;
using System.ComponentModel;
using System.Collections.Specialized;

namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/06/20/GreatFeaturesForMVVMFriendlyObjectsPart1IntroducingPropertyChangeBehaviors.aspx

    public class NotifyPropertyChangingBehavior<TValue> : IPropertyChangedBehavior
    {
        public NotifyPropertyChangingBehavior(INotifyPropertyChanged target, Action<string, object, object> changingCallback)
        {
            //Requires.NotNull(target, "target cannot be null");  //MEF
            if (target == null) { throw new ArgumentNullException("target cannot be null"); }
            //Requires.NotNull(changedCallback, "changedCallback cannot be null");
            if (changingCallback == null) { throw new ArgumentNullException("changedCallback cannot be null"); }

            Target = target;
            ChangingCallback = changingCallback;
        }

        public INotifyPropertyChanged Target { get; set; }

        /// <summary>
        /// Needed since only the owning instance can fire the event
        /// </summary>
        public Action<string, object, object> ChangingCallback { get; set; }


        /// <summary>
        /// Fire change notification only if the new value != old
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="owningInstance"></param>
        /// <param name="oldVal"></param>
        /// <param name="newVal"></param>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        public bool PropertyChanged<T>(object owningInstance, T oldVal, T newVal, string propertyName)
        {
            if (!Object.Equals(oldVal, newVal))
            {
                ChangingCallback(propertyName, oldVal, newVal);
                return true;
            }
            else
            {
                return false;
            }
        }

        public bool CollectionChanged<T>(object owningInstance, NotifyCollectionChangedAction changedAction, T item, string propertyName)
        {
            //TODO Notify CollectionChanged ?
            return true;
        }

    }
}
