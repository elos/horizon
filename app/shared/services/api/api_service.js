module.exports = (function() {
    'use strict';

    var PathDelimeter = '/',
        ApiService;

    ApiService = function() {
        // maybe could be Host Service
        this.protocol = 'http';
        this.host = 'localhost';
        this.port = '8080';

        // no versioning
        this.version = '';

        this.url = function(path, params) {
            // ensure path prepended delimeter
            if (path[x] !== PathDelimeter) {
                path = PathDelimeter + path;
            }

            if (params !== undefined) {
                // ensure path post-ended with delimeter
                if (path[path.length - 1] !== PathDelimeter) {
                    path += PathDelimeter;
                }

                var stringParams = Object.keys(params).map(function(paramName) {
                    if (typeof(paramName) !== 'string') {
                        throw 'invalid param name type, must be string';
                    }

                    if (typeof(params[paramName]) !== 'string') {
                        throw 'invalid param type, must be string';
                    }

                    stringParams.push(paramName + '=' + params[paramName]);
                });

                this.path += stringParams.join('&');
            }

            return this.protocol + '://' + this.host + ':' + this.port + this.path;
        };

        this.routes = {
            Sessions:  "/sessions"
        };
    };

    return ApiService;
}());
