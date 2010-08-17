using System;
using System.Collections.Generic;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;
using System.Diagnostics;

namespace JA_Tennis.Model
{
    public class BoxArray
    {
        private Dictionary<int, Box> _Boxes = new Dictionary<int, Box>();


        #region Constructor
        [DebuggerStepThrough]
        public Box Add(Box box)
        {
            if (box == null)
            {
                throw new ArgumentNullException("box");
            }

            if (_Boxes.ContainsValue(box))
            {
                throw new ArgumentException("Item already in array.", "box");
            }

            box.PropertyChanging += box_PropertyChanging;

            _Boxes.Add(box.Position, box);

            return box;
        }
        #endregion Constructor


        #region Remove
        [DebuggerStepThrough]
        public bool Remove(Box box)
        {
            if (box == null)
            {
                throw new ArgumentNullException("box");
            }

            if (!_Boxes.ContainsValue(box))
            {
                throw new ArgumentException("Item not found.", "box");
            }

            box.PropertyChanging -= box_PropertyChanging;

            return _Boxes.Remove(box.Position);
        }

        public void Remove(int position)
        {
            Box box = this[position];
            if (box != null)
            {
                box.PropertyChanging -= box_PropertyChanging;

                _Boxes.Remove(position);
            }
        }
        #endregion Remove


        public void Clear()
        {
            foreach (Box box in _Boxes.Values)
            {
                box.PropertyChanging -= box_PropertyChanging;
            }

            _Boxes.Clear();
        }


        public Box this[int position]
        {
            get { return _Boxes.ContainsKey(position) ? _Boxes[position] : null; }
        }


        public int Count
        {
            get { return _Boxes.Count; }
        }


        public IEnumerable<Box> Values
        {
            get { return _Boxes.Values; }
        }


        public bool ContainsKey(int position)
        {
            return _Boxes.ContainsKey(position);
        }


        void box_PropertyChanging(object sender, PropertyChangingEventArgs e)
        {
            Box box = (Box)sender;

            if (e.PropertyName == Member.Of(() => box.Position))
            {
                Remove((int)e.OldValue);
                Add(box);
            }
        }
    }
}
