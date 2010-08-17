using System;
using System.Collections.Generic;
using JA_Tennis.ComponentModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Diagnostics;

namespace JA_Tennis_UnitTest.ComponentModel
{
    public class Cid : IIdentifiable
    {
        public Cid(string id)
        {
            Id = id;
        }

        public string Id { get; set; }

        #region IDisposable Members
        public void Dispose()
        {
            throw new NotImplementedException();
        }
        #endregion
    }

    [TestClass, Tag("ref")]
    public class TestIdRef
    {
        static Cid c1 = new Cid("c1");
        static Cid c2 = new Cid("c2");
        static Cid c3 = new Cid("c3");
        static List<Cid> source1 = new List<Cid> { c1 };
        static List<Cid> source12 = new List<Cid> { c1, c2 };
        static List<Cid> source123 = new List<Cid> { c1, c2, c3 };

        [TestMethod]
        public void TestRef1()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c1.Id, source1);

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
            Assert.AreSame(c1, (Cid)ref1);
        }

        [TestMethod]
        public void TestRef2()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c1, source1);

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
            Assert.AreSame(c1, (Cid)ref1);
        }

        [TestMethod]
        public void TestRef1_()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(" c1 ", source1);

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
            Assert.AreSame(c1, (Cid)ref1);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerStepThrough]
        public void TestBadRef1()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c2, source1);
        }

        //[TestMethod]
        //[ExpectedException(typeof(ArgumentNullException))]
        //[DebuggerStepThrough]
        //public void TestBadRef2()
        //{
        //    Ref<Cid> ref1 = new Ref<Cid>(null, c1);
        //}

        [TestMethod]
        public void TestRef3()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c1, source123);

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
        }

        [TestMethod]
        public void TestRefDeferred1()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c1, null);

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);

            ref1.IdsSource = source1;

            Assert.AreEqual("c1", ((Cid)ref1).Id);
        }

        [TestMethod]
        public void TestRefDeferred2()
        {
            IdRef<Cid> ref1 = new IdRef<Cid>(c1.Id, null);

            try
            {
                Cid o = ref1;
            }
            catch (NullReferenceException)
            {
                //ref1.IdsSource is null
            }

            ref1.IdsSource = source1;

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
            Assert.AreSame(c1, (Cid)ref1);
        }

        [TestMethod]
        [ExpectedException(typeof(ArgumentException))]
        [DebuggerStepThrough]
        public void TestBadRefDeferred1()
        {
            IdRef<Cid> ref1 = null;
            try
            {
                ref1 = new IdRef<Cid>(c2,null);
            }
            catch (Exception ex)
            {
                Assert.IsTrue(false, "", ex);
            }

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c2", ((Cid)ref1).Id);

            ref1.IdsSource = source1;
        }

        [TestMethod]
        [ExpectedException(typeof(Exception))]
        [DebuggerStepThrough]
        public void TestBadRefDeferred2()
        {
            IdRef<Cid> ref1 = null;
            try
            {
                ref1 = new IdRef<Cid>(c2.Id, null);
            }
            catch (Exception ex)
            {
                Assert.IsTrue(false, "", ex);
            }

            Assert.IsNull((Cid)ref1);

            ref1.IdsSource = source1;
        }

        /*
        [TestMethod]
        public void TestRefSerialization1()
        {
            Ref<Cid> ref1 = new Ref<Cid>(source1, c1);

            string s = SerializationHelper.Save(ref1);

            XmlAssert.AreEqual(@"<RefOfCid xmlns=""http://jatennis.free.fr/schema"">c1</RefOfCid>", s, true, null, null);
        }

        [TestMethod]
        public void TestRefSerialization2()
        {
            string s = @"<RefOfCid xmlns=""http://jatennis.free.fr/schema"">c1</RefOfCid>";

            Ref<Cid> ref1 = SerializationHelper.Load<Ref<Cid>>(s);
            ref1.IdsSource = source1;

            Assert.IsNotNull((Cid)ref1);
            Assert.AreEqual("c1", ((Cid)ref1).Id);
            Assert.AreSame(c1, (Cid)ref1);
        }
        //*/
    }
}
