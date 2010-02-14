using System.Collections.Generic;
using System.Xml.Serialization;
using System.IO;

namespace JA_Tennis.Model
{
    public class Tournament
    {
        public string Name { get; set; }

        public Tournament() {
            _Players =  new List<Player>();
        }
        
        public static Tournament Open(Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Tournament));
            Tournament tournament = (Tournament)serializer.Deserialize(stream);
            return tournament;
        }

        public bool Save(Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Tournament));
            serializer.Serialize(stream, this);
            return true;
        }

        #region Players
        //[XmlElement("Player")]
        [XmlArray("Players")]
        public List<Player> _Players {get; set;} 
        public IEnumerable<Player> Players { get { return _Players; } }

        public bool AddPlayer(Player player)
        {
            _Players.Add(player);
            return true;
        }

        public bool RemovePlayer(Player player)
        {
            //TODO: manage dependencies (registrations, matches, etc.)
            return _Players.Remove(player);
        }
        #endregion Players
    }
}
