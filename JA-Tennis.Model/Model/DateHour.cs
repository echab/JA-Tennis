using System;
using System.Diagnostics;

namespace JA_Tennis.Model
{
    public class DateHour : IComparable<DateHour>
    {
        DateTime _DateTime;
        public bool HasHour { get; private set; }


        #region Constructor
        public DateHour() : this(null, true) { }    //for serialization

        public DateHour(DateTime dateTime) : this(dateTime, true) { }

        public DateHour(DateTime dateTime, bool hasHour)
        {
            _DateTime = dateTime;
            HasHour = hasHour;
        }

        [DebuggerStepThrough]
        public DateHour(string dateHour)
        {
            if (dateHour == null)
            {
                throw new ArgumentNullException("dateHour");
            }

            HasHour = dateHour.IndexOf(' ', 0) != -1;

            _DateTime = DateTime.ParseExact(dateHour,
                HasHour
                ? "yyyy/M/d H:mm"
                : "yyyy/M/d"
                , null);
        }

        [DebuggerStepThrough]
        public DateHour(string dateHour, bool hasHour)
        {
            if (dateHour == null)
            {
                throw new ArgumentNullException("dateHour");
            }

            HasHour = hasHour;

            _DateTime = DateTime.ParseExact(dateHour,
                HasHour
                ? "yyyy/M/d H:mm"
                : "yyyy/M/d"
                , null);
        }
        #endregion Constructor


        #region Implicit operator
        public static implicit operator DateTime(DateHour dateHour)
        {
            return dateHour._DateTime;
        }

        public static implicit operator DateHour(DateTime dateTime)
        {
            return new DateHour(dateTime);
        }

        public static implicit operator string(DateHour dateHour)
        {
            return
                dateHour != null
                ? dateHour._DateTime.ToString(
                    dateHour.HasHour
                    ? "yyyy/M/d H:mm"
                    : "yyyy/M/d"
                    )
                : null;
        }

        public static implicit operator DateHour(string s)
        {
            return s != null ? new DateHour(s) : null;
        }

        #endregion Implicit operator


        #region IComparable Members

        public int CompareTo(DateHour obj)
        {
            if (!(obj is DateHour))
            {
                throw new ArgumentException("Not an DateHour", "obj");
            }

            DateHour other = (DateHour)obj;

            if ((!HasHour || !other.HasHour)
                && _DateTime.Year == other._DateTime.Year
                && _DateTime.Month == other._DateTime.Month
                && _DateTime.Day == other._DateTime.Day
                )
            {
                return 0;   //same date, without hours
            }

            return this._DateTime.CompareTo(other);
        }
        #endregion


        public override string ToString()
        {
            return (string)this;
        }
    }
}
