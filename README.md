# Passport-CloudFoundry

[Passport](https://github.com/jaredhanson/passport) strategy for authenticating
with [Cloud Foundry open PaaS](http://cloudfoundry.org/) using the OAuth 2.0 API.

 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page3.png" height="400px" />
</p>

## Installation

    $ npm install passport-cloudfoundry

## Usage

#### Configure Strategy

The CloudFoundry authentication strategy authenticates users using a CloudFoundry
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.


```javascript

var cfStrategy = new CloudFoundryStrategy({
    clientID: CF_CLIENT_ID,
    clientSecret: CF_CLIENT_SECRET,
    callbackURL: CF_CALLBACK_URL
}, function(accessToken, refreshToken, profile, done) { //verify callback
    // asynchronous verification, for effect...
    process.nextTick(function() {

        // To keep the example simple, the user's CloudFoundry profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the CloudFoundry account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
    });
});

//****************************************
// Examples 2 (w/ 'state' parameter):
//****************************************

var CloudFoundryStrategy = require('passport-cloudfoundry').Strategy;
var cfStrategy = new CloudFoundryStrategy({
    clientID: '123-456-789',
    clientSecret: 'shhh-its-a-secret'
    callbackURL: 'https://myapp.cloudfoundry.com/auth/cloudfoundry/callback',
    passReqToCallback: true //<---- Pass this to get req (as 1st param)from CF.com to callback
  },
  function(req, accessToken, refreshToken, profile, done) {

    //Verify things like 'state' in req.query (be sure to set: passReqToCallback=true)
    if(req.query.state === 'stateValueIpreviouslySent') {
        User.findOrCreate(..., function (err, user) {
           done(err, user);
       });
    } else {
       done({error: 'state value didnt match.. possible CSRF?'});
    }
  });


 // Set a callback to generate 'state' value.
 cfStrategy.setStateParamCallBack(generateState);

 Where.. 'generateState' generates new state and stores is somwhere
 and returns that random value back.

 // Temporarily store `state` ids
 var states = {};

 // Generates a random value to be used as 'state' param during authorization
  function generateStateParam() {
    var state = uuid.v4();
    states[state] = true;
    return state;
  }

 // Finally, in your 'finalCallback',check if that state exists
 if(req.query.state && states[req.query.state]) {
   done(null, user);
   //delete it from memory
   delete states[req.query.state];
 } else {
   done({"error": 'state value didn't match. possible CSRF?'})
 }

 // Pass the strategy
 passport.use(cfStrategy);

```

#### Express middlewares
In Express apps, you need to add the below middlewares. Also make sure to add them after Express' session middleware

```javascript
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
```

#### Express routes

For passport to work, you need to add two routes.
1.   `app.get('/auth/cloudfoundry'… ` to start OAuth
2.   ` app.get('/auth/cloudfoundry/callback'…` to receive OAuth callback back from Cloud Foundry.
    * NOTE: This must match your callback url's path that you used to register the app.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript

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

      w/ 'state' parameter (& verify/match it in the main callback to ensure no CSRF)
      app.get('/auth/cloudfoundry',
      passport.authenticate('cloudfoundry', {state: 'generateSomeRandomStateString'}),
      function(req, res){
        // The request will be redirected to CloudFoundry for authentication, so
        // this function will not be called.
      });
```

#### Logging out
To logout, call `req.logout()` AND `cfStrategy.reset()` like below:

```javascript
app.get('/', function(req, res) {
    if(!req.user) {
        req.session.destroy();
        req.logout();
        cfStrategy.reset(); //required!

        return res.redirect('/login');
    }
    res.render('index', {
        user: req.user
    });
});
```



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

#### 1. You will see login page like below (Click on 'Login with Cloud Foundry' link): ####
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page1.png" height="400px" width="550px" />
</p>

####2. Your browser will be redirected to https://login.cloudfoundry.com/login (default auth url): ####
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page2.png" height="400px" width="550px" />
</p>

####3. If you Sign-in using your cloudfoundry.com account, you will see ####
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page3.png" height="400px" width="550px" />
</p>

#### 4. If you Approve, browser will redirect you to your app w/ access_token & user info. And you will see: ####
 <p align='center'>
<img src="https://github.com/rajaraodv/passport-cloudfoundry/raw/master/examples/login/pics/page4.png" height="400px" width="550px" />
</p>

------


## Tests

    $ npm install --dev
    $ make test



## Credits

  - [Raja Rao DV](http://github.com/rajaraodv)

## License
(MIT)
VMware

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.