module.exports = (function () {
    var SchedulingController;

    SchedulingController = function ($scope) {
        $scope.options = [
            { title: 'Base' },
            { title: 'Weekly' },
            { title: 'Yearly' }
        ];

        $scope.styles = {
            bubbleSize: 'large'
        };
    };

    SchedulingController.$inject = [ '$scope' ];

    return SchedulingController;
}());
