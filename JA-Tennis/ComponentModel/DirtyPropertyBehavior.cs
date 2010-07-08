using System;
using System.Collections.Generic;

namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/07/06/GreatFeaturesForMVVMFriendlyObjectsPart2NdashChangeDirtyTracking.aspx

    public class DirtyPropertyBehavior : IPropertyChangedBehavior
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="owningInstance"></param>
        public DirtyPropertyBehavior(IDirtyAware owningInstance)
            : this(owningInstance, new List<string>() { "IsDirty" })
        {

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="owningInstance"></param>
        /// <param name="exclusions"></param>
        public DirtyPropertyBehavior(IDirtyAware owningInstance, List<string> exclusions)
        {
            _owner = owningInstance;
            _propertyExclusions = exclusions;
        }

        IDirtyAware _owner;
        List<string> _propertyExclusions;

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="owningInstance"></param>
        /// <param name="oldVal"></param>
        /// <param name="newVal"></param>
        /// <param name="propertyName"></param>
        /// <returns></returns>
        public bool PropertyChanged<T>(object owningInstance, T oldVal, T newVal, string propertyName)
        {
            if (!Object.Equals(oldVal, newVal)
                && !_propertyExclusions.Contains(propertyName)
                && !_owner.SuspendChangeNotification)
            {
                _owner.IsDirty = true;
            }
            return true;
        }
    }
}
