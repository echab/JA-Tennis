using System;
using System.Diagnostics;

namespace JA_Tennis.ComponentModel
{
    public class Range<T> : BindableType where T : IComparable<T>
    {
        #region Constructor
        public Range()    //For serialization
            : this(default(T), default(T), null)
        { }

        [DebuggerStepThrough]
        public Range(T min, T max)
            : this(min, max, null)
        { }

        [DebuggerStepThrough]
        public Range(T min, T max, BindableType parentAggregate)
            : base(parentAggregate)
        {
            CheckValues(min, max);

            _Min = min;
            _Max = max;
        }
        #endregion Constructor


        #region Min property
        T _Min;
        public T Min
        {
            get { return _Min; }
            set
            {
                CheckValues(value, _Max);
                Set(ref _Min, value, () => Min);
            }
        }
        #endregion Min


        #region Max property
        T _Max;
        public T Max
        {
            get { return _Max; }
            set
            {
                CheckValues(_Min, value);
                Set(ref _Max, value, () => Max);
            }
        }
        #endregion


        public bool InRange(T value)
        {
            return value != null
                && (_Min == null || _Min.CompareTo(value) <= 0)
                && (_Max == null || value.CompareTo(_Max) <= 0);
        }


        [DebuggerStepThrough]
        private static void CheckValues(T min, T max)
        {
            if (min != null && max != null)
            {
                if (min.CompareTo(max) > 0)
                {
                    throw new ArgumentException("min must be inferior or equal to max");
                }
            }
        }


        #region override
        public override string ToString()
        {
            return string.Format("[{0}<{1}]",
                _Min != null ? _Min.ToString() : string.Empty,
                _Max != null ? _Max.ToString() : string.Empty
                );
        }
        #endregion override
    }
}
