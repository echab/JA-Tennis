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
using JA_Tennis.ViewModel;
using JA_Tennis.Command;
using JA_Tennis.Model;
using JA_Tennis.Helpers;
using Microsoft.Silverlight.Testing;

namespace JA_Tennis_UnitTest.ViewModel
{
    [TestClass]
    public class TestUndoManager
    {
        class VM
        {
            public string Name { get; set; }
        }

        [TestMethod]
        [Tag("undo")]
        public void TestUndo()
        {
            UndoManager undoManager = new UndoManager();

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initially no undo");

            VM vm = new VM() { Name = "Toto" };

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No undo after ViewModel creation");
            Assert.AreEqual("Toto", vm.Name, "Initial Name");

            //vm.Name = "Dudu";
            undoManager.Do(() => vm.Name = "Dudu", () => vm.Name = "Toto", "Set name by hand", false);
            //undoManager.Do(new UndoablePropertySet<string>(vm, "Dudu", Member.Of(() => vm.Name)), false);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo after Name change");
            Assert.AreEqual("Dudu", vm.Name, "Changed Name");

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No more undo.");
            Assert.AreEqual("Toto", vm.Name, "Name undo");

        }

        [TestMethod]
        [Tag("undo")]
        public void TestUndo1()
        {
            UndoManager undoManager = new UndoManager();

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initially no undo");

            PlayerEditorViewModel vm = new PlayerEditorViewModel(undoManager);
            vm.Player = new Player() { Id = "J1",Name = "Toto" };

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No undo after ViewModel creation");
            Assert.AreEqual("Toto", vm.Name, "Initial Name");

            //vm.Name = "Dudu";
            undoManager.Do(() => vm.Name = "Dudu", () => vm.Name = "Toto", "Set name by hand", false);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo after Name change");
            Assert.AreEqual("Dudu", vm.Name, "Changed Name");

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No more undo.");
            Assert.AreEqual("Toto", vm.Name, "Name undo");
        }

    }
}
