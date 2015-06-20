module.exports = (function () {
    var SchedulerController;

    SchedulerController = function (DataService, ModelsService) {
        console.log(ModelsService);
        ModelsService.session().then(
            function (session) {
                console.log(session);

                return session.owner(DataService);
            },
            function (reason) {
                console.log(reason);
            }
        /*
        ).then(
            function (owner) {
                console.log(owner);

                var person = ModelsService.newPerson();
                person.name = "Test From Browser";
                person.owner_id = owner.id;
                return person.save(DataService);
            }
        */
        ).then(
            function (owner) {
                return owner.person(DataService);
            }
        ).then(
            function (person) {
                console.log(person);
            }
        );
    };

    SchedulerController.$inject = [ 'DataService', 'ModelsService' ];

    return SchedulerController;
}());
