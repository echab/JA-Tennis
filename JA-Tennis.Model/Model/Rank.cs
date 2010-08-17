using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using System.Xml.Schema;

namespace JA_Tennis.Model
{
    public class Rank : BindableType, IComparable<Rank> //, IXmlSerializable
    {
        #region Constructor
        public Rank() { } //For serialization

        protected Rank(int value, string text, string division) //For static initialization
        {
            Value = value;
            Text = text;
            Division = division;
        }

        [DebuggerStepThrough]
        public Rank(string text)
        {
            Rank rank = Ranks.FirstOrDefault(r => r.Text == text);
            if (rank == null)
            {
                throw new ArgumentException("Invalid Rank", "text");
            }

            Value = rank.Value;
            Text = rank.Text;
        }

        [DebuggerStepThrough]
        public Rank(int value)
        {
            Rank rank = Ranks.FirstOrDefault(r => r.Value == value);
            if (rank == null)
            {
                throw new ArgumentException("Invalid Rank", "value");
            }
            Value = rank.Value;
            Text = rank.Text;
        }
        #endregion Constructor


        #region Properties
        [XmlIgnore]
        public int Value { get; private set; }

        [XmlAttribute]  //TODO
        public string Text { get; private set; }

        [XmlIgnore]
        public string Division { get; private set; }
        #endregion Properties


        #region Converters
        public static implicit operator Rank(string s)
        {
            return s != null ?  new Rank(s) : null;
        }
        public static implicit operator string(Rank rank)
        {
            return rank != null ? rank.Text : null;
        }
        #endregion Converters


        #region IComparable<Rank> Members

        public int CompareTo(Rank other)
        {
            return other.Value - Value;
        }

        #endregion


        #region override
        public override bool Equals(object obj)
        {
            return obj is Rank
                && Value == ((Rank)obj).Value;
        }
        public override int GetHashCode()
        {
            return Value.GetHashCode();
        }
        public override string ToString()
        {
            return Text;
        }
        #endregion override


        #region static
        static Rank()
        {
            const string SERIE4 = "4e série";
            const string SERIE3 = "3e série";
            const string SERIE2 = "2e série";
            const string SERIE1 = "1e série";

            Ranks = new Collection<Rank>()
            {
                new Rank( 19,"NC", SERIE4 ),
                new Rank( 18,"40", SERIE4 ),
                new Rank( 17,"30/5", SERIE4 ),
                new Rank( 16,"30/4", SERIE4 ),
                new Rank( 15,"30/3", SERIE4 ),
                new Rank( 14,"30/2", SERIE4 ),
                new Rank( 13,"30/1", SERIE4 ),

                new Rank( 12,"30", SERIE3 ),
                new Rank( 11,"15/5", SERIE3 ),
                new Rank( 10,"15/4", SERIE3 ),
                new Rank( 9,"15/3", SERIE3 ),
                new Rank( 8,"15/2", SERIE3 ),
                new Rank( 7,"15/1", SERIE3 ),

                new Rank( 6,"15", SERIE2 ),
                new Rank( 5,"5/6", SERIE2 ),
                new Rank( 4,"4/6", SERIE2 ),
                new Rank( 3,"3/6", SERIE2 ),
                new Rank( 2,"2/6", SERIE2 ),
                new Rank( 1,"1/6", SERIE2 ),

                new Rank( 0, "0", SERIE1 ),
                new Rank( -1,"-1/6", SERIE1 ),
                new Rank( -2,"-2/6", SERIE1 ),
                new Rank( -3,"-3/6", SERIE1 ),
                new Rank( -4,"-4/6", SERIE1 ),
                new Rank( -5,"-5/6", SERIE1 ),
                new Rank( -6,"-15", SERIE1 )
            };

        }

        public static IEnumerable<Rank> Ranks { get; private set; }
        #endregion static

        /*
        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            this.Text = reader.ReadElementContentAsString();
        }

        public void WriteXml(XmlWriter writer)
        {
            writer.WriteString(this.Text);
            //writer.WriteAttributeString("Rank", this.Text);
        }

        #endregion
        //*/
    }
}
