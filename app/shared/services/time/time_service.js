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
        // --- }}}

        // --- Months {{{
        service.Months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
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

        service.DaysInMonth = {
            1: 31,
            2: 29,
            3: 31,
            4: 31,
            5: 31,
            6: 31,
            7: 31,
            8: 31,
            9: 31,
            10: 31,
            11: 31,
            12: 31
        };
    };

    return TimeService;
}());
