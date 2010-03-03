using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class MainFrame : UserControl
    {
        public MainFrame()
        {
            InitializeComponent();
        }

        public MainFrameViewModel ViewModel {
            set
            {
                this.DataContext = value;

                //Init player list
                //TODO: Bind to selected tournament
                playerListView.ViewModel = new PlayerListViewModel( 
                    value.Tournaments[0]
                );

                playerEditorView.ViewModel = new PlayerEditorViewModel(
                    value.Tournaments[0].Players[0]
                );
            }
        }
    }
}
