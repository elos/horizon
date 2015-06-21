module.exports = (function() {
    'use strict';

    var ModelsService;

    ModelsService = function($http, $q, AccessService, HostService, TimeService) {
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
                        if (person.relations.calendar) {
                            resolve(person.relations.calendar);
                            return;
                        }

                        var calendar = service.newCalendar();

                        if (!person.calendar_id) {
                            calendar.save(DataService).then(
                                function (calendar) {
                                    person.relations.calendar = calendar;
                                    resolve(calendar);
                                },
                                function (error) {
                                    reject(error);
                                }
                            );
                        } else {
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
                        }
                    });
                },

                save: function (DataService) {
                    return DataService.kind(this.kind).save(this.toJSON());
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
                kind: 'calendar',

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

                        if (!calendar.base_schedule_id) {
                            schedule.name = "Base Schedule";
                            schedule.save(DataService).then(
                                function (schedule) {
                                    calendar.relations.base_schedule = schedule;

                                    resolve(schedule);
                                },
                                function (error) {
                                    reject(error);
                                }
                            );
                        } else {
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
                        }
                    });
                },
                // --- }}}

                // --- weekday schedule {{{
                weekday_schedule: function (DataService, weekday) {
                    var calendar = this;

                    return $q(function (resolve, reject) {

                        var schedule = service.newSchedule();

                        if (!calendar.weekday_schedules[weekday]) {
                            schedule.name = "Weekday Schedule for " + TimeService.Weekdays[weekday];
                            schedule.save(DataService).then(
                                function (schedule) {
                                    calendar.reload(DataService).then(
                                        function () {
                                            resolve(schedule);
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
                        } else {
                            DataService.kind(schedule.kind).find(calendar.weekday_schedules[weekday]).then(
                                function (response) {
                                    schedule.load(response.data.data[schedule.kind]);
                                    resolve(schedule);
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        }

                    });
                },
                // --- }}}

                // --- yearday_schedule
                yearday_schedule: function (DataService, yearday) {
                    var calendar = this;

                    return $q(function (resolve, reject) {
                        var schedule = service.newSchedule();

                        if (!calendar.yearday_schedules[yearday]) {
                            schedule.name = "Yearday Schedule for " + TimeService.YeardayString(yearday);
                            schedule.save(DataService).then(
                                function (schedule) {
                                    calendar.reload(DataService).then(
                                        function () {
                                            resolve(schedule);
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
                        } else {
                            service.FindSchedule(calendar.yearday_schedules[yearday], DataService).then(
                                function (schedule) {
                                    resolve(schedule);
                                },
                                function (error) {
                                    reject(error);
                                }
                            );
                        }
                    });
                },

                // -- States {{{

                save: function (DataService) {
                    var calendar = this;

                    return $q(function (resolve, reject) {
                        DataService.kind(calendar.kind).save(calendar.toJSON()).then(
                            function (response) {
                                calendar.load(response.data.data[calendar.kind]);
                                resolve(calendar);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

                reload: function (DataService) {
                    var calendar = this;

                    if (!calendar.id) {
                        return $q(function (r) { r(calendar); });
                    }

                    return $q(function (resolve, reject) {
                        DataService.kind(calendar.kind).find(calendar.id).then(
                            function (response) {
                                calendar.load(response.data.data[calendar.kind]);
                                resolve(calendar);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

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
                },

                toJSON: function () {
                    var calendar = this;

                    return {
                        id: calendar.id,
                        created_at: calendar.created_at,
                        updated_at: calendar.updated_at,
                        owner_id: calendar.owner_id,
                        person_id: calendar.person_id,
                        base_schedule_id: calendar.base_schedule_id,
                        weekday_schedules: calendar.weekday_schedules,
                        yearday_schedules: calendar.yearday_schedules
                    };
                }

                // --- }}}
            };
        };
        //  --- }}}

        // --- New Schedule {{{
        service.newSchedule = function () {
            return {
                kind: 'schedule',

                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                name: '',
                start_time: new Date(),
                end_time: new Date(),
                owner_id: '',
                fixtures_ids: [],

                relations: {
                    owner: undefined,
                    fixtures: undefined
                },

                // --- fixtures (DataService)  {{{
                fixtures: function (DataService) {
                    var schedule = this;

                    return $q(function (resolve, reject) {
                        if (schedule.relations.fixtures) {
                            resolve(schedule.relations.fixtures);
                            return;
                        }

                        var fixtures = [],
                            fixture_id,
                            fixture,
                            i,
                            promises = [];

                        for (i = 0; i < schedule.fixtures_ids.length; i += 1) {
                            fixture_id = schedule.fixtures_ids[i];
                            promises.push(DataService.kind(fixture.kind).find(fixture_id));
                        }

                        $q.all(promises).then(
                            function (successResponses) {
                                var j;

                                for (j = 0; j < successResponses.length; j += 1) {
                                    fixture = service.newFixture();
                                    fixture.load(successResponses[j].data.data[fixture.kind]);

                                    fixtures.push(fixture);
                                }

                                resolve(fixtures);
                            },
                            function (failureResponse) {
                                reject(failureResponse.data.developer_message);
                            }
                        );
                    });
                },
                // --- }}}

                save: function (DataService) {
                    var schedule = this;

                    return $q(function (resolve, reject) {
                        DataService.kind(schedule.kind).save(schedule.toJSON()).then(
                            function (response) {
                                schedule.load(response.data.data[schedule.kind]);
                                resolve(schedule);
                            },
                            function (response) {
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

                toJSON: function () {
                    var schedule = this;

                    return {
                        id: schedule.id,
                        created_at: schedule.created_at,
                        updated_at: schedule.updated_at,
                        name: schedule.name,
                        start_time: schedule.start_time,
                        end_time: schedule.end_time,
                        owner_id: schedule.owner_id,
                        fixtures_ids: schedule.fixtures_ids
                    };
                },

                load: function (json) {
                    this.id = json.id || this.id;
                    this.created_at = json.created_at || this.created_at;
                    this.updated_at = json.updated_at || this.updated_at;
                    this.name = json.name || this.name;
                    this.start_time = json.start_time || this.start_time;
                    this.end_time = json.end_time || this.end_time;
                    this.owner_id = json.owner_id || this.owner_id;
                    this.fixtures_ids = json.fixtures_ids || this.fixtures_id;

                    this.relations.owner = undefined;
                    this.relations.fixtures = undefined;
                }

            };
        };
        // --- }}}

        // --- New Fixture {{{
        service.newFixture = function () {
            return {
                kind: 'fixture',

                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                name: '',
                start_time: new Date(0),
                end_time: new Date(0),
                description: '',
                rank: 0,
                label: false,
                expires: new Date(0),
                date_exceptions: [],
                owner_id: '',

                load: function (json) {
                    var properties = [
                        'id', 'created_at', 'updated_at', 'name',
                        'start_time', 'end_time', 'description',
                        'rank', 'label', 'expires', 'date_exceptions',
                        'owner_id'
                    ],
                    fixture = this;

                    angular.forEach(properties, function (property) {
                        fixture[property] = json[property] || fixture[property];
                    });
                }
            };
        };
        // --- }}}

        // --- New Session {{{
        service.newSession = function () {
            return {
                kind: 'session',

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

        service.FindSchedule = function (id, DataService) {
            var schedule = service.newSchedule();

            return $q(function (resolve, reject) {
                DataService.kind(schedule.kind).find(id).then(
                    function (response) {
                        schedule.load(response.data.data[schedule.kind]);
                        resolve(schedule);
                    },
                    function (response) {
                        reject(response.data.developer_message);
                    }
                );
            });
        };

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

    ModelsService.$inject = [ '$http', '$q', 'AccessService', 'HostService', 'TimeService' ];

    return ModelsService;
}());
