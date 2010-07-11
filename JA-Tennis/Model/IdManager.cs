using System;
using System.Collections.ObjectModel;

namespace JA_Tennis.Model
{
    public static class IdManager
    {
        private static Collection<string> Ids = new Collection<string>();

        public static void DeclareId(string id)
        {
            if (Ids.Contains(id))
            {
                throw new Exception(string.Format("Duplicated id: [{0}]", id));
            }

            Ids.Add(id);
        }

        public static void DeclareId( IIdentifiable obj)
        {
            DeclareId(obj.Id);
        }

        public static string CreateId(string prefix)
        {
            string id;

            do
            {
                id = string.Format("{0}{1:4X}", prefix ?? "", new Random().Next(0, 0xFFFF));
            }
            while (Ids.Contains(id));

            Ids.Add(id);

            return id;
        }
    }
}
