var models;
(function (models) {
    (function (DrawType) {
        DrawType[DrawType["Normal"] = 0] = "Normal";
        DrawType[DrawType["Final"] = 1] = "Final";
        DrawType[DrawType["PouleSimple"] = 2] = "PouleSimple";
        DrawType[DrawType["PouleAR"] = 3] = "PouleAR";
    })(models.DrawType || (models.DrawType = {}));
    var DrawType = models.DrawType;
    ;
})(models || (models = {}));
//# sourceMappingURL=draw.js.map
