module.exports = (function () {
    var KeyService = function () {
        this.ENTER = 13;

        this.isEnter = function ($event) {
            return $event.keyCode === this.ENTER;
        };
    };

    return KeyService;
}());
