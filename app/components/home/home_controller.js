module.exports = (function() {
    'use strict';

    var HomeController = function ($scope, AccessService) {
        // --- Handlers {{{
        $scope.handlers = {
            logout: function () {
                AccessService.logout();
            }
        };
        // --- }}}

    };

    HomeController.$inject = [ '$scope', 'AccessService' ];

    return HomeController;
}());
