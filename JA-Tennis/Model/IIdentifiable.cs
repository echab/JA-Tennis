using System;

namespace JA_Tennis.Model
{
    public interface IIdentifiable : IDisposable
    {
        string Id { get; set; }

        //Should FreeId into Dispose()
    }
}
