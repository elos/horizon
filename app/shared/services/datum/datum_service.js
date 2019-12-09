module.exports = (function () {
    'use strict';

    var DatumService;

    DatumService = function ($http, $q, AccessService, HostService, ModelsService) {
        var controller = this;

        controller.tags = function () {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: HostService.url('/data/tags'),
                    headers: {
                        'Elos-Auth': AccessService.token()
                    },
                }).then(
                    function (response) {
                        resolve(response.data.data.tags);
                    },
                    reject
                );
            });
        };

        // Options:
        // {
        //     start_time: Date
        //     end_time: Date
        //     tags: []
        // }
        controller.query = function (options) {
            return $q(function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: HostService.url('data/query'),
                    headers: {
                        'Elos-Auth': AccessService.token()
                    },
                    params: {
                        start_time: options.start_time,
                        end_time: options.end_time,
                        tags: options.tags.join(',')
                    }
                }).then(
                    function (response) {
                        // response data, data of successful response, data matching query
                        resolve(response.data.data.data.map(function (raw) {
                            return ModelsService.Datum.new().load(raw);
                        }));
                    },
                    reject
                );
            });
        };
    };

    DatumService.$inject = [ '$http', '$q', 'AccessService', 'HostService', 'ModelsService' ];

    return DatumService;
}());
