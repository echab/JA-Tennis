using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Windows.Controls.Primitives;

namespace JA_Tennis.Command
{
    // http://blogs.southworks.net/jdominguez/2008/08/icommand-for-silverlight-with-attached-behaviors/

    public class CommandButtonBehavior
    {
        private readonly WeakReference elementReference;
        private readonly ICommand command;

        public CommandButtonBehavior(ButtonBase element, ICommand command)
        {
            this.elementReference = new WeakReference(element);
            this.command = command;
        }

        public void Attach()
        {
            ButtonBase element = GetElement();
            if (element != null)
            {
                element.Click += element_Clicked;
            }
        }

        public void Detach()
        {
            ButtonBase element = GetElement();
            if (element != null)
            {
                element.Click -= element_Clicked;
            }
        }

        private static void element_Clicked(object sender, EventArgs e)
        {
            DependencyObject element = (DependencyObject)sender;
            ICommand command = (ICommand)element.GetValue(CommandProperty);
            object commandParameter = element.GetValue(CommandParameterProperty);
            command.Execute(commandParameter);
        }

        private ButtonBase GetElement()
        {
            return elementReference.Target as ButtonBase;
        }
    }
}
