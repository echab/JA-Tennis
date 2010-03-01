using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class PlayerEditorView : UserControl
    {
        public PlayerEditorView()
        {
            InitializeComponent();
        }

        public PlayerEditorViewModel ViewModel
        {
            set
            {
                this.DataContext = value;
            }
        }
    }
}
