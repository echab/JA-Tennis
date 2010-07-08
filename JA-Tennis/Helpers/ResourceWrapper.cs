namespace JA_Tennis.Assets.Resources
{
    /// <summary>
    /// Wraps access to the strongly typed resource classes so that you can bind
    /// control properties to resource strings in XAML
    /// </summary>
    public sealed class ResourceWrapper
    {
        private static Strings applicationStrings = new Strings();

        /// <summary>
        /// Gets the <see cref="Strings"/>.
        /// </summary>
        public Strings Strings
        {
            get { return applicationStrings; }
        }
    }
}
