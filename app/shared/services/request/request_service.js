module.exports = (function() {
    'use strict';

    // Headers config
    // {
    //  'POST': {
    //      'Header': 'Value'
    //  }
    //  'GET': ...
    // }

    var RequestService = function($http) {
        // --- Actions {{{

        this.validActions = [ 'POST', 'GET', 'DELETE' ];

        this.validAction = function(action) {
            return this.validActions.includes(action);
        };

        // --- }}}

        // --- Headers {{{
        this.headersConfig = {
            'POST': {},
            'GET': {},
            'DELETE': {},
        };

        this.includeHeader = function(key, value) {
            for (var i in this.validActions) {
                this.includeActionHeader(this.validactions[i], key, value);
            }
        };

        this.includeActionHeader = function(action, key, value) {
            if (!validAction(action)) {
                throw 'invalid action ' + method;
            }

            this.headersConfig[action] = this.headersConfig[method] || {};
            this.headersConfig[action][key] = value;
        };

        // --- }}}

        // --- Execution & Core {{{

        // --- Constructors {{{
        this.newRequest = function() {
            return {
                action: undefined,
                url: undefined,
                headers: {},
                data: {},
            };
        };

        this.request = function(url, action, headers, data) {
            return this.execute({
                url: url,
                action: method,
                headers: headers,
                data: data
            });
        };

        // --- }}}

        // --- Convenience {{{

        this.POST = function(url, data) {
            return this.execute({
                url: url,
                action: 'POST',
                data: data
            });
        };

        this.GET = function(url) {
            return this.execute({
                url: url,
                action: 'GET'
            });
        };

        // --- }}}

        // --- execute() {{{

        this.execute = function(request) {
            if (request.action === undefined) {
                throw 'request.action can\'t be undefined';
            }

            if (request.url === undefined) {
                throw 'request.url can\'t be undefined';
            }

            if (!validAction(action)) {
                throw 'request.action ' + request.method + ' is invalid';
            }

            // We are ok with undefineds, but now we will set to empty object
            request.headers = request.headers || {};
            request.data = request.data || {};

            // But now we must assert they are objects, assuming someone could
            // pass headers: true or something crazy cause we have no types
            if (typeof(request.headers) !== 'object') {
                throw 'request.headers must be of type object';
            }

            if (typeof(request.data) !== 'object') {
                throw 'request.data must be of type object';
            }

            // Apply default headers
            var actionConfig = headersConfig[request.method];
            if (actionConfig) {
                for (var header in actionConfig) {
                    if (actionConfig.hasOwnProperty(header)) {
                        if (request.headers.hasOwnProperty(header)) {
                            if (request.headers[header] === undefined) {
                                // forget it and don't add any default header
                                delete request.headers[header];
                            }
                        } else {
                            // add default header
                            request.headers[header] = actionConfig[header];
                        }
                    }
                }
            }

            return $http(request);
        };

        // --- }}}

        // --- }}}
    };

    RequestService.$inject = [ '$http' ];

    return RequestService;
});
