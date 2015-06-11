module.exports = (function() {
    'use strict';

    var ElosAuthToken = 'elos-auth-token',
        NoTokenError = 'no token',
        AccessService;

    AccessService = function(ApiService, CookieService, ModelsService, RequestService) {

        // --- SessionCache {{{

        this.cacheSession = function(session) {
            CookieService.remember(ElosAuthToken, session.token);
        };

        this.getCachedSession = function(session) {
            var token = CookieService.recall(ElosAuthToken);

            if (token === undefined || token === null || token === '') {
                throw NoTokenError;
            }

            return {
                token: token
            };
        };

        this.clearCachedSession = function(session) {
            CookieService.forget(ElosAuthService);
        };

        // --- }}}

        this.authenticate = function(publicInfo, privateInfo) {
            RequestService.POST(
                ApiService.url(
                    ApiService.routes.sessions,
                    {
                     'public': publicInfo,
                     'private': privateInfo
                    }
                ),
                {}
            ).then(
                function(response) {
                    this.cacheSession(response.data.data.session);
                    return true;
                },
                function(response) {
                    alert(response);
                    return false;
                }
            );

            // need to handle this promise
        };

        this.authenticated = function() {
            return token !== undefined && token !== null && token !== '';
        };

    };

    AccessService.$inject = [ 'ApiService', 'CookieService', 'ModelsService', 'RequestService' ];

    return AccessService;
}());
