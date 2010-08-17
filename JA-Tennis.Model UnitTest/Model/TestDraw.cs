using System.ComponentModel;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("draw")]
    public class TestDraw
    {
        private Tournament tournoi = new Tournament();
        private Draw draw1 = null;
        Player toto;
        Player dudu;

        private Draw InitDraw1()
        {
            Draw draw = new Draw(null, null, 1, 1);
            MatchPlayer m1 = new MatchPlayer(null, draw, 2) { Player = toto };
            MatchPlayer m2 = new MatchPlayer(null, draw, 1) { Player = dudu };
            Match m = new Match(null, draw, 0);
            draw.Boxes.Add(m);
            draw.Boxes.Add(m1);
            draw.Boxes.Add(m2);
            return draw;
        }

        private Draw InitDraw2()
        {
            draw1 = new Draw(tournoi, null, 1, 1);
            toto = new Player(tournoi, null) { Id = "J1", Name = "Toto" };
            dudu = new Player(tournoi, null) { Id = "J2", Name = "Dudu" };
            tournoi.Players.Add(toto);
            tournoi.Players.Add(dudu);

            draw1.Boxes.Add(new Match(tournoi, draw1, 0)
            {
                Player1 = new MatchPlayer() { Player = toto },
                Player2 = new MatchPlayer() { Player = dudu }
            });

            return draw1;
        }


        [TestMethod]
        public void Constructor0()
        {
            Draw draw = new Draw();

            Assert.IsNotNull(draw);
            Assert.IsNull(draw.Id);
            Assert.IsNull(draw.Name);
        }

        [TestMethod]
        public void Constructor1()
        {
            Draw draw = new Draw()
            {
                Id = "E2",
                Name = "Draw1"
            };

            Assert.IsNotNull(draw);
            Assert.AreEqual("E2", draw.Id);
            Assert.AreEqual("Draw1", draw.Name);
        }

        [TestMethod]
        public void VerifyNotifyPropertyChanged()
        {
            Draw draw = new Draw()
            {
                Id = "E3",
                Name = "Tutu"
            };

            int nChangeName = 0;
            int nChangeId = 0;
            PropertyChangedEventHandler drawNameChanged = (sender, args) =>
            {
                Assert.AreSame(draw, sender);
                Assert.AreEqual("Name", args.PropertyName);
                Assert.AreEqual("Tata", (sender as Draw).Name);
                nChangeName++;
            };

            draw.PropertyChanged += drawNameChanged;

            draw.Name = "Tata";
            Assert.AreEqual(1, nChangeName, "PropertyChanged fire once for Name");

            draw.PropertyChanged -= drawNameChanged;

            draw.Name = "Draw1";
            draw.Id = "E4";
            Assert.AreEqual(1, nChangeName, "PropertyChanged does not fire when disconnected for Name");

            PropertyChangedEventHandler drawIdChanged = (sender, args) =>
            {
                Assert.AreSame(draw, sender);
                Assert.AreEqual("Id", args.PropertyName);
                Assert.AreEqual("Draw1", (sender as Draw).Name);
                Assert.AreEqual("E5", (sender as Draw).Id);
                nChangeId++;
            };

            draw.PropertyChanged += drawIdChanged;

            draw.Id = "E5";
            Assert.AreEqual(1, nChangeId, "PropertyChanged fire once for Id");

            draw.PropertyChanged -= drawIdChanged;

            draw.Name = "Tztz";
            draw.Id = "E6";
            Assert.AreEqual(1, nChangeId, "PropertyChanged does not fire when disconnected for Id");

            //object handler = draw.PropertyChanged;
            //Assert.IsNull(handler);

            //draw.Dispose();   
            draw = null;
        }


        [TestMethod]
        public void TestSave1()
        {
            Draw draw = new Draw() { Name = "Draw1" };

            string s = SerializationHelper.Save(draw);

            XmlAssert.AreEqual(@"<Draw Name=""Draw1"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
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
            tournoi.Events.Add(simpleHomme);

            Draw draw = new Draw(tournoi, simpleHomme, 0, 0)
            {
                Id = "D1",
                Name = "NC - 4e série"
            };
            draw.Ranks.Min = "30/5";
            draw.Ranks.Max = "30/3";
            simpleHomme.Draws.Add(draw);


            string s = SerializationHelper.Save(draw);

            XmlAssert.AreEqual(@"<Draw Id=""D1"" Name=""NC - 4e série"" RankMin=""30/5"" RankMax=""30/3"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave3()
        {
            Draw draw = InitDraw2();

            string s = SerializationHelper.Save(draw);

            XmlAssert.AreEqual(@"<Draw xmlns=""http://jatennis.free.fr/schema"">
                    <Match Position=""0"">
                        <Player1 Player=""J1""/>
                        <Player2 Player=""J2""/>
                    </Match>
                </Draw>", s, true, "", null);
        }



        [TestMethod]
        public void TestLoad()
        {
            string xml = @"<Draw Name=""Draw1"" xmlns=""http://jatennis.free.fr/schema""/>";

            Draw draw = SerializationHelper.Load<Draw>(xml);

            Assert.IsNotNull(draw);
            Assert.AreEqual(draw.Name, "Draw1");
        }

        [TestMethod]
        public void TestLoad2()
        {
            string xml = @"<Draw Id=""E1"" Name=""Draw1"" RankMin=""30/5"" RankMax=""30/3"" xmlns=""http://jatennis.free.fr/schema""/>";

            Draw draw = SerializationHelper.Load<Draw>(xml);

            Assert.IsNotNull(draw);
            Assert.AreEqual("E1", draw.Id);
            Assert.AreEqual("Draw1", draw.Name);
            Assert.IsNotNull(draw.Ranks);
            Assert.AreEqual("30/5", draw.Ranks.Min.Text);
            Assert.AreEqual("30/3", draw.Ranks.Max.Text);
        }



        [TestMethod]
        public void SetDimension1()
        {
            draw1 = InitDraw1();
        }

        [TestMethod]
        public void SetDimension2()
        {
            draw1 = InitDraw1();

            //No change
            draw1.SetDimension(1, 1, null, null);
        }

        [TestMethod]
        public void SetDimension3()
        {
            draw1 = InitDraw1();

            //Add one qualifier
            draw1.SetDimension(1, 2, null, null);

            Assert.AreEqual(1, draw1.RoundCount);
            Assert.AreEqual(2, draw1.OutgoingCount);
        }

    }
}