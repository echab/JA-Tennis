using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class PlayerListView : UserControl
    {
        public PlayerListView(PlayerListViewModel viewModel)
        {
            InitializeComponent();

            this.DataContext = viewModel;
        }
    }
}
