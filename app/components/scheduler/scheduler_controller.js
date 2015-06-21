module.exports = (function () {
    var SchedulerController;

    SchedulerController = function ($scope, $location, $routeParams, DataService, ModelsService) {
        $scope.states = {
            schedule: {
                title: ''
            },
            detail: {
                visible: false,
            }
        };

        $scope.handlers = {
            Back: function () {
                $location.path('scheduling');
            },

            Add: function () {
                $scope.states.detail.visible = true;
            }
        };

        // time boxes {{{
        $scope.states.schedule.timeBoxes = [
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

        $scope.states.schedule.labels = [
            { name: "Label 1" },
            { name: "Longer Label 2" }
        ];

        $scope.states.schedule.elements = [
            {
                name: "Name 1",
                style: {
                    height: "200px",
                    top: "100px"
                }
            },
            {
                name: "Name 2",
                style: {
                    height: "100px",
                    top: "650px"
                }
            }
        ];

        // --- Initialization {{{
        function init() {
            if (!$routeParams.schedule_id) {
                $location.path('scheduling');
            }

            ModelsService.FindSchedule($routeParams.schedule_id, DataService).then(
                function (schedule) {
                    $scope.states.schedule.title = schedule.name;
                },
                function (error) {
                    console.log(error);
                    $location.path('scheduling');
                }
            );

            $scope.states.detail.title = "Lorem Ipsum";
            $scope.states.detail.visible = false;
        }

        init();
        // --- }}}
    };

    SchedulerController.$inject = [ '$scope', '$location', '$routeParams', 'DataService', 'ModelsService' ];

    return SchedulerController;
}());
