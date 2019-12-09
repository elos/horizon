module.exports = (function () {
    'use strict';

    var DataInputController;

    DataInputController = function ($scope, $location, ModelsService) {
        var controller = this;

        $scope.states = {
            models: {
                value: undefined,
                units: undefined,
                created_at: new Date(),
                tags: [],
                tagAdding: undefined
            },
            error: {
                text: undefined
            }
        };

        controller.error = {
            show: function (text) {
                switch (typeof text) {
                    case 'string':
                        $scope.states.error.text = text;
                        break;
                    default:
                        return;
                }
            },
            hide: function () {
                $scope.states.error.text = undefined;
            }
        };

        function submit(models) {
            switch (typeof models.value) {
                case  "number":
                    break;
                default:
                    controller.error.show('Value must be a number');
                    return;
            }

            switch (typeof models.units) {
                case "string":
                    break;
                default:
                    controller.error.show('Units must be a string');
                    return;
            }

            switch (typeof models.created_at) {
                case "object":
                    break;
                default:
                    controller.error.show('Time & Date must be defined');
                    return;
            }

            switch (models.created_at instanceof Date) {
                case true:
                    break;
                default:
                    controller.error.show('Time & Date must compose a date object');
                    return;
            }

            switch (typeof models.name) {
                case "string":
                    break;
                case "undefined":
                    models.name = models.tags.join(' ');
                    break;
                default:
                    controller.error.show('Name must be a string, or not defined');
                    return;
            }

            ModelsService.session().then(
                function (session) {
                    var datum = ModelsService.Datum.new();
                    datum.value = models.value;
                    datum.unit = models.units;
                    datum.created_at = models.created_at;
                    datum.tags = models.tags;
                    datum.name = models.name;
                    datum.owner_id = session.owner_id;

                    return datum.save();
                },
                function (error) {
                    controller.error.show(error);
                }
            ).then(
                function () {
                    $location.path('/data');
                },
                function (error) {
                    controller.error.show(error);
                }
            );
        }

        $scope.handlers = {
            submit: function () {
                controller.error.hide();
                submit($scope.states.models);
            },
            addTag: function (tag) {
                switch (typeof tag) {
                    case 'string':
                        break;
                    default:
                        return;
                }

                $scope.states.models.tags.push(tag);
            }
        };
    };

    DataInputController.$inject = [ '$scope', '$location', 'ModelsService' ];

    return DataInputController;

}());
