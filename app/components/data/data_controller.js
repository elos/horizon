module.exports = (function () {
    var DataController;

    DataController = function ($scope, DatumService, TimeService) {
        $scope.states = {
            validTags: []
        };

        function aggregate (data) {
            console.log(data);

            data = data.sort(function (a, b) {
                return a.date - b.date;
            });

            console.log(data);

            var days = data.reduce(function (acc, datum) {
                console.log(acc, datum);
                if (acc.length > 0 && TimeService.DayEquivalent(acc[acc.length - 1][0].created_at, datum.created_at)) {
                    acc[acc.length - 1].push(datum);
                } else {
                    acc.push([ datum ]);
                }
                return acc;
            }, []);

            console.log(days);

            return days.map(function (dayArr) {
                return {
                    value: dayArr.reduce(function (acc, day) {
                        return acc + day.value;
                    }, 0),
                    created_at: dayArr[0].created_at
                };
            });
        }

        function query(options) {
            DatumService.query(options).then(
                function (data) {
                    $scope.show({
                        data: aggregate(data),
                        x_accessor: "created_at",
                        y_accessor: "value"
                    });
                },
                $scope.handlers.queryError
            );
        }

        $scope.handlers = {
            applyQuery: query,

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
        console.log(allData);

        function init() {
            DatumService.tags().then(
                function (tags) {
                    $scope.states.validTags = tags;
                }, function (error) {
                    console.log(error);
                }
            );
        }

        init();
    };

    DataController.$inject = [ '$scope', 'DatumService', 'TimeService' ];

    return DataController;
}());
