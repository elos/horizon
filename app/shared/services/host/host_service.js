module.exports = (function() {
    'use strict';

    var DefaultBaseHost = 'http://api.elos.io',
        HostService,
        HostBaseCookie = 'elos-host-base',
        LocalHostBase = 'http://localhost:8000',
        LocalHosts = [ 'localhost', '127.0.0.1', '0.0.0.0' ],
        PathDelimeter = '/';

    HostService = function($cookies, $location) {
        var service = this;

        function setup() {
            var cookieBase = $cookies[HostBaseCookie];
            if (cookieBase) {
                return cookieBase;
            }

            var base = DefaultBaseHost,
                host = $location.host(),
                i;

            for (i = 0; i < LocalHosts.length; i += 1) {
                if (host.indexOf(LocalHosts[i]) >= 0) {
                    base = LocalHostBase;
                    break;
                }
            }

            $cookies[HostBaseCookie] = base;

            return base;
        }

        service._base = setup();

        service.set = function(base) {
            service._base = base;
            $cookies[HostBaseCookie] = base;
            return service;
        };

        service.base = function() {
            return service._base;
        };

        service.url = function(path) {
            if (path[0] !== PathDelimeter) {
                path = PathDelimeter + path;
            }

            return service._base + path;
        };
    };

    HostService.$inject = [ '$cookies', '$location' ];

    return HostService;
}());
