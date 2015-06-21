module.exports = (function() {
    var TimeService;

    TimeService = function() {
        var service = this;

        service.isDaytime = function () /* => bool */ {
            var now = new Date(),
                hour = now.getHours();

            if (hour < 6 || hour > 20) {
                return false;
            }

            return true;
        };

        // hmm.. I wonder why enums were invented.... oh js...
        // --- Weekdays {{{
        service.Sunday = 0;
        service.Monday = 1;
        service.Tuesday = 2;
        service.Wednesday = 3;
        service.Thursday = 4;
        service.Friday = 5;
        service.Saturday = 6;

        service.Weekdays = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
        };
        // --- }}}

        // --- Months {{{
        service.Months = [ '-', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                           'September', 'October', 'November', 'December' ];

        service.January = 1;
        service.February = 2;
        service.March = 3;
        service.April = 4;
        service.May = 5;
        service.June = 6;
        service.July = 7;
        service.August = 8;
        service.September = 9;
        service.October = 10;
        service.November = 11;
        service.December = 12;
        // --- }}}

        service.Yearday = function (month, day) {
            return (month * 100) + day;
        };

        service.numSuffixes = {
            1: "st",
            2: "nd",
            3: "rd",
            4: "th",
            5: "th",
            6: "th",
            7: "th",
            8: "th",
            9: "th",
            0: "th"
        };

        service.YeardayString = function (yearday) {
            if (typeof yearday === 'string') {
                yearday = parseInt(yearday, 10);
            }

            console.log(yearday);

            return service.Months[Math.floor(yearday / 100)] + ' ' + yearday % 100 + service.numSuffixes[yearday % 10];
        };

        service.DaysInMonth = {
            1: 31,
            2: 29,
            3: 31,
            4: 31,
            5: 30,
            6: 30,
            7: 31,
            8: 31,
            9: 30,
            10: 31,
            11: 30,
            12: 31
        };
    };

    return TimeService;
}());
