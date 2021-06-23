@Module(name = "apiRouter")

function ApiRouter() {

  @Autowire(name = "server")
  this.server;

  @Autowire(name = "memoryDatasource")
  this.memoryDatasource;

  @Autowire(name = "securityMemoryProvider")
  this.securityMemoryProvider;

  @Autowire(name = "options")
  this.options;

  this.init = () => {

    this.memoryDatasource.setDocumentsBaseDir(this.options.documentsLocation);
    this.memoryDatasource.loadDocuments(this.memoryDatasource.getDocumentsBaseDir());
    this.server.getExpressInstance().get('/api/document', this.ensurePermissions, this.findDocument);
    this.server.getExpressInstance().post('/api/document/path', this.ensurePermissions, this.findDocumentByPath);
    this.server.getExpressInstance().post('/api/document/content', this.ensurePermissions, this.findDocumentByContent);
  };

  this.findDocument = (req, res) => {

    var filter = ["meta", "$loki", "content"];
    var role = req.session['login_user'].role;
    var paths = this.securityMemoryProvider.findPathsByRole(role);
    var data;
    try {
      if (role === "all") {
        data = this.memoryDatasource.findAll(filter);
      } else {
        data = this.memoryDatasource.findByPaths(filter, paths);
      }
      res.json({
        "code": 200000,
        "message": "success",
        "content": data
      })
    } catch (e) {
      console.log(e);
      res.json({
        "error": e
      })
    }
  };

  this.findDocumentByPath = (req, res) => {
    var filter = ["meta", "$loki"];
    var role = req.session['login_user'].role;
    var paths = this.securityMemoryProvider.findPathsByRole(role);
    var data;
    var query = [
      {
        "path": req.body.path
      }
    ]
    try {
      if (role === "all") {
        data = this.memoryDatasource.findDocumentByAndRestrictions(query, filter);
      } else {
        if(paths.includes(req.body.path)){
          data = this.memoryDatasource.findDocumentByAndRestrictions(query, filter);
        }else{
          return res.json({
            "code": 403003,
            "message": "You don't have access to this document."
          });
        }
      }
      return res.json({
        "code": 200000,
        "message": "success",
        "content": data
      })
    } catch (e) {
      console.log(e);
      res.json({
        "error": e
      })
    }
  };

  this.findDocumentByContent = (req, res) => {
    var filter = ["meta", "$loki"];
    var role = req.session['login_user'].role;
    var paths = this.securityMemoryProvider.findPathsByRole(role);
    var query = [
      {
        "content": {
          "$regex": [req.body.text,"i"]
        }
      }
    ];
    var data;
    try {
      var allData = this.memoryDatasource.findDocumentByAndRestrictions(query, filter);
      if (role === "all") {
        data = allData;
      } else {
        var allowedDocuments = [];
        for(documentFound of allData){
          let doc = Object.assign({}, documentFound);
          if(paths.includes(doc.path)){
            allowedDocuments.push(doc);
          }
        }
        data = allowedDocuments;
      }
      return res.json({
        "code": 200000,
        "message": "success",
        "content": data
      })
    } catch (e) {
      console.log(e);
      res.json({
        "error": e
      })
    }
  };

  this.ensurePermissions = (req, res, next) => {
    if (typeof process.env.DOCS4ALL_ENABLE_SECURITY === 'undefined' || process.env.DOCS4ALL_ENABLE_SECURITY === false) {
      return next();
    }
    if (typeof req.session['login_user'] === 'undefined') {
      return res.json({
        "code": 403000,
        "message": "You don't have permission to access."
      })
    }
    var role = req.session['login_user'].role;
    if (typeof req.session['login_user'].role === 'undefined') {
      return res.json({
        "code": 403001,
        "message": "You don't have permission to access."
      })
    }
    if (req.session['login_user'].role === 'all') {
      return next();
    }
    var paths = this.securityMemoryProvider.findPathsByRole(role);
    if (typeof paths === 'undefined' || paths.length == 0) {
      return res.json({
        "code": 403002,
        "message": "You don't have permission to access."
      })
    }
    return next();
  };



}

module.exports = ApiRouter
