module.exports = (function () {
    var DataController;

    DataController = function ($scope) {
        var controller = this;

        controller.foo = 'bar';

        $scope.options = {
            title: "Hello",
            data: [
                {
                    x: 1,
                    y: 2,
                },
                {
                    x: 2,
                    y: 2,
                },
                {
                    x: 3,
                    y: 2,
                },
                {
                    x: 4,
                    y: 2,
                },
                {
                    x: 5,
                    y: 2,
                },
                {
                    x: 6,
                    y: 2,
                }
            ],
            x_accessor: "x",
            y_accessor: "y"
        };

    };

    DataController.$inject = [ '$scope' ];

    return DataController;
}());
