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
using System.Linq.Expressions;
using Microsoft.Silverlight.Testing;

namespace JA_Tennis_UnitTest
{
    [TestClass]
    [Tag("undo")]
    public class UndoManager : SilverlightTest
    {

        [TestMethod]
        public void TestUndo()
        {
            Player2 player = new Player2(){Name="Toto"};

            Add(SetValueCommand( player, Member.Of(()=>p.Name), "Dudu"));
        }

        public static void Add(ICommand undoCommand)
        {
            //var body = SetValueExpression.Body;
            //MethodCallExpression methodCall = body as MethodCallExpression;

            //var arg0 = methodCall.Arguments[0];
            //var arg1 = methodCall.Arguments[1];
        }

        public static ICommand SetValueCommand(object obj, string member, string value)
        {
            return null;
        }
        
    }

    public class Player2 {
        public string Name { get; set; }
        public override string ToString()
        {
            return string.Format("[{0}]", Name);
        }
    }
}
