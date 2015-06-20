module.exports = (function () {
    var SchedulingController,
        WeeklySelector = 'weekly',
        MonthSelector = 'monthly',
        YearlySelector = 'yearly';

    SchedulingController = function ($scope, $route, $routeParams, TimeService) {
        var controller = this,
            i,
            monthName;

        // --- States {{{
        $scope.states = {
            options: [] // selectable options
        };
        // --- }}}

        // --- Dynamic Styles {{{
        $scope.styles = {
            bubbleSize: 'large'    // size of the clickable circles
        };
        // --- }}}

        // --- Handlers {{{
        $scope.handlers = {
            selectBase: function () {
                console.log('base');
            },

            selectWeekly: function () {
                $route.updateParams({ selector: WeeklySelector });
            },

            selectYearly: function () {
                $route.updateParams({ selector: YearlySelector });
            },

            selectWeekday: function (weekday) {
                console.log(weekday);
            },

            selectMonth: function (month) {
                console.log(month);
            },

            selectYearday: function (yearday) {
                console.log(yearday);
            }
        };
        // --- }}}

        // --- Helpers {{{
        $scope.helpers = {
            bubbleSize: function() {
                if ($scope.states.options.length < 4) {
                    return 'large';
                }
                if ($scope.states.options.length < 10) {
                    return 'medium';
                }

                return 'small';
            }
        };
        // --- }}}

        // --- Default Options {{{
        controller.DefaultOptions =  [
            {
                title: 'Base',
                click: $scope.handlers.selectBase
            },
            {
                title: 'Weekly',
                click: $scope.handlers.selectWeekly
            },
            {
                title: 'Yearly',
                click: $scope.handlers.selectYearly
            }
        ];

        // --- Weekday {{{
        controller.WeekdayOptions = [
            {
                title: 'Sunday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Sunday);
                }
            },
            {
                title: 'Monday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Monday);
                }
            },
            {
                title: 'Tuesday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Tuesday);
                }
            },
            {
                title: 'Wednesday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Wednesday);
                }
            },
            {
                title: 'Thursday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Thursday);
                }
            },
            {
                title: 'Friday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Friday);
                }
            },
            {
                title: 'Saturday',
                click: function () {
                    $scope.handlers.selectWeekday(TimeService.Saturday);
                }
            },
        ];
        // --- }}}

        // --- Month {{{
        function monthSelector(monthName) {
            return function () {
                $scope.handlers.selectMonth(TimeService[monthName]);
            };
        }

        controller.MonthOptions = [];
        for (i = 0; i < TimeService.Months.length; i += 1) {
            monthName = TimeService.Months[i];

            controller.MonthOptions.push({
                title: monthName,
                click: monthSelector(monthName)
            });
        }
        // --- }}}
        // --- }}}

        // --- Initialization {{{
        function init() {
            if ($routeParams.selector === WeeklySelector) {
                $scope.states.options = controller.WeekdayOptions;
            } else if ($routeParams.selector === YearlySelector) {
                $scope.states.options = controller.MonthOptions;
            } else {
                $scope.states.options = controller.DefaultOptions;
            }
        }

        init();
        // --- }}}
    };

    SchedulingController.$inject = [ '$scope', '$route', '$routeParams',
                                     'TimeService' ];

    return SchedulingController;
}());
