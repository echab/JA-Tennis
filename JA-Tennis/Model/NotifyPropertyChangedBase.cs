using System.ComponentModel;

namespace JA_Tennis.Model
{
    public abstract class NotifyPropertyChangedBase : INotifyPropertyChanged
    {
    
       public event PropertyChangedEventHandler PropertyChanged;
    
       protected void FirePropertyChanged(string propertyname)
       {
            var handler = PropertyChanged;
            if (handler != null) {
                handler(this, new PropertyChangedEventArgs(propertyname));
            }
       }
    }

    //TODO: Use WeakEventSourceBase to avoid memory leaks
    // http://blog.thekieners.com/2010/02/11/simple-weak-event-listener-for-silverlight/
    // http://blog.thekieners.com/2010/02/17/weakeventsource-implementation-2/
}
