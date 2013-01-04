/**
 * Module dependencies.
 */
var util = require('util'),
  OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Cloud Foundry authentication strategy authenticates requests by delegating to
 * Cloud Foundry using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Cloud Foundry application's client id
 *   - `clientSecret`  your Cloud Foundry application's client secret
 *   - `callbackURL`   URL to which Cloud Foundry will redirect the user after granting authorization
 *
 * Examples:
 *     var CloudFoundryStrategy = require('passport-cloudfoundry').Strategy;
 *
 *     passport.use(new CloudFoundryStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://myapp.cloudfoundry.com/auth/cloudfoundry/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify  A calback function to which accessToken, refreshToken, profile, done are sent back
 * @api public
 */

function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://login.cloudfoundry.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://login.cloudfoundry.com/oauth/token';

  //Send clientID & clientSecret in 'Authorization' header
  var auth = 'Basic ' + new Buffer(options.clientID + ':' + options.clientSecret).toString('base64');
  if(!options.customHeaders) {
    options.customHeaders = {};
  }
  options.customHeaders.Authorization = auth; //Set Authorization header

  OAuth2Strategy.call(this, options, verify);

  this.name = 'cloudfoundry';

  //Set AuthMethod as 'Bearer' (used w/ accessToken to perform actual resource actions)
  this._oauth2.setAuthMethod('Bearer');

  //Set default userProfileURI (this is /info endpoint for Cloud Foundry)
  this._userProfileURI = 'https://api.cloudfoundry.com/info';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Cloud Foundry.
 *
 * This function calls /info endpoint of Cloud Foundry and returns the result
 * as 'profile'
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURI, accessToken, function(err, body, res) {
    if(err) {
      return done(err);
    }

    try {
      done(null, JSON.parse(body));
    } catch(e) {
      done(e);
    }
  });
};

/**
 * Set user profile URI for a Cloud Foundry installation.
 * Default value: https://api.cloudfoundry.com/info
 *
 * @param {String} userProfileURI End-point to get user profile (/info in CF)
 */
Strategy.prototype.setUserProfileURI = function(userProfileURI) {
  this._userProfileURI = userProfileURI;
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;