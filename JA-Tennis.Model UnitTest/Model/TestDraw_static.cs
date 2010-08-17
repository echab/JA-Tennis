using System.Linq;
using JA_Tennis.Model;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections;

namespace JA_Tennis_UnitTest.Model
{
    [TestClass, Tag("draw"), Tag("static")]
    public class TestDraw_static
    {
        [TestMethod]
        public void Test_iCol()
        {
            short[] p = { 0, 1, 2, 3, 4, 5, 6, 7 };

            var actual = p.Select(i => Draw.iCol(i)).ToArray();

            sbyte[] expected = { 0, 1, 1, 2, 2, 2, 2, 3 };

            CollectionAssert.AreEqual(expected, actual);
        }

        [TestMethod]
        public void Test_iColEx()
        {
            var actual = new short[] { -1, 0, 1, 2, 3, 4, 5, 6, 7 }.Select(i => Draw.iColEx(i)).ToArray();

            CollectionAssert.AreEqual(new sbyte[] { -1, 0, 1, 1, 2, 2, 2, 2, 3 }, actual);
        }

        [TestMethod]
        public void Test_iHautCol0()
        {
            var actual = new sbyte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }.Select(i => Draw.iHautCol0(i)).ToArray();

            CollectionAssert.AreEqual(new short[] { 0, 2, 6, 14, 30, 62, 126, 254, 510, 1022 }, actual);
        }

        [TestMethod]
        public void Test_iBasCol()
        {
            var actual = new sbyte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }.Select(i => Draw.iBasCol(i)).ToArray();

