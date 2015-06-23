module.exports = (function () {
    var SchedulerController,
        SchedulingPath = "/scheduling",
        TimeBoxHeight = 80, // px
        PixelsPerMinute = TimeBoxHeight / 30; // px/min

    // clean this up
    // add panel state to url
    SchedulerController = function ($scope, $location, $q, $routeParams, DataService, ModelsService) {

        // --- States {{{
        // Enum of the possible panel states
        $scope.detailPanels = {
            creating: 'creating',
            editing:  'editing',
            viewing: 'viewing'
        };

        $scope.states = {
            schedule: {                // Properties of the schedule card in middle and on right
                title: '',             //  * The title displayed in the header of the schedule card
                labels: [],            //  * Array of labels displayed at top of schedule card
                elements: [],          //  * Array of elements displayed on schedule
                target: undefined      //  * Schedule represented by title, label, and elements
            },
            detail: {                  // Properties of the detail panel on the left
                visible: false,        //  * Whether the detail card is visible
                title: '',             //  * The title of the detail card
                panel: '',             //  * Which panel is currently visible
                error: {               //  * The error field on the detail panel forms
                    visible: false,    //  ** Whether the error is visible on screen or not
                    text: ''           //  ** The text in the error box
                }
            }
        };
        // --- States }}}

        // --- Models {{{
        $scope.models = {
            creating: {                // Description of the creating panel models (inputs)
                name: undefined,       //  * The value of the name field
                startTime: undefined,  //  * The value of the startTime field
                endTime: undefined,    //  * The value of the endTime field
                label: undefined       //  * The value of the label checkbox
            },
            editing: {                 // Description of the editing panel models (inputs)
                fixture: undefined,    //  * The fixture being edited (changes are not directly here)
                name: undefined,       //  * The value of the name field
                startTime: undefined,  //  * The value of the startTime field
                endTime: undefined,    //  * The value of the endTime field
                label: undefined       //  * The value of the label checkbox
            },
            viewing: {                 // Description of the viewing panel models
                fixture: undefined     //  * The fixture being viewed
            }
        };
        // --- Models }}}

        // --- Core Actions (Add, View, Edit) (all open the detail panel) {{{
        // Start creating a fixture
        function add() {
            $scope.states.detail.title = 'New Fixture';
            $scope.states.detail.panel = $scope.detailPanels.creating;

            $scope.states.detail.visible = true;
        }

        // Start viewing a fixture
        function view(fixture) {
            $scope.states.detail.title = fixture.name;
            $scope.states.detail.panel = $scope.detailPanels.viewing;
            $scope.models.viewing.fixture = fixture;

            $scope.states.detail.visible = true;
        }

        // Start editing a fixture
        function edit(fixture) {
            $scope.states.detail.title = 'Edit Fixture';
            $scope.states.detail.panel = $scope.detailPanels.editing;
            $scope.models.editing.fixture = fixture;

            $scope.models.editing.name = fixture.name;
            $scope.models.editing.startTime = fixture.start_time;
            $scope.models.editing.endTime = fixture.end_time;
            $scope.models.editing.label = fixture.label;

            $scope.states.detail.visible = true;
        }
        // --- }}}

        // --- createFixture {{{
        function createFixture(name, startTime, endTime, isLabel) {
            return $q(function (resolve, reject) {
                if (!name) {
                    reject('need a name');
                }

                if (!startTime) {
                    reject('need a start time');
                }

                if (!endTime) {
                    reject('need a end time');
                }

                if (startTime >= endTime) {
                    reject('start time must be before end time');
                }

                if (isLabel === undefined) {
                    isLabel = false;
                }

                var fixture = ModelsService.newFixture();
                fixture.name = name;
                fixture.start_time = startTime;
                fixture.end_time = endTime;
                fixture.label = isLabel;
                fixture.schedule_id = $scope.states.schedule.target.id;
                fixture.save(DataService).then(
                    function (fixture) {
                        $scope.states.schedule.target.fixtures_ids.push(fixture.id);

                        $scope.states.schedule.target.save(DataService).then(
                            function (schedule) {
                                resolve([ fixture, schedule ]);
                            },
                            function (error) {
                                reject(error);
                            }
                        );
                    },
                    function (error) {
                        reject(error);
                    }
                );
            });
        }
        // --- }}}

        // --- save {{{
        function saveFixture(fixture, name, startTime, endTime, isLabel) {
            return $q(function (resolve, reject) {
                if (!name) {
                    reject('need a name');
                }

                if (!startTime) {
                    reject('need a start time');
                }

                if (!endTime) {
                    reject('need a end time');
                }

                if (startTime >= endTime) {
                    reject('start time must be before end time');
                }

                if (isLabel === undefined) {
                    isLabel = false;
                }

                fixture.name = name;
                fixture.start_time = startTime;
                fixture.end_time = endTime;
                fixture.label = isLabel;
                fixture.schedule_id = $scope.states.schedule.target.id;

                fixture.save(DataService).then(resolve, reject);
            });
        }
        // --- }}}

        // --- Loading State {{{
        function labelFor(fixture) {
            return {
                name: fixture.name,
                click: function () {
                    view(fixture);
                }
            };
        }

        function pixelTop(time) {
            return (time.getHours() * 60 + time.getMinutes()) * PixelsPerMinute;
        }

        function elementHeight(fixture) {
            return pixelTop(fixture.end_time) - pixelTop(fixture.start_time);
        }

        function elementFor(fixture) {
            return {
                name: fixture.name,
                style: {
                    height: elementHeight(fixture) + "px",
                    top: pixelTop(fixture.start_time) + "px"
                },
                click: function () {
                    view(fixture);
                }
            };
        }

        function load(schedule) {
            console.log('starting load');
            $scope.states.schedule.target = schedule;

            var i,
                fixture;

            schedule.fixtures(DataService).then(
                function (fixtures) {
                    $scope.states.schedule.title = schedule.name;
                    $scope.states.schedule.labels = [];
                    $scope.states.schedule.elements = [];

                    console.log(fixtures);

                    for (i = 0; i < fixtures.length; i += 1) {
                        fixture = fixtures[i];

                        if (fixture.label) {
                            $scope.states.schedule.labels.push(labelFor(fixture));
                        } else {
                            $scope.states.schedule.elements.push(elementFor(fixture));
                        }
                    }

                    console.log('ending load');
                },
                function (error) {
                    console.log('hey');
                    console.log(error);
                    return;
                }
            );

        }
        // --- }}}

        $scope.handlers = {
            Back: function () {
                $location.path('scheduling');
            },

            Add: function () {
                add();
            },

            closePanel: function () {
                $scope.states.detail.visible = false;
            },

            editFixtureViewing: function () {
                if ($scope.models.viewing.fixture) {
                    edit($scope.models.viewing.fixture);
                }
            },

            saveFixtureEditing: function () {
                if ($scope.models.editing.fixture) {
                    saveFixture(
                        $scope.models.editing.fixture,
                        $scope.models.editing.name,
                        $scope.models.editing.startTime,
                        $scope.models.editing.endTime,
                        $scope.models.editing.label
                    ).then(
                        function(fixture) {
                            $scope.states.schedule.target.reload(DataService).then(
                                function (schedule) {
                                    load(schedule);
                                    view(fixture);
                                },
                                function (error) {
                                    console.log(error);
                                }
                            );
                        },
                        function (error) {
                            $scope.states.detail.error.text = error;
                            $scope.states.detail.error.visible = true;
                        }
                    );
                }

            },

            removeFixtureEditing: function () {
                alert('no');
            },

            submitNewFixture: function () {
                createFixture(
                    $scope.models.creating.name,
                    $scope.models.creating.startTime,
                    $scope.models.creating.endTime,
                    $scope.models.creating.label
                ).then(
                    function (pair) {
                        load(pair[1]); // schedule
                        view(pair[0]); // fixture
                    },
                    function (error) {
                        $scope.states.detail.error.text = error;
                        $scope.states.detail.error.visible = true;
                    }
                );
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

        // --- Initialization {{{
        function init() {
            // If we don't have a schedule id, we need to get one
            if (!$routeParams.schedule_id) {
                $location.path(SchedulingPath);
            }

            // Find the schedule associated with the id
            ModelsService.FindSchedule($routeParams.schedule_id, DataService).then(
                function (schedule) {
                    if ($routeParams.panel) {
                        if ($scope.detailPanels[$routeParams.panel]) {
                            var fixture;
                            switch ($routeParams.panel) {
                            case $scope.detailPanels.creating:
                                load(schedule);
                                add();
                                break;
                            case $scope.detailPanels.editing:
                                if (!$routeParams.panel_target_id) {
                                    $location.path('/scheduler/' + $routeParams.schedule_id);
                                }

                                fixture = ModelsService.newFixture();
                                DataService.kind(fixture.kind).find($routeParams.panel_target_id).then(
                                    function (fixture) {
                                        load(schedule);
                                        edit(fixture);
                                    }, function () {
                                        $location.path('/scheduler/' + $routeParams.schedule_id);
                                    }
                                );
                                break;
                            case $scope.detailPanels.viewing:
                                if (!$routeParams.panel_target_id) {
                                    $location.path('/scheduler/' + $routeParams.schedule_id);
                                }

                                fixture = ModelsService.newFixture();
                                DataService.kind(fixture.kind).find($routeParams.panel_target_id).then(
                                    function (fixture) {
                                        load(schedule);
                                        view(fixture);
                                    }, function () {
                                        $location.path('/scheduler/' + $routeParams.schedule_id);
                                    }
                                );
                                break;
                            }
                        } else {
                            $location.path('/scheduler/' + $routeParams.schedule_id);
                        }
                    }

                    load(schedule);
                },
                function (error) {
                    console.log(error);
                    $location.path(SchedulingPath);
                }
            );
        }

        init();
        // --- }}}
    };

    SchedulerController.$inject = [ '$scope', '$location', '$q', '$routeParams',
                                    'DataService', 'ModelsService' ];

    return SchedulerController;
}());
