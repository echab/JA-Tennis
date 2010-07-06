using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class MainFrameView : UserControl
    {
        public MainFrameView()
        {
            InitializeComponent();
        }

        public MainFrameViewModel ViewModel {
            get { return DataContext as MainFrameViewModel; }
            set
            {
                DataContext = value;

                //Init children ViewModels
                playerListView.ViewModel = value.PlayerListViewModel;
                playerEditorView.ViewModel = value.PlayerEditorViewModel;
            }
        }

    }
}
