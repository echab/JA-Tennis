using JA_Tennis.Helpers;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("xml")]
    public class TestTournamentSerialization
    {
        [TestMethod]
        public void Save0()
        {
            Tournament t = new Tournament();

            string xml = SerializationHelper.Save(t);

            // see http://xmlunit.sourceforge.net/
            XmlAssert.AreEqual(@"<Tournament xmlns=""http://jatennis.free.fr/schema"">
                </Tournament>"
                , xml, true, null);
        }

        [TestMethod]
        public void Load0()
        {
            string xml = @"<Tournament xmlns=""http://jatennis.free.fr/schema"">
                </Tournament>";

            Tournament t = SerializationHelper.Load<Tournament>(xml);

            Assert.IsNotNull(t);
            Assert.IsNull(t.Id);
            Assert.IsNull(t.Name);
            Assert.IsNull(t.Dates.Min);
            Assert.IsNull(t.Dates.Max);
            Assert.AreEqual(0, t.Players.Count);
            Assert.AreEqual(0, t.Events.Count);
        }

        [TestMethod]
        public void SavePlayer1()
        {
            Tournament t = new Tournament() { Name = " test3", Id = "T3" };
            t.Players.Add(new Player() { Id = "J3", Name = "Toto" });

            string xml = SerializationHelper.Save(t);

            XmlAssert.AreEqual(@"<Tournament xmlns=""http://jatennis.free.fr/schema"" Id=""T3"">
                  <Name> test3</Name>
                  <Players>
                    <Player Id=""J3"" Name=""Toto"" />
                  </Players>
                </Tournament>"
                , xml, true, null);
        }

        [TestMethod]
        public void LoadPlayer1()
        {
            string xml = @"<Tournament xmlns=""http://jatennis.free.fr/schema"" Id=""T3"">
                  <Name>test1</Name>
                  <Players>
                    <Player Id=""J3"" Name=""Toto"" />
                  </Players>
                </Tournament>";

            Tournament t = SerializationHelper.Load<Tournament>(xml);

            Assert.IsNotNull(t);
            Assert.AreEqual("T3",t.Id);
            Assert.AreEqual("test1",t.Name);
            Assert.IsNull(t.Dates.Min);
            Assert.IsNull(t.Dates.Max);
            Assert.AreEqual(1, t.Players.Count);
            Assert.AreEqual("J3", t.Players[0].Id);
            Assert.AreEqual("Toto", t.Players[0].Name);
            Assert.AreEqual(0, t.Events.Count);
        }



        [TestMethod]
        public void SavePlayer2()
        {
            Tournament t = new Tournament() { Name = "test2" };
            t.Players.Add(new Player() { Id = "J1", Name = "Toto" });
            t.Players.Add(new Player() { Id = "J2", Name = "Dudu" });

            string xml = SerializationHelper.Save(t);
            //StringStream ss = new StringStream();
            //t.Save(ss.Stream);
            //string xml = ss.ToString();

            XmlAssert.AreEqual(@"<Tournament xmlns=""http://jatennis.free.fr/schema"">
                  <Name>test2</Name>
                  <Players>
                    <Player Id=""J1"" Name=""Toto"" />
                    <Player Id=""J2"" Name=""Dudu"" />
                  </Players>
                </Tournament>"
                , xml, true, null);
        }


        [TestMethod]
        public void SaveDates1()
        {
            Tournament t = new Tournament();
            t.Dates.Min = new DateHour("1971/5/24");
            t.Dates.Max = new DateHour("1978/3/19");

            StringStream ss = new StringStream();
            t.Save(ss.Stream);
            string xml = ss.ToString();

            XmlAssert.AreEqual(@"<Tournament DateMin=""1971/5/24"" DateMax=""1978/3/19"" xmlns=""http://jatennis.free.fr/schema"">
                </Tournament>"
                , xml, true, null);
        }

        [TestMethod]
        public void LoadDates1()
        {
            string xml = @"<Tournament DateMin=""1971/5/24"" DateMax=""1978/3/19"" xmlns=""http://jatennis.free.fr/schema"">
                </Tournament>";

            Tournament t = SerializationHelper.Load<Tournament>(xml);

            Assert.IsNotNull(t);
            Assert.AreEqual("1971/5/24", t.Dates.Min.ToString());
            Assert.AreEqual("1978/3/19", t.Dates.Max.ToString());
        }
    }
}
