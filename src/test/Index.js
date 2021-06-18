// require('nodejs-require-enhancer');// require enhancement
var meta = require('meta-js');
const NodeInternalModulesHook = require('meta-js').NodeInternalModulesHook;
NodeInternalModulesHook._compile(); //comment annotations

//load tests
require('datasource/default/MemoryDatasourceTest.js');
