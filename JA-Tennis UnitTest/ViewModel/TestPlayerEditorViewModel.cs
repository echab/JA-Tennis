using JA_Tennis.Model;
using JA_Tennis.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.ComponentModel;

namespace JA_Tennis_UnitTest.ViewModel
{
    [TestClass]
    public class TestPlayerEditorViewModel : WorkItemTest   //inherit for asynchronous tests
    {
        private Player player1;
        private Player player2;

        [TestInitialize]
        public void PrepareModel()
        {
            player1 = new Player()
            {
                Id = "J1",
                Name = "Toto"
            };
            player2 = new Player()
            {
                Id = "J20",
                Name = "Dudu"
            };
        }

        [TestCleanup]
        public void CleanupModel()
        {
            IdManager.FreeId(player1);
            player1 = null;
            IdManager.FreeId(player2.Id);
            player2 = null;
        }

        [TestMethod]
        public void TestConstructor()
        {
            PlayerEditorViewModel viewModel = new PlayerEditorViewModel(null);
            Assert.IsFalse(viewModel.IsPlayer);
            //Assert.IsNull(viewModel.Player);

#if WITH_SUBPLAYER
            viewModel.Player = player1;
            Assert.IsTrue(viewModel.IsPlayer);
            Assert.IsNotNull(viewModel.Player);
            //Assert.AreSame(player1, viewModel.Player);
            Assert.AreEqual(player1.Name, viewModel.Player.Name);
            //Assert.AreEqual(player1.Id, viewModel.Player.Id);
#else
            viewModel.Name = player1.Name;
            Assert.IsTrue(viewModel.IsPlayer);
            Assert.AreEqual(player1.Name, viewModel.Name);
#endif
        }

        //delegate void delegatePropertyChanged(object sender, PropertyChangedEventArgs e);

        [TestMethod]
        public void VerifyNotifyPropertyChanged()
        {
            PlayerEditorViewModel viewModel = new PlayerEditorViewModel(null);

            int nChangePlayer = 0;
            int nChangeOhter = 0;

            PropertyChangedEventHandler playerChanged = (sender, args) =>
            {
                Assert.AreSame(viewModel, sender);
                if ("Player" == args.PropertyName)
                {
                    nChangePlayer++;
                }
                else
                {
                    nChangeOhter++;
                }
            };

            viewModel.PropertyChanged += playerChanged;

            //TODO test Change
            Assert.IsFalse(viewModel.IsPlayer);

            viewModel.Player = player1;
            Assert.IsNotNull(viewModel.Player);
            Assert.IsTrue(viewModel.IsPlayer);
            Assert.AreEqual(1, nChangePlayer);

            viewModel.Player = player2;
            Assert.AreEqual(2, nChangePlayer);

            //viewModel.Player = player2;   
            //Assert.AreEqual(2, nChangePlayer);    //TODO change to the same player should not raise propertychanged

            viewModel.Player = null;
            Assert.AreEqual(3, nChangePlayer);
        }

        /* [TestMethod, Asynchronous]
        public void TestAsynchronous()
        {
            PlayerEditorViewModel viewModel = null;
            bool isOk = false;
            bool isDone = false;

            viewModel = new PlayerEditorViewModel(null);

            PropertyChangedEventHandler playerChanged = (sender, args) =>
            {
                Assert.AreSame(viewModel, sender);
                if ("Player" == args.PropertyName)
                {
                    isOk = true;
                }
            };
            viewModel.PropertyChanged += playerChanged;

            EnqueueCallback(delegate
            {
                viewModel.Player = player1;
                isDone = true;
            });
            EnqueueConditional(() => isDone);
            EnqueueCallback(delegate
            {
                Assert.IsTrue(isOk);
            });
            EnqueueTestComplete();
        }
        //*/

#if !WITH_SUBPLAYER
        [TestMethod]
        public void TestPlayerEditorViewModelChange()
        {
            PlayerEditorViewModel viewModel = null;

            viewModel = new PlayerEditorViewModel(null);

            bool nameChanged = false;
            bool idChanged = false;
            viewModel.PropertyChanged += (sender, args) =>
            {
                Assert.AreSame(viewModel, sender);
                if ("Name" == args.PropertyName)
                {
                    nameChanged = true;
                } 
                else if ("Id" == args.PropertyName)
                {
                    idChanged = true;
                }
            };

            viewModel.Id = player1.Id;
            viewModel.Name = player1.Name;
            Assert.IsTrue( nameChanged);
            Assert.IsTrue( idChanged);
        }
#endif
    }
}