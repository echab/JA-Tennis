using JA_Tennis.Model;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Diagnostics;
using Microsoft.Silverlight.Testing;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("box")]
    public class TestBoxArray
    {
        Box p1 = new MatchPlayer();

        [TestMethod]
        public void TestConstructor1()
        {
            BoxArray boxes = new BoxArray();

            Assert.AreEqual(0, boxes.Count);
            Assert.IsFalse(boxes.ContainsKey(0));
        }

        [TestMethod]
        public void TestAdd1()
        {
            BoxArray boxes = new BoxArray();

            boxes.Add(p1);
            
            Assert.AreEqual(1, boxes.Count);
            Assert.IsTrue(boxes.ContainsKey(Box.NoPosition));
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        [DebuggerStepThrough]
        public void TestAdd2()
        {
            BoxArray boxes = new BoxArray();

            boxes.Add(null);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerStepThrough]
        public void TestAdd3()
        {
            BoxArray boxes = new BoxArray();

            boxes.Add(p1);
            boxes.Add(p1);
        }

        [TestMethod]
        public void TestRemove1()
        {
            BoxArray boxes = new BoxArray();
            boxes.Add(p1);

            boxes.Remove(p1);

            Assert.AreEqual(0, boxes.Count);
            Assert.IsFalse(boxes.ContainsKey(Box.NoPosition));
        }

        [TestMethod]
        public void TestRemove2()
        {
            BoxArray boxes = new BoxArray();
            boxes.Add(p1);

            boxes.Remove(Box.NoPosition);

            Assert.AreEqual(0, boxes.Count);
            Assert.IsFalse(boxes.ContainsKey(Box.NoPosition));
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerStepThrough]
        public void TestRemove3()
        {
            BoxArray boxes = new BoxArray();

            boxes.Remove(p1);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentNullException))]
        [DebuggerStepThrough]
        public void TestRemove4()
        {
            BoxArray boxes = new BoxArray();

            boxes.Remove(null);
        }
    

    }
}
