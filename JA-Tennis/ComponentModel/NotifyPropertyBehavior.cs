using System;
using System.ComponentModel;

namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/06/20/GreatFeaturesForMVVMFriendlyObjectsPart1IntroducingPropertyChangeBehaviors.aspx

    public class NotifyPropertyBehavior : IPropertyChangedBehavior
    {
        public NotifyPropertyBehavior(INotifyPropertyChanged target, Action<string> changedCallback)
        {
            //Requires.NotNull(target, "target cannot be null");  //MEF
            if (target == null) { throw new ArgumentNullException("target cannot be null"); }
            //Requires.NotNull(changedCallback, "changedCallback cannot be null");
            if (changedCallback == null) { throw new ArgumentNullException("changedCallback cannot be null"); }

            Target = target;
            ChangeCallback = changedCallback;
        }

        public INotifyPropertyChanged Target { get; set; }

        /// <summary>
        /// Needed since only the owning instance can fire the event
        /// </summary>
        public Action<string> ChangeCallback { get; set; }


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
                ChangeCallback(propertyName);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
