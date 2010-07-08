
namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/06/20/GreatFeaturesForMVVMFriendlyObjectsPart1IntroducingPropertyChangeBehaviors.aspx

    public interface IPropertyChangedBehavior
    {
        /// <summary>
        /// Do something useful when a property changes
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="owningInstance">Object instance whose property has changed</param>
        /// <param name="oldVal">current property value</param>
        /// <param name="newVal">new property value</param>
        /// <param name="propertyName"></param>
        /// <returns>Returns true of more behaviors can keep processing</returns>
        bool PropertyChanged<T>(object owningInstance, T oldVal, T newVal, string propertyName);
    }
}
