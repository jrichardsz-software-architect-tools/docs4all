var chai = require('chai');
var path = require('path');
var expect = chai.expect;
var assert = chai.assert;
require("SetupTest.js");
const EnvironmentHelper = require("common/EnvironmentHelper.js");
var environmentHelper = new EnvironmentHelper();

describe('common/EnvironmentSource.js \tfindByPrefix()', function() {
  it('read vars without config', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var data = environmentHelper.findByPrefix("USER_");
    assert(data);
    console.log(JSON.stringify(data, null, 4));
    expect(data.jane).to.equal("pass1 , all");
    expect(data['kurt']).to.equal("pass2 , role1");
  });
  it('read vars with wrong config', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    try{
      environmentHelper.findByPrefix("USER_", {"foo":"bar"});
    }catch(err){
      assert(err);
      expect(err.message).to.equal("outputType is required if config is used");
    }
  });
  it('read vars as object', function() {
    process.env['USER_jane'] = "pass1 , all";
    process.env['USER_kurt'] = "pass2 , role1";
    var config = {
      "outputType":"object",
      "splitChar":",",
      "indexNames":{
        "0":"password",
        "1":"role"
      }
    };
    var data = environmentHelper.findByPrefix("USER_", config);
    assert(data);
    console.log(JSON.stringify(data, null, 4));
    expect(data.jane.password).to.equal("pass1");
    expect(data.jane.role).to.equal("all");
    expect(data.kurt.password).to.equal("pass2");
    expect(data.kurt.role).to.equal("role1");
  });
  it('read vars as object', function() {
    process.env['USER_jane'] = "item1, item2, item3";
    process.env['USER_kurt'] = "item4   , item5";
    var config = {
      "outputType":"array",
      "splitChar":","
    };
    var data = environmentHelper.findByPrefix("USER_", config);
    assert(data);
    console.log(JSON.stringify(data, null, 4));
    expect(data.jane.length).to.equal(3);
    expect(data.kurt.length).to.equal(2);
    expect(data.kurt[0]).to.equal("item4");
    expect(data.kurt[1]).to.equal("item5");
  });
});
