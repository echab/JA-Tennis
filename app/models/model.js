'use strict';
var models;
(function (models) {
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
