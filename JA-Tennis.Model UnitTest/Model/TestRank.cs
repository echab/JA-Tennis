using System;
using System.Linq;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("rank")]
    public class TestRank
    {

        [TestMethod]
        public void TestConstructorText1()
        {
            Rank r1 = new Rank("30/3");

            Assert.AreEqual("30/3", r1.Text);
            Assert.AreEqual(15, r1.Value);
        }

        [TestMethod]
        public void TestConstructorValue1()
        {
            Rank r1 = new Rank(14);

            Assert.AreEqual("30/2", r1.Text);
            Assert.AreEqual(14, r1.Value);
        }

        [TestMethod]
        [ExpectedException( typeof (ArgumentException))]
        [DebuggerNonUserCode]
        public void TestConstructorText2()
        {
            Rank r1 = new Rank("30/6");
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerNonUserCode]
        public void TestConstructorValue2()
        {
            Rank r1 = new Rank(21);
        }

        [TestMethod]
        public void TestComparable1()
        {
            Rank r1 = new Rank("15/5");
            Rank r2 = new Rank("15/5");

            //Assert.IsTrue(r1 == r2);  //TODO
            Assert.IsTrue(r1.Equals( r2));  //TODO
        }

        [TestMethod]
        public void TestComparable2()
        {
            Rank r1 = new Rank("15/3");
            Rank r2 = new Rank("15/3");

            Assert.IsTrue(r1.CompareTo(r2) == 0);
        }

        [TestMethod]
        public void TestComparable3()
        {
            Rank r1 = new Rank("15/5");
            Rank r2 = new Rank("15/4");

            Assert.IsTrue(r1.CompareTo( r2) < 0);
        }

        [TestMethod]
        public void TestComparable4()
        {
            Rank r1 = new Rank("2/6");
            Rank r2 = new Rank("5/6");

            Assert.IsTrue(r1.CompareTo(r2) > 0);
        }

        [TestMethod]
        public void TestRanks1()
        {
            Assert.AreEqual( 26, Rank.Ranks.Count());

            int n4 = Rank.Ranks.Where(r => r.Division == "4e série").Count();
            Assert.AreEqual(7, n4);
        }


        //[TestMethod]
        //public void TestSave()
        //{
        //    Rank rank = new Rank("15/2");

        //    string s = SerializationHelper.Save(rank);

        //    XmlAssert.AreEqual(@"<Score Value=""2/6 3/6"" xmlns=""http://jatennis.free.fr/schema""/>", s, true, "", null);
        //}

        //[TestMethod]
        //public void TestLoad()
        //{
        //    string xml = @"<Rank Value=""2/6 3/6"" xmlns=""http://jatennis.free.fr/schema""/>";

        //    Rank rank = SerializationHelper.Load<Score>(xml);

        //    Assert.IsNotNull(rank);
        //    Assert.AreEqual(rank.Value, "2/6 3/6");
        //}

    }
}
