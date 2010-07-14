using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.IO;
using System.Xml.Serialization;
using JA_Tennis.Helpers;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.Model
{
    public class Tournament : BindableType, IIdentifiable  //NotifyPropertyChangedBase //:IXmlSerializable
    {
        public Tournament()
        {
            //Players = new ObservableCollection<Player>();
            Players = new PlayerCollection();

            Players.CollectionChanged += Players_CollectionChanged;
        }

        private string _Id;
        [XmlAttribute]
        [Id]
        public string Id
        {
            get { return _Id; }
            set
            {
                //IdManager.FreeId(_Id);
                //IdManager.DeclareId(value);

                Set(ref _Id, value, () => Id);
            }
        }

        private string _Name;
        public string Name
        {
            get { return _Name; }
            set { Set(ref _Name, value.Trim(), () => Name); }
        }

        //public ObservableCollection<Player> Players { get; private set; }
        public PlayerCollection Players { get; private set; }


        #region Serialization
        public const string Namespace = @"http://jatennis.free.fr/schema";

        public static Tournament Open(Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Tournament), Tournament.Namespace);
            stream.Position = 0;
            Tournament tournament = (Tournament)serializer.Deserialize(stream);
            return tournament;
        }

        public bool Save(Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Tournament), Tournament.Namespace);
            XmlSerializerNamespaces namespaces = new XmlSerializerNamespaces();
            namespaces.Add(String.Empty, Tournament.Namespace);
            stream.Position = 0;
            serializer.Serialize(stream, this, namespaces);
            stream.SetLength(stream.Position);  //Truncate
            //stream.Flush();
            return true;
        }
        #endregion Serialization

        void Players_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            //TODO: Tournamenent players collection changed, manage dependencies (registrations, matches, etc.)
            switch (e.Action)
            {
                case NotifyCollectionChangedAction.Add:
                    break;
                case NotifyCollectionChangedAction.Remove:
                    break;
                case NotifyCollectionChangedAction.Replace:
                    break;
                case NotifyCollectionChangedAction.Reset:
                    break;
            }
        }

        /*
                #region IXmlSerializable Members

                public XmlSchema GetSchema()
                {
                    throw new System.NotImplementedException();
                }

                public void ReadXml(XmlReader reader)
                {
                    reader.ReadStartElement("Tournament", Tournament.Namespace);

                    reader.ReadStartElement("Name", Tournament.Namespace);
                    Name = reader.ReadContentAsString();
                    reader.ReadEndElement();

                    reader.ReadStartElement("Players", Tournament.Namespace);
            
                    var serializer = new XmlSerializer(typeof(Player), Tournament.Namespace);
                    while (reader.IsStartElement("Player", Tournament.Namespace))
                    {
                        Player player = (Player)serializer.Deserialize(reader.ReadSubtree());
                        this.Players.Add(player);
                        reader.ReadStartElement();
                    }

                    reader.ReadEndElement();    //Players

                    reader.ReadEndElement();    //Tournament
                }

                public void WriteXml(XmlWriter writer)
                {
                    writer.WriteElementString("Name", Tournament.Namespace, Name);

                    writer.WriteStartElement("Players", Tournament.Namespace);

                    var serializer = new XmlSerializer(typeof(Player), Tournament.Namespace);
                    XmlSerializerNamespaces namespaces = new XmlSerializerNamespaces();
                    namespaces.Add(String.Empty, Tournament.Namespace);
                    foreach (Player player in Players)
                    {
                        serializer.Serialize(writer, player, namespaces);
                    }

                    writer.WriteEndElement();    //Players
                }
                #endregion
         //*/

        #region IDisposable Members

        public void Dispose()
        {
            IdManager.FreeId(this);
        }

        #endregion

#if DEBUG
        public override string ToString()
        {
            return string.Format("[{0}] {1}", Id, Name);
        }
#endif //DEBUG
    }
}
