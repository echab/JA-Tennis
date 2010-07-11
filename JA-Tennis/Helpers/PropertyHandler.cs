namespace JA_Tennis.Helpers
{
    // http://www.eggheadcafe.com/tutorials/aspnet/a4264125-fcb0-4757-9d78-ff541dfbcb56/net-reflection--copy-class-properties.aspx

    using System;
    using System.Collections.Generic;
    using System.Reflection;
    using System.Text;
    using System.Diagnostics;

    public class PropertyHandler
    {
        #region Set Properties
        public static void SetProperties(PropertyInfo[] fromFields,
                                         PropertyInfo[] toFields,
                                         object fromRecord,
                                         object toRecord)
        {
            PropertyInfo fromField = null;
            PropertyInfo toField = null;

            try
            {

                if (fromFields == null)
                {
                    return;
                }
                if (toFields == null)
                {
                    return;
                }

                for (int f = 0; f < fromFields.Length; f++)
                {

                    fromField = (PropertyInfo)fromFields[f];

                    for (int t = 0; t < toFields.Length; t++)
                    {

                        toField = (PropertyInfo)toFields[t];

                        if (fromField.Name != toField.Name)
                        {
                            continue;
                        }

                        toField.SetValue(toRecord,
                                         fromField.GetValue(fromRecord, null),
                                         null);
                        break;

                    }

                }

            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion

        #region Set Properties
        /// <summary>
        /// Copy properties from an object to another.
        /// </summary>
        /// <param name="fromFields"></param>
        /// <param name="fromRecord"></param>
        /// <param name="toRecord"></param>
        public static void SetProperties(PropertyInfo[] fromFields,
                                         object fromRecord,
                                         object toRecord)
        {
            try
            {
                if (fromFields == null)
                {
                    return;
                }

                Type toType = toRecord.GetType();

                foreach (PropertyInfo fromField in fromFields)
                {
                    PropertyInfo toField = toType.GetProperty(fromField.Name, fromField.PropertyType);
                    if (toField != null)
                    {
                        object v = fromField.GetValue(fromRecord, null);

                        //fromField.SetValue(toRecord, v, null);
                        toField.SetValue(toRecord, v, null);
                    }
                }

            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion

        public static void SetProperties(object fromRecord,
                                         object toRecord)
        {
            PropertyInfo[] fromFields = fromRecord.GetType().GetProperties(BindingFlags.GetProperty | BindingFlags.Instance | BindingFlags.Public);

            SetProperties(fromFields, fromRecord, toRecord);
        }

        //public static PropertyInfo GetPropertyByName(Type type, string propertyName)
        //{
        //    return type.GetProperty(propertyName);
        //    //foreach (PropertyInfo pi in type.GetProperties())
        //    //{
        //    //    if (pi.Name == propertyName)
        //    //    {
        //    //        return pi;
        //    //    }
        //    //}
        //    //return null;
        //}
    }
}
