module.exports = (function () {
    var SchedulingController,
        WeeklySelector = 'weekly',
        MonthSelector = 'monthly',
        YearlySelector = 'yearly';

    SchedulingController = function ($scope, $location, $route, $routeParams, TimeService, ScheduleService, LogService) {
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
                ScheduleService.base().then($scope.helpers.view, LogService.error);
            },

            selectWeekly: function () {
                $route.updateParams({ selector: WeeklySelector });
            },

            selectYearly: function () {
                $route.updateParams({ selector: YearlySelector });
            },

            selectWeekday: function (day) {
                ScheduleService.weekday(day).then($scope.helpers.view, LogService.error);
            },

            selectMonth: function (month) {
                $route.updateParams({
                    selector: MonthSelector,
                    index: month,
                });
            },

            selectYearday: function (day) {
                ScheduleService.yearday(day).then($scope.helpers.view, LogService.error);
            },

            selectToday: function () {
                var d = new Date();
                $scope.handlers.selectYearday(TimeService.Yearday(d.getMonth() + 1, d.getDate()));
            }
        };
        // --- }}}

        // --- Helpers {{{
        $scope.helpers = {
            bubbleSize: function() {
                if ($scope.states.options.length < 5) {
                    return 'large';
                }
                if ($scope.states.options.length < 10) {
                    return 'medium';
                }

                return 'small';
            },

            view: function (schedule) {
                $location.path("/scheduler/" + schedule.id);
            }
        };
        // --- }}}

        // --- Options {{{
        // --- Basic (Default) {{{
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
            },
            {
                title: 'Today',
                click: $scope.handlers.selectToday
            }
        ];
        // --- }}}

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
        for (i = 1; i < TimeService.Months.length; i += 1) {
            monthName = TimeService.Months[i];

            controller.MonthOptions.push({
                title: monthName,
                click: monthSelector(monthName)
            });
        }
        // --- }}}

        // --- MonthDay {{{
        function yeardaySelector(month, day) {
            return function () {
                $scope.handlers.selectYearday(TimeService.Yearday(month, day));
            };
        }

        controller.MonthDayOptions = function (month) {
            var opts = [],
                j;

            for (j = 1; j < TimeService.DaysInMonth[month] + 1; j += 1) {
                opts.push({
                    title: j,
                    click: yeardaySelector(month, j)
                });
            }

            return opts;
        };
        // --- }}}
        // --- }}}

        // --- Initialization {{{
        function init() {
            if ($routeParams.selector === WeeklySelector) {
                $scope.states.options = controller.WeekdayOptions;
            } else if ($routeParams.selector === YearlySelector) {
                $scope.states.options = controller.MonthOptions;
            } else if ($routeParams.selector === MonthSelector) {
                if ($routeParams.index) {
                    $scope.states.options = controller.MonthDayOptions($routeParams.index);
                } else {
                    $route.updateParams({ selector: YearlySelector });
                }
            } else {
                $scope.states.options = controller.DefaultOptions;
            }
        }

        init();
        // --- }}}
    };

    SchedulingController.$inject = [ '$scope', '$location', '$route', '$routeParams',
                                     'TimeService', 'ScheduleService', 'LogService' ];

    return SchedulingController;
}());
