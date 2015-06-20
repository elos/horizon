module.exports = (function() {
    'use strict';

    var ModelsService;

    ModelsService = function($http, $q, AccessService, HostService) {
        var service = this;

        service.kinds = [ 'person', 'session', 'credential', 'calendar' ];

        // --- New User {{{
        service.newUser = function () {
            return {
                kind: 'user',

                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                password: '',

                relations: {
                    person: undefined
                },

                person: function (DataService) {
                    var user = this;

                    console.log(DataService);

                    return $q(function(resolve, reject) {
                        var person = service.newPerson();

                        if (user.relations.person) {
                            resolve(user.relations.person);
                            return;
                        }

                        // this one is custom
                        $http({
                            method: 'GET',
                            url: HostService.url('/persons'),
                            headers: {
                                'Elos-Auth': AccessService.token()
                            }
                        }).then(
                            function (response) {
                                person.load(response.data.data[person.kind]);
                                user.relations.person = person;
                                resolve(person);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

                load: function(json) {
                    this.id         = json.id || this.id;
                    this.created_at = json.created_at || this.created_at;
                    this.updated_at = json.deleted_at || this.updated_at;
                    this.password   = json.password || this.password;

                    this.relations.person = undefined;
                }
            };
        };
        // --- }}}

        // --- New Person {{{
        service.newPerson = function () {
            return {
                kind: 'person',

                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                name: '',
                owner_id: '',
                calendar_id: '',

                relations: {
                    owner: undefined,
                    calendar: undefined
                },

                calendar: function (DataService) {
                    var person = this;

                    return $q(function(resolve, reject) {
                        var calendar = service.newCalendar();

                        if (person.relations.calendar) {
                            resolve(person.relations.calendar);
                            return;
                        }

                        DataService.kind(calendar.kind).find(person.calendar_id).then(
                                function (response) {
                                    calendar.load(response.data.data[calendar.kind]);

                                    person.relations.calendar = calendar;
                                    calendar.relations.person = person;

                                    resolve(calendar);
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                        );
                    });
                },

                save: function (DataService) {
                    DataService.kind(this.kind).save(this.toJSON());
                },

                load: function (json) {
                    this.id          = json.id || this.id;
                    this.created_at  = json.created_at || this.created_at;
                    this.updated_at  = json.deleted_at || this.updated_at;
                    this.name        = json.name || this.name;
                    this.owner_id    = json.owner_id || this.owner_id;
                    this.calendar_id = json.calendar_id || this.calendar_id;

                    this.relations.owner = undefined;
                },

                toJSON: function () {
                    var person = this;

                    return {
                        id: person.id,
                        created_at: person.created_at,
                        updated_at: person.updated_at,
                        name: person.name,
                        owner_id: person.owner_id,
                        calendar_id: person.calendar_id
                    };
                }
            };
        };
        // --- }}}

        //  --- New Calendar {{{
        service.newCalendar = function () {
            return {
                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                person_id: '',
                owner_id: '',
                base_schedule_id: '',
                weekday_schedules: {}, // empty map
                yearday_schedules: {},

                relations: {
                    owner: undefined,
                    person: undefined,
                    base_schedule: undefined
                },

                // --- owner(DataService) {{{
                owner: function (DataService) {
                    var calendar = this;

                    return $q(function(resolve, reject) {
                        var user = service.newUser();

                        if (calendar.relations.owner) {
                            resolve(calendar.relations.owner);
                            return;
                        }

                        DataService.kind(user.kind).find(calendar.owner_id).then(
                            function (response) {
                                user.load(response.data.data[user.kind]);

                                calendar.relations.owner = user;

                                resolve(user);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },
                // --- }}}

                // --- person(DataService) {{{
                person: function (DataService) {
                    var calendar = this;

                    return $q(function(resolve, reject) {
                        var person = service.newPerson();

                        if (calendar.relations.person) {
                            resolve(calendar.relations.person);
                            return;
                        }

                        DataService.kind(person.kind).find(calendar.person_id).then(
                            function (response) {
                                person.load(response.data.data[person.kind]);

                                calendar.relations.person = person;
                                person.relations.calendar = calendar;

                                resolve(person);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },
                // --- }}}

                // --- base_schedule {{{
                base_schedule: function (DataService) {
                    var calendar = this;

                    return $q(function (resolve, reject) {
                        if (calendar.relations.base_schedule) {
                            resolve(calendar.relations.base_schedule);
                            return;
                        }

                        var schedule = service.newSchedule();

                        DataService.kind(schedule.kind).find(calendar.base_schedule_id).then(
                            function (response) {
                                schedule.load(response.data.data[schedule.kind]);

                                calendar.relations.base_schedule = schedule;

                                resolve(schedule);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },
                // --- }}}

                load: function (json) {
                    this.id = json.id || this.id;
                    this.created_at = json.created_at || this.created_at;
                    this.updated_at = json.updated_at || this.updated_at;
                    this.owner_id = json.owner_id || this.owner_id;
                    this.person_id = json.person_id || this.person_id;
                    this.base_schedule_id = json.base_schedule_id || this.base_schedule_id;

                    this.weekday_schedules = json.weekday_schedules || this.weekday_schedules;
                    this.yearday_schedules = json.yearday_schedules || this.yearday_schedules;

                    this.relations.owner = undefined;
                    this.relations.person = undefined;
                    this.relations.base_schedule = undefined;
                }
            };
        };
        //  --- }}}

        // --- New Schedule {{{
        service.newSchedule = function () {
            return {
                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                name: ''
            };
        };
        // --- }}}

        // --- New Session {{{
        service.newSession = function () {
            return {
                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                token: '',
                expires_after: 0,
                owner_id: '',

                relations: {
                    owner: undefined
                },

                owner: function (DataService) {
                    var session = this;

                    return $q(function(resolve, reject) {
                        var user = service.newUser();

                        if (session.relations.owner) {
                            resolve(session.relations.owner);
                            return;
                        }

                        DataService.kind(user.kind).find(session.owner_id).then(
                            function(response) {
                                user.load(response.data.data[user.kind]);

                                session.relations.owner = user;
                                resolve(user);
                            },
                            function(response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

                load: function(json) {
                    this.id            = json.id || this.id;
                    this.created_at    = json.created_at || this.created_at;
                    this.updated_at    = json.deleted_at || this.updated_at;
                    this.token         = json.token || this.token;
                    this.expires_after = json.expires_after || this.expires_after;
                    this.owner_id       = json.owner_id || this.owner_id;

                    this.relations.owner = undefined;
                },
            };
        };
        // --- }}}

        service.session = function () {
            return $q(function(resolve, reject) {
                AccessService.session().then(
                    function (response) {
                        var s = service.newSession();
                        s.load(response.data.data.session);
                        resolve(s);
                    },
                    function (response) {
                        reject(response.data.developer_message);
                    }
                );
            });
        };
    };

    ModelsService.$inject = [ '$http', '$q', 'AccessService', 'HostService' ];

    return ModelsService;
}());
