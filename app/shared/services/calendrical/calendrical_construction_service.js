module.exports = (function () {
    'use strict';

    var CalendricalConstructionService;

    CalendricalConstructionService = function () {
        var service = this;

        // Definitions:
        // ppm = pixels per minute == px/min

        // time boxes {{{
        service.TimeBoxes = [
         { time: "12:30 AM" },
         { time: "1:00 AM" },
         { time: "1:30 AM" },
         { time: "2:00 AM" },
         { time: "2:30 AM" },
         { time: "3:00 AM" },
         { time: "3:30 AM" },
         { time: "4:00 AM" },
         { time: "4:30 AM" },
         { time: "5:00 AM" },
         { time: "5:30 AM" },
         { time: "6:00 AM" },
         { time: "6:30 AM" },
         { time: "7:00 AM" },
         { time: "7:30 AM" },
         { time: "8:00 AM" },
         { time: "8:30 AM" },
         { time: "9:00 AM" },
         { time: "9:30 AM" },
         { time: "10:00 AM" },
         { time: "10:30 AM" },
         { time: "11:00 AM" },
         { time: "11:30 AM" },
         { time: "12:00 PM" },
         { time: "12:30 PM" },
         { time: "1:00 PM" },
         { time: "1:30 PM" },
         { time: "2:00 PM" },
         { time: "2:30 PM" },
         { time: "3:00 PM" },
         { time: "3:30 PM" },
         { time: "4:00 PM" },
         { time: "4:30 PM" },
         { time: "5:00 PM" },
         { time: "5:30 PM" },
         { time: "6:00 PM" },
         { time: "6:30 PM" },
         { time: "7:00 PM" },
         { time: "7:30 PM" },
         { time: "8:00 PM" },
         { time: "8:30 PM" },
         { time: "9:00 PM" },
         { time: "9:30 PM" },
         { time: "10:00 PM" },
         { time: "10:30 PM" },
         { time: "11:00 PM" },
         { time: "11:30 PM" },
         { time: "12:00 AM" },
        ];
        // --- }}}

        // Note that time is a JS Date Object
        service.pixelTop = function (ppm, time) {
            return (time.getHours() * 60 + time.getMinutes()) * ppm;
        };

        // Note: timeable must have a start_time and end_time
        service.timeableHeight = function (ppm, timeable) {
            return service.pixelTop(ppm, timeable.end_time) - service.pixelTop(ppm, timeable.start_time);
        };

        service.label = function (fixture, onClickCallback) {
            return {
                name: fixture.name,
                click: function () {
                    onClickCallback(fixture);
                }
            };
        };

        service.element = function (ppm, fixture, onClickCallback) {
            return {
                name: fixture.name,
                style: {
                    height: service.timeableHeight(ppm, fixture) + "px",
                    top: service.pixelTop(ppm, fixture.start_time) + "px"
                },
                click: function () {
                    onClickCallback(ppm, fixture);
                }
            };
        };
    };

    CalendricalConstructionService.$inject = [];

    return CalendricalConstructionService;
}());
