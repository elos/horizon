// Currently just a stub of a log service
module.exports = (function () {
    var LogService;

    LogService = function ($log) {
        var service = this;

        service.info = function (message) {
            $log.info(message);
        };

        service.error = function (errorOrMessage) {
            $log.info(errorOrMessage);
        };
    };

    LogService.$inject = [ '$log' ];

    return LogService;
}());
