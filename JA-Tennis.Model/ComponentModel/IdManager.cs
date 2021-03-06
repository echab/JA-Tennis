﻿using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace JA_Tennis.ComponentModel
{
    public class IdException : Exception
    {
        public IdException(string message) : base(message) { }
    }

    /// <summary>
    /// Centralize Id uniqueness management
    /// </summary>
    public class IdManager
    {
#if DEBUG
        //For debug, keep trace of the creation of each Id
        private Dictionary<string, StackTrace> Ids = new Dictionary<string, StackTrace>();
#else
        private Collection<string> Ids = new Collection<string>();
#endif

        [DebuggerStepThrough]   //to disable debug breakpoint on test with ExpectedException.
        public void DeclareId(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) { return; }

#if DEBUG
            if (Ids.ContainsKey(id))
            {
                StackTrace stackTrace = Ids[id];
                throw new IdException(string.Format("Duplicated id [{0}], allready declared at:\n{1}", id, stackTrace.ToString()));
            }
            Ids.Add(id, new StackTrace());
#else
            if (Ids.Contains(id))
            {
                throw new IdException(string.Format("Duplicated id: [{0}]", id));
            }
            Ids.Add(id);
#endif
        }

        public void DeclareId(IIdentifiable obj)
        {
            DeclareId(obj.Id);
        }

        public void FreeId(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) { return; }

#if DEBUG
            if (!Ids.ContainsKey(id))
#else
            if (!Ids.Contains(id))
#endif
            {
                throw new IdException(string.Format("Invalid id: [{0}]", id));
            }

            Ids.Remove(id);
        }
        public void FreeId(IIdentifiable obj)
        {
            FreeId(obj.Id);
        }


        public string CreateId(string prefix)
        {
            string id;

            Random rand = new Random(DateTime.Now.Millisecond);
            do
            {
                id = string.Format("{0}{1:X}", prefix ?? "", rand.Next(0, 0xFFFF));
            }
#if DEBUG
            while (Ids.ContainsKey(id));
#else
            while (Ids.Contains(id));
#endif

            //#if DEBUG
            //            Ids.Add(id, new StackTrace());
            //#else
            //            Ids.Add(id);
            //#endif

            return id;
        }

        public bool Contains(string id)
        {
#if DEBUG
            return Ids.ContainsKey(id);
#else
            return Ids.Contains(id);
#endif
        }
    }
}
