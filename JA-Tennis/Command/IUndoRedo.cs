
namespace JA_Tennis.Command
{
    // http://www.codeproject.com/Articles/55937/Undoing-MVVM.aspx

    /// <summary>
    /// The interface describing the Undo/Redo operation.
    /// </summary>
    public interface IUndoRedo
    {
        /// <summary>
        /// The optional name for the Undo/Redo property.
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Code to perform the Undo operation.
        /// </summary>
        void Undo();

        /// <summary>
        /// Code to perform the Redo operation.
        /// </summary>
        void Redo();
    }
}
