module.exports = (function() {
    'use strict';

    var DataService, Types, Transforms, Spaces;

    // --- Types {{{
    Types = {
        ID: 'id',
        Date: 'date',
        String: 'string',
        Array: 'array',
        Map: 'map',
        Integer: 'integer',
        Boolean: 'boolean'
    };
    // --- }}}

    // --- Transformations {{{
    function IdentityTransformation(raw) { return raw; }
    function DateCast(raw) { return new Date(raw); }

    Transforms = {
        Unmarshal: {},  // from server
        Marshal: {}   // to server
    };

    // register unmarshal transforms
    Transforms.Unmarshal[Types.ID]      = IdentityTransformation;
    Transforms.Unmarshal[Types.Date]    = DateCast;
    Transforms.Unmarshal[Types.String]  = IdentityTransformation;
    Transforms.Unmarshal[Types.Array]   = IdentityTransformation;
    Transforms.Unmarshal[Types.Map]     = IdentityTransformation;
    Transforms.Unmarshal[Types.Integer] = IdentityTransformation;
    Transforms.Unmarshal[Types.Boolean] = IdentityTransformation;

    // register marshal transforms
    Transforms.Marshal[Types.ID]        = IdentityTransformation;
    Transforms.Marshal[Types.Date]      = IdentityTransformation;
    Transforms.Marshal[Types.String]    = IdentityTransformation;
    Transforms.Marshal[Types.Array]     = IdentityTransformation;
    Transforms.Marshal[Types.Map]       = IdentityTransformation;
    Transforms.Marshal[Types.Integer]   = IdentityTransformation;
    Transforms.Marshal[Types.Boolean]   = IdentityTransformation;
    // --- }}}

    // --- Spaces {{{
    Spaces = {
        'calendar': 'calendars',
        'credential': 'credentials',
        'fixture': 'fixtures',
        'person': 'persons',
        'schedule': 'schedules',
        'session': 'sessions',
        'user': 'users'
    };
    // --- }}}

    // --- Kind Helper Object {{{
    function kind(k, $http, $log, AccessService, HostService) {
        return {
            find: function (id) {
                $log.info('Finding ' + k + ' with id ' + id);
                var params = {};
                params[k + "_id"] = id;

                return $http({
                    method: 'GET',
                    url: HostService.url('/' + Spaces[k]),
                    headers: {
                        'Elos-Auth': AccessService.token()
                    },
                    params: params
                });
            },

            save: function (model) {
                $log.info('Saving ' + model + ' as ' + k);
                return $http({
                    method: 'POST',
                    url: HostService.url('/' + Spaces[k]),
                    headers: {
                        'Elos-Auth': AccessService.token()
                    },
                    data: model
                });
            }
        };
    }
    // --- }}}

    DataService = function($http, $log, AccessService, HostService) {
        var service = this;

        service.Types = Types;
        service.Transforms = Transforms;

        service.unmarshal = function (model, typemap, data) {
            Object.keys(typemap).map(function (field) {
                model[field] = service.Transforms.Unmarshal[typemap[field]](data[field]) || model[field];
            });

            return model;
        };

        service.marshal = function (model, typemap) {
            var json = {};

            Object.keys(typemap).map(function (field) {
                if (model[field] === undefined) { return; }
                json[field] = service.Transforms.Marshal[typemap[field]](model[field]);
            });

            return JSON.stringify(json);
        };

        service.kind = function (k) {
            return kind(k, $http, $log, AccessService, HostService);
        };
    };

    DataService.$inject = [ '$http', '$log', 'AccessService', 'HostService' ];

    return DataService;
}());
