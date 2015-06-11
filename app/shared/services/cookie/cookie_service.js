module.exports = (function() {
    'use strict';

    // --- Set Cookie  {{{

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();

        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

        var expires = "expires=" + d.toUTCString();

        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    // --- }}}

    // --- Get Cookie {{{

    function getCookie(cname) {
        var name = cname + "=", ca = document.cookie.split(';'), i;

        for (i = 0; i < ca.length; i += 1) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return "";
    }

    // ---}}}

    // --- Delete Cookie {{{

    function del(cname) {
        setCookie(cname, "", -1);
    }

    // --- }}}

    var CookieService = function() {
        this.setCookie = setCookie;
        this.getCookie = getCookie;
        this.delCookie = delCookie;

        this.rememember = function(key, value) {
            this.setCookie(key, value, 1);
        };

        this.forget = function(key) {
            this.delCookie(key);
        };
    };

    CookieService.$inject = [ ];

    return CookieService;
}());
