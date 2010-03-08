using System;
using System.Windows.Input;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using JA_Tennis.Model;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass]
    public class TestTournament
    {
        [TestMethod]
        public void TestMethod1()
        {
            Tournament tournament = new Tournament();

            CollectionAssert.AllItemsAreUnique(tournament.Players);

            //TODO continue test
        }
    }
}