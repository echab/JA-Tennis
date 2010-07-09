using System.IO;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass]
    public class TestTournamentSerialization
    {
        [TestMethod]
        [Tag("xml")]
        public void SerializationToXml()
        {
            StringStream ss = new StringStream();

            Tournament t = new Tournament() { Name = "test2" };
            t.Players.Add(new Player() { Id = "J1", Name = "Toto" });
            t.Players.Add(new Player() { Id = "J2", Name = "Dudu" });

            t.Save(ss.Stream);
            string sXml = ss.ToString();

            // see http://xmlunit.sourceforge.net/
            XmlAssert.AreEqual(@"<Tournament xmlns=""http://jatennis.free.fr/schema"">
                  <Name>test2</Name>
                  <Players>
                    <Player Id=""J1"" Name=""Toto"" />
                    <Player Id=""J2"" Name=""Dudu"" />
                  </Players>
                </Tournament>"
                , sXml, true, null);



            t = new Tournament() { Name = " test3", Id="T3" };
            t.Players.Add(new Player() { Id = "J1", Name = "Toto" });

            t.Save(ss.Stream);
            sXml = ss.ToString();
            
            // see http://xmlunit.sourceforge.net/
            XmlAssert.AreEqual(@"<Tournament xmlns=""http://jatennis.free.fr/schema"" Id=""T3"">
                  <Name> test3</Name>
                  <Players>
                    <Player Id=""J1"" Name=""Toto"" />
                  </Players>
                </Tournament>"
                , sXml, true, null);
        }

    }



    public class StringStream 
    {
        MemoryStream _stream ;
        public Stream Stream
        {
            get {
                if (_stream == null) { _stream = new MemoryStream(); }
                return _stream;
            }
        }

        public override string ToString()
        {
            StreamReader reader = null;
            _stream.Position = 0;
            reader = new StreamReader(_stream);
            return reader.ReadToEnd();
        }
    }
}
