using System.IO;
using System.Xml;

namespace JA_Tennis_UnitTest
{
    public class StringStream
    {
        public StringStream() { }

        public StringStream(string source)
        {
            Stream.Position = 0;
            StreamWriter writer = new StreamWriter( Stream);
            writer.Write(source);
            writer.Flush();
            Stream.SetLength( Stream.Position);
        }

        MemoryStream _stream;
        public Stream Stream
        {
            get
            {
                if (_stream == null) { _stream = new MemoryStream(); }
                return _stream;
            }
        }

        public static implicit operator string(StringStream s)
        {
            return s.ToString();
        }

        public static implicit operator Stream(StringStream s)
        {
            return s.Stream;
        }

        public static implicit operator XmlReader(StringStream s)
        {
            return XmlReader.Create( s.Stream);
        }

        public override string ToString()
        {
            StreamReader reader = null;
            Stream.Position = 0;
            reader = new StreamReader(Stream);
            return reader.ReadToEnd();
        }
    }
}
