using System;
using System.Collections.Generic;
using JA_Tennis.ComponentModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace JA_Tennis_UnitTest.ComponentModel
{
    [TestClass, Tag("ref")]
    public class TestIdRefs
    {
        static Cid c1 = new Cid("c1");
        static Cid c2 = new Cid("c2");
        static Cid c3 = new Cid("c3");
        static List<Cid> source1 = new List<Cid> { c1 };
        static List<Cid> source12 = new List<Cid> { c1, c2 };
        static List<Cid> source123 = new List<Cid> { c1, c2, c3 };

        [TestMethod]
        public void TestIdRefs1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>("c1",source123);

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreEqual("c1", refs.Ids);
        }

        [TestMethod]
        public void TestIdRefs12()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>("c1 c2", source123);

            Assert.AreEqual(2, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreSame(c2, refs[1]);
            Assert.AreEqual("c1 c2", refs.Ids);
        }

        [TestMethod]
        public void TestIdRefs1_()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>( " c1 ",source123);

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreEqual(" c1 ", refs.Ids);
        }

        [TestMethod]
        public void TestIdRefsAdd1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, source123);
            refs.Add(c1);

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreEqual("c1", refs.Ids);
        }

        [TestMethod]
        public void TestDeferredIdRefs1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>("c1", null);

            Assert.AreEqual(0, refs.Count);

            refs.IdsSource = source123;

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
        }

        [TestMethod]
        public void TestDeferredIdRefs2()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>( "c3 c2",null);

            Assert.AreEqual(0, refs.Count);

            refs.IdsSource = source123;

            Assert.AreEqual(2, refs.Count);
            Assert.AreSame(c3, refs[0]);
            Assert.AreSame(c2, refs[1]);
        }

        [TestMethod]
        public void TestDeferredIdRefs3()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, null);
            refs.Ids = "c1";

            Assert.AreEqual(0, refs.Count);
            Assert.AreEqual("c1", refs.Ids);
            Assert.IsNull(refs.IdsSource);

            refs.IdsSource = source123;

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreEqual("c1", refs.Ids);
            Assert.AreSame(source123, refs.IdsSource);
        }


        [TestMethod]
        public void TestDeferredIdRefsAdd1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, null);
            refs.Add(c1);

            Assert.AreEqual(1, refs.Count);
            Assert.AreEqual("c1", refs.Ids);
            Assert.IsNull(refs.IdsSource);

            refs.IdsSource = source123;

            Assert.AreEqual(1, refs.Count);
            Assert.AreSame(c1, refs[0]);
            Assert.AreEqual("c1", refs.Ids);
            Assert.AreSame(source123, refs.IdsSource);
        }

        [TestMethod]
        [ExpectedException(typeof(Exception))]
        [DebuggerStepThrough]
        public void TestBadIdRefs1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>("c4",source123);
        }

        [TestMethod]
        public void TestBadIdRefs2()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, source123);

            Assert.IsNull(refs.Ids);
            Assert.IsNotNull(refs.IdsSource);
            Assert.AreEqual(0, refs.Count);
        }

        [TestMethod]
        public void TestBadIdRefs3()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, null);

            Assert.IsNull(refs.Ids);
            Assert.IsNull(refs.IdsSource);
            Assert.AreEqual(0, refs.Count);
        }

        [TestMethod]
        [ExpectedException(typeof(Exception))]
        [DebuggerStepThrough]
        public void TestBadIdRefsAdd1()
        {
            IdRefs<Cid> refs = new IdRefs<Cid>(null, source1);
            refs.Add(c2);
        }

        [TestMethod]
        [ExpectedException(typeof(Exception))]
        [DebuggerStepThrough]
        public void TestBadDeferredIdRefs2()
        {
            IdRefs<Cid> refs = null;
            try
            {
                refs = new IdRefs<Cid>("c5", null);
            }
            catch (Exception ex)
            {
                Assert.IsTrue(false, "", ex);
            }

            Assert.AreEqual(0, refs.Count);

            refs.IdsSource = source123;
        }

        /*
        [TestMethod]
        public void TestIdRefsSerialization1()
        {
            var ref1 = new IdRefs<Cid>("c1", source1);

            string s = SerializationHelper.Save(ref1);

            XmlAssert.AreEqual(@"<IdRefsOfCid xmlns=""http://jatennis.free.fr/schema"">c1</IdRefsOfCid>", s, true, null, null);
        }

        [TestMethod]
        public void TestIdRefsSerialization2()
        {
            string s = @"<IdRefsOfCid xmlns=""http://jatennis.free.fr/schema"">c1</IdRefsOfCid>";

            var ref1 = SerializationHelper.Load<IdRefs<Cid>>(s);

            Assert.AreEqual(0, ref1.Count);

            ref1.IdsSource = source1;

            Assert.AreEqual(1, ref1.Count);
            Assert.AreSame(c1, ref1[0]);
        }
        //*/

    }
}
