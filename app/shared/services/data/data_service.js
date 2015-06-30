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

        service.Types = {
            ID: 'id',
            Date: 'date',
            String: 'string',
            Array: 'array',
            Map: 'map'
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
        service.Transforms.Marshal[service.Types.ID] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Date] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.String] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Array] = service.IdentityTransformation;
        service.Transforms.Marshal[service.Types.Map] = service.IdentityTransformation;

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

        service.one = function (OtherClass, id) {
            return Class.find(id);
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
