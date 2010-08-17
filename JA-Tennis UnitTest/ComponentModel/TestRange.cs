using System;
using System.Diagnostics;
using JA_Tennis.ComponentModel;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.ComponentModel
{
    [TestClass, Tag("range")]
    public class TestRange
    {
        [TestMethod]
        public void TestRangeConstructor1()
        {
            var r1 = new Range<int>(5, 10);

            Assert.AreEqual(5, r1.Min);
            Assert.AreEqual(10, r1.Max);
        }

        [TestMethod]
        public void TestRangeConstructor2()
        {
            var r1 = new Range<Rank>(new Rank("30/5"), new Rank("30/1"));

            Assert.AreEqual("30/5", r1.Min.Text);
            Assert.AreEqual("30/1", r1.Max.Text);
        }

        [TestMethod]
        public void TestRangeConstructor3()
        {
            var r1 = new Range<DateTime>(new DateTime(2001, 01, 31), new DateTime(2010, 07, 17));
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerNonUserCode]
        public void TestRangeConstructor4()
        {
            var r1 = new Range<int>(8, 2);
        }

        [TestMethod]
        public void TestRangeConstructor5()
        {
            var r1 = new Range<Rank>(null, "30/2");
            Assert.IsNull(r1.Min);
            Assert.IsNotNull(r1.Max);
        }

        [TestMethod]
        public void TestRangeConstructor6()
        {
            var r1 = new Range<Rank>( "30/2", null);
            Assert.IsNotNull(r1.Min);
            Assert.IsNull(r1.Max);
        }

        [TestMethod]
        public void TestRange1()
        {
            var r1 = new Range<Rank>(null,"30/2");
            r1.Max = "30/1";

            Assert.IsNull( r1.Min);
        }

        [TestMethod]
        public void TestRange2()
        {
            var r1 = new Range<Rank>( "30/2",null);
            r1.Min = "30/1";

            Assert.IsNull(r1.Max);
        }

        [TestMethod]
        public void TestRange3()
        {
            var r1 = new Range<Rank>(null, "30/2");
            r1.Min = "30/4";

            Assert.IsNotNull(r1.Min);
        }

        [TestMethod]
        public void TestRange4()
        {
            var r1 = new Range<Rank>("30/2", null);
            r1.Max = "30/1";

            Assert.IsNotNull(r1.Max);
        }
    }
}
