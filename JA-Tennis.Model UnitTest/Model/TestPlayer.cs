using System.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using JA_Tennis.ComponentModel;
using System.Collections.ObjectModel;
using System.Collections.Generic;

namespace JA_Tennis_UnitTest.Model
{
    //TODO: append in tested project AssemblyInfo.cs: [assembly: InternalsVisibleTo("JA-Tenis_UnitTest")]

    [TestClass, Tag("player")]
    public class TestPlayer
    {
        //[TestMethod]
        //[ExpectedException(typeof(NullReferenceException))]
        //public void NullInstance()
        //{
        //    Player player = null;
        //    player.Id = "123";
        //}

        [TestMethod]
        public void Constructor0()
        {
            Player player = new Player();
            Assert.IsNotNull(player);
            Assert.IsNull(player.Id, "Id is null");
            Assert.IsNull(player.Name, "Name is null");
        }

        [TestMethod]
        public void Constructor1()
        {
            Player player = new Player()
            {
                Id = "J2",
                Name = "Toto"
            };
            Assert.IsNotNull(player);
            Assert.AreEqual("J2", player.Id);
            Assert.AreEqual("Toto", player.Name);
        }

        [TestMethod]
        public void Constructor2()
        {
            Tournament t = new Tournament();

            Player player = new Player(t, null)
            {
                Id = "J2",
                Name = "Toto"
            };

            Assert.IsNotNull(player);
            Assert.IsNotNull(player.Tournament);
            Assert.AreEqual("J2", player.Id);
            Assert.AreEqual("Toto", player.Name);
            Assert.IsTrue(t.IdManager.Contains(player.Id));
        }

        //delegate void delegatePropertyChanged(object sender, PropertyChangedEventArgs e);

        [TestMethod]
        public void VerifyNotifyPropertyChanged()
        {
            Player player = new Player()
            {
                Id = "J3",
                Name = "Tutu"
            };

            int nChangeName = 0;
            int nChangeId = 0;
            PropertyChangedEventHandler playerNameChanged = (sender, args) =>
            {
                Assert.AreSame(player, sender);
                Assert.AreEqual("Name", args.PropertyName);
                Assert.AreEqual("Tata", (sender as Player).Name);
                nChangeName++;
            };

            player.PropertyChanged += playerNameChanged;

            player.Name = "Tata";
            Assert.AreEqual(1, nChangeName, "PropertyChanged fire once for Name");

            player.PropertyChanged -= playerNameChanged;

            player.Name = "Toto";
            player.Id = "J4";
            Assert.AreEqual(1, nChangeName, "PropertyChanged does not fire when disconnected for Name");

            PropertyChangedEventHandler playerIdChanged = (sender, args) =>
            {
                Assert.AreSame(player, sender);
                Assert.AreEqual("Id", args.PropertyName);
                Assert.AreEqual("Toto", (sender as Player).Name);
                Assert.AreEqual("J5", (sender as Player).Id);
                nChangeId++;
            };

            player.PropertyChanged += playerIdChanged;

            player.Id = "J5";
            Assert.AreEqual(1, nChangeId, "PropertyChanged fire once for Id");

            player.PropertyChanged -= playerIdChanged;

            player.Name = "Tztz";
            player.Id = "J6";
            Assert.AreEqual(1, nChangeId, "PropertyChanged does not fire when disconnected for Id");

            //object handler = player.PropertyChanged;
            //Assert.IsNull(handler);

            //player.Dispose();   
            player = null;
        }

        //[TestMethod]
        //[Tag("Undo")]
        //public void TestDirty()
        //{
        //    JA_Tennis.Model.Player player = new JA_Tennis.Model.Player();

        //    Assert.IsFalse(player.IsDirty, "IsDirty is initially false");

        //    using (new SuspendDirtyContext(player))
        //    {
        //        player.Id = "J1";
        //        player.Name = "Toto";
        //    }

        //    Assert.IsFalse(player.IsDirty, "IsDirty is false using SuspendDirtyContext");

        //    player.Name = "Tutu";

        //    Assert.IsTrue(player.IsDirty, "IsDirty is true after Name change");
        //}

        [TestMethod]
        public void TestSave1()
        {
            Player Toto = new Player() { Name = "Toto" };

            string s = SerializationHelper.Save(Toto);

            XmlAssert.AreEqual(@"<Player Name=""Toto"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave2()
        {
            Tournament tournoi = new Tournament();
            Event simpleHomme = new Event(tournoi, null)
            {
                Id = "SH",
                Name = "Simple hommes"
            };
            tournoi.Events.Add(simpleHomme);
            Player Toto = new Player(tournoi, null)
            {
                Id = "J1",
                Name = "Toto",
                Rank = new Rank("30/3")
            };
            Toto.Registration.Add(simpleHomme);
            tournoi.Players.Add(Toto);

            string s = SerializationHelper.Save(Toto);

            XmlAssert.AreEqual(@"<Player Id=""J1"" Name=""Toto"" Rank=""30/3"" Registration=""SH"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        }

        [TestMethod]
        public void TestLoad()
        {
            string xml = @"<Player Name=""Toto"" xmlns=""http://jatennis.free.fr/schema""/>";

            Player player = SerializationHelper.Load<Player>(xml);

            Assert.IsNotNull(player);
            Assert.AreEqual(player.Name, "Toto");
        }

        static List<Event> eventSH = new List<Event> {new Event(null, null)
            {
                Id = "SH",
                Name = "Simple hommes"
            }};

        [TestMethod]
        public void TestLoad2()
        {
            string xml = @"<Player Id=""J1"" Name=""Toto"" Rank=""30/3"" Registration=""SH"" xmlns=""http://jatennis.free.fr/schema""/>";

            Player player = SerializationHelper.Load<Player>(xml);

            Assert.IsNotNull(player);
            Assert.AreEqual("J1", player.Id);
            Assert.AreEqual("Toto", player.Name);
            Assert.IsNotNull(player.Rank);
            Assert.AreEqual("30/3", player.Rank.Text);
            Assert.AreEqual("SH", player.Registration.Ids);
            Assert.AreEqual(0, player.Registration.Count);

            player.Registration.IdsSource = eventSH;

            Assert.AreEqual(1, player.Registration.Count);
        }

    }
}