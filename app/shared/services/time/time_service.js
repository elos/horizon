module.exports = (function() {
    var TimeService;

    TimeService = function() {
        this.isDaytime = function() /* => bool */ {
            var now = new Date(),
                hour = now.getHours();

            if (hour < 6 || hour > 20) {
                return false;
            }

            return true;
        };
    };

    return TimeService;
}());
