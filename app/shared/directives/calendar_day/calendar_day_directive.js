module.exports = (function () {
    'use strict';

    var CalendarDayController = require('./calendar_day_controller'),
        CalendarDayDirective;

    CalendarDayDirective = function () {
        return {
            replace: true, // inserting some DOM

            templateUrl: './app/shared/directives/calendar_day/calendar_day.html',

            // We want to be _reactive_
            scope: {
                load: '=' // function (schedule);
            },

            controller: CalendarDayController
        };
    };

    return CalendarDayDirective;
}());
