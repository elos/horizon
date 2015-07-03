module.exports = (function () {
    'use strict';

     var GraphController = require('./graph_controller'),
         GraphDirective;

    GraphDirective = function () {
        return {
            replace: false,

            controller: GraphController,

            scope: {
                title: '=',
                data: '=',
                xAccessor: '=',
                yAccessor: '='
            }
        };
    };

    return GraphDirective;
}());
