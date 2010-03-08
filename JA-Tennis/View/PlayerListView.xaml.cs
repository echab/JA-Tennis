using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class PlayerListView : UserControl
    {
        public PlayerListView()
        {
            InitializeComponent();
        }

        public PlayerListViewModel ViewModel
        {
            get { return DataContext as PlayerListViewModel; }
            set { DataContext = value;}
        }
    }
}
