using System;
using System.IO;
using System.Xml.Serialization;
using JA_Tennis.Model;
using JA_Tennis.Helpers;
using System.Xml;

namespace JA_Tennis_UnitTest
{
    public static class SerializationHelper
    {
        public static void Load<T>(out T obj, Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T), Tournament.Namespace);
            stream.Position = 0;
            obj = (T)serializer.Deserialize(stream);
        }

        public static void Read<T>(ref T obj, Stream stream) where T:IXmlSerializable
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T), Tournament.Namespace);
            stream.Position = 0;
            //obj = (T)serializer.Deserialize(stream);
            XmlReaderSettings readerSettings = new XmlReaderSettings();
            
            obj.ReadXml( XmlReader.Create( stream, readerSettings));
        }

        public static T Load<T>(string s)
        {
            StringStream stream = new StringStream(s);
            //XmlSerializer serializer = new XmlSerializer(typeof(T), Tournament.Namespace);
            //T result = (T)serializer.Deserialize((Stream)stream);
            T result;
            Load(out result, stream);
            return result;
        }

        public static void Load<T>(ref T result, string s) where T : IXmlSerializable
        {
            StringStream stream = new StringStream(s);
            //XmlSerializer serializer = new XmlSerializer(typeof(T), Tournament.Namespace);
            //T result = (T)serializer.Deserialize((Stream)stream);
            //Load(out result, stream);
            Read(ref result, stream);
        }

        public static void Save<T>(T obj, Stream stream)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T), Tournament.Namespace);
            XmlSerializerNamespaces namespaces = new XmlSerializerNamespaces();
            namespaces.Add(String.Empty, Tournament.Namespace);
            stream.Position = 0;
            serializer.Serialize(stream, obj, namespaces);
            stream.SetLength(stream.Position);  //Truncate
            //stream.Flush();
        }

        public static string Save<T>(T obj)
        {
            StringStream stream = new StringStream();
            Save(obj, stream);
            return stream.ToString();
        }

    }
}
