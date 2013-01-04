# Passport-CloudFoundry

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Cloud Foundry open PaaS](http://cloudfoundry.org/) using the OAuth 2.0 API.

## Installation

    $ npm install passport-cloudfoundry

## Usage

#### Configure Strategy

The CloudFoundry authentication strategy authenticates users using an CloudFoundry
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

    passport.use(new CloudFoundryStrategy({
        clientID: CF_CLIENT_ID,
        clientSecret: CF_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/cloudfoundry/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ email: profile.user }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'cloudfoundry'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/cloudfoundry',
      passport.authenticate('cloudfoundry'),
      function(req, res){
        // The request will be redirected to CloudFoundry for authentication, so
        // this function will not be called.
      });

    app.get('/auth/cloudfoundry/callback',
      passport.authenticate('cloudfoundry', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/rajaraodv/passport-cloudfoundry/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test



## Credits

  - [Raja Rao DV](http://github.com/rajaraodv)

## License

VMware