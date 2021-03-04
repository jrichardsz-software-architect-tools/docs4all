var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var finder = require('find-package-json');
var bodyParser = require('body-parser');

@Entrypoint(name = "server")

function Server() {

  @Autowire(name = "options")
  this.options;

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

    this.expressInstance.use(bodyParser.json());

    /*Optional security*/
    if (process.env.ENABLE_SECURITY == "true") {

      const basicAuth = require('express-basic-auth');
      var userName = process.env.AUTH_USER;
      var users = {};
      users[userName] = process.env.AUTH_PASSWORD;
      this.expressInstance.use(basicAuth({
        users: users,
        challenge: true
      }))
    }

    this.expressInstance.get('*', (req, res, next) => {

      if (req.url === "/") {
        // render home page
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
