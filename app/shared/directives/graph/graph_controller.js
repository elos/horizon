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

        function init(options) {
            console.log(options);
            LogService.info("Initializing graph");
            MG.data_graphic(options);
        }

        init({
            title: $scope.title,
            data: $scope.data,
            x_accessor: $scope.xAccessor,
            y_accessor: $scope.yAccessor,
            full_width: true,
            x_extended_ticks: true,
            height: 300
        });
    };

    GraphController.$inject = [ '$scope', 'LogService' ];

    return GraphController;
}());
