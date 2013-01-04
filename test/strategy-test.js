var vows = require('vows');
var assert = require('assert');
var util = require('util');
var CloudFoundryStrategy = require('passport-cloudfoundry/strategy');
var clientID = 'YOUR_CLIENT_ID';
var clientSecret = 'YOUR_CLIENT_SECRET';

vows.describe('CloudFoundryStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new CloudFoundryStrategy({
        clientID: clientID,
        clientSecret: clientSecret
      },
      function() {});
    },
    
    'should be named cloudfoundry': function (strategy) {
      assert.equal(strategy.name, 'cloudfoundry');
    }
  }
  
}).export(module);
