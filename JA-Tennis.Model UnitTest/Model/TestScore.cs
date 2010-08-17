using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("score")]
    public class TestScore
    {
        [TestMethod]
        public void TestConstructor0()
        {
            Score s = new Score();
            Assert.IsFalse(s.HasErrors);
            Assert.IsTrue(s.IsFirstWinner == null);
        }

        [TestMethod]
        public void TestConstructorNull()
        {
            Score s = new Score()
            {
                Value = null
            };
            Assert.IsFalse(s.HasErrors);
            Assert.IsTrue(s.IsFirstWinner == null);
        }

        [TestMethod]
        public void TestConstructorEmpty()
        {
            Score s = new Score()
            {
                Value = ""
            };
            Assert.IsFalse(s.HasErrors);
            Assert.IsTrue(s.IsFirstWinner == null);
        }

        [TestMethod]
        public void TestScore1()
        {
            Score s = new Score()
            {
                Value = "6/4 6/4"
            };
            Assert.IsFalse(s.HasErrors);
            Assert.IsTrue(s.IsFirstWinner == true);
        }

        [TestMethod]
        public void TestScore2()
        {
            Score s = new Score()
            {
                Value = "2/6 3/6"
            };
            Assert.IsFalse(s.HasErrors);
            Assert.IsTrue(s.IsFirstWinner == false);
        }

        [TestMethod]
        public void TestSave()
        {
            Score score = new Score()
            {
                Value = "2/6 3/6"
            };

            string s = SerializationHelper.Save(score);

            XmlAssert.AreEqual(@"<Score xmlns=""http://jatennis.free.fr/schema"">2/6 3/6</Score>", s, true, "", null);
        }

        [TestMethod]
        public void TestLoad()
        {
            string xml = @"<Score xmlns=""http://jatennis.free.fr/schema"">2/6 3/6</Score>";

            Score score = SerializationHelper.Load<Score>( xml);

            Assert.IsNotNull(score);
            Assert.AreEqual(score.Value, "2/6 3/6");
        }
    }
}
