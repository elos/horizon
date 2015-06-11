(function () {
    'use strict';

    // --- Configure Dependencies {{{
    // Require all third party dependencies
    require('../bower_components/angular');
    require('../bower_components/angular-route');
    require('../bower_components/angular-animate');
    // --- }}}

    // --- Configure App {{{
    var app = angular.module('horizon', [ 'ngRoute', 'ngAnimate' ]);

    app.config([ '$locationProvider', '$routeProvider', '$httpProvider',
        function($locationProvider, $routeProvider, $httpProvider) {
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

            $locationProvider.hashPrefix('!');

            var encodeData = require('../assets/js/requests/encode_form_data');

            // 'Fix' angular's form data encoding
            $httpProvider.defaults.transformRequest = [ function(data) {
                if (angular.isObject(data) && String(data) !== '[object File]') {
                    return encodeData(data);
                } else {
                    return data;
                }
            } ];

            // Configure Routing
            $routeProvider
                .when('/', {
                    templateUrl: './app/components/home/views/home.html',
                    controller: 'HomeController'
                })
                .otherwise({
                    redirectTo: '/'
                });
    } ]);
    // --- }}}

  // --- Configure Controllers {{{
  app.controller('HomeController', require('./components/home/controllers/home_ctrl'));
  // --- }}}

  // --- Configure Services {{{
  app.service('CookieService', require('./shared/services/cookie/cookie_service'));
  app.service('ApiService', require('./shared/services/api/api_service'));
  app.service('RequestService', require('./shared/services/request/request_service'));
  app.service('AccessService', require('./shared/services/access/access_service'));
  // --- }}}

}());
