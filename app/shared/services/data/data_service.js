module.exports = (function() {
    'use strict';

    var DataService = function($http, AccessService, HostService) {
        var service = this;

        service.spaces = {
            'person': 'persons',
            'session': 'sessions',
            'credential': 'credentials',
            'calendar': 'calendars',
            'user': 'users',
            'schedule': 'schedules',
            'fixture': 'fixtures'
        };

        service.kind = function (kind) {

            return {
                find: function (id) {
                    var params = {};
                    params[kind + "_id"] = id;

                    return $http({
                        method: 'GET',
                        url: HostService.url('/' + service.spaces[kind]),
                        headers: {
                            'Elos-Auth': AccessService.token()
                        },
                        params: params
                    });
                },

                save: function (model) {
                    return $http({
                        method: 'POST',
                        url: HostService.url('/' + service.spaces[kind]),
                        headers: {
                            'Elos-Auth': AccessService.token()
                        },
                        data: JSON.stringify(model)
                    });
                }
            };
        };
    };

    DataService.$inject = [ '$http', 'AccessService', 'HostService' ];

    return DataService;
}());
