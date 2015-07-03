module.exports = (function () {
    var ScheduleService;

    ScheduleService = function ($q, ModelsService, TimeService) {
        var service = this;

        // http://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
        function uniq(arr) {
            console.log(arr);
            return arr.reverse().filter(function (e, i, arr) {
                    return arr.indexOf(e, i + 1) === -1;
            }).reverse();
        }

        service.merge = function (s1, s2) {
            var merged = ModelsService.Schedule.new();
            merged.name = s1.name;
            merged.fixtures_ids = uniq(s1.fixtures_ids.concat(s2.fixtures_ids));
            return merged;
        };

        service.base = function () {
            return $q(function (resolve, reject) {
                ModelsService.session()
                    .then(function (session) { return session.owner(); })
                    .then(function (user) { return user.person(); })
                    .then(function (person) { return person.calendar(); })
                    .then(function (calendar) { return calendar.base_schedule(); })
                    .then(function (schedule) { resolve(schedule); })
                    .catch(function () { reject('Fuck'); });
            });
        };

        service.weekday = function (weekday) {
            return $q(function (resolve, reject) {
                ModelsService.session()
                    .then(function (session) { return session.owner(); })
                    .then(function (user) { return user.person(); })
                    .then(function (person) { return person.calendar(); })
                    .then(function (calendar) { return calendar.weekday_schedule(weekday); })
                    .then(function (schedule) { resolve(schedule); })
                    .catch(function () { reject('Fuck'); });
            });
        };

        service.yearday = function (yearday) {
            return $q(function (resolve, reject) {
                ModelsService.session()
                    .then(function (session) { return session.owner(); })
                    .then(function (user) { return user.person(); })
                    .then(function (person) { return person.calendar(); })
                    .then(function (calendar) { return calendar.yearday_schedule(yearday); })
                    .then(function (schedule) { resolve(schedule); })
                    .catch(function () { reject('Fuck'); });
            });
        };

        service.day = function(date) {
            return $q(function (resolve, reject) {
                $q.all([ service.base(),
                         service.weekday(TimeService.WeekdayFor(date)),
                         service.yearday(TimeService.YeardayFor(date)) ])
                  .then(
                      function (schedules) {
                          var merged = service.merge(service.merge(schedules[0], schedules[1]), schedules[2]);
                          merged.name = "Today";
                          resolve(merged);
                      }, reject
                  );
            });
        };

    };

    ScheduleService.$inject = [ '$q', 'ModelsService', 'TimeService' ];

    return ScheduleService;
}());
