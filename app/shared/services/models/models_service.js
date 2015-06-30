module.exports = (function() {
    'use strict';

    var ModelsService;

    ModelsService = function($http, $q, AccessService, DataService, HostService, TimeService) {
        var service = this;

        service.kinds = [ 'person', 'session', 'credential', 'calendar' ];

        service.UserKind = 'user';
        service.PersonKind = 'person';
        service.CalendarKind = 'calendar';

        // --- User {{{
        service.User = {
            TypeMap: {
                id: DataService.Type.ID,
                created_at: DataService.Type.Date,
                updated_at: DataService.Type.Date,
                password: DataService.Type.String,
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
                                    user.relations.person = service.Person().new().load(response.data.data[service.PersonKind]);
                                    resolve(user.relations.person);
                                },
                                function (response) {
                                    reject(response.data.developer_message);
                                }
                            );
                        });
                    },

                    load: function(DataService, payload) {
                        var user = this;
                        DataService.unmarshal(user, user.TypeMap, payload);
                        this.relations = {};
                        return user;
                    }
                };
            }
        };

        service.newUser = service.User.new;
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
        service.Calendar = {
            TypeMap: {
                id: DataService.Type.ID,
                created_at: DataService.Type.Date,
                updated_at: DataService.Type.Date,
                password: DataService.Type.String,
                person_id: DataService.Type.String,
                owner_id: DataService.Type.String,
                base_schedule_id: DataService.Type.String,
                weekday_schedules: DataService.Type.Map,
                yearday_schedules: DataService.Type.Map,
            },

            new: {
                kind: service.CalendarKind,

                id: '',
                created_at: new Date(),
                updated_at: new Date(),
                person_id: '',
                owner_id: '',
                base_schedule_id: '',
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

                    return $q(function (resolve, reject) {
                        if (calendar.relations.weekday_schedules[weekday]) { return resolve(calendar.relations.weekday_schedules[weekday]); }

                        switch(typeof calendar.weekday_schedules[weekday]) {
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

                        switch(typeof calendar.yearday_schedules[yearday]) {
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
                    DataService.unmarshal(calendar, calendar.TypeMap, payload);
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
                    return DataService.marshal(this, this.TypeMap);
                }
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

                            $q.all(schedule.fixture_ids.map(function (fixture_id) {
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
                        return DataService.marshal(this, this.TypeMap);
                    },

                    load: function (payload) {
                        return DataService.unmarshal(this, this.TypeMap, payload);
                    },

                    reload: function () {
                        var schedule = this;
                        return $q(function (resolve, reject) {
                            switch(typeof schedule.id) {
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
                schedule_id: '',

                save: function (DataService) {
                    var fixture = this;

                    return $q(function (resolve, reject) {
                        DataService.kind(fixture.kind).save(fixture.toJSON()).then(
                            function (response) {
                                fixture.load(response.data.data[fixture.kind]);
                                resolve(fixture);
                            },
                            function (response) {
                                console.log(response);
                                reject(response.data.developer_message);
                            }
                        );
                    });
                },

                load: function (json) {
                    var properties = [
                            'id', 'created_at', 'updated_at', 'name',
                            'start_time', 'end_time', 'description',
                            'rank', 'label', 'expires', 'date_exceptions',
                            'owner_id', 'schedule_id'
                        ],
                        fixture = this;

                    /*globals angular*/
                    angular.forEach(properties, function (property) {
                        if (property.indexOf('time') > 0 && json[property]) {
                            json[property] = new Date(json[property]);
                        }

                        fixture[property] = json[property] || fixture[property];
                    });
                },

                toJSON: function () {
                    var fixture = this;

                    return {
                        id: fixture.id,
                        created_at: fixture.created_at,
                        updated_at: fixture.updated_at,
                        name: fixture.name,
                        start_time: fixture.start_time,
                        end_time: fixture.end_time,
                        description: fixture.description,
                        rank: fixture.rank,
                        label: fixture.label,
                        expires: fixture.expires,
                        date_exceptions: fixture.date_exceptions,
                        owner_id: fixture.owner_id,
                        schedule_id: fixture.schedule_id
                    };
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
