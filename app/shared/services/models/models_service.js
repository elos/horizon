module.exports = (function() {
    var newUser, newPerson, newSession, newCredential, newCalendar, ModelsService;

    newUser = function() {
        return {
            kind: 'user',

            id: '',
            created_at: new Date(),
            updated_at: new Date(),
            password: '',

            load: function(json) {
                this.id         = json.id || this.id;
                this.created_at = json.created_at || this.created_at;
                this.updated_at = json.deleted_at || this.updated_at;
                this.password   = json.password || this.password;
            }
        };
    };

    newPerson = function() {
        return {
            kind: 'person',

            id: '',
            created_at: new Date(),
            updated_at: new Date(),
            name: '',

            load: function(json) {
                this.id         = json.id || this.id;
                this.created_at = json.created_at || this.created_at;
                this.updated_at = json.deleted_at || this.updated_at;
                this.name       = json.name || this.name;
            }
        };
    };

    newSession = function() {
        return {
            id: '',
            created_at: new Date(),
            updated_at: new Date(),
            token: '',
            expires_after: 0,
            user_id: '',

            user: function(DataService) {
                if (this._user !== undefined) {
                    return this._user;
                }

                var user = newUser();

                DataService.kind(user.kind).find(this.user_id).then(
                    function(response) {
                        user.load(response.data.data[user.kind]);
                    },
                    function(response) {
                        throw response.data.developer_message;
                    }
                );

                this._user = user;
                return user;
            },

            load: function(json) {
                this.id            = json.id || this.id;
                this.created_at    = json.created_at || this.created_at;
                this.updated_at    = json.deleted_at || this.updated_at;
                this.token         = json.token || this.token;
                this.expires_after = json.expires_after || this.expires_after;
                this.user_id       = json.user_id || this.user_id;
            }
        };
    };

    newCredential = function() {};
    newCalendar = function() {};

    ModelsService = function() {
        this.kinds = [ 'person', 'session', 'credential', 'calendar' ];

        this.spaces = {
            'person': 'persons',
            'session': 'sessions',
            'credential': 'credentials',
            'calendar': 'calendars'
        };

        this.newPerson = newPerson;
        this.newSession = newSession;
        this.newCredential = newCredential;
        this.newCalendar = newCalendar;
    };

    ModelsService.$inject = [ ];

    return ModelsService;
}());
