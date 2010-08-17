using System.Xml;
using System.ComponentModel;
using System;
using System.Diagnostics;

namespace JA_Tennis.Helpers
{
    public static class XmlSerializationExtension
    {
        public static int GetAttributeOrDefaultInt(this XmlReader reader, string localName, int defaultValue)
        {
            string s = reader.GetAttribute(localName);
            if (!string.IsNullOrWhiteSpace(s))
            {
                int v;
                if (!int.TryParse(s, out v))
                {
                    throw new XmlException("Invalid int value");
                }
                return v;
            }
            return defaultValue;
        }

        //public static T GetAttributeOrDefault<T>(this XmlReader reader, string localName, T defaultValue) where T : struct
        //{
        //    string s = reader.GetAttribute(localName);
        //    if (!string.IsNullOrWhiteSpace(s))
        //    {
        //        Type t = typeof(T);
        //        if( t.IsAssignableFrom( typeof(string))) {
        //            //T v = t.InvokeMember(             
        //            Debug.Assert(true);
        //        }

        //        //if(typeof(T)==typeof(int)) {
        //        //    int v;
        //        //    if (!int.TryParse(s, out v))
        //        //    {
        //        //        throw new XmlException("Invalid int value");
        //        //    }
        //        //    return (T)v;
        //        //}

        //        TypeConverter converter = new TypeConverter();
        //        if (converter.CanConvertTo(typeof(T)) && converter.CanConvertFrom(typeof(string)))
        //        {
        //            T v = (T)converter.ConvertFromString(s);
        //            return v;
        //        }
        //        else
        //        {
        //            throw new XmlException("Invalid value");
        //        }
        //    }
        //    return defaultValue;
        //}

        //public static int? ReadAttributeNotNull(this XmlReader reader, string localName)
        //{
        //    string s = reader.GetAttribute(localName);
        //    if (!string.IsNullOrWhiteSpace(s))
        //    {
        //        int v;
        //        if (!int.TryParse(s, out v))
        //        {
        //            throw new XmlException("Invalid int value");
        //        }
        //        return v;
        //    }
        //    return null;
        //}

        //public static void WriteElementNotNull(this XmlWriter writer, string localName, string value)
        //{
        //    if (value != null)
        //    {
        //        writer.WriteElementString(localName, value);
        //    }
        //}

        public static void WriteElementOrDefault<T>(this XmlWriter writer, string localName, T value, T defaultValue) where T : IComparable
        {
            if (value != null || defaultValue != null)
            {
                if (value.CompareTo(defaultValue) != 0)
                {
                    writer.WriteElementString(localName, value.ToString());
                }
            }
        }


        public static void WriteAttributeNotNull(this XmlWriter writer, string localName, string value)
        {
            if (value != null)
            {
                writer.WriteAttributeString(localName, value);
            }
        }

        public static void WriteAttributeOrDefault<T>(this XmlWriter writer, string localName, T value, T defaultValue) where T : IComparable
        {
            if (value.CompareTo(defaultValue) != 0)
            {
                if (typeof(T) == typeof(Boolean))
                {
                    writer.WriteAttributeString(localName, value.CompareTo(true) == 0 ? "1" : "0");
                }
                else
                {
                    writer.WriteAttributeString(localName, value.ToString());
                }
            }
        }

        public static void WriteAttributeTrue(this XmlWriter writer, string localName, bool value)
        {
            if (value)
            {
                writer.WriteAttributeString(localName, "1");
            }
        }
    }
}
