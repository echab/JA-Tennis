using System;
using System.Reflection;
using JA_Tennis.Model;
using System.Diagnostics;

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
        /// <param name="fields"></param>
        public static void Copy(
            object toRecord,
            object fromRecord,
            PropertyInfo[] fields
        )
        {
            if (fields == null)
            {
                return;
            }

            Type toType = toRecord.GetType();

            foreach (PropertyInfo fromField in fields)
            {
                if (fromField.CanRead)
                {
                    PropertyInfo toField = toType.GetProperty(fromField.Name, fromField.PropertyType);
                    if (toField != null && toField.CanWrite)
                    {
                        //TODO copy IdRef or IdRefs by string
                        //if (toField.PropertyType.Name == @"IdRefs`1")
                        //{
                        //    //PropertyInfo toField2 = toField.PropertyType.GetProperty("Ids");
                        //    //string ids = toField2.GetValue();
                        //    //Debug.Assert(false);
                        //}
                        //else
                        {
                            object v = fromField.GetValue(fromRecord, null);

                            ////if (toField == typeof(IIdentifiable).GetProperty("Id"))
                            //if (toField.Name == "Id" && v is string)
                            //{
                            //    v = IdManager.CreateId((v as string).Substring(0, 1));
                            //}

                            toField.SetValue(toRecord, v, null);
                        }
                    }
                }
            }
        }

        public static void Copy(object toRecord, object fromRecord)
        {
            if (toRecord == null) { throw new ArgumentNullException("toRecord"); }

            PropertyInfo[] fields;

            if (fromRecord != null)
            {
                fields = fromRecord.GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public);
                Copy(toRecord, fromRecord, fields);
            }
            else
            {
                Clear(toRecord, null);
            }
        }
        #endregion

        /// <summary>
        /// Clear all writable properties of the record, setting them to null.
        /// </summary>
        /// <param name="toRecord"></param>
        /// <param name="fields">Fields to clear or <c>null</c> for all fields.</param>
        public static void Clear(
            object toRecord,
            PropertyInfo[] fields
        )
        {
            if (fields == null)
            {
                fields = toRecord.GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public);
            }

            Type toType = toRecord.GetType();

            foreach (PropertyInfo field in fields)
            {
                PropertyInfo toField = toType.GetProperty(field.Name, field.PropertyType);
                if (toField != null && toField.CanWrite)
                {
                    toField.SetValue(toRecord, null, null);
                }
            }
        }

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
