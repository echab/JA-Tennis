using System.Collections.ObjectModel;

namespace JA_Tennis.Model
{
    public class PlayerCollection : ObservableCollection<Player>
    {
        //protected override void OnCollectionChanged(NotifyCollectionChangedEventArgs e)
        //{
        //    base.OnCollectionChanged(e);

        //    foreach (Player player in e.OldItems)
        //    {
        //        player.PropertyChanged -= player_PropertyChanged;
        //    }
        //    foreach (Player player in e.NewItems)
        //    {
        //        player.PropertyChanged += player_PropertyChanged;
        //    }
        //}

        //private void player_PropertyChanged(object sender, PropertyChangedEventArgs e)
        //{
        //    base.OnPropertyChanged(e);
        //}

        //protected override void OnPropertyChanged(PropertyChangedEventArgs e)
        //{
        //    base.OnPropertyChanged(e);
        //}
    }
}