            CollectionAssert.AreEqual(new short[] { 0, 1, 3, 7, 15, 31, 63, 127, 255, 511 }, actual);
        }

        [TestMethod]
        public void Test_nInCol()
        {
            var actual = new sbyte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }.Select(i => Draw.nInCol(i)).ToArray();

            CollectionAssert.AreEqual(new short[] { 1, 2, 4, 8, 16, 32, 64, 128, 256, 512 }, actual);
        }

        [TestMethod]
        public void Test_log2()
        {
            var actual = new short[] { 1, 2, 3, 4, 5, 6, 7, 8, 9 }.Select(i => Draw.log2(i)).ToArray();

            CollectionAssert.AreEqual(new sbyte[] { 0, 1, 1, 2, 2, 2, 2, 3, 3 }, actual);
        }

        struct pair<Ta, Tb>
        {
            public Ta a;
            public Tb b;
            public pair(Ta a, Tb b) { this.a = a; this.b = b; }
        };

        [TestMethod]
        public void Test_iColMaxQ()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(2, 1), 
                new pair<byte,byte>(3, 1), 
                new pair<byte,byte>(3, 2), 
                new pair<byte,byte>(3, 3),
                new pair<byte,byte>(4, 5)
            };
            var expected = new sbyte[] { 1, 2, 3, 4, 6 };

            var actual = p.Select(i => Draw.iColMaxQ(i.a, i.b)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iColMinQ()
        {
            var p = new short[] { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

            var expected = new sbyte[] { 0, 1, 2, 2, 3, 3, 3, 3, 4 };

            var actual = p.Select(i => Draw.iColMinQ(i)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iBasColQ()
        {
            var p = new pair<sbyte, short>[] { 
                new pair<sbyte, short>(1, 1), 
                new pair<sbyte, short>(2, 1), 
                new pair<sbyte, short>(3, 1), 
                new pair<sbyte, short>(3, 2), 
                new pair<sbyte, short>(3, 3) 
            };
            var expected = new short[] { 1, 3, 7, 7, 9 };

            var actual = p.Select(i => Draw.iBasColQ(i.a, i.b)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_nInColQ()
        {
            var p = new pair<sbyte, short>[] { 
                new pair<sbyte, short>(1, 1), 
                new pair<sbyte, short>(2, 1), 
                new pair<sbyte, short>(3, 1), 
                new pair<sbyte, short>(3, 2), 
                new pair<sbyte, short>(3, 3) 
            };
            var expected = new short[] { 2, 4, 8, 8, 6 };

            var actual = p.Select(i => Draw.nInColQ(i.a, i.b)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iBoxMinQ()
        {
            var p = new short[] { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

            var expected = new short[] { 0, 1, 4, 3, 10, 9, 8, 7, 22 };

            var actual = p.Select(i => Draw.iBoxMinQ(i)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iBoxMaxQ()
        {
            var p = new pair<int, short>[] { 
                new pair<int, short>(2, 1), 
                new pair<int, short>(3, 1), 
                new pair<int, short>(3, 2), 
                new pair<int, short>(3, 3) ,
                new pair<int, short>(4, 5)
            };
            var expected = new short[] { 2, 6, 14, 30, 126 };

            var actual = p.Select(i => Draw.iBoxMaxQ(i.a, i.b)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_exp2()
        {
            var p = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };

            var expected = new short[] { 1, 2, 4, 8, 16, 32, 64, 128, 256, 512 };

            var actual = p.Select(i => Draw.exp2(i)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iBoxPivotGauche()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(0, 0), 
                new pair<byte,byte>(0, 1), 
                new pair<byte,byte>(0, 2), 
                new pair<byte,byte>(0, 2), 
                new pair<byte,byte>(0, 3), 

                new pair<byte,byte>(1, 1), 
                new pair<byte,byte>(1, 2), 
                new pair<byte,byte>(1, 3), 

                new pair<byte,byte>(2, 0), 
                new pair<byte,byte>(2, 1) ,
                new pair<byte,byte>(2, 2) ,
                    new pair<byte,byte>  (2, 3)
            };
            var expected = new short[] { 0, 1, 2, 2, 3, 3, 5, 7, 2, 4, 6, 8 };

            var actual = p.Select(i => Draw.iBoxPivotGauche(i.a, i.b)).ToArray();

            CollectionAssert.AreEqual(expected, actual);;
        }

        [TestMethod]
        public void Test_iBoxMin()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(1, 1), 
                new pair<byte,byte>(2, 1), 
                new pair<byte,byte>(3, 1), 
                new pair<byte,byte>(3, 2), 
                new pair<byte,byte>(3, 3) 
            };
            var expected = new short[] { 0, 1, 3, 3, 3 };

            var actual = p.Select(i => new Draw(null, null, i.a, i.b).iBoxMin).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iBoxMax()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(1, 1), 
                new pair<byte,byte>(2, 1), 
                new pair<byte,byte>(3, 1), 
                new pair<byte,byte>(3, 2), 
                new pair<byte,byte>(3, 3) 
            };
            var expected = new short[] { 2, 6, 14, 30, 62 };

            var actual = p.Select(i => new Draw(null, null, i.a, i.b).iBoxMax).ToArray();

            CollectionAssert.AreEqual(expected, actual);;

        }

        [TestMethod]
        public void Test_iColMin()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(1, 1), 
                new pair<byte,byte>(2, 1), 
                new pair<byte,byte>(3, 1), 
                new pair<byte,byte>(3, 2), 
                new pair<byte,byte>(3, 3) 
            };
            var expected = new sbyte[] { 0, 1, 2, 2, 2 };

            var actual = p.Select(i => new Draw(null, null, i.a, i.b).iColMin).ToArray();

            CollectionAssert.AreEqual(expected, actual);;
        }

        [TestMethod]
        public void Test_iColMax()
        {
            var p = new pair<byte, byte>[] { 
                new pair<byte,byte>(1, 1), 
                new pair<byte,byte>(2, 1), 
                new pair<byte,byte>(3, 1), 
                new pair<byte,byte>(3, 2), 
                new pair<byte,byte>(3, 3) 
            };
            var expected = new sbyte[] { 1, 2, 3, 4, 5 };

            var actual = p.Select(i => new Draw(null, null, i.a, i.b).iColMax).ToArray();

            CollectionAssert.AreEqual(expected, actual);;
        }
    }
}
