@Module(name="securityServerConfigurer")
function SecurityServerConfigurer() {

  @Autowire(name = "options")
  this.options;

  @Autowire(name = "securityMemoryProvider")
  this.securityMemoryProvider;

  @Autowire(name = "server")
  this.server;

  this.start = () => {
    let users = this.securityMemoryProvider.getUsersForBasicAuth();
    const auth = require('basic-auth')
    this.server.getExpressInstance().use((req, res, next) => {
      if(req.url === "/login"){
        return next();
      }
      if(typeof req.session['login_user'] === 'undefined'){
        return res.redirect("/login");
      }
      next();
    })

    this.server.getExpressInstance().get('/login', this.showLogin);
    this.server.getExpressInstance().post('/login', this.performLogin);
    this.server.getExpressInstance().get('/logout', this.logout);
  };

  this.showLogin = (req, res, next) => {
    var login_message = req.session['login.message'] || "";
    var title = this.options.design.title;
    var html = `
    <body onload="document.getElementById('initial_url').value = document.location.href" >
        <center> <h1> ${title} Login </h1> </center>
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
  };

  this.performLogin = (req, res, next) => {
    if(typeof req.body['initial_url'] !== 'undefined'){
      if(req.body['initial_url'].indexOf("#")>=0){
        req.session['initial_url'] = req.body['initial_url'].substring(req.body['initial_url'].indexOf("#")+1);
      }
    }

    if (typeof req.body.username === 'undefined' || typeof req.body.password === 'undefined') {
      req.session['login.message'] = "User or password incorrect";
      return res.redirect("/login");
    }

    let storedUser = this.securityMemoryProvider.findUser(req.body.username);

    if (typeof storedUser === 'undefined') {
      req.session['login.message'] = "User or password incorrect";
      return res.redirect("/login");
    }

    let rolePaths  = this.securityMemoryProvider.findPathsByRole(storedUser.role);
    if (typeof storedUser === 'undefined' || req.body.password !== storedUser.password) {
      req.session['login.message'] = "User or password incorrect";
      res.redirect("/login");
    }else if(storedUser.role !== "all" && (typeof rolePaths === 'undefined' || rolePaths.length == 0)){
      req.session['login.message'] = `code: 403002 message: You don't have permission to access.`;
      res.redirect("/login");
    }else {
      //user, password and roles are validated!!
      req.session['login_user'] = storedUser;
      res.redirect("/");
    }
  };

  this.logout = (req, res, next) => {
    req.session.destroy();
    res.redirect("/");
  };

}

module.exports = SecurityServerConfigurer;
