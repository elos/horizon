module.exports = (function() {
    'use strict';

    var DataService = function($http) {
        this.collections = {
        };
    };

    DataService.$inject = [ '$http' ];

    return DataService;
}());
