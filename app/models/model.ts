'use strict';

module models {

    export interface Model {
        //TODO serialize()
	    //init(parent?:Model):void;
    }

    export function copy(source: any, destination?: any) {
        if (!destination) {
            destination = source;
            if (source) {
                if (angular.isArray(source)) {
                    destination = copy(source, []);
                } else if (angular.isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (angular.isObject(source)) {
                    destination = copy(source, {});
                }
            }
        } else {
            if (source === destination) throw Error("Can't copy equivalent objects or arrays");
            if (angular.isArray(source)) {
                destination.length = 0;
                for (var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                for (var key in source) {
                    if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {  //ignore prefixes _ and $
                        destination[key] = copy(source[key]);
                    }
                }
            }
        }
        return destination;
    }

    //export function getService(name: string): any {
    //    //TODO should not be used in models. To be replaced by standard service injection into services
    //    var injector = angular.injector([name]);
    //    var p = name.lastIndexOf('.');
    //    var shortName = name.substring(p+1);
    //    var service = injector.get(shortName);
    //    return service;
    //}
}