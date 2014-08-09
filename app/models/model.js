'use strict';
var models;
(function (models) {
    function copy(source, destination) {
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
            if (source === destination)
                throw Error("Can't copy equivalent objects or arrays");
            if (angular.isArray(source)) {
                destination.length = 0;
                for (var i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                for (var key in source) {
                    if (source.hasOwnProperty(key) && "_$".indexOf(key.charAt(0)) == -1) {
                        destination[key] = copy(source[key]);
                    }
                }
            }
        }
        return destination;
    }
    models.copy = copy;
})(models || (models = {}));
//# sourceMappingURL=model.js.map
