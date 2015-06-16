module.exports = (function() {
    'use strict';

    var TokenCookie = 'elos-auth-token',
        NoTokenError = 'no token',
        AccessService;

    AccessService = function($cookies, $http, HostService) {
        var service = this;

        service.Unauthorized = 'Unauthorized';

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
            var cookie = CookieService.get(TokenCookie);

            if (cookie === '') {
                service._token = undefined;
            } else {
                service._token = cookie;
            }

            return service._token;
        }

        function forgetToken() {
            service._token = undefined;
            $cookies.remove(TokenCookie);
        }

        // --- }}}

        this.token = function() {
            if (service._token) {
                return token;
            }

            return recallToken();
        };

        this.isAuthenticated = function() {
            return (!!this._token);
        };

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
            forgetSession();

            // Reload for fresh data
            $window.location = "./";
        };

        this.authenticate = function() {
            return $q(function(resolve, reject) {
                var presentToken = service.token();

                if (presentToken) {
                    resolve(presentToken);
                }

                reject(service.Unauthorized);
            });
        };
    };

    AccessService.$inject = [ '$cookies', '$http', 'HostService' ];

    return AccessService;
}());
