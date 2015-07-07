module.exports = (function () {
    var QueryPanelController;

    QueryPanelController = function ($scope, LogService, KeyService) {

        $scope.states = {
            tags: [],
            models: {
                filter: '',
                start_date: undefined,
                end_date: undefined
            },
        };

        function query() {
            $scope.query({
                'options': {
                tags: $scope.states.tags.map(function (t) { return t.name; }),
                start_date: $scope.states.models.start_date,
                end_date: $scope.states.models.end_date
                }
            });
        }

        function publishError(error) {
            LogService.error('publishing query panel error: ' + error);
            $scope.states.error = error;
            $scope.error({ 'error': error });
        }

        function validateTag(string) {
            return $scope.validTags.indexOf(string.toLowerCase()) >= 0;
        }

        function tryAddTag() {
            var potential = $scope.states.models.filter;

            if (validateTag(potential)) {
                $scope.states.tags.push({
                    name: $scope.states.models.filter
                });
                $scope.states.models.filter = '';
                query();
            } else {
                publishError('That tag is invalid');
            }
        }

        $scope.handlers = {
            addTag: tryAddTag,

            removeTag: function (index) {
                $scope.states.tags.splice(index, 1);
            },

            filterKeyUp: function ($event) {
                if (KeyService.isEnter($event)) {
                    $scope.handlers.addTag();
                }
            }
        };
    };

    QueryPanelController.$inject = [ '$scope', 'LogService', 'KeyService' ];

    return QueryPanelController;
}());
