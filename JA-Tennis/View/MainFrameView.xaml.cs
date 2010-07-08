using System.Windows.Controls;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class MainFrameView : UserControl
    {
        public MainFrameView()
        {
            //On message: No matching constructor found on type 'JA_Tennis.Assets.Resources.Strings'. [Line: 18 Position: 28]
            //Change into generated file JA_Tennis\Assets\Resources\Strings.Designer.cs:
            //  internal Strings()
            //to
            //  public Strings()

            InitializeComponent();
        }

        public MainFrameViewModel ViewModel {
            get { return DataContext as MainFrameViewModel; }
            set
            {
                //Init children ViewModels
                playerListView.ViewModel = value.PlayerListViewModel;
                playerEditorView.ViewModel = value.PlayerEditorViewModel;

                DataContext = value;
            }
        }

    }
}
