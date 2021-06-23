//https://stackoverflow.com/questions/4163122/http-basic-authentication-log-out
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var finder = require('find-package-json');
var bodyParser = require('body-parser');
var rateLimit = require("express-rate-limit");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');

@Entrypoint(name = "server")
function Server() {

  @Autowire(name = "options")
  this.options;

  @Autowire(name = "securityMemoryProvider")
  this.securityMemoryProvider;

  this.port = process.env.PORT || 2708;
  this.baseDirectory;
  this.expressInstance = express();

  this.init = () => {

    this.setAppBaseDirectory();

    var staticAssets = new serveStatic(this.baseDirectory + "/src/main/web", {
      'index': ['default.html', 'default.htm']
    })

    // set the view engine to ejs
    this.expressInstance.set('view engine', 'ejs');
    this.expressInstance.set('views', this.baseDirectory + "/src/main/web");
    // use .html instead .ejs
    this.expressInstance.engine('html', require('ejs').renderFile);

    this.expressInstance.use(cookieParser())

    this.expressInstance.use(session({
      secret: uuid.v4(),
      resave: true,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: (45 * 60 * 1000)
      }
    }));

    this.expressInstance.use(bodyParser.urlencoded({ extended: false }))
    this.expressInstance.use(bodyParser.json());

    if (process.env.ENABLE_BFA_PROTECTION == "true") {
      const limiter = rateLimit({
        windowMs: process.env.BFA_WINDOW_MS_MINUTES * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
        max: process.env.BFA_MAX_CONN || 50 // limit each IP to 50 requests per windowMs
      });
      //  apply to all requests
      this.expressInstance.use(limiter);
    }

    this.expressInstance.post('/login', (req, res, next) => {
      if(typeof req.body['initial_url'] !== 'undefined'){
        req.session['initial_url'] = req.body['initial_url'].substring(req.body['initial_url'].indexOf("#")+1);
      }

      if (typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
        req.session['login.message'] = "User or password incorrect";
        res.redirect("/login");
      }

      let storedUser = this.securityMemoryProvider.findUser(req.body.username);
      if (typeof storedUser === 'undefined' || req.body.password !== storedUser.password) {
        req.session['login.message'] = "User or password incorrect";
        res.redirect("/login");
      } else {
        req.session['login_user'] = storedUser;
        res.redirect("/");
      }
    });

    this.expressInstance.get('/login', (req, res, next) => {
      var login_message = req.session['login.message'] || "";
      var html = `
      <body onload="document.getElementById('initial_url').value = document.location.href" >
          <center> <h1> Docs4All Login </h1> </center>
          <form action="/login" method="post" >
              <div class="container" style="text-align: center;">
                  <input id="initial_url" name="initial_url" type="hidden">
                  <label>Username : </label>
                  <input type="text" placeholder="Enter Username" name="username" required>
                  <label>Password : </label>
                  <input type="password" placeholder="Enter Password" name="password" required>
                  <button type="submit">Login</button>
              </div>
          </form>
          <div style="text-align: center;"  >
            <p1>${login_message}</p1>
          </div>
      </body>
      `;
      res.type("text/html")
      res.send(html);
    });

    this.expressInstance.get('/logout', (req, res, next) => {
      var html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Logout</title>
          <script>
            setTimeout(function() {
              window.location.href = "http://aaa:aa@localhost:2708";
            }, 3000);
          </script>
        </head>
        <body>
          <p>Logout</p>
        </body>
      </html>
      `;
      res.type("text/html")
      res.send(html);
    });

    /*Optional security*/
    if (process.env.DOCS4ALL_ENABLE_SECURITY == "true") {
      let users = this.securityMemoryProvider.getUsersForBasicAuth();
      const auth = require('basic-auth')
      this.expressInstance.use((req, res, next) => {

        if(req.url === "/login"){
          return next();
        }

        if(typeof req.session['login_user'] === 'undefined'){
          return res.redirect("/login");
        }

        next();

        // let incomingUser = auth(req)
        // console.log("Incoming user: "+JSON.stringify(incomingUser));
        // if (typeof incomingUser === 'undefined') {
        //   res.statusCode = 401
        //   req.session['login_user'] = undefined;
        //   res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
        //   res.end('Unauthorized')
        //   return;
        // }
        //
        // let storedUser = this.securityMemoryProvider.findUser(incomingUser['name']);
        // if (typeof incomingUser === 'undefined' ||typeof storedUser === 'undefined' || incomingUser['pass'] !== storedUser.password) {
        //   req.session['login_user'] = undefined;
        //   res.statusCode = 401
        //   res.setHeader('WWW-Authenticate', 'Basic realm="Node"')
        //   res.end('Unauthorized')
        // } else {
        //   req.session['login_user'] = incomingUser['name'];
        //   next()
        // }
      })
    }


    this.expressInstance.get('*', (req, res, next) => {

      if (req.url === "/") {
        // render home page
        if(typeof req.session['initial_url'] !== 'undefined'){
          res.setHeader("x-initial",req.session['initial_url'])
        }
        res.render('index.html', this.options.design);
      } else {
        return staticAssets(req, res, next);
      }

    });

    this.expressInstance.listen(this.port, () => {
      console.log('Docs4All is running on port: ' + this.port);
    });

  };

  this.getExpressInstance = () => {
    return this.expressInstance;
  };

  this.setAppBaseDirectory = () => {
    var f = finder(__dirname);
    this.baseDirectory = path.dirname(f.next().filename);
  };

  this.getAppBaseDirectory = () => {
    return this.baseDirectory;
  };

}

module.exports = Server
