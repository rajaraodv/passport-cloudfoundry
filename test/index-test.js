var vows = require('vows');
var assert = require('assert');
var util = require('util');
var cloudfoundry = require('passport-cloudfoundry');


vows.describe('passport-cloudfoundry').addBatch({

  'module': {
    'should report a version': function (x) {
      assert.isString(cloudfoundry.version);
    },
  },

}).export(module);
