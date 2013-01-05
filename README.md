# Passport-CloudFoundry

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Cloud Foundry open PaaS](http://cloudfoundry.org/) using the OAuth 2.0 API.

## Installation

    $ npm install passport-cloudfoundry

## Usage

#### Configure Strategy

The CloudFoundry authentication strategy authenticates users using a CloudFoundry
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

-----

## An Example OAuth2 App

The example app is located in the [/examples](https://github.com/rajaraodv/passport-cloudfoundry/tree/master/examples/login) folder. But here are the details.

### Running the example app
* Git clone this repo to `passport-cloudfoundry` folder (note `npm install` won't download examples, docs etc).
* `cd passport-cloudfoundry/examples/login`
* `npm install`
* Open `login/app.js` and set `CF_CLIENT_ID`, `CF_CLIENT_SECRET` & `CF_CALLBACK_URL` 
  * You will get these info when you register your app (see below). 	

```

//Set Cloud Foundry app's clientID
var CF_CLIENT_ID = '--insert-cloudfoundry-client-id-here--';

//Set Cloud Foundry app's clientSecret
var CF_CLIENT_SECRET = '--insert-cloudfoundry-client-secret-here--';

// Note: You should have a app.get(..) for this callback to receive callback from Cloud Foundry
// For example: If your callback url is: https://myKoolapp.cloudfoundry.com/auth/cloudfoundry/callback
// then, you should have a HTTP GET endpoint like: app.get('/auth/cloudfoundry/callback', callback))
//
var CF_CALLBACK_URL = '--insert-cloudfoundry--url--/auth/cloudfoundry/callback';
```
* `node app.js` to run app on `localhost:3000` 
  * PS: You should run this app at a pre-registered location that you provided during registering your app. 
* Open up browser & open the app.

### Registering your app 
<OL>
    <li>Register your app at Cloud Foundry at: <a href="http://support.cloudfoundry.com/">http://support.cloudfoundry.com/</a></li>
    <li>Provide your app name. e.g. MyCoolApp</li>
    <li>Provide a app's server domain for callback. e.g. mycoolapp.cloudfoundry.com</li>
</OL>

### App Workflow
 Once the app is up and running, here is how it works:
 
 *** 1. You will see login page like below (Click on 'login with Cloud Foundry' link): ***
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page1.png" height="300px" width="450px" />
</p>

 *** 2. Your browser will be redirected to https://login.cloudfoundry.com/login: ***
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page2.png" height="300px" width="450px" />
</p>

 *** 3. Signin using your cloudfoundry.com account & you will see ***
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page3.png" height="300px" width="450px" />
</p>

 *** 4. If you Approve, browser will redirect you to your app w/ access_token & user info. And you will see: ***
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page4.png" height="300px" width="450px" />
</p>

------


## Tests

    $ npm install --dev
    $ make test



## Credits

  - [Raja Rao DV](http://github.com/rajaraodv)

## License

VMware