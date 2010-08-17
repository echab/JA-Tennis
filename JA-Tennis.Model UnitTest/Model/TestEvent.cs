using System.ComponentModel;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("event")]
    public class TestEvent
    {

        [TestMethod]
        public void Constructor0()
        {
            Event _event = new Event();
            Assert.IsNotNull(_event);
            Assert.IsNull(_event.Id, "Id is null");
            Assert.IsNull(_event.Name, "Name is null");
        }

        [TestMethod]
        public void Constructor1()
        {
            Event _event = new Event()
            {
                Id = "E2",
                Name = "Toto"
            };
            Assert.IsNotNull(_event);
            Assert.AreEqual("E2", _event.Id);
            Assert.AreEqual("Toto", _event.Name);
        }

        [TestMethod]
        public void VerifyNotifyPropertyChanged()
        {
            Event _event = new Event()
            {
                Id = "E3",
                Name = "Tutu"
            };

            int nChangeName = 0;
            int nChangeId = 0;
            PropertyChangedEventHandler _eventNameChanged = (sender, args) =>
            {
                Assert.AreSame(_event, sender);
                Assert.AreEqual("Name", args.PropertyName);
                Assert.AreEqual("Tata", (sender as Event).Name);
                nChangeName++;
            };

            _event.PropertyChanged += _eventNameChanged;

            _event.Name = "Tata";
            Assert.AreEqual(1, nChangeName, "PropertyChanged fire once for Name");

            _event.PropertyChanged -= _eventNameChanged;

            _event.Name = "Toto";
            _event.Id = "E4";
            Assert.AreEqual(1, nChangeName, "PropertyChanged does not fire when disconnected for Name");

            PropertyChangedEventHandler _eventIdChanged = (sender, args) =>
            {
                Assert.AreSame(_event, sender);
                Assert.AreEqual("Id", args.PropertyName);
                Assert.AreEqual("Toto", (sender as Event).Name);
                Assert.AreEqual("E5", (sender as Event).Id);
                nChangeId++;
            };

            _event.PropertyChanged += _eventIdChanged;

            _event.Id = "E5";
            Assert.AreEqual(1, nChangeId, "PropertyChanged fire once for Id");

            _event.PropertyChanged -= _eventIdChanged;

            _event.Name = "Tztz";
            _event.Id = "E6";
            Assert.AreEqual(1, nChangeId, "PropertyChanged does not fire when disconnected for Id");

            //object handler = _event.PropertyChanged;
            //Assert.IsNull(handler);

            //_event.Dispose();   
            _event = null;
        }

        //[TestMethod, Tag("Undo")]
        //public void TestDirty()
        //{
        //    JA_Tennis.Model.Event _event = new JA_Tennis.Model.Event();

        //    Assert.IsFalse(_event.IsDirty, "IsDirty is initially false");

        //    using (new SuspendDirtyContext(_event))
        //    {
        //        _event.Id = "E1";
        //        _event.Name = "Toto";
        //    }

        //    Assert.IsFalse(_event.IsDirty, "IsDirty is false using SuspendDirtyContext");

        //    _event.Name = "Tutu";

        //    Assert.IsTrue(_event.IsDirty, "IsDirty is true after Name change");
        //}

        [TestMethod]
        public void TestSave1()
        {
            Event Toto = new Event() { Name = "Toto" };

            string s = SerializationHelper.Save(Toto);

            XmlAssert.AreEqual(@"<Event Name=""Toto"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave2()
        {
            Tournament tournoi = new Tournament();
            Event simpleHomme = new Event(tournoi, null)
            {
                Id = "SH",
                Name = "Simple hommes"
                //Ranks = new Range<Rank>("30/5", "30/3")
            };
            simpleHomme.Ranks.Min = "30/5";
            simpleHomme.Ranks.Max = "30/3";
            tournoi.Events.Add(simpleHomme);

            string s = SerializationHelper.Save(simpleHomme);

            XmlAssert.AreEqual(@"<Event Id=""SH"" Name=""Simple hommes"" RankMin=""30/5"" RankMax=""30/3"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        }

        [TestMethod]
        public void TestLoad()
        {
            string xml = @"<Event Name=""Toto"" xmlns=""http://jatennis.free.fr/schema""/>";

            Event _event = SerializationHelper.Load<Event>(xml);

            Assert.IsNotNull(_event);
            Assert.AreEqual(_event.Name, "Toto");
        }

        [TestMethod]
        public void TestLoad2()
        {
            string xml = @"<Event Id=""E1"" Name=""Toto"" RankMin=""30/5"" RankMax=""30/3"" xmlns=""http://jatennis.free.fr/schema""/>";

            Event _event = SerializationHelper.Load<Event>(xml);

            Assert.IsNotNull(_event);
            Assert.AreEqual("E1", _event.Id);
            Assert.AreEqual("Toto", _event.Name);
            Assert.IsNotNull(_event.Ranks);
            Assert.AreEqual("30/5", _event.Ranks.Min.Text);
            Assert.AreEqual("30/3", _event.Ranks.Max.Text);
        }

        [TestMethod]
        public void TestIsSexeCompatible0()
        {
            //TODO isSexeCompatible
        }
    }
}