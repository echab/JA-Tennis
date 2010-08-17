using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Xml.Serialization;
using System.Xml.Schema;
using System.Xml;

namespace JA_Tennis.ComponentModel
{
    public class IdRefs<T> : ObservableCollection<T> where T : IIdentifiable //, IXmlSerializable
    {
        string _DeferedIds;

        #region Constructor
        public IdRefs()  //For serialization only
        {
        }

        public IdRefs(IEnumerable<T> idsSource)
        {
            _IdsSource = idsSource;

            if (idsSource == null)
            {
                throw new ArgumentNullException("idsSource");
            }

        }

        [DebuggerStepThrough]
        public IdRefs(IEnumerable<T> idsSource, string ids)
        {
            _IdsSource = idsSource;

            InitFromIds(ids);
        }
        #endregion Constructor


        #region IdsSource property
        IEnumerable<T> _IdsSource;
        public IEnumerable<T> IdsSource
        {
            get { return _IdsSource; }
            [DebuggerStepThrough]
            set
            {
                if (_IdsSource == null)
                {
                    _IdsSource = value;
                    if (_DeferedIds != null)
                    {
                        InitFromIds(_DeferedIds);
                    }
                }
            }
        }
        #endregion IdsSource


        /*#region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            string ids = reader.ReadElementContentAsString();

            this.Clear();

            if (_IdsSource != null)
            {
                FindIds(ids);
            }
            else
            {
                _DeferedIds = ids;
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            string s = (string)this;

            if (!string.IsNullOrWhiteSpace(s))
            {
                writer.WriteString(s);
            }
        }

        #endregion
        //*/

        [DebuggerStepThrough]
        public void InitFromIds(string ids)
        {
            this.Clear();

            if (_IdsSource != null)
            {
                var refs = ids.Split(' ');
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

                _DeferedIds = null;
            }
            else
            {
                _DeferedIds = ids;
            }
        }


        public static implicit operator string(IdRefs<T> refs)
        {
            string s = null;

            if (refs._DeferedIds != null)
            {
                s = refs._DeferedIds;
            }
            else
            {
                if (refs.Count > 0)
                {
                    s = refs.Select(e => e.Id).Aggregate((a, b) => a + " " + b);
                }
            }
            return s;
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
