'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('JA-Tennis', function() {

  beforeEach(function() {
    browser().navigateTo('../../app/index.html');
  });


  it('should automatically redirect to /players when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/players");
  });


  describe('players', function() {

    beforeEach(function() {
      browser().navigateTo('#/players');
    });


    it('should render players when user navigates to /players', function() {
      expect(element('[ng-view] p:first').text()).
        toMatch(/partial for players/);
    });

  });


  describe('player', function() {

    beforeEach(function() {
      browser().navigateTo('#/player');
    });


    it('should render player when user navigates to /player', function() {
      expect(element('[ng-view] p:first').text()).
        toMatch(/partial for player/);
    });

  });
});
