using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;

namespace JA_Tennis.Model
{
    [XmlType(IncludeInSchema=false)]
    public class Player : NotifyPropertyChangedBase //, IXmlSerializable
    {
        string _Id;
        [XmlAttribute]
        public string Id {
            get { return _Id; }
            set { _Id = value; FirePropertyChanged("Id"); } 
        }

        string _Name;
        [XmlAttribute]
        public string Name {
            get { return _Name; }
            set { _Name = value; FirePropertyChanged("Name"); } 
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
    }
}
