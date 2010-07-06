using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq.Expressions;

namespace JA_Tennis.Helpers
{
    public abstract class NotifyPropertyChangedBase : INotifyPropertyChanged
    {
    
       public event PropertyChangedEventHandler PropertyChanged;

       [DebuggerStepThrough]
       protected void RaisePropertyChanged(string propertyname)
       {
            var handler = PropertyChanged;
            if (handler != null) {
                handler(this, new PropertyChangedEventArgs(propertyname));
            }
       }

       [DebuggerStepThrough]
       protected void RaisePropertyChanged(Expression<Func<object>> member)
       {
           RaisePropertyChanged(Member.Of(member));
       }
    }

    //TODO: Use WeakEventSourceBase to avoid memory leaks
    // http://blog.thekieners.com/2010/02/11/simple-weak-event-listener-for-silverlight/
    // http://blog.thekieners.com/2010/02/17/weakeventsource-implementation-2/
}
