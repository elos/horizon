module.exports = (function() {
    'use strict';

    var ModelsService;

    ModelsService = function($http, $q, AccessService, DataService, HostService, TimeService) {
        var service = this;

        service.kinds = [ 'person', 'session', 'credential', 'calendar' ];

        service.CalendarKind = 'calendar';
        service.FixtureKind = 'fixture';
        service.PersonKind = 'person';
        service.ScheduleKind = 'schedule';
        service.UserKind = 'user';

        // --- User {{{
        service.User = {
            TypeMap: {
                id: DataService.Types.ID,
                created_at: DataService.Types.Date,
                updated_at: DataService.Types.Date,
                password: DataService.Types.String,
            },

            new: function () {
                return {
                    kind: service.UserKind,

                    id: '',
                    created_at: new Date(),
                    updated_at: new Date(),
                    password: '',

                    relations: {
                        person: undefined
                    },

                    person: function () {
                        var user = this;

                        return $q(function (resolve, reject) {
                            if (user.relations.person) { return resolve(user.relations.person); }

                            $http({
                                method: 'GET',
                                url: HostService.url('/persons'),
                                headers: {
                                    'Elos-Auth': AccessService.token()
                                }
                            }).then(
                                function (response) {
                                    user.relations.person = service.Person.new().load(response.data.data[service.PersonKind]);
                                    resolve(user.relations.person);
                                },
                                function (response) {
                                    switch (response.data.status) {
                                        case 404:
                                            var person = service.Person.new();
                                            person.owner_id = user.id;

                                            person.save().then(
                                                function (response) {
                                                    user.relations.person = service.Person.new().load(response.data.data[service.PersonKind]);
                                                    resolve(user.relations.person);
                                                },
                                                function () {
                                                    throw 'fuck';
                                                }
                                            );
                                            break;
                                        default:
                                            reject(response.data.developer_message);
                                    }
                                }
                            );
                        });
                    },

                    load: function(payload) {
                        var user = this;
                        DataService.unmarshal(user, service.User.TypeMap, payload);
                        this.relations = {};
                        return user;
                    }
                };
            }
        };

        service.newUser = service.User.new;
        // --- }}}

        // --- New Person {{{
        service.Person = {
            TypeMap: {
                id: DataService.Types.ID,
                created_at: DataService.Types.Date,
                updated_at: DataService.Types.Date,
                name: DataService.Types.String,
                owner_id: DataService.Types.String,
                calendar_id: DataService.Types.String
            },

            new: function () {
                return {
                    kind: service.PersonKind,

                    id: undefined,
                    created_at: new Date(),
                    updated_at: new Date(),
                    name: undefined,
                    owner_id: undefined,
                    calendar_id: undefined,

                    relations: {
                        owner: undefined,
                        calendar: undefined
                    },

                    owner: function () {
                        var person = this;

                        return $q(function (resolve, reject) {
                            if (person.relations.owner) { return resolve(person.relations.owner); }

                            switch (typeof person.owner_id) {
                                case "string":
                                    DataService.kind(service.UserKind).find(person.owner_id).then(
                                        function (response) {
                                            person.relations.owner = service.User.new().load(response.data.data[service.UserKind]);
                                            resolve(person.relations.owner);
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                    break;
                                case "undefined":
                                    throw "User can't be undefined lol";
                            }
                        });
                    },

                    calendar: function () {
                        var person = this;

                        return $q(function (resolve, reject) {
                            if (person.relations.calendar) { return resolve(person.relations.calendar); }

                            switch (typeof person.calendar_id) {
                                case "string":
                                    DataService.kind(service.CalendarKind).find(person.calendar_id).then(
                                        function (response) {
                                            person.relations.calendar = service.Calendar.new().load(response.data.data[service.CalendarKind]);
                                            resolve(person.relations.calendar);
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                    break;
                                case "undefined":
                                    var calendar = service.Calendar.new();

                                    calendar.owner_id = person.owner_id;
                                    calendar.person_id = person.id;

                                    calendar.save().then(
                                        function (calendar) {
                                            person.calendar_id = calendar.id;
                                            person.save().then(
                                                function (person) {
                                                    person.relations.calendar = calendar;
                                                    resolve(calendar);
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
                                    break;
                            }
                        });
                    },

                    load: function(payload) {
                        var person = this;
                        DataService.unmarshal(person, service.Person.TypeMap, payload);
                        this.relations = {};
                        return person;
                    },

                    save: function () {
                        var person = this;
                        return $q(function (resolve, reject) {
                            DataService.kind(person.kind).save(person.toJSON()).then(
                                function (response) {
                                    resolve(person.load(response.data.data[service.PersonKind]));
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    toJSON: function () {
                        return DataService.marshal(this, service.Person.TypeMap);
                    }
                };
            }
        };
        // --- }}}

        //  --- New Calendar {{{
        service.Calendar = {
            TypeMap: {
                id: DataService.Types.ID,
                created_at: DataService.Types.Date,
                updated_at: DataService.Types.Date,
                password: DataService.Types.String,
                person_id: DataService.Types.String,
                owner_id: DataService.Types.String,
                base_schedule_id: DataService.Types.String,
                weekday_schedules: DataService.Types.Map,
                yearday_schedules: DataService.Types.Map,
            },

            new: function () {
                return {
                    kind: service.CalendarKind,

                    id: undefined,
                    created_at: new Date(),
                    updated_at: new Date(),
                    person_id: undefined,
                    owner_id: undefined,
                    base_schedule_id: undefined,
                    weekday_schedules: {},
                    yearday_schedules: {},

                    relations: {
                        owner: undefined,
                        person: undefined,
                        base_schedule: undefined,
                        weekday_schedules: {},
                        yearday_schedules: {}
                    },

                    owner: function () {
                        var calendar = this;

                        return $q(function (resolve, reject) {
                            if (calendar.relations.owner) { return resolve(calendar.relations.owner); }

                            DataService.kind(service.UserKind).find(calendar.owner_id).then(
                                function (response) {
                                    calendar.relations.owner = service.User.new().load(response.data.data[service.UserKind]);
                                    resolve(calendar.relations.owner);
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    person: function () {
                        var calendar = this;

                        return $q(function (resolve, reject) {
                            if (calendar.relations.person) { return resolve(calendar.relations.person); }

                            DataService.kind(service.PersonKind).find(calendar.person_id).then(
                                function (response) {
                                    calendar.relations.person = service.Person.new().load(response.data.data[service.PersonKind]);
                                    resolve(calendar.relations.owner);
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    base_schedule: function () {
                        var calendar = this;

                        return $q(function (resolve, reject) {
                            if (calendar.relations.base_schedule) { return resolve(calendar.relations.base_schedule); }

                            switch (typeof calendar.base_schedule_id) {
                                case "string":
                                    DataService.kind(service.ScheduleKind).find(calendar.base_schedule_id).then(
                                        function (response) {
                                            calendar.relations.base_schedule = service.Schedule.new().load(response.data.data[service.ScheduleKind]);
                                            resolve(calendar.relations.base_schedule);
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                    break;
                                case "undefined":
                                    var schedule = service.Schedule.new();

                                    schedule.name = "Base Schedule";
                                    schedule.owner_id = calendar.owner_id;

                                    schedule.save(DataService).then(
                                        function (schedule) {
                                            calendar.relations.base_schedule = schedule;

                                            resolve(schedule);
                                        },
                                        function (error) {
                                            reject(error);
                                        }
                                    );
                                    break;
                            }
                        });
                    },

                    weekday_schedule: function (weekday) {
                        var calendar = this;
                        console.log('Weekday schedule', weekday);

                        return $q(function (resolve, reject) {
                            if (calendar.relations.weekday_schedules[weekday]) { return resolve(calendar.relations.weekday_schedules[weekday]); }

                            switch (typeof calendar.weekday_schedules[weekday]) {
                                case "string":
                                    DataService.kind(service.ScheduleKind).find(calendar.weekday_schedules[weekday]).then(
                                        function (response) {
                                            calendar.relations.weekday_schedules[weekday] = service.Schedule.new().load(response.data.data[service.ScheduleKind]);
                                            resolve(calendar.relations.weekday_schedules);
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                    break;
                                case "undefined":
                                    var schedule = service.Schedule.new();

                                    schedule.name = "Weekday Schedule for " + TimeService.Weekdays[weekday];
                                    schedule.owner_id = calendar.owner_id;

                                    schedule.save(DataService).then(
                                        function (schedule) {
                                            calendar.reload().then(
                                                function () { resolve(schedule); },
                                                function (error) { reject(error); }
                                            );
                                        },
                                        function (error) {
                                            reject(error);
                                        }
                                    );
                                    break;
                            }
                        });
                    },

                    yearday_schedule: function (yearday) {
                        var calendar = this;

                        return $q(function (resolve, reject) {
                            if (calendar.relations.yearday_schedules[yearday]) { return resolve(calendar.relations.yearday_schedules[yearday]); }

                            switch (typeof calendar.yearday_schedules[yearday]) {
                                case "string":
                                    service.FindSchedule(calendar.yearday_schedules[yearday], DataService).then(
                                        function (schedule) {
                                            resolve(schedule);
                                        },
                                        function (error) {
                                            reject(error);
                                        }
                                    );

                                    break;
                                case "undefined":
                                    var schedule = service.Schedule.new();

                                    schedule.name = "Yearday Schedule for " + TimeService.YeardayString(yearday);
                                    schedule.owner_id = calendar.owner_id;

                                    schedule.save().then(
                                        function (schedule) {
                                            calendar.reload(DataService).then(
                                                function () { resolve(schedule); },
                                                function (error) { reject(error); }
                                            );
                                        },
                                        function (error) {
                                            reject(error);
                                        }
                                    );
                                    break;
                            }
                        });
                    },

                    save: function () {
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

                    load: function (payload) {
                        var calendar = this;
                        DataService.unmarshal(calendar, service.Calendar.TypeMap, payload);
                        return calendar;
                    },

                    reload: function () {
                        var calendar = this;

                        switch (typeof calendar.id) {
                            case "string":
                                return $q(function (resolve, reject) {
                                    DataService.kind(calendar.kind).find(calendar.id).then(
                                        function (response) {
                                            resolve(calendar.load(response.data.data[calendar.kind]));
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                });
                            case "undefined":
                                return $q(function (r) { r(calendar); });
                        }
                    },

                    toJSON: function () {
                        return DataService.marshal(this, service.Calendar.TypeMap);
                    }
                };
            }
        };
        //  --- }}}

        // --- New Schedule {{{
        service.Schedule = {
            TypeMap: {
                id: DataService.Types.String,
                created_at: DataService.Types.Date,
                updated_at: DataService.Types.Date,
                name: DataService.Types.String,
                start_time: DataService.Types.Date,
                end_time: DataService.Types.Date,
                owner_id: DataService.Types.String,
                fixtures_ids: DataService.Types.Array
            },

            new: function () {
                return {
                    kind: service.ScheduleKind,

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

                    fixtures: function () {
                        var schedule = this;

                        return $q(function (resolve, reject) {
                            if (schedule.relations.fixtures) { return resolve(schedule.relations.fixtures); }

                            $q.all(schedule.fixtures_ids.map(function (fixture_id) {
                                return DataService.kind(service.FixtureKind).find(fixture_id);
                            })).then(
                                function (responses) {
                                    resolve(responses.map(function (response) {
                                        return service.Fixture.new().load(response.data.data[service.FixtureKind]);
                                    }));
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    save: function () {
                        var schedule = this;

                        return $q(function (resolve, reject) {
                            DataService.kind(schedule.kind).save(schedule.toJSON()).then(
                                function (response) {
                                    resolve(schedule.load(response.data.data[schedule.kind]));
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    toJSON: function () {
                        return DataService.marshal(this, service.Schedule.TypeMap);
                    },

                    load: function (payload) {
                        DataService.unmarshal(this, service.Schedule.TypeMap, payload);
                        this.relations = {};
                        return this;
                    },

                    reload: function () {
                        var schedule = this;
                        return $q(function (resolve, reject) {
                            switch (typeof schedule.id) {
                                case "string":
                                    DataService.kind(schedule.kind).find(schedule.id).then(
                                        function (response) {
                                            resolve(schedule.load(response.data.data[schedule.kind]));
                                        },
                                        function (response) {
                                            reject(response.data.developer_message);
                                        }
                                    );
                                    break;
                                case "undefined":
                                    resolve(schedule);
                                    break;
                            }
                        });
                    }
                };
            }
        };
        // --- }}}

        // --- New Fixture {{{
        service.Fixture = {
            TypeMap: {
                id: DataService.Types.String,
                created_at: DataService.Types.Date,
                updated_at: DataService.Types.Date,
                name: DataService.Types.String,
                start_time: DataService.Types.Date,
                end_time: DataService.Types.Date,
                description: DataService.Types.String,
                rank: DataService.Types.Integer,
                label: DataService.Types.Boolean,
                expires: DataService.Types.Date,
                date_exceptions: DataService.Types.Array,
                owner_id: DataService.Types.String,
                schedule_id: DataService.Types.String
            },

            new: function () {
                return {
                    kind: service.FixtureKind,

                    id: undefined,
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
                    owner_id: undefined,
                    schedule_id: undefined,

                    save: function () {
                        var fixture = this;

                        return $q(function (resolve, reject) {
                            DataService.kind(fixture.kind).save(fixture.toJSON()).then(
                                function (response) {
                                    fixture.load(response.data.data[fixture.kind]);
                                    resolve(fixture);
                                },
                                function (response) {
                                    console.log(response);
                                    reject(response.data.data.developer_message);
                                }
                            );
                        });
                    },

                    load: function (payload) {
                        DataService.unmarshal(this, service.Fixture.TypeMap, payload);
                        this.relations = {};
                        return this;
                    },

                    toJSON: function () {
                        return DataService.marshal(this, service.Fixture.TypeMap);
                    }
                };
            }
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

                owner: function () {
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
            var schedule = service.Schedule.new();

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

    ModelsService.$inject = [ '$http', '$q', 'AccessService', 'DataService', 'HostService', 'TimeService' ];

    return ModelsService;
}());
