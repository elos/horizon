(function () {
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

            // Configure Routing
            $routeProvider
                .when('/', {
                    templateUrl: './app/components/home/views/home.html',
                    controller: 'HomeController'
                })
                .when('/login', {
                    templateUrl: './app/components/login/login.html',
                    controller: 'LoginController'
                })
                .otherwise({
                    redirectTo: '/'
                });
    } ]);
    // --- }}}

  // --- Configure Controllers {{{
  app.controller('HomeController', require('./components/home/controllers/home_ctrl'));
  app.controller('LoginController', require('./components/login/login_controller'));
  // --- }}}

  // --- Configure Services {{{
  app.service('AccessService', require('./shared/services/access/access_service'));
  app.service('ApiService', require('./shared/services/api/api_service'));
  app.service('RequestService', require('./shared/services/request/request_service'));
  app.service('KeyService', require('./shared/services/key/key_service'));
  // --- }}}

}());
