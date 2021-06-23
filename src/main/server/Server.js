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

  @Autowire(name = "securityServerConfigurer")
  this.securityServerConfigurer;

  this.port = process.env.PORT || 2708;
  this.baseDirectory;
  this.expressInstance = express();

  this.init = () => {

    this.validateRequiredOptions(this.options);
    console.log("options:");
    console.log(this.options);

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

    /*Optional security*/
    if (process.env.DOCS4ALL_ENABLE_SECURITY == "true") {
      this.securityServerConfigurer.start(this.expressInstance);
    }

    this.expressInstance.get('*', (req, res, next) => {
      if (req.url === "/") {
        // render home page
        if(typeof req.session['initial_url'] !== 'undefined'){
          res.setHeader("x-initial",req.session['initial_url'])
        }
        //TODO: Validate if options has the required variables
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

  this.validateRequiredOptions = (initialOptions) => {
    if(typeof initialOptions==='undefined'){
      throw new Error("At least documentsLocation config is required");
    }
    if(typeof initialOptions.documentsLocation==='undefined'){
      throw new Error("documentsLocation config is required");
    }

    if(typeof initialOptions.design==='undefined'){
      initialOptions.design = {
        "title":"Docs4All"
      };
    }
    if(typeof initialOptions.design.title==='undefined'){
      initialOptions.design.title = "Docs4All";
    }
  };

}

module.exports = Server
