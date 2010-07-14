using JA_Tennis.Command;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using JA_Tennis_UnitTest.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.ObjectModel;
using System.Collections.Generic;

namespace JA_Tennis_UnitTest.ComponentModel
{
    [TestClass]
    public class TestUndoCollectionBehavior
    {
        static UndoManager undoManager = new UndoManager();


        public class VMUndo : BindableType
        {
            public VMUndo()
            {
                _Pets = new ObservableCollection<Pet>();
                ChangeBehaviors.Add(new UndoPropertyBehavior(undoManager));
            }

            ICollection<Pet> _Pets;
            public ICollection<Pet> Pets { get { return _Pets; } }

            public void AddPet(Pet pet)
            {
                Add<Pet>(ref _Pets, pet, Member.Of(() => Pets));
            }
            public void RemovePet(Pet pet)
            {
                Remove<Pet>(ref _Pets, pet, Member.Of(() => Pets));
            }

            public class Pet
            {
                //public string Name { get; set; }

                string _Name;
                public string Name
                {
                    get { return _Name; }
                    set { _Name = value; }
                    //set { Set(ref _Name, value, () => Name); }
                }

                public override string ToString() { return Name; }
            }
        }


        [TestMethod]
        [Tag("undoc")]
        public void TestUndoCollection1()
        {
            VMUndo vm = new VMUndo();// { Pets = new ObservableCollection<VMUndo.Pet>() { new VMUndo.Pet() { Name = "Dog" } } };
            VMUndo.Pet dog = new VMUndo.Pet() { Name = "Dog" };
            VMUndo.Pet cat = new VMUndo.Pet() { Name = "Cat" };

            UndoPropertyBehavior undoPropertyBehavior = new UndoPropertyBehavior(undoManager);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null), "Initial state");
            Assert.AreEqual(0, vm.Pets.Count);

            //vm.Pets.Add( cat);
            vm.AddPet(cat);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual(1, vm.Pets.Count);

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual(0, vm.Pets.Count);

            undoManager.RedoCommand.Execute(null);

            Assert.IsTrue(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual(1, vm.Pets.Count);

            undoManager.UndoCommand.Execute(null);

            Assert.IsFalse(undoManager.UndoCommand.CanExecute(null));
            Assert.AreEqual(0, vm.Pets.Count);
        }
    }
}
