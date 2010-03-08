using System;
using JA_Tennis.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.ComponentModel;

namespace JA_Tennis_UnitTest.Model
{
    //TODO: append in tested project AssemblyInfo.cs: [assembly: InternalsVisibleTo("JA-Tenis_UnitTest")]

    [TestClass]
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
        public void VerifyConstructor()
        {
            Player player = new Player();
            Assert.IsNotNull(player);
            Assert.IsNull(player.Id, "Id is null");
            Assert.IsNull(player.Name, "Name is null");

            player = new Player()
            {
                Id = "J2",
                Name = "Toto"
            };
            Assert.IsNotNull(player);
            Assert.AreEqual("J2",player.Id);
            Assert.AreEqual("Toto",player.Name);
        }

        delegate void delegatePropertyChanged(object sender, PropertyChangedEventArgs e);

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
            delegatePropertyChanged playerNameChanged = (sender, args) =>
            {
                Assert.AreSame(player,sender);
                Assert.AreEqual("Name",args.PropertyName);
                Assert.AreEqual("Tata",(sender as Player).Name);
                nChangeName++;
            };

            player.PropertyChanged += new PropertyChangedEventHandler(playerNameChanged);

            player.Name = "Tata";
            Assert.AreEqual(1, nChangeName,"PropertyChanged fire once for Name");

            player.PropertyChanged -= new PropertyChangedEventHandler(playerNameChanged);

            player.Name = "Toto";
            player.Id = "J4";
            Assert.AreEqual(1, nChangeName, "PropertyChanged does not fire when disconnected for Name");

            delegatePropertyChanged playerIdChanged = (sender, args) =>
            {
                Assert.AreSame(player,sender);
                Assert.AreEqual("Id",args.PropertyName);
                Assert.AreEqual("Toto",(sender as Player).Name);
                Assert.AreEqual("J5",(sender as Player).Id);
                nChangeId++;
            };

            player.PropertyChanged += new PropertyChangedEventHandler(playerIdChanged);

            player.Id = "J5";
            Assert.AreEqual(1, nChangeId, "PropertyChanged fire once for Id");

            player.PropertyChanged -= new PropertyChangedEventHandler(playerIdChanged);

            player.Name = "Tztz";
            player.Id = "J6";
            Assert.AreEqual(1, nChangeId, "PropertyChanged does not fire when disconnected for Id");

            //object handler = player.PropertyChanged;
            //Assert.IsNull(handler);

            player = null;
        }
    }
}