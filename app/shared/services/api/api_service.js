module.exports = (function() {
    'use strict';

    var PathDelimeter = '/',
        QueryBegin = '?',
        QueryDelimeter = '&',
        ApiService;

    ApiService = function() {
        // maybe could be Host Service
        this.protocol = 'http';
        this.host = 'localhost';
        this.port = '8000';

        // no versioning
        this.version = '';

        this.url = function(path, params) {
            path = path || '';

            // ensure path prepended delimeter
            if (path[0] !== PathDelimeter) {
                path = PathDelimeter + path;
            }

            if (params !== undefined) {
                path += QueryBegin;

                var stringParams = Object.keys(params).map(function(paramName) {
                    if (typeof paramName  !== 'string') {
                        throw 'invalid param name type, must be string';
                    }

                    if (typeof params[paramName]  !== 'string') {
                        throw 'invalid param type, must be string';
                    }

                    return paramName + '=' + params[paramName];
                });

                path += stringParams.join(QueryDelimeter);
            }

            return this.protocol + '://' + this.host + ':' + this.port + path;
        };

        this.routes = {
            Sessions:  "/sessions"
        };
    };

    return ApiService;
}());
