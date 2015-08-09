'use strict';

// Declare app level module which depends on filters, and services
angular.module('jat', [
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'jat.services.selection',
    'jat.services.find',
    'jat.services.undo',
    'jat.services.type',
    'jat.main'
])
    .constant('appName', 'JA-Tennis')
    .constant('appVersion', '0.1')
    .directive('appVersion',
        ['appName', 'appVersion',
        (appName: string, appVersion: string) => {
        return {
            template: appName + ' v' + appVersion
        };
    }])
;
/*    
.config([<any>'$routeProvider', ( $routeProvider: ng.IRouteProviderProvider) => {
    //routes
    $routeProvider.when('/players', {
        templateUrl: 'views/player/players.html',         
        controller: controllers.Players
    });
    $routeProvider.when('/player/:id', {
        templateUrl: 'views/player/player.html',
        controller: controllers.Player
    });
    $routeProvider.otherwise({
        redirectTo: '/players'
    });    
}])
//*/
