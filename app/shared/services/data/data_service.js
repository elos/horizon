module.exports = (function() {
    'use strict';

    var DataService = function($http, $log, AccessService, HostService) {
        var service = this;

        service.spaces = {
            'calendar': 'calendars',
            'credential': 'credentials',
            'fixture': 'fixtures',
            'person': 'persons',
            'schedule': 'schedules',
            'session': 'sessions',
            'user': 'users'
        };

        service.Types = {
            ID: 'id',
            Date: 'date',
            String: 'string',
            Array: 'array',
            Map: 'map',
            Integer: 'integer',
            Boolean: 'boolean'
        };

        service.IdentityTransformation = function (raw) { return raw; };

        service.Transforms = {
            Marshal: {},
            Unmarshal: {}
        };

        service.Transforms.Unmarshal[service.Types.ID] = service.IdentityTransformation;
        service.Transforms.Unmarshal[service.Types.Date] = function (data) { return new Date(data); };
        service.Transforms.Unmarshal[service.Types.String] = service.IdentityTransformation;
        service.Transforms.Unmarshal[service.Types.Array] = service.IdentityTransformation;
        service.Transforms.Unmarshal[service.Types.Map] = service.IdentityTransformation;
        service.Transforms.Unmarshal[service.Types.Integer] = service.IdentityTransformation;
        service.Transforms.Unmarshal[service.Types.Boolean] = service.IdentityTransformation;

        service.Transforms.Marshal[service.Types.ID] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Date] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.String] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Array] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Map] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Integer] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Boolean] = service.IdentityTransformation;

        service.unmarshal = function (model, typemap, data) {
            /*globals angular*/
            angular.forEach(Object.keys(typemap), function (field) {
                model[field] = service.Transforms.Unmarshal[typemap[field]](data[field]) || model[field];
            });

            return model;
        };

        service.marshal = function (model, typemap) {
            var json = {};

            /*globals angular*/
            angular.forEach(Object.keys(typemap), function (field) {
                if (model[field] === undefined) { return; }
                json[field] = service.Transforms.Marshal[typemap[field]](model[field]);
            });

            return JSON.stringify(json);
        };

        service.kind = function (kind) {
            return {
                find: function (id) {
                    $log.info('Finding ' + kind + ' with id ' + id);
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
                    $log.info('Saving ' + model + ' as ' + kind);
                    return $http({
                        method: 'POST',
                        url: HostService.url('/' + service.spaces[kind]),
                        headers: {
                            'Elos-Auth': AccessService.token()
                        },
                        data: model
                    });
                }
            };
        };
    };

    DataService.$inject = [ '$http', '$log', 'AccessService', 'HostService' ];

    return DataService;
}());
