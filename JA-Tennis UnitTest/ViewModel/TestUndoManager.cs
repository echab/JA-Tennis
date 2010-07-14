using JA_Tennis.Command;
using JA_Tennis.Helpers;
using JA_Tennis.Model;
using JA_Tennis.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.ViewModel
{
    [TestClass]
    public class TestUndoManager
    {
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
            undoManager.Do(new UndoableProperty<object, string>(vm, Member.Of(() => vm.Name), vm.Name, "Dudu"), false);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo after Name change");
            Assert.AreEqual("Dudu", vm.Name, "Changed Name");

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No more undo.");
            Assert.AreEqual("Toto", vm.Name, "Name undo");

        }

        [TestMethod]
        [Tag("undo0")]
        public void TestUndo1()
        {
            UndoManager undoManager = new UndoManager();

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initially no undo");

            PlayerEditorViewModel vm = new PlayerEditorViewModel(undoManager)
#if WITH_SUBPLAYER
            { Player = new Player() { Id = "J10", Name = "Toto" } }
#else
            { Id = "J10", Name = "Toto" }
#endif
            ;

            undoManager.Clear();    //TODO virer undoManager.Clear()

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No undo after ViewModel creation");
#if WITH_SUBPLAYER
            Assert.AreEqual("Toto", vm.Player.Name, "Initial Name");
#else
            Assert.AreEqual("Toto", vm.Name, "Initial Name");
#endif

#if WITH_SUBPLAYER
            vm.Player.Name = "Dudu";
#else
            vm.Name = "Dudu";
#endif
            //undoManager.Do(() => vm.Name = "Dudu", () => vm.Name = "Toto", "Set name by hand", false);
            //undoManager.Do(new UndoableProperty<PlayerEditorViewModel, string>(vm, Member.Of(() => vm.Name), vm.Name, "Dudu", "Set name by hand"), true);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null), "Undo after Name change");
#if WITH_SUBPLAYER
            Assert.AreEqual("Dudu", vm.Player.Name, "Changed Name");
#else
            Assert.AreEqual("Dudu", vm.Name, "Changed Name");
#endif

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "No more undo.");
#if WITH_SUBPLAYER
            Assert.AreEqual("Toto", vm.Player.Name, "Name undo");
#else
            Assert.AreEqual("Toto", vm.Name, "Name undo");
#endif
        }

    }
}
