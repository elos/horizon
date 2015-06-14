module.exports = (function() {
    var HomeController = function($scope, $location) {
        $location.absUrl();
    };

    HomeController.$inject = [ '$scope', '$location' ];

    return HomeController;
}());
