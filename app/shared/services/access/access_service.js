module.exports = (function() {
    'use strict';

    var TokenCookie = 'elos-auth-token',
        AccessService;

    AccessService = function($cookies, $http, $q, $window, HostService) {
        var service = this;

        // --- Service Constants {{{
        service.Unauthorized = 'Unauthorized';
        // --- }}}

        // --- Cookies & Caching {{{

        function rememberToken(token) {
            service._token = token;
            try {
                $cookies[TokenCookie] = token;
            } catch (ignore) {
                // pass
            }
        }

        function recallToken() {
            // get cookie
            var cookie = $cookies[TokenCookie];

            if (cookie === '') {
                service._token = undefined;
            } else {
                service._token = cookie;
            }

            return service._token;
        }

        function forgetToken() {
            service._token = undefined;
            $cookies[TokenCookie] = '';
        }

        // --- }}}

        // --- token() & isAuthenticated() {{{
        this.token = function () {
            if (service._token) {
                return service._token;
            }

            return recallToken();
        };

        this.isAuthenticated = function () {
            return (!!this._token);
        };

        this.session = function () {
            return $http({
                method: 'GET',
                url: HostService.url('/sessions'),
                headers: {
                    'Elos-Auth': service.token()
                }
            });
        };
        // --- }}}

        // --- Login/Logout {{{
        this.login = function(publicCredential, privateCredential) {
            return $http({
                method: 'POST',
                url: HostService.url('/sessions'),
                params: {
                    'public': publicCredential,
                    'private': privateCredential
                }
            }).success(function (response) {
                rememberToken(response.data.session.token);
            });
        };

        this.logout = function() {
            // Clear out session
            forgetToken();

            // Reload for fresh data
            $window.location = "./";
        };
        // --- }}}

        // --- Route resolve: 'authenticate' {{{
        this.authenticate = function() {
            return $q(function(resolve, reject) {
                var presentToken = service.token();

                if (presentToken) {
                    resolve(presentToken);
                }

                reject(service.Unauthorized);
            });
        };
        // --- }}}

        // --- Initialization {{{
        function init() {
            service._token = recallToken();
        }

        init();
        // --- }}}
    };

    AccessService.$inject = [ '$cookies', '$http', '$q', '$window', 'HostService' ];

    return AccessService;
}());
