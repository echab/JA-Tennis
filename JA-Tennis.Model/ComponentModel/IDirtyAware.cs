
namespace JA_Tennis.ComponentModel
{
    // http://www.damonpayne.com/2010/07/06/GreatFeaturesForMVVMFriendlyObjectsPart2NdashChangeDirtyTracking.aspx

    /// <summary>
    /// Capable of storing and notifying Dirty/HasChanged state
    /// </summary>
    public interface IDirtyAware
    {
        bool IsDirty { get; set; }
        bool SuspendChangeNotification { get; set; }
    }
}
