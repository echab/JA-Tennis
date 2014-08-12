(function (window, angular, undefined) {

    'use strict';

    var mock = {};

    mock.$modalProvider = function () {
        this.$get = function () {
            //var openCount = 0;
            var modal = {
                open: function () {
                    return {
                        close: modal.close,
                        dismiss: function (reason) {
                            modal.errorCallback(reason);
                        },
                        result: {
                            then: function (successCallback, errorCallback) {
                                modal.successCallback = successCallback;
                                modal.errorCallback = errorCallback;
                            }
                        }
                        //,opened: null
                    };
                },
                close: function (result) {
                    //expect(openCount).toBe(1);
                    modal.successCallback(result);
                }
            };
            return modal;
        };
    };

    angular.module('ui.bootstrap.mock', []).provider({
        $modal: mock.$modalProvider
    });

})(window, window.angular);