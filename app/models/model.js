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

    //export function getService(name: string): any {
    //    //TODO should not be used in models. To be replaced by standard service injection into services
    //    var injector = angular.injector([name]);
    //    var p = name.lastIndexOf('.');
    //    var shortName = name.substring(p+1);
    //    var service = injector.get(shortName);
    //    return service;
    //}
    (function (DrawType) {
        DrawType[DrawType["Normal"] = 0] = "Normal";
        DrawType[DrawType["Final"] = 1] = "Final";
        DrawType[DrawType["PouleSimple"] = 2] = "PouleSimple";
        DrawType[DrawType["PouleAR"] = 3] = "PouleAR";
    })(models.DrawType || (models.DrawType = {}));
    var DrawType = models.DrawType;

    (function (GenerateType) {
        GenerateType[GenerateType["None"] = 0] = "None";
        GenerateType[GenerateType["Create"] = 1] = "Create";
        GenerateType[GenerateType["PlusEchelonne"] = 2] = "PlusEchelonne";
        GenerateType[GenerateType["PlusEnLigne"] = 3] = "PlusEnLigne";
        GenerateType[GenerateType["Mix"] = 4] = "Mix";
    })(models.GenerateType || (models.GenerateType = {}));
    var GenerateType = models.GenerateType;

    (function (ModelType) {
        ModelType[ModelType["None"] = 0] = "None";
        ModelType[ModelType["Tournament"] = 1] = "Tournament";
        ModelType[ModelType["Player"] = 2] = "Player";
        ModelType[ModelType["Event"] = 3] = "Event";
        ModelType[ModelType["Draw"] = 4] = "Draw";
        ModelType[ModelType["Match"] = 5] = "Match";
    })(models.ModelType || (models.ModelType = {}));
    var ModelType = models.ModelType;
})(models || (models = {}));
//# sourceMappingURL=model.js.map
