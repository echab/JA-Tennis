using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Linq;

namespace JA_Tennis.ComponentModel
{
    //TODO use WeakReference or Lazy

    public class IdRefs<T> : ObservableCollection<T> where T : IIdentifiable //, IXmlSerializable
    {
        #region Constructor
        //public IdRefs() {} //For serialization only

        [DebuggerStepThrough]
        public IdRefs(string ids, IEnumerable<T> idsSource)
        {
            //if (string.IsNullOrWhiteSpace(ids))
            //{
            //    throw new ArgumentNullException("ids");
            //}

            _Ids = ids;

            IdsSource = idsSource;

            this.CollectionChanged += IdRefs_CollectionChanged;
        }
        #endregion Constructor


        #region Ids property
        string _Ids;
        public string Ids
        {
            get
            {
                if (_Ids == null && Count > 0)
                {
                    _Ids = this.Select(e => e.Id).Aggregate((a, b) => a + " " + b);
                }

                return _Ids;
            }
            set
            {
                if (value == _Ids) { return; }

                if (_Ids == null)
                {
                    Clear();
                }

                _Ids = value;

                //Clear();
                if (_Ids != null && _IdsSource != null)
                {
                    InitFromIds(_Ids);
                }
            }
        }
        #endregion Ids


        #region IdsSource property
        IEnumerable<T> _IdsSource;
        public IEnumerable<T> IdsSource
        {
            get { return _IdsSource; }
            [DebuggerStepThrough]
            set
            {
                if (value == _IdsSource) { return; }

                if (_IdsSource == null && _Ids != null)
                {
                    _IdsSource = value;

                    InitFromIds(_Ids);
                }
                else
                {
                    _IdsSource = value;
                }

                foreach (T item in this)
                {
                    if (!_IdsSource.Contains(item))
                    {
                        throw new ArgumentException(string.Format("Id [{0}] not found in IdsSource", item.Id));
                    }
                }
            }
        }
        #endregion IdsSource


        [DebuggerStepThrough]
        protected void InitFromIds(string ids)
        {
            Clear();

            if (_IdsSource == null)
            {
                throw new NullReferenceException("IdsSource");
            }

            var refs = ids.Trim().Split(' ');
            foreach (string r in refs)
            {
                if (string.IsNullOrWhiteSpace(r)) { continue; }

                T obj = _IdsSource.FirstOrDefault(o => o.Id == r);
                if (obj == null)
                {
                    throw new Exception(string.Format("Bad reference id [{0}]", r));
                }
                this.Add(obj);
            }
        }


        [DebuggerStepThrough]
        void IdRefs_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            _Ids = null;

            if (e.NewItems != null)
            {
                if (_IdsSource != null)
                {
                    foreach (T item in e.NewItems)
                    {
                        if (!_IdsSource.Contains(item))
                        {
                            throw new Exception(string.Format("Id [{0}] not found in IdsSource", item.Id));
                        }
                    }
                }
            }
        }


        public static implicit operator string(IdRefs<T> idRefs)
        {
            return idRefs.Ids;
        }

        public static implicit operator IdRefs<T>(string ids)
        {
            return new IdRefs<T>(ids, null);
        }

#if DEBUG
        public override string ToString()
        {
            string s = this.Select(e => e.ToString()).Aggregate((a, b) => a + ", " + b);
            return string.Format("Refs {0}", s);
        }
#endif
    }
}
