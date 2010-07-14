using System;
using System.Collections.Generic;
using JA_Tennis.Helpers;

namespace JA_Tennis.ComponentModel
{
    /// <summary>
    /// Enable nice using(){} semantics for setting property values without firing Dirty state behaviors
    /// </summary>
    public class SuspendDirtyContext : IDisposable
    {
        public SuspendDirtyContext(IDirtyAware target)
            : this(new List<IDirtyAware> { target })
        {
        }

        public SuspendDirtyContext(IEnumerable<IDirtyAware> targets)
        {
            _targets = targets;
            int index = 0;
            _previousValues = new bool[_targets.Count()];
            _targets.ForEach(d =>
            {
                _previousValues[index] = d.SuspendChangeNotification;
                d.SuspendChangeNotification = true;
                ++index;
            });
        }

        IEnumerable<IDirtyAware> _targets;
        bool[] _previousValues;

        public void Dispose()
        {
            int index = 0;
            _targets.ForEach(d =>
            {
                d.SuspendChangeNotification = _previousValues[index];
                ++index;
            });
        }

        //public void usage() {
        //    JA_Tennis.Model.Player player = new JA_Tennis.Model.Player();
        //    using( new SuspendDirtyContext( player)) {
        //        player.Id="J1";
        //        player.Name="Toto";
        //    }
        //    Assert.IsFalse( player.IsDirty);
        //}
    }
}