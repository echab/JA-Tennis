using System;
using System.Collections;
using System.ComponentModel;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using JA_Tennis.ComponentModel;
using JA_Tennis.Helpers;

namespace JA_Tennis.Model
{
    //[XmlType(IncludeInSchema = false)]
    public class Player : BindableType, IIdentifiable, INotifyDataErrorInfo, IXmlSerializable //, IDirtyAware //NotifyPropertyChangedBase
    {
        #region Constructor
        public Player()
            : this(null, null)
        { }

        public Player(Tournament tournament, BindableType parentAggregate)
            : base(parentAggregate)
        {
            Registration = new IdRefs<Event>(null, tournament != null ? tournament.Events : null);

            Tournament = tournament;

            _ErrorManager = new ValidationErrorManager(this, s => OnErrorsChanged(s));

            //ChangeBehaviors.Add(new DirtyPropertyBehavior(this));
        }
        #endregion Constructor


        #region Tournament property
        Tournament _Tournament;
        [XmlIgnore]
        public Tournament Tournament
        {
            get { return _Tournament; }
            set
            {
                _Tournament = value;
                if (_Tournament != null)
                {
                    Registration.IdsSource = _Tournament.Events;
                }
                else
                {
                    Registration.IdsSource = null;
                }
            }
        }
        #endregion


        #region Id property
        private string _Id;
        [XmlAttribute]
        public string Id
        {
            get { return _Id; }
            set
            {
                if (_ErrorManager.Validate(() => Id, new Check(!string.IsNullOrWhiteSpace(value), "Id cannot be empty")))
                {
                    if (_Tournament != null)
                    {
                        _Tournament.IdManager.FreeId(_Id);
                        _Tournament.IdManager.DeclareId(value);
                    }
                    Set(ref _Id, value, () => Id);
                }
            }
        }
        #endregion


        #region Name property
        private string _Name;
        [XmlAttribute]
        public string Name
        {
            get { return _Name; }
            set
            {
                if (_ErrorManager.Validate(() => Name, new Check(!string.IsNullOrWhiteSpace(value), "Name cannot be empty")))
                {
                    Set(ref _Name, value.Trim(), () => Name);
                }
            }
        }
        #endregion


        #region Rank property
        Rank _Rank;
        [XmlAttribute]
        public Rank Rank
        {
            get { return _Rank; }
            set { Set(ref _Rank, value, () => Rank); }
        }
        #endregion Rank


        #region Registration property
        [XmlAttribute]
        //public ObservableCollection<Event> Registration { get; private set; }
        public IdRefs<Event> Registration { get; set; }    //public set for PropertyHelper.Copy
        #endregion


        #region IXmlSerializable Members

        public XmlSchema GetSchema()
        {
            return null;    //Not supported by Silverlight
        }

        public void ReadXml(XmlReader reader)
        {
            //reader.Read();

            //reader.ReadStartElement();

            if (reader.IsStartElement("Player"))
            {
                Id = reader.GetAttribute("Id");
                Name = reader.GetAttribute("Name");

                Rank = reader.GetAttribute("Rank");

                string registrations = reader.GetAttribute("Registration");
                if (!string.IsNullOrWhiteSpace(registrations))
                {
                    Registration.Ids = registrations;
                }

                reader.ReadStartElement();

                //reader.ReadEndElement();
            }
        }

        public void WriteXml(XmlWriter writer)
        {
            writer.WriteAttributeNotNull("Id", Id);

            writer.WriteAttributeString("Name", Name);

            writer.WriteAttributeNotNull("Rank", Rank);

            if (Registration.Count > 0)
            {
                writer.WriteAttributeString("Registration", Registration.Ids);
            }
        }

        #endregion


        #region INotifyDataErrorInfo Members
        ValidationErrorManager _ErrorManager;

        public event EventHandler<DataErrorsChangedEventArgs> ErrorsChanged;

        public IEnumerable GetErrors(string propertyName) { return _ErrorManager.GetErrors(propertyName); }

        public bool HasErrors { get { return _ErrorManager.HasErrors; } }

        private void OnErrorsChanged(string propertyName)
        {
            var handler = ErrorsChanged;
            if (handler != null)
            {
                handler.Invoke(this, new DataErrorsChangedEventArgs(propertyName));
            }
        }
        #endregion

#if DEBUG
        public override string ToString()
        {
            return string.Format("[{0}] {1}", Id, Name);
        }
#endif //DEBUG


        #region IDisposable Members

        public void Dispose()
        {
            if (_Tournament != null)
            {
                _Tournament.IdManager.FreeId(this);
            }
        }

        #endregion
    }
}
