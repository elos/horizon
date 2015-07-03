module.exports = (function () {
    var CalendarController;

    CalendarController = function ($scope, ScheduleService) {
        var controller = this;
        controller.foo = 'bar';

        ScheduleService.day(new Date()).then(
            function (schedule) {
                $scope.loadSchedule(schedule);
            }
        );
    };

    CalendarController.$inject = [ '$scope', 'ScheduleService' ];

    return CalendarController;
}());
