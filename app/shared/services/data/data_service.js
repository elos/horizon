module.exports = (function() {
    var DataService = function($http) {
        $http.get('/');
        this.collections = {
        };
    };

    DataService.$inject = [ '$http' ];

    return DataService;
}());
