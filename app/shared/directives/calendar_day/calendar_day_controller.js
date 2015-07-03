module.exports = (function () {
    var TimeBoxHeight = 80, // should be dynamic
        PixelsPerMinute = TimeBoxHeight / 30, //ppm
        NOP = function () { return; },
        CalendarDayController;

    CalendarDayController = function ($scope, CalendricalConstructionService, LogService) {
        // var controller = this;

        console.log(CalendricalConstructionService);
        $scope.states = {
            schedule: {
                title: '',
                timeBoxes: CalendricalConstructionService.TimeBoxes,
                labels: [],
                elements: []
            }
        };

        // This should be the only function with side effects
        function load(schedule) {
            LogService.info('Calendar Day Load Begin with Schedule: ');
            LogService.info(schedule);

            $scope.states.schedule.title = schedule.name;

            schedule.fixtures().then(
                function (fixtures) {
                    // Construct Labels
                    $scope.states.schedule.labels = fixtures.filter(function (fixture) { return fixture.label; })
                            .map(function (fixture) {
                                return CalendricalConstructionService.label(fixture, NOP);
                            });

                    // Construct elements
                    $scope.states.schedule.elements = fixtures.filter(function (fixture) { return !fixture.label; })
                            .map(function (fixture) {
                                return CalendricalConstructionService.element(PixelsPerMinute, fixture, NOP);
                            });
                },
                function (error) {
                    LogService.info('Calendar Day Error');
                    LogService.info(error);
                }
            );

            LogService.info('Calendar Day Load End');
        }

        $scope.load = load;
    };

    CalendarDayController.$inject = [ '$scope', 'CalendricalConstructionService', 'LogService' ];

    return CalendarDayController;
}());
