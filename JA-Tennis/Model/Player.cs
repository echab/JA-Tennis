using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.Helpers;
using System.ComponentModel;
using System.Collections;
using System;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.Model
{
    [XmlType(IncludeInSchema = false)]
    public class Player : BindableType, INotifyDataErrorInfo, IDirtyAware //NotifyPropertyChangedBase //, IXmlSerializable
    {
        public Player()
        {
            _errMgr = new ValidationErrorManager(this, s => OnErrorsChanged(s));

            ChangeBehaviors.Add(new DirtyPropertyBehavior(this));
        }

        private string _Id;
        [XmlAttribute]
        public string Id
        {
            get { return _Id; }
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    _errMgr.AddError(Member.Of(() => Id), "Id cannot be empty");
                }
                else
                {
                    _errMgr.ClearErrors(Member.Of(() => Id));
                }

                Set<string>(ref _Id, value, () => Id);
            }
        }

        private string _Name;
        [XmlAttribute]
        public string Name
        {
            get { return _Name; }
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                {
                    _errMgr.AddError(Member.Of(() => Name), "Name cannot be empty");
                }
                else
                {
                    _errMgr.ClearErrors(Member.Of(() => Name));
                }

                Set<string>(ref _Name, value.Trim(), () => Name);
            }
        }

        /*
        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            if (reader.IsStartElement("Player"))
            {
                Id = reader.GetAttribute("Id");
                Name = reader.GetAttribute("Name");
                reader.ReadStartElement();
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            writer.WriteAttributeString("Id", Id);
            writer.WriteAttributeString("Name", Name);
        }

        #endregion
        //*/

        #region INotifyDataErrorInfo Members
        ValidationErrorManager _errMgr;

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        public IEnumerable GetErrors(string propertyName) { return _errMgr.GetErrors(propertyName); }

        public bool HasErrors { get { return _errMgr.HasErrors; } }

        private void OnErrorsChanged(string propertyName)
        {
            var handler = ErrorsChanged;
            if (handler != null)
            {
                handler.Invoke(this, new DataErrorsChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region IDirtyAware Members

        [XmlIgnore]
        public bool IsDirty { get; set; }

        #endregion

#if DEBUG
        public override string ToString()
        {
            return string.Format("[{0}] {1}", Id, Name);
        }
#endif //DEBUG

    }
}
