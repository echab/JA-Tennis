using JA_Tennis.Model;
using JA_Tennis.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.ComponentModel;

namespace JA_Tennis_UnitTest.ViewModel
{
    [TestClass]
    public class TestPlayerEditorViewModel : WorkItemTest
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
                Id = "J2",
                Name = "Dudu"
            };
        }

        [TestCleanup]
        public void CleanupModel()
        {
            player1 = null;
        }

        [TestMethod]
        public void TestConstructor()
        {
            PlayerEditorViewModel viewModel = new PlayerEditorViewModel();
            Assert.IsFalse(viewModel.IsPlayer);
            Assert.IsNull(viewModel.Player);

            viewModel.Player = player1;
            Assert.IsTrue(viewModel.IsPlayer);
            Assert.IsNotNull(viewModel.Player);
            Assert.AreSame(player1,viewModel.Player);
        }
 
        //delegate void delegatePropertyChanged(object sender, PropertyChangedEventArgs e);

        [TestMethod]
        public void VerifyNotifyPropertyChanged()
        {
            PlayerEditorViewModel viewModel = new PlayerEditorViewModel();

            int nChangePlayer = 0;
            int nChangeOhter = 0;

            PropertyChangedEventHandler playerChanged = (sender, args) =>
            {
                Assert.AreSame(viewModel,sender);
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

            Assert.IsNull(viewModel.Player);
            viewModel.Player = player1;
            Assert.IsNotNull(viewModel.Player);
            Assert.AreEqual(1,nChangePlayer);

            viewModel.Player = player1;
            Assert.AreEqual(1,nChangePlayer);

            viewModel.Player = player2;
            Assert.AreEqual(2,nChangePlayer);

            viewModel.Player = null;
            Assert.AreEqual(3,nChangePlayer);
        }


        [TestMethod]
        [Asynchronous]
        public void TestAsynchronous() 
        {
            PlayerEditorViewModel viewModel = new PlayerEditorViewModel();

            PropertyChangedEventHandler playerChanged = (sender, args) =>
            {
                Assert.AreSame(viewModel, sender);
                if ("Player" == args.PropertyName)
                {
                    EnqueueTestComplete();
                }
            };

            viewModel.PropertyChanged += playerChanged;

            viewModel.Player = player1;
        }
    }
}