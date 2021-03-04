const MetaJsContextHelper = require('meta-js').MetaJsContextHelper;
const NodeInternalModulesHook = require('meta-js').NodeInternalModulesHook;
NodeInternalModulesHook._compile();
const DependencyHelper = require('meta-js').DependencyHelper;

function Docs4All(){
  var headAnnotations = ["Entrypoint","Module"];
  var internalAnnotations = ["Autowire"];
  
  this.start = (opts) => {
    
    var dependencies = DependencyHelper.getDependecies(__dirname, [".js"], ["src/main/Index.js"],headAnnotations, internalAnnotations);
    console.log(JSON.stringify(dependencies, null,4 ));

    var instancedDependecies = {};

    var entrypointDependency = MetaJsContextHelper.getDependencyByAnnotationName("Entrypoint",dependencies);
    var entrypointDependencyRequire = require(entrypointDependency.meta.location);
    var entrypointDependencyInstance = new entrypointDependencyRequire();
    instancedDependecies[entrypointDependency.meta.arguments.name] = entrypointDependencyInstance;

    console.log("\nPerform instantation...");

    for(let dependency of dependencies){
      console.log("Detected dependency:"+dependency.meta.location);
      if(instancedDependecies[dependency.meta.arguments.name]){
        console.log("dependency is already instanced");
      }else{
        var functionRequire = require(dependency.meta.location);
        var functionInstance = new functionRequire();
        instancedDependecies[dependency.meta.arguments.name] = functionInstance;
      }  
    }
    
    //add custom modules to dependency context
    instancedDependecies["options"] = opts || {};

    console.log("\nPerform autowire injection...");
    for(let dependency of dependencies){
      var functionInstance = instancedDependecies[dependency.meta.arguments.name];
      console.log("Dependency:"+dependency.meta.arguments.name);
      
      if(Object.keys(dependency.variables).length > 0 && dependency.variables.constructor === Object){
        Object.keys(dependency.variables).forEach(function(variableToInject,index) {
          for(let annotation of dependency.variables[variableToInject]){
            if(annotation.name === 'Autowire'){
              console.log(`inject: ${variableToInject} with name ${annotation.arguments.name} which is ${instancedDependecies[annotation.arguments.name]}`);
              functionInstance[variableToInject] = instancedDependecies[annotation.arguments.name];
            }
          }  
        });    
      }
    }

    console.log("\nPerform modules init...");
    Object.keys(instancedDependecies).forEach(function(instanceKey,index) {
      if(typeof instancedDependecies[instanceKey].init === 'function'){
        instancedDependecies[instanceKey].init();          
      }
    }); 
  };
}  

module.exports = Docs4All
