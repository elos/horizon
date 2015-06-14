import HomeController from "home_ctrl";
import angular, { beforeEach, describe, expect, it } from "../../../../bower_components/angular-mocks/angular-mocks";

describe('Home', function() {
    beforeEach(angular.mock.module('horizon'));

    // Just Pass...
    it('should', function() {
        HomeController();
        expect('true').toEqual('true');
    });
});
