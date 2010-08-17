using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.IO;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;

namespace JA_Tennis.Model
{
    public class Tournament : BindableType, IIdentifiable, IXmlSerializable
    {
        #region Constructor
        public Tournament()
        {
            IdManager = new IdManager();

            Dates = new Range<DateHour>(null, null, this);

            Players = new ObservableCollection<Player>();
            //Players = new PlayerCollection();
            Players.CollectionChanged += Players_CollectionChanged;

            Events = new ObservableCollection<Event>();
            Events.CollectionChanged += Events_CollectionChanged;
        }
        #endregion Constructor

        public readonly IdManager IdManager;    // { get; private set; }

        #region Id property
        private string _Id;
        [XmlAttribute]
        public string Id
        {
            get { return _Id; }
            set
            {
                IdManager.FreeId(_Id);
                IdManager.DeclareId(value);

                Set(ref _Id, value, () => Id);
            }
        }
        #endregion


        #region Name property
        private string _Name;
        public string Name
        {
            get { return _Name; }
            set { Set(ref _Name, value != null ? value.Trim() : null, () => Name); }
        }
        #endregion


        #region Dates property
        Range<DateHour> _Dates;
        public Range<DateHour> Dates
        {
            get { return _Dates; }
            private set { Set(ref _Dates, value, () => Dates); }
        }
        #endregion Dates


        #region Players collection
        public ObservableCollection<Player> Players { get; private set; }

        void Players_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            //TODO: undo
            //TODO: Tournament players collection changed, manage dependencies (registrations, matches, etc.)
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
        #endregion


        #region Events collection
        public ObservableCollection<Event> Events { get; private set; }

        void Events_CollectionChanged(object sender, NotifyCollectionChangedEventArgs e)
        {
            //TODO: Tournament players collection changed, manage dependencies (registrations, matches, etc.)
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
        #endregion


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


        #region IDisposable Members

        public void Dispose()
        {
            IdManager.FreeId(this);
        }

        #endregion


        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }


        public void ReadXml(XmlReader reader)
        {
            if (reader.IsStartElement("Tournament"))
            {
                Id = reader.GetAttribute("Id");
                //Name = reader.GetAttribute("Name");

                Dates.Min = reader.GetAttribute("DateMin");
                Dates.Max = reader.GetAttribute("DateMax");

                if (!reader.IsEmptyElement)
                {
                    while (reader.NodeType != XmlNodeType.EndElement)
                    {
                        reader.Read();

                        if (reader.IsStartElement("Name"))
                        {
                            Name = reader.ReadElementContentAsString();
                        }

                        if (reader.IsStartElement("Players"))
                        {
                            reader.Read();

                            while (reader.IsStartElement("Player"))
                            {
                                XmlSerializer xPlayer = new XmlSerializer(typeof(Player), Tournament.Namespace);
                                Player player = (Player)xPlayer.Deserialize(reader);
                                Players.Add(player);

                                reader.Read();
                            }
                        }

                        if (reader.IsStartElement("Events"))
                        {
                            reader.Read();

                            while (reader.IsStartElement("Event"))
                            {
                                XmlSerializer xEvent = new XmlSerializer(typeof(Event), Tournament.Namespace);
                                Event _event = (Event)xEvent.Deserialize(reader);
                                Events.Add(_event);

                                reader.Read();
                            }
                        }
                    }
                    reader.ReadEndElement();
                }
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            if (Id != null)
            {
                writer.WriteAttributeString("Id", Id);
            }
            //if (Name != null)
            //{
            //    writer.WriteAttributeString("Name", Name);
            //}

            if (Dates != null)
            {
                if (Dates.Min != null)
                {
                    writer.WriteAttributeString("DateMin", Dates.Min);
                }
                if (Dates.Max != null)
                {
                    writer.WriteAttributeString("DateMax", Dates.Max);
                }
            }

            if (Name != null)
            {
                writer.WriteElementString("Name", Name);
            }

            if (Players.Count > 0)
            {
                writer.WriteStartElement("Players");

                XmlSerializer xPlayer = new XmlSerializer(typeof(Player), Tournament.Namespace);
                foreach (Player player in Players)
                {
                    xPlayer.Serialize(writer, player);
                }

                writer.WriteEndElement();
            }

            if (Events.Count > 0)
            {
                writer.WriteStartElement("Events");

                XmlSerializer xEvent = new XmlSerializer(typeof(Event), Tournament.Namespace);
                foreach (Event _event in Events)
                {
                    xEvent.Serialize(writer, _event);
                }

                writer.WriteEndElement();
            }
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
