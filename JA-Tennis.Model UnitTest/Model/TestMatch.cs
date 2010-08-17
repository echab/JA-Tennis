using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using JA_Tennis.ComponentModel;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("match")]
    public class TestMatch
    {
        Tournament tournoi;
        Player Toto;
        Player Dudu;
        Draw draw1;

        private void InitDraw1()
        {
            tournoi = new Tournament();
            Toto = new Player(tournoi, null) { Id = "J1", Name = "Toto" };
            Dudu = new Player(tournoi, null) { Id = "J2", Name = "Dudu" };
            tournoi.Players.Add(Toto);
            tournoi.Players.Add(Dudu);
            draw1 = new Draw(tournoi, null, 1, 1);
        }

        [TestMethod]
        public void TestSave()
        {
            InitDraw1();

            draw1.Boxes.Add(new MatchPlayer(tournoi, draw1, 2) { Player = Toto });
            draw1.Boxes.Add(new MatchPlayer(tournoi, draw1, 1) { Player = Dudu });

            Match match = new Match(tournoi, draw1, 0)
            {
                //Position = 0,
                Date = new DateTime(2010, 7, 18, 21, 16, 0),
                Place = "Court 1",
                Player = new IdRef<Player>(Toto.Id, tournoi.Players),
                Score = new Score() { Value = "6/1 3/6 6/1" }
            };
            draw1.Boxes.Add(match);

            string s = SerializationHelper.Save(match);

            //XmlAssert.AreEqual(@"<Match Position=""1"" Player1=""J1"" Player2=""J2"" Date=""2010/7/18 21:16"" Place=""Court 1"" xmlns=""http://jatennis.free.fr/schema"" ><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
            XmlAssert.AreEqual(@"<Match Position=""0"" Date=""2010/7/18 21:16"" Place=""Court 1"" Player=""J1"" xmlns=""http://jatennis.free.fr/schema"" ><Player1 Player=""J1"" /><Player2 Player=""J2"" /><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave1()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                //Position = 0,
                Date = new DateTime(2010, 7, 18, 21, 16, 0),
                Place = "Court 1"
            };
            draw1.Boxes.Add(match);

            match.Player1 = new MatchPlayer() { Player = Toto };
            match.Player2 = new MatchPlayer() { Player = Dudu };

            match.Player = new IdRef<Player>(Toto.Id, tournoi.Players);
            match.Score = new Score() { Value = "6/1 3/6 6/1" };

            string s = SerializationHelper.Save(match);

            //XmlAssert.AreEqual(@"<Match Position=""1"" Player1=""J1"" Player2=""J2"" Date=""2010/7/18 21:16"" Place=""Court 1"" xmlns=""http://jatennis.free.fr/schema"" ><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
            XmlAssert.AreEqual(@"<Match Position=""0"" Date=""2010/7/18 21:16"" Place=""Court 1"" Player=""J1"" xmlns=""http://jatennis.free.fr/schema"" ><Player1 Player=""J1"" /><Player2 Player=""J2"" /><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave2()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                //Position = 0,
                Date = new DateTime(2010, 7, 18, 21, 16, 0),
                Place = "Court 1",
                Player1 = new MatchPlayer() { Player = Toto },
                Player2 = new MatchPlayer() { Player = Dudu },

                Player = new IdRef<Player>(Toto.Id, tournoi.Players),
                Score = new Score() { Value = "6/1 3/6 6/1" },
            };

            string s = SerializationHelper.Save(match);

            //XmlAssert.AreEqual(@"<Match Position=""1"" Player1=""J1"" Player2=""J2"" Date=""2010/7/18 21:16"" Place=""Court 1"" xmlns=""http://jatennis.free.fr/schema"" ><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
            XmlAssert.AreEqual(@"<Match Position=""0"" Date=""2010/7/18 21:16"" Place=""Court 1"" Player=""J1"" xmlns=""http://jatennis.free.fr/schema"" ><Player1 Player=""J1"" /><Player2 Player=""J2"" /><Score>6/1 3/6 6/1</Score></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave3()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                Player1 = new MatchPlayer() { Player = Toto },
                Player2 = new MatchPlayer() { Player = Dudu }
            };

            string s = SerializationHelper.Save(match);

            XmlAssert.AreEqual(@"<Match Position=""0"" xmlns=""http://jatennis.free.fr/schema"" ><Player1 Player=""J1"" /><Player2 Player=""J2"" /></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave4()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                Player1 = new MatchPlayer() { Player = Toto }
            };

            string s = SerializationHelper.Save(match);

            XmlAssert.AreEqual(@"<Match Position=""0"" xmlns=""http://jatennis.free.fr/schema"" ><Player1 Player=""J1"" /></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave5()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                Player2 = new MatchPlayer() { Player = Toto }
            };

            string s = SerializationHelper.Save(match);

            XmlAssert.AreEqual(@"<Match Position=""0"" xmlns=""http://jatennis.free.fr/schema"" ><Player2 Player=""J1"" /></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave6()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                Note="Note1"
            };

            string s = SerializationHelper.Save(match);

            XmlAssert.AreEqual(@"<Match Position=""0"" xmlns=""http://jatennis.free.fr/schema"" ><Note>Note1</Note></Match>", s, true, "", null);
        }

        [TestMethod]
        public void TestSave7()
        {
            InitDraw1();

            Match match = new Match(tournoi, draw1, 0)
            {
                OutgoingQualifier = 1
            };

            string s = SerializationHelper.Save(match);

            XmlAssert.AreEqual(@"<Match Position=""0"" OutgoingQualifier=""1"" xmlns=""http://jatennis.free.fr/schema"" />", s, true, "", null);
        }


        
        [TestMethod]
        public void TestLoad()
        {
            Player Toto = new Player() { Id = "J1", Name = "Toto" };
            Player Dudu = new Player() { Id = "J2", Name = "Dudu" };
            Tournament tournoi = new Tournament();
            tournoi.Players.Add(Toto);
            tournoi.Players.Add(Dudu);
            Draw draw = new Draw(tournoi, null, 1, 1);

            string xml =
                @"<Match Position=""1"" Date=""2010/7/18 21:16"" Place=""Court 1"" xmlns=""http://jatennis.free.fr/schema"" >
                    <Player1 Player=""J1"" />
                    <Player2 Player=""J2"" />
                    <Score>6/1 3/6 6/1</Score>
                </Match>";

            Match match = new Match(tournoi, draw, 0);
            SerializationHelper.Load(ref match, xml);
            //match.Tournament = tournoi;

            Assert.IsNotNull(match);
            Assert.AreEqual(1, match.Position);
            Assert.AreEqual("2010/7/18 21:16", match.Date.ToString());
            Assert.AreEqual("Court 1", match.Place);
            Assert.AreEqual("J1", match.Player1.Player.Id);
            Assert.AreEqual("J2", match.Player2.Player.Id);
            Assert.AreEqual("6/1 3/6 6/1", match.Score.Value);
        }

        [TestMethod]
        public void TestLoad0()
        {
            string xml = @"<Match xmlns=""http://jatennis.free.fr/schema""/>";

            Match match = SerializationHelper.Load<Match>(xml);

            Assert.IsNotNull(match);
            Assert.IsNull(match.Score);
        }

        [TestMethod]
        public void TestLoad1()
        {
            string xml = @"<Match xmlns=""http://jatennis.free.fr/schema""></Match>";

            Match match = SerializationHelper.Load<Match>(xml);

            Assert.IsNotNull(match);
            Assert.IsNull(match.Score);
        }

        [TestMethod]
        public void TestLoad2()
        {
            //string xml = @"<Match Score=""2/6 3/6"" xmlns=""http://jatennis.free.fr/schema""/>";
            string xml = @"<Match xmlns=""http://jatennis.free.fr/schema""><Score>2/6 3/6</Score></Match>";

            Match match = SerializationHelper.Load<Match>(xml);

            Assert.IsNotNull(match);
            Assert.AreEqual(match.Score.Value, "2/6 3/6");
        }


        [TestMethod]
        public void TestLoad6()
        {
            string xml=@"<Match xmlns=""http://jatennis.free.fr/schema""><Note>Note1</Note></Match>";

            Match match = SerializationHelper.Load<Match>(xml);

            Assert.AreEqual("Note1", match.Note);
        }

        [TestMethod]
        public void TestLoad7()
        {
            string xml = @"<Match Position=""0"" OutgoingQualifier=""1"" xmlns=""http://jatennis.free.fr/schema"" />";

            Match match = SerializationHelper.Load<Match>(xml);

            Assert.AreEqual(1, match.OutgoingQualifier);
        }

    }
}
