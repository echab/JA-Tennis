using System;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("date")]
    public class TestDateHour
    {
        [TestMethod]
        public void TestDateHour1()
        {
            DateTime now = DateTime.Now;

            DateHour d = new DateHour(now);

            Assert.AreEqual(now, (DateTime)d);
            Assert.IsTrue(d.HasHour);
        }

        [TestMethod]
        public void TestDateHour2()
        {
            DateTime now = DateTime.Now;

            DateHour d = new DateHour(now, true);

            Assert.AreEqual(now, (DateTime)d);
            Assert.IsTrue(d.HasHour);
        }

        [TestMethod]
        public void TestDate1()
        {
            DateTime now = DateTime.Now;

            DateHour d = new DateHour(now, false);

            Assert.AreEqual(now, (DateTime)d);
            Assert.IsFalse(d.HasHour);
        }

        [TestMethod]
        public void TestDateString1()
        {
            DateHour d = new DateHour("2010/7/19");

            Assert.AreEqual(new DateTime(2010, 7, 19), (DateTime)d);
            Assert.IsFalse(d.HasHour);
        }

        [TestMethod]
        public void TestDateHourString2()
        {
            DateHour d = new DateHour("2010/7/19 8:59");

            Assert.AreEqual(new DateTime(2010, 7, 19, 8, 59, 0), (DateTime)d);
            Assert.IsTrue(d.HasHour);
        }


        [TestMethod]
        [ExpectedException(typeof(FormatException))]
        [DebuggerStepThrough]
        public void TestDateHourBadString1()
        {
            DateHour d = new DateHour("10/07/19 8:59");
        }

        [TestMethod]
        [ExpectedException(typeof(FormatException))]
        [DebuggerStepThrough]
        public void TestDateHourBadString2()
        {
            DateHour d = new DateHour("8:59");
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerStepThrough]
        public void TestDateBad1()
        {
            DateHour d = new DateHour(null);
        }
    }
}
