using System;
using System.Reflection;

namespace JA_Tennis.Command
{
    public class UndoablePropertySet<T> : UndoRedoActions
    {
        public UndoablePropertySet( object owner, T newVal, string name)
        {
            Type ownerType = owner.GetType();

            //FieldInfo propInfo = ownerType.GetField(name, BindingFlags.Instance | BindingFlags.Public | BindingFlags.GetProperty | BindingFlags.SetProperty | BindingFlags.GetField | BindingFlags.SetField);

            //if (propInfo == null)
            //{
            //    throw new ArgumentException("Property nof found " + name);
            //}

            //T oldVal = (T)propInfo.GetValue(owner);

            PropertyInfo propInfo = ownerType.GetProperty(name, typeof(T));

            if (propInfo == null)
            {
                throw new ArgumentException("Property nof found " + name);
            }

            T oldVal = (T)propInfo.GetValue(owner, null);   //TODO échec d'accés à la property ???

            base.DoAction = () => propInfo.SetValue( owner, newVal, null);
            base.UndoAction = () => propInfo.SetValue(owner, oldVal,null);
            
            base.Description ="Set " + name;
        }
    }
}
