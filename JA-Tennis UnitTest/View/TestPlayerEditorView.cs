using JA_Tennis.Model;
using JA_Tennis.View;
using JA_Tennis.ViewModel;
using Microsoft.Silverlight.Testing;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest.View
{
    [TestClass]
    [Ignore]    //TODO Test PlayerEditorView
    public class TestPlayerEditorView : SilverlightTest
    {
        private PlayerEditorView view; //= new PlayerEditorView();
        private PlayerEditorViewModel viewModel; // = new PlayerEditorViewModel(null);
        private PlayerEditorViewModel viewModelEmpty; // = new PlayerEditorViewModel(null);

        [TestInitialize]
        public void PrepareView()
        {
            viewModel = new PlayerEditorViewModel(null)
            {
#if WITH_SUBPLAYER
                Player = new Player()
                {
                    Id = "J1",
                    Name = "Toto"
                }
#else
                Id = "J1",
                Name = "Toto"
#endif
            };

            //TODO Test View: Cannot find ResourceWrapper
            view = new PlayerEditorView()
            {
                ViewModel = viewModel
            };
            TestPanel.Children.Add(view);

            viewModelEmpty = new PlayerEditorViewModel(null);

        }

        [TestCleanup]
        public void CleanupView()
        {
            viewModel = null;
            view = null;
        }

        //*
        [TestMethod]
        public void TestConstructor()
        {
            Assert.IsNull(view.ViewModel);
            Assert.IsNull(view.DataContext);

            view.ViewModel = viewModel;
        }

        [TestMethod]
        public void TestDataContext()
        {
            Assert.IsNull(view.ViewModel);
            Assert.IsNull(view.DataContext);

            view.ViewModel = viewModelEmpty;

            Assert.AreSame(viewModelEmpty, view.DataContext);
            Assert.AreSame(viewModelEmpty, view.ViewModel);
            Assert.IsFalse(view.ViewModel.IsPlayer);
#if WITH_SUBPLAYER
            Assert.IsNull(view.ViewModel.Player);
#else
            Assert.IsNull(view.ViewModel.Name);
#endif

            view.ViewModel = viewModel;

            Assert.AreSame(viewModel, view.DataContext);
            Assert.AreSame(viewModel, view.ViewModel);
            Assert.IsTrue(view.ViewModel.IsPlayer);
#if WITH_SUBPLAYER
            Assert.IsNotNull(view.ViewModel.Player);
#else
            Assert.IsNotNull(view.ViewModel.Name);
#endif
        }
        //*/

        /*
        // http://www.wintellect.com/CS/blogs/jlikness/archive/2010/01/07/silverlight-unit-testing-framework-asynchronous-testing-of-behaviors.aspx
        const string TESTXAML =
            "<UserControl " +
                "xmlns=\"http://schemas.microsoft.com/winfx/2006/xaml/presentation\" " +
                "xmlns:x=\"http://schemas.microsoft.com/winfx/2006/xaml\" " +
                "xmlns:vm=\"clr-namespace:PRISMMEF.Common.Behavior;assembly=PRISMMEF.Common\">" +
                    "<Grid x:Name=\"LayoutRoot\" Background=\"White\" " +
                        "vm:ViewModelBehavior.ViewModel=\"PRISMMEF.Tests.Helper.TestViewModel, PRISMMEF.Tests, Version=1.0.0.0\">" +
                        "<ListBox x:Name=\"ListBox\" ItemsSource=\"{Binding ListOfItems}\"/>" +
            "</Grid></UserControl>";

        [TestMethod]
        [Asynchronous]
        [Description("Test creating from XAML")]
        public void TestFromXaml()
        {
            UserControl control = XamlReader.Load(TESTXAML) as UserControl;

            control.Loaded += (o, e) =>
            {
                ListBox listBox = control.FindName("ListBox") as ListBox;

                Assert.IsNotNull(listBox, "ListBox was not found.");
                Assert.IsNotNull(listBox.DataContext, "The data context was never bound.");
                Assert.AreSame(listBox.DataContext, _viewModel, "The data context was not bound to the correct view model.");

                IEnumerable<string> list = listBox.ItemsSource as IEnumerable<string>;
                List<string> targetList = new List<string>(list);
                CollectionAssert.AreEquivalent(targetList, _testCollection, "Collection not properly bound.");

                EnqueueTestComplete();
            };

            TestPanel.Children.Add(control);
        }
        //*/
    }
}
