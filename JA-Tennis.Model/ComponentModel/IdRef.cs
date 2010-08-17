using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace JA_Tennis.ComponentModel
{
    //TODO use WeakReference

    public class IdRef<T> where T : IIdentifiable //: IXmlSerializable 
    {
        T _InstanceCache;

        #region Constructor
        //public IdRef() {} //For serialization only

        [DebuggerNonUserCode]
        public IdRef(string id, IEnumerable<T> idsSource)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentNullException("id");
            }

            _Id = id.Trim();
            _IdsSource = idsSource;

            if (_IdsSource != null && _Id != null &&  InstanceById(_Id) == null)
            {
                throw new ArgumentException("Id not found in IdsSource", "id");
            }
        }

        [DebuggerNonUserCode]
        public IdRef(T obj, IEnumerable<T> idsSource)
        {
            if (string.IsNullOrWhiteSpace(obj.Id))
            {
                throw new ArgumentNullException("Id");
            }

            _Id = obj.Id;
            _InstanceCache = obj;
            _IdsSource = idsSource;

            if (_IdsSource != null && InstanceById(obj.Id) == null)
            {
                throw new ArgumentException("Object not found in IdsSource", "obj");
            }
        }
        #endregion Constructor


        #region Id property
        string _Id;
        public string Id
        {
            get { return _Id; }
            set
            {
                _Id = value.Trim();
                _InstanceCache = default(T);
            }
        }
        #endregion Id


        #region IdsSource property
        IEnumerable<T> _IdsSource;
        public IEnumerable<T> IdsSource
        {
            get { return _IdsSource; }
            [DebuggerNonUserCode]
            set
            {
                _IdsSource = value;
                if (_InstanceCache != null && InstanceById(Id) == null)
                {
                    throw new ArgumentException(string.Format("Id not found in IdsSource [{0}]", Id));
                }
            }
        }
        #endregion IdsSource


        [DebuggerNonUserCode]
        private T InstanceById(string id)
        {
            T instance = default(T);

            if (_IdsSource == null)
            {
                throw new NullReferenceException("IdsSource");
            }

            instance = _IdsSource.FirstOrDefault(o => o.Id == id);

            return instance;
        }

        [DebuggerNonUserCode]
        public static implicit operator T(IdRef<T> idRef)
        {
            if (idRef._InstanceCache == null)
            {
                idRef._InstanceCache = idRef.InstanceById(idRef.Id);

                if (idRef._InstanceCache == null)
                {
                    throw new Exception(string.Format("Id reference not found [{0}]", idRef.Id));
                }
            }
            else
            {
                if (idRef.Id != idRef._InstanceCache.Id)
                {
                    throw new Exception(string.Format("Cached Id mismatch. Id={0} cache={1}", idRef.Id, idRef._InstanceCache.Id));
                }
            }

            return idRef._InstanceCache;
        }

        public static implicit operator IdRef<T>(T obj)
        {
            return obj != null ? new IdRef<T>(obj, null) : null;
        }


        /* #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            string id = reader.ReadElementContentAsString();

            InitFromId(id);
        }

        public void WriteXml(XmlWriter writer)
        {
            string s;

            if (_DeferedId != null)
            {
                s = _DeferedId;
            }
            else
            {
                s = _Instance.Id;
            }

            writer.WriteString(s);
        }

        #endregion
        //*/

        public static implicit operator string(IdRef<T> idRef)
        {
            return idRef.Id;
        }

        public static implicit operator IdRef<T>(string id)
        {
            return new IdRef<T>(id, null);
        }

#if DEBUG
        public override string ToString()
        {
            return string.Format("Ref {0}", _InstanceCache == null ? _Id : _InstanceCache.ToString());
        }
#endif
    }
}
