using System;

namespace JA_Tennis.ComponentModel
{
    public interface IIdentifiable : IDisposable
    {
        string Id { get; set; }

        //Should FreeId into Dispose()
    }
}
