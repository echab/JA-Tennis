var jat;
(function (jat) {
    var fft;
    (function (fft) {
        var Category = (function () {
            function Category() {
                // http://www.fft.fr/sites/default/files/pdf/153-231_rs_nov2011.pdf
                this._category = {
                    "-8ans": { ageMax: 8 },
                    "-9ans": { ageMax: 9 },
                    "-10ans": { ageMax: 10 },
                    "-11ans": { ageMax: 11 },
                    "-12ans": { ageMax: 12 },
                    "-13ans": { ageMax: 13 },
                    "-14ans": { ageMax: 14 },
                    "-15ans": { ageMax: 15 },
                    "-16ans": { ageMax: 16 },
                    "-17ans": { ageMax: 17 },
                    "-18ans": { ageMax: 18 },
                    "Senior": { ageMin: 18, ageMax: 34 },
                    "+35ans": { ageMin: 35 },
                    "+45ans": { ageMin: 45 },
                    "+55ans": { ageMin: 55 },
                    "+65ans": { ageMin: 60 },
                    "+70ans": { ageMin: 70 },
                    "+75ans": { ageMin: 75 }
                };
                //    this.refDate = function( date) {
                //        refDate = date;
                //    }
                this._categories = [];
                this._index = {};
                var now = new Date();
                var refDate = new Date(now.getFullYear(), 9, 1); //1er Octobre
                this.currentYear = now.getFullYear() + (now > refDate ? 1 : 0);
                for (var c in this._category) {
                    this._categories.push(c);
                }
                for (var i = this._categories.length - 1; i >= 0; i--) {
                    this._index[this._categories[i]] = i;
                }
            }
            Category.prototype.list = function () {
                return this._categories;
            };
            Category.prototype.isValid = function (category) {
                return this._index[category] >= 0;
            };
            Category.prototype.compare = function (category1, category2) {
                var i = this._index[category1], j = this._index[category2];
                return i - j;
            };
            Category.prototype.getAge = function (date) {
                //var age = (new Date(refDate - date)).getFullYear() - _beginOfTime.getFullYear() -1;
                var age = this.currentYear - date.getFullYear();
                return age;
            };
            Category.prototype.ofDate = function (date) {
                var age = this.getAge(date), i, prev;
                for (i in this._category) {
                    var categ = this._category[i];
                    if (categ.ageMax && categ.ageMax < age) {
                        continue; //too old
                    }
                    if (categ.ageMin) {
                        if (categ.ageMin <= age) {
                            prev = i;
                            continue;
                        }
                        else {
                            return prev;
                        }
                    }
                    return i;
                }
            };
            Category.prototype.isCompatible = function (eventCategory, playerCategory) {
                if (playerCategory || !eventCategory) {
                    return true;
                }
                //TODO,2006/12/31: comparer l'age du joueur au 31 septembre avec la date de début de l'épreuve.
                var idxSenior = this._index['Senior'];
                var idxEvent = this._index[eventCategory];
                //Epreuve senior
                if (idxEvent === idxSenior) {
                    return true;
                }
                var catEvent = this._category[eventCategory];
                var catPlayer = this._category[playerCategory];
                if (idxEvent < idxSenior) {
                    //Epreuve jeunes
                    if (catPlayer.ageMax <= catEvent.ageMax) {
                        return true;
                    }
                }
                else {
                    //Epreuve vétérans
                    if (catEvent.ageMin <= catPlayer.ageMin) {
                        return true;
                    }
                }
                return false;
                //TODO? 2006/08/28	AgeMin() < playerCategory.AgeMin()	//vétéran
                //	return playerCategory.isVide() || isVide()
                //		(playerCategory.AgeMin() <= AgeMax() 
                //		&& AgeMin() <= playerCategory.AgeMax() );
            };
            return Category;
        })();
        fft.Category = Category;
        angular.module('jat.services.fft.category', [])
            .service('category', Category);
    })(fft = jat.fft || (jat.fft = {}));
})(jat || (jat = {}));
