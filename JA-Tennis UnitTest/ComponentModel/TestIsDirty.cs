using System.Collections.Generic;
using JA_Tennis.ComponentModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.ComponentModel
{
    [TestClass, Tag("dirty")]
    public class TestIsDirty
    {
        class VMDirty : BindableType, IDirtyAware
        {
            public VMDirty() {
                ChangeBehaviors.Add(new DirtyPropertyBehavior(this));
            }
            string _Name;
            public string Name
            {
                get { return _Name; }
                set { Set(ref _Name, value, () => Name); }
            }

            public bool IsDirty { get; set; }
        }

        [TestMethod]
        public void TestIsDirty1()
        {
            VMDirty vm = new VMDirty()
            {
                Name = "Toto",
                IsDirty = false
            };

            vm.Name = "Dudu";

            Assert.IsTrue(vm.IsDirty);
        }


        class VMDirty2 : BindableType, IDirtyAware
        {
            public VMDirty2()
            {
                ChangeBehaviors.Add(new DirtyPropertyBehavior(this));
                _Pet = new Pet(this);
            }
            Pet _Pet;
            public Pet Pet
            {
                get { return _Pet; }
                set { Set(ref _Pet, value, () => Pet); }
            }

            public bool IsDirty { get; set; }
        }

        class Pet : BindableType
        {
            public Pet(BindableType parent)
                : base(parent)
            {
            }
            string _Kind;
            public string Kind
            {
                get { return _Kind; }
                set { Set(ref _Kind, value, () => Kind); }
            }
        }

        [TestMethod]
        public void TestIsDirty2()
        {
            VMDirty2 vm = new VMDirty2()
            {
                IsDirty = false
            };
            vm.Pet = new Pet(vm);
            vm.IsDirty = false;

            vm.Pet.Kind = "Cat";

            Assert.IsTrue(vm.IsDirty);
        }

    }
}
