require('nodejs-require-enhancer');
const EnvironmentHelper = require("common/EnvironmentHelper.js");

@Module(name="securityMemoryProvider")
function SecurityMemoryProvider() {

  @Autowire(name="environmentHelper")
  this.environmentHelper;

  this.users;

  this.loadUsers = () => {
    var config = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };
    this.users = this.environmentHelper.findByPrefix("DOCS4ALL_USER_", config);
  };

  this.getUsersForBasicAuth = () => {
    if(typeof this.users === 'undefined'){
      this.loadUsers();
    }
    let basicAuthData = {};
    for(userName in this.users){
      basicAuthData[userName] = this.users[userName].password;
    }
    return basicAuthData;
  };

  this.findUser = (username) => {
    if(typeof this.users === 'undefined'){
      this.loadUsers();
    }
    return this.users[username];
  };



}

module.exports = SecurityMemoryProvider;
