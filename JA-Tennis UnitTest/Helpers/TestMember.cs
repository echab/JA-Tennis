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
using JA_Tennis.Helpers;
using System.Linq.Expressions;
using Microsoft.Silverlight.Testing;

namespace JA_Tennis_UnitTest.Helpers
{
    [TestClass]
    public class TestMember
    {
        class VM
        {
            public string Name { get; set; }
        }

        [TestMethod, Tag("hash")]
        public void TestHash()
        {
            VM vm1 = new VM();
            VM vm2 = new VM();

            //Expression<Func<object>> me1 = () => vm1.Name;
            //Expression<Func<object>> me2 = () => vm1.Name;

            //Assert.AreEqual(me1.Body.Member, me2.Body);
            //Assert.AreEqual(me1, me2);
            //Assert.AreEqual(me1.GetHashCode(), me2.GetHashCode());

            Member mb1 = Member.Of(() => vm1.Name);
            Member mb2 = Member.Of(() => vm2.Name);

            Assert.AreEqual("Name", mb1);

        }

    }
}
