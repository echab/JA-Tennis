using JA_Tennis.Command;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis_UnitTest.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.ComponentModel
{
    [TestClass]
    public class TestUndoPropertyBehavior
    {
        static UndoManager undoManager = new UndoManager();

        public class VMUndo : BindableType
        {
            public VMUndo()
            {
                ChangeBehaviors.Add(new UndoPropertyBehavior(undoManager));
            }

            string _Name;
            public string Name
            {
                get { return _Name; }
                set { Set<string>(ref _Name, value, () => Name); }
            }
        }

 
        [TestMethod]
        [Tag("undo")]
        public void Test1()
        {
            VM vm = new VM() { Name = "Toto" };

            UndoPropertyBehavior undoPropertyBehavior = new UndoPropertyBehavior(undoManager);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initial state");
            Assert.AreEqual("Toto", vm.Name);

            vm.Name = "Dudu";
            bool b = undoPropertyBehavior.PropertyChanged<string>(vm, "Toto", vm.Name, Member.Of(() => vm.Name));
            Assert.IsTrue(b);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual("Dudu", vm.Name);

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual("Toto", vm.Name);
        }

        [TestMethod]
        [Ignore]
        public void TestUndoManagerNoUndoOnInit()
        {
            undoManager.Clear();

            VMUndo vm = new VMUndo() { Name = "Toto" };

            //TODO désactiver undo on init

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initial state");
            Assert.IsFalse(undoManager.RedoCommand.CanExecute(null), "Initial state");
            Assert.AreEqual("Toto", vm.Name, "Initial state");
        }

        [TestMethod]
        [Tag("undo")]
        public void Test2()
        {
            VMUndo vm = new VMUndo() { Name = "Toto" };
            undoManager.Clear();

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initial state");
            Assert.IsFalse(undoManager.RedoCommand.CanExecute(null), "Initial state");
            Assert.AreEqual("Toto", vm.Name, "Initial state");

            vm.Name = "Dudu";

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo is possible.");
            Assert.IsFalse(undoManager.RedoCommand.CanExecute(null), "No Redo");
            Assert.AreEqual("Dudu", vm.Name, "new state");

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No Undo");
            Assert.IsTrue(undoManager.RedoCommand.CanExecute(null), "Redo is possible.");
            Assert.AreEqual("Toto", vm.Name, "final state");

            undoManager.RedoCommand.Execute(null);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo is possible.");
            Assert.IsFalse(undoManager.RedoCommand.CanExecute(null), "No Redo");
            Assert.AreEqual("Dudu", vm.Name, "new state");

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No Undo");
            Assert.IsTrue(undoManager.RedoCommand.CanExecute(null), "Redo is possible.");
            Assert.AreEqual("Toto", vm.Name, "final state");
        }

    }
}
