using System.Windows.Controls;
using JA_Tennis.ViewModel;
using System.Windows.Data;

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
            set { 
                DataContext = value;

                //TODO: Bind Listbox SelectedItem to Selection.Player
                //PlayerListbox.SetBinding(ListBox.SelectedItemProperty,
                //    new Binding()
                //    {
                //        Source = value.Selection.Player,
                //        Mode = BindingMode.TwoWay
                //    });
            }
        }
    }
}
