module.exports = (function() {
    'use strict';

    var ElosAuthToken = 'elos-auth-token',
        NoTokenError = 'no token',
        AccessService;

    AccessService = function($cookies, ApiService, RequestService) {
        this._token = undefined;
        this._unauthedReason = undefined;

        // --- SessionCache {{{

        this.cacheToken = function(token) {
            this._token = token;
            $cookies.set(ElosAuthToken, token);
        };

        this.getCachedToken = function() {
            if (this._token) {
                return this._token;
            }

            var token = $cookies.get(ElosAuthToken);

            if (token === undefined || token === null || token === '') {
                throw NoTokenError;
            }

            return token;
        };

        this.clearCachedSession = function() {
            this._token = undefined;
            $cookies.remove(ElosAuthToken);
        };

        // --- }}}

        this.authenticate = function(publicInfo, privateInfo) {
            var token, success;

            try {
                token = this.getCachedToken();
            } catch (NoTokenError) {
                RequestService.POST(
                    ApiService.url(
                        "/sessions",
                        {
                         'public': publicInfo,
                         'private': privateInfo
                        }
                    ),
                    {}
                ).then(
                    function(response) {
                        token = response.data.data.session.token;
                        success = true;
                    },
                    function(response) {
                        AccessService._unauthedReason = response.data.message;
                        success = false;
                    }
                );
            }

            if (success) {
                this.cacheToken(token);
            }

            return success;
        };

        this.authenticated = function() {
            return this._token !== undefined && this._token !== null && this._token !== '';
        };

        this.unauthedReason = function() {
            return this._unauthedReason || '';
        };

    };

    AccessService.$inject = [ '$cookies', 'ApiService', 'RequestService' ];

    return AccessService;
}());
