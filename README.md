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

passport.use(cfStrategy); //pass the strategy

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

#### Logging out
To logout, call `req.logout()` AND `cfStrategy.reset()` like below:

```
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

####2. Your browser will be redirected to https://login.cloudfoundry.com/login: ####
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

VMware