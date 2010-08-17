using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using System.Diagnostics;
using JA_Tennis.ComponentModel;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("id")]
    public class TestIdManager
    {
        const string key1 = "O1";
        static IdManager IdManager = new IdManager();

        public class VMId : IIdentifiable
        {
            #region IIdentifiable Members
            string _Id;
            public string Id
            {
                get { return _Id; }
                [DebuggerStepThrough]   //to disable debug breakpoint on test with ExpectedException.
                set
                {
                    TestIdManager.IdManager.FreeId(_Id);
                    _Id = value;
                    TestIdManager.IdManager.DeclareId(_Id);
                }
            }
            #endregion

            #region IDisposable Members
            public void Dispose()
            {
                TestIdManager.IdManager.FreeId(_Id);
            }
            #endregion
        }


        [TestMethod]
        public void TestId1()
        {
            IdManager.DeclareId(key1);

            Assert.IsTrue(IdManager.Contains(key1));

            IdManager.FreeId(key1);

            Assert.IsFalse(IdManager.Contains(key1));
        }

        [TestCleanup]
        public void FreeId()
        {
            if (IdManager.Contains(key1))
            {
                IdManager.FreeId(key1);
            }
        }


        [TestMethod]
        [ExpectedException(typeof(IdException))]
        [DebuggerStepThrough]   //to disable debug breakpoint on test with ExpectedException.
        public void TestIdDuplicated()
        {
            IdManager.DeclareId(key1);

            IdManager.DeclareId(key1);  //IdException
        }


        [TestMethod]
        public void TestIIdentifiable()
        {
            VMId vm = new VMId() { Id = key1 };

            Assert.IsTrue(IdManager.Contains(key1));

            vm.Dispose();

            Assert.IsFalse(IdManager.Contains(key1));
        }

        [TestMethod]
        [ExpectedException(typeof(IdException))]
        [DebuggerNonUserCode]   //to disable debug breakpoint on test with ExpectedException.
        public void TestIdDuplicated3()
        {
            VMId vm = new VMId() { Id = key1 };

            VMId vm2 = new VMId() { Id = key1 };    //IdException
        }
    }
}
