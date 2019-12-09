module.exports = (function () {
    'use strict';

    var GraphController,
        MG = require("../../../../bower_components/metrics-graphics/dist/metricsgraphics");

    GraphController = function ($scope, LogService) {
        // var service = this;

        // Options:
        // {
        //   title: string
        //   data: []Object,
        //   x_accessor: string
        //   y_accessor: string
        // }
        $scope.show = function (options) {
            options.full_width = options.full_width || true;
            options.x_extended_ticks = options.x_extended_ticks || true;
            options.height = options.height || 300;
            options.animate_on_load = options.animate_on_load || true;

            LogService.info(options);
            MG.data_graphic(options);
        };
    };

    GraphController.$inject = [ '$scope', 'LogService' ];

    return GraphController;
}());
