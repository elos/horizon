module.exports = (function () {
    var DataController;

    DataController = function ($scope) {
        $scope.states = {
            validTags: [ 'pushups' ]
        };

        $scope.handlers = {
            applyQuery: function (options) {
                console.log(options);
            },
            queryError: function (error) {
                console.log(error);
            }
        };

        var allData = [
            {
                tags: [ 'pushups' ],
                value: 30,
                created_at: new Date(2015, 5, 28, 0)
            },
            {
                tags: [ 'pushups' ],
                value: 40,
                created_at: new Date(2015, 5, 29, 0)
            },
            {
                tags: [ 'pushups' ],
                value: 50,
                created_at: new Date(2015, 5, 30, 0)
            },
            {
                tags: [ 'pushups' ],
                value: 52,
                created_at: new Date(2015, 6, 1, 0)
            },
            {
                tags: [ 'pushups' ],
                value: 37,
                created_at: new Date(2015, 6, 2, 0)
            },
            {
                tags: [ 'pushups' ],
                value: 30,
                created_at: new Date(2015, 6, 3, 0)
            }
        ];

        $scope.options = {
            title: undefined,
            data: allData,
            x_accessor: "created_at",
            y_accessor: "value"
        };
    };

    DataController.$inject = [ '$scope' ];

    return DataController;
}());
