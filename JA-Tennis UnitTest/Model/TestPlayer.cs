using System.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using JA_Tennis.ComponentModel;

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
                Assert.AreSame(player,sender);
                Assert.AreEqual("Name",args.PropertyName);
                Assert.AreEqual("Tata",(sender as Player).Name);
                nChangeName++;
            };

            player.PropertyChanged += playerNameChanged;

            player.Name = "Tata";
            Assert.AreEqual(1, nChangeName,"PropertyChanged fire once for Name");

            player.PropertyChanged -= playerNameChanged;

            player.Name = "Toto";
            player.Id = "J4";
            Assert.AreEqual(1, nChangeName, "PropertyChanged does not fire when disconnected for Name");

            PropertyChangedEventHandler playerIdChanged = (sender, args) =>
            {
                Assert.AreSame(player,sender);
                Assert.AreEqual("Id",args.PropertyName);
                Assert.AreEqual("Toto",(sender as Player).Name);
                Assert.AreEqual("J5",(sender as Player).Id);
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

            player = null;
        }

        [TestMethod]
        [Tag("Undo")]
        public void TestDirty()
        {
            JA_Tennis.Model.Player player = new JA_Tennis.Model.Player();

            Assert.IsFalse(player.IsDirty, "IsDirty is initially false");
            
            using( new SuspendDirtyContext( player)) {
                player.Id="J1";
                player.Name="Toto";
            }

            Assert.IsFalse(player.IsDirty, "IsDirty is false using SuspendDirtyContext");

            player.Name = "Tutu";

            Assert.IsTrue(player.IsDirty, "IsDirty is true after Name change");
        }
    }
}