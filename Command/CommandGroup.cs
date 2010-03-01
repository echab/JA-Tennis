using System.Collections.Generic;
using System.Windows.Markup;

namespace JA_Tennis.Command
{
    //extracted from http://agcommandmanager.codeplex.com/

    [ContentProperty("Children")]
    public class CommandGroup
    {
        List<CommandBinding> _children = new List<CommandBinding>();
        public List<CommandBinding> Children
        {
            get { return _children; }
        }
    }
}
