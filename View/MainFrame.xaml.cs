using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using JA_Tennis.ViewModel;

namespace JA_Tennis.View
{
    public partial class MainFrame : UserControl
    {
        public MainFrameViewModel MainFrameViewModel {
            get { return (MainFrameViewModel)this.DataContext; } 
            set { this.DataContext=value;            }
        }

        public MainFrame()
        {
            InitializeComponent();
        }
    }
}
