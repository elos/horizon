module.exports = (function() {
    'use strict';

    var LoginController,
        DefaultError = 'Something went wrong';

    LoginController = function($scope, $location, $log, AccessService, KeyService) {
        var controller = this;

        // --- States {{{
        $scope.states = {
            canSubmit: false,    // whether the form can be submitted (to enable continue button)
            error: {             // the error object of the login component
                visible: false,  //  * whether the error is visible
                text: undefined  //  * the error text that is displayed
            }
        };
        // --- }}}

        // --- Handlers {{{
        $scope.handlers = {
            submit: function(publicCredential, privateCredential) {
               controller.helpers.authenticationResult(
                   AccessService.login(
                       publicCredential,
                       privateCredential
                   )
               );
            },

            keyUp: function($event, pubString, priString) {
                $scope.states.canSubmit = controller.helpers.ableToSubmit(pubString, priString);

                if (KeyService.isEnter($event) && $scope.states.canSubmit) {
                    $scope.handlers.submit(pubString, priString);
                }
            }
        };
        // --- }}}

        // --- Helpers {{{
        controller.helpers = {
            ableToSubmit: function(publicCredential, privateCredential) {
                return publicCredential && privateCredential;
            },

            authenticationResult: function(deferred) {
                deferred.then(
                    function(response) {
                        $location.path('/home');
                    },
                    function(response) {
                        $scope.states.canSubmit = false;
                        controller.error.show(DefaultError);
                    }
                );
            },
        };

       controller.error = {
            show: function(text) {
                $scope.states.error.visible = true;
                $scope.states.error.text = text;
            },

            hide: function() {
                $scope.states.error.visible = false;
            }
        };
        // --- }}}

        // --- Initialization {{{
        if (AccessService.isAuthenticated()) {
            $log.info('already authenticated');
        }
        // --- }}}
    };

    LoginController.$inject = [ '$scope', '$location', '$log',
                                'AccessService', 'KeyService' ];

    return LoginController;
}());
