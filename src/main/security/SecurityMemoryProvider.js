require('nodejs-require-enhancer');
const EnvironmentHelper = require("common/EnvironmentHelper.js");

@Module(name="securityMemoryProvider")
function SecurityMemoryProvider() {

  @Autowire(name="environmentHelper")
  this.environmentHelper;

  this.users;
  this.rolePaths;

  this.loadSecurityMatrix = () => {
    var configUsers = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };
    var configPaths = {
      "outputType":"array",
      "splitChar":","
    };
    this.users = this.environmentHelper.findByPrefix("DOCS4ALL_USER_", configUsers);
    this.rolePaths = this.environmentHelper.findByPrefix("DOCS4ALL_ROLE_", configPaths);
    console.log(this.users);
    console.log(this.rolePaths);
  };

  this.getUsersForBasicAuth = () => {
    if(typeof this.users === 'undefined'){
      this.loadSecurityMatrix();
    }
    let basicAuthData = {};
    for(userName in this.users){
      basicAuthData[userName] = this.users[userName].password;
    }
    return basicAuthData;
  };

  this.findUser = (username) => {
    if(typeof this.users === 'undefined'){
      this.loadSecurityMatrix();
    }
    return this.users[username];
  };

  this.findPathsByRole = (role) => {
    if(typeof this.rolePaths === 'undefined'){
      this.loadSecurityMatrix();
    }
    return this.rolePaths[role];
  };
}

module.exports = SecurityMemoryProvider;
