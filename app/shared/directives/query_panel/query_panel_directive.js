module.exports = (function () {
    'use strict';

    var QueryPanelController = require('./query_panel_controller'),
        QueryPanelDirective;

    QueryPanelDirective = function () {
        return {
            replace: true, // inserting the panel into DOM

            templateUrl: './app/shared/directives/query_panel/query_panel.html',

            // We are a source of events
            scope: {
                validTags: "=",
                error: "&", // function (error), see: QueryPanelController
                query: '&' // function (queryOptions), see: QueryPanelController
            },

            controller: QueryPanelController
        };
    };

    return QueryPanelDirective;
}());
