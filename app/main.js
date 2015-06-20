(function () {
    'use strict';

    // --- Configure Dependencies {{{
    // Require all third party dependencies
    var angular = require('../bower_components/angular');
    require('../bower_components/angular-route');
    require('../bower_components/angular-animate');
    require('../bower_components/angular-cookies');
    // --- }}}

    // --- Configure App {{{
    var app = angular.module('horizon', [ 'ngRoute', 'ngAnimate', 'ngCookies' ]);

    app.config([ '$locationProvider', '$routeProvider', '$httpProvider',
        function($locationProvider, $routeProvider, $httpProvider) {
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

            $locationProvider.hashPrefix('!');

            var encodeData = require('../assets/js/requests/encode_form_data');

            // 'Fix' angular's form data encoding
            $httpProvider.defaults.transformRequest = [ function(data) {
                if (angular.isObject(data) && String(data) !== '[object File]') {
                    return encodeData(data);
                }

                return data;
            } ];

            // --- Configure Routing {{{
            $routeProvider
                .when('/', {
                    templateUrl: './app/components/home/home.html',
                    controller: 'HomeController',
                    resolve: {
                        session: [ 'AccessService', function (AccessService) {
                            return AccessService.authenticate();
                        } ]
                    }
                })
                .when('/scheduling/:selector?/:index?', {
                    templateUrl: './app/components/scheduling/scheduling.html',
                    controller: 'SchedulingController',
                    resolve: {
                        session: [ 'AccessService', function (AccessService) {
                            return AccessService.authenticate();
                        } ]
                    }
                })
                .when('/scheduler/:schedule_id?', {
                    templateUrl: './app/components/scheduler/scheduler.html',
                    controller: 'SchedulerController',
                    resolve: {
                        session: [ 'AccessService', function (AccessService) {
                            return AccessService.authenticate();
                        } ]
                    }
                })
                .when('/login', {
                    templateUrl: './app/components/login/login.html',
                    controller: 'LoginController'
                })
                .otherwise({
                    redirectTo: '/'
                });
            // --- }}}
    } ]);

    app.run([ '$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.$on('$routeChangeError', function (event, current, previous, eventObj) {
            if (eventObj === 'Unauthorized') {
                $location.path('/login');
            }
        });
    } ]);

    app.run([ '$rootScope', 'TimeService', function($rootScope, TimeService) {
        if (TimeService.isDaytime()) {
            $rootScope.theme = 'light';
        } else {
            $rootScope.theme = 'dark';
        }
    } ]);
    // --- }}}

  // --- Configure Controllers {{{
  app.controller('HomeController', require('./components/home/home_controller'));
  app.controller('LoginController', require('./components/login/login_controller'));
  app.controller('SchedulerController', require('./components/scheduler/scheduler_controller'));
  app.controller('SchedulingController', require('./components/scheduling/scheduling_controller'));
  // --- }}}

  // --- Configure Services {{{
  app.service('AccessService', require('./shared/services/access/access_service'));
  app.service('DataService', require('./shared/services/data/data_service'));
  app.service('HostService', require('./shared/services/host/host_service'));
  app.service('KeyService', require('./shared/services/key/key_service'));
  app.service('ModelsService', require('./shared/services/models/models_service'));
  app.service('RequestService', require('./shared/services/request/request_service'));
  app.service('TimeService', require('./shared/services/time/time_service'));
  // --- }}}

}());
