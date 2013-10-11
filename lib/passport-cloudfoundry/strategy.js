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
 * Examples 1:
 *     var CloudFoundryStrategy = require('passport-cloudfoundry').Strategy;
 *     var cfStrategy = new CloudFoundryStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://myapp.cloudfoundry.com/auth/cloudfoundry/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       });
 *
 *     passport.use(cfStrategy);
 *
 *     Call cfStrategy.reset() to reset when user is logged out (along w/ req.logout()).

 *
 *   Examples 2 (w/ 'state' parameter):
 *     var CloudFoundryStrategy = require('passport-cloudfoundry').Strategy;
 *     var cfStrategy = new CloudFoundryStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://myapp.cloudfoundry.com/auth/cloudfoundry/callback',
 *         passReqToCallback: true //<-- pass this to get req from CF.com to callback
 *       },
 *       function(req, accessToken, refreshToken, profile, done) {
 *         //verify things like 'state' in req.query (be sure to set: passReqToCallback=true)
 *         if(req.query.state === 'stateValueIpreviouslySent') {
 *             User.findOrCreate(..., function (err, user) {
 *                done(err, user);
 *            });
 *         } else {
 *            done({error: 'state value didnt match.. CSRF?'});
 *         }
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       });
 *
 * @param {Object} options
 * @param {Function} verify  A callback function to which accessToken, refreshToken, profile, done are sent back
 * @api public
 */

function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://login.cloudfoundry.com/oauth/authorize';
    options.tokenURL = options.tokenURL || 'https://login.cloudfoundry.com/oauth/token';

    //Send clientID & clientSecret in 'Authorization' header
    var auth = 'Basic ' + new Buffer(options.clientID + ':' + options.clientSecret).toString('base64');
    options.customHeaders = {
        'Authorization':auth
    };

    //Store auth in a different variable so we can reset it back.
    this._origCustomHeader = {
        'Authorization':auth
    };

    OAuth2Strategy.call(this, options, verify);

    this.name = 'cloudfoundry';

    //Set AuthMethod as 'Bearer' (used w/ accessToken to perform actual resource actions)
    this._oauth2.setAuthMethod('Bearer');
    //Make sure that it is used when performing a userinfo request:
    this._oauth2.useAuthorizationHeaderforGET(true);

    //Set default userProfileURI (this is /info endpoint for cloudfoundry.COM)
    this._userProfileURI = 'https://uaa.cloudfoundry.com/userinfo';
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
Strategy.prototype.userProfile = function (accessToken, done) {
    this._oauth2.get(this._userProfileURI, accessToken, function (err, body, res) {
        if (err) {
            return done(err);
        }

        try {
            done(null, JSON.parse(body));
        } catch (e) {
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
Strategy.prototype.setUserProfileURI = function (userProfileURI) {
    this._userProfileURI = userProfileURI;
};

/**
 * Resets _customHeaders to original _customHeaders - This is a workaround because of a
 * bug https://github.com/jaredhanson/passport/issues/89 that causes
 * "logout current user & then relogin to fail"
 *
 * Call this 'cfStrategy.reset()' when you are logging off a user.
 */
Strategy.prototype.reset = function () {
    this._oauth2._customHeaders = {};
    this._oauth2._customHeaders['Authorization'] = this._origCustomHeader['Authorization'];
};

/**
 * Override authorizationParams function. In our case, we will check if this._stateParamCallback is
 * set. If so, we'll call that callback function to set {'state' : 'randomStateVal'}
 *
 * @param  {Object} options Hash of options
 * @return {Object}         {} or {'state' : 'randomStateValFrom__stateParamCallback'}
 */
Strategy.prototype.authorizationParams = function(options) {
    if(this._stateParamCallback) {
        return {'state': this._stateParamCallback()};
    }
  return {};
};

/*
 * Sets a callback function to generate 'state' param's random value.
 *
 * @param {callback} Set a callback function that returns a random string
 * @return null
 *
 * In the app set this callback to a function that returns a random string that'll be
 * used as 'state' param's value.
 *
 * ***************
 * For example:
 * ***************
 * var cfStrategy = new CloudFoundryStrategy(..., finalCallback);
 *
 * //set a callback to generate 'state' value.
 * cfStrategy.setStateParamCallBack(generateState);
 *
 *
 * Where.. 'generateState' generates new state and stores is somwhere
 * and returns that random value back.

 * // Temporarily store `state` ids
 * var states = {};

 * // Generates a random value to be used as 'state' param during authorization
 *    function generateStateParam() {
 *       var state = uuid.v4();
 *        states[state] = true;
 *        return state;
 *    }
 *
 * Finally, in your 'finalCallback',check if that state exists
 * if(req.query.state && states[req.query.state]) {
 *   done(null, user);
 *   //delete it from memory
 *   delete states[req.query.state];
 * } else {
 *   done({"error": 'state value didn't match. possible CSRF?'})
 * }
 *
 */
Strategy.prototype.setStateParamCallBack = function(callback) {
  this._stateParamCallback = callback;
};
/**
 * Expose `Strategy`.
 */
module.exports = Strategy;