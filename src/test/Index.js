require('nodejs-require-enhancer');// require enhancement
var meta = require('meta-js');
require('meta-js').NodeInternalModulesHook._compile(); //comment annotations

//load tests
require('datasource/default/MemoryDatasourceTest.js');
