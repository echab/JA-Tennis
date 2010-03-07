﻿
using System.Collections.ObjectModel;
using JA_Tennis.Model;

namespace JA_Tennis.ViewModel
{
    public class Selection : NotifyPropertyChangedBase
    {
        Tournament _Tournament;
        public Tournament Tournament {
            get { return _Tournament; }
            set {
                if (_Tournament == value) { return; }
                _Tournament = value; 
                FirePropertyChanged("Tournament"); 
            }
        }

        Player _Player;
        public Player Player
        {
            get { return _Player; }
            set {
                if (_Player == value) { return; }
                _Player = value; 
                FirePropertyChanged("Player"); 
            }
        }

        //public ObservableCollection<Player> Players { get; set; }     //TODO selection multiple players 
    }
}
