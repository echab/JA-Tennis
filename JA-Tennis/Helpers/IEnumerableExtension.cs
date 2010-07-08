using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace JA_Tennis.Helpers
{
#if SILVERLIGHT
    public static class IEnumerableExtension
    {
        /// <summary>
        /// ForEach missing in Silverlight 4
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="sequence"></param>
        /// <param name="action"></param>
        [DebuggerStepThrough]
        public static void ForEach<T>(this IEnumerable<T> sequence, Action<T> action)
        {
            if (sequence == null) throw new ArgumentNullException("sequence");
            if (action == null) throw new ArgumentNullException("action");
            foreach (T item in sequence)
            {
                action(item);
            }
        }

        //Return false to stop the loop
        [DebuggerStepThrough]
        public static void ForEach<T>(this IEnumerable<T> sequence, Func<T, bool> action)
        {
            if (sequence == null) throw new ArgumentNullException("sequence");
            if (action == null) throw new ArgumentNullException("action");

            foreach (T item in sequence)
            {
                if (!action(item))
                {
                    return;
                }
            }
        }

        [DebuggerStepThrough]
        public static int Count<T>(this IEnumerable<T> sequence)
        {
            if (sequence == null) throw new ArgumentNullException("sequence");
            int count = 0;
            foreach (T item in sequence)
            {
                count++;
            }
            return count;
        }

        [DebuggerStepThrough]
        public static IEnumerable<T> Where<T>(this IEnumerable<T> sequence, Predicate<T> predicate)
        {
            if (sequence == null) throw new ArgumentNullException("sequence");
            if (predicate == null) throw new ArgumentNullException("predicate");

            foreach (T item in sequence)
            {
                if (predicate(item))
                {
                    yield return item;
                }
            }
        }
    }
#endif //SILVERLIGHT
}
