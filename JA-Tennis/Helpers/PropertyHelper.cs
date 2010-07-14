using System;
using System.Reflection;
using JA_Tennis.Model;

namespace JA_Tennis.Helpers
{
    public static class PropertyHelper
    {
        public static T Clone<T>(T source) where T : new()
        {
            if (source == null) { return default(T); }

            T target = new T();

            Copy(target, source);

            return target;
        }

        #region Copy Properties
        /// <summary>
        /// Copy properties from an object to another.
        /// </summary>
        /// <param name="toRecord"></param>
        /// <param name="fromRecord"></param>
        /// <param name="fromFields"></param>
        public static void Copy(
            object toRecord,
            object fromRecord,
            PropertyInfo[] fromFields
        )
        {
            if (fromFields == null)
            {
                return;
            }

            Type toType = toRecord.GetType();

            foreach (PropertyInfo fromField in fromFields)
            {
                if (fromField.CanRead)
                {
                    PropertyInfo toField = toType.GetProperty(fromField.Name, fromField.PropertyType);
                    if (toField != null && toField.CanWrite)
                    {
                        object v = fromField.GetValue(fromRecord, null);

                        //if (toField == typeof(IIdentifiable).GetProperty("Id"))
                        if (toField.Name == "Id" && v is string)
                        {
                            v = IdManager.CreateId((v as string).Substring(0, 1));
                        }

                        toField.SetValue(toRecord, v, null);
                    }
                }
            }

        }

        public static void Copy(object toRecord, object fromRecord)
        {
            PropertyInfo[] fromFields = fromRecord.GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public);

            Copy(toRecord, fromRecord, fromFields);
        }
        #endregion

        /// <summary>
        /// Return property info from a full property path.
        /// </summary>
        /// <param name="owningInstance"></param>
        /// <param name="propertyPath">Property composed of names separated by dot. <example>My.Object.Age</example></param>
        /// <param name="obj"></param>
        /// <param name="property"></param>
        /// <returns></returns>
        public static bool GetPropertyByPath(object owningInstance, string propertyPath, out object obj, out PropertyInfo property)
        {
            if (owningInstance == null) { throw new ArgumentException(Member.Of(() => owningInstance)); }

            obj = owningInstance;

            //Decode property Path
            string[] elements = propertyPath.Split('.');
            for (var i = 0; i < elements.Length - 1; i++)
            {
                string propName = elements[i];

                Type objType = obj.GetType();
                PropertyInfo prop = objType.GetProperty(propName);
                if (prop == null)
                {
                    throw new ArgumentException(propName);
                }

                obj = objType.GetProperty(propName);
            }

            string propertyName = elements[elements.Length - 1];

            Type objectType = obj.GetType();
            property = objectType.GetProperty(propertyName);
            if (property == null)
            {
                throw new ArgumentException(propertyName);
            }

            return true;
        }
    }
}
