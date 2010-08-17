using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Linq;

namespace JA_Tennis_UnitTest
{
    public static class ArrayAssert
    {
        public static void AreEqual<T>(T[] expected, T[] actual, string message, params object[] parameters)
        {
            //Assert.AreEqual(expected.Length, actual.Length, message, parameters);
            //for (int i = 0; i < expected.Length; i++)
            //{
            //    Assert.AreEqual(expected[i], actual[i], message, parameters);
            //}

            string sExpected = expected.ToArrayString();
            string sActual = actual.ToArrayString();
            Assert.AreEqual(sExpected, sActual, message, parameters);
        }

        private static string ToArrayString<T>(this T[] array)
        {
            return array.Aggregate<T,string>(null, (a, b) => a + "," + b.ToString());
        }
    }
}
