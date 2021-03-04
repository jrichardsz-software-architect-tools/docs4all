const fs = require('fs');
const loki = require('lokijs');

@Module(name="memoryDatasource")
function MemoryDatasource() {

  this.documentsBaseDir;
  var excludeRootDirInPath = true;
  var sequence = 0;
  this.database = new loki('database.json');
  this.documents = this.database.addCollection('documents');

  this.getDocuments = () => {
    return this.database.getCollection('documents');
  };  
  
  this.setDocumentsBaseDir = (documentsBaseDir) => {
    return this.documentsBaseDir = documentsBaseDir;
  };  
  
  this.getDocumentsBaseDir = () => {
    return this.documentsBaseDir;
  };  

  this.loadDocuments = (dir, parent) => {

    if (dir[dir.length - 1] != '/') dir = dir.concat('/')

    var fs = fs || require('fs'),
      files = fs.readdirSync(dir);    
    files.forEach((file) => {
      if (fs.statSync(dir + file).isDirectory()) {
        let id = this.next();
        let meta = this.getMetaForDirectoryIfExist(dir + file);
        this.getDocuments().insert({
          ...{
            "path": this.getFixedPath(this.getDocumentsBaseDir(), dir + file),
            "id": id,
            "parent": parent,
            "name": file,
            "content": this.getMarkdownContentIfExist(dir + file+"/_index.md"),
            "type": "node"
          },
          ...meta
        });
        this.loadDocuments(dir + file + '/', id);
      } else {

        if (file != "_index.md" && file.endsWith(".md")) {
          let id = this.next();
          let meta = this.getMetaForMarkdownIfExist(dir + file);
          this.getDocuments().insert({
            ...{
              "path": this.getFixedPath(this.getDocumentsBaseDir(), dir + file),
              "id": id,
              "parent": parent,
              "type": "child",
              "content": this.getMarkdownContentIfExist(dir + file),
              "name": file,
            },
            ...meta
          });
        }

      }
    });
  };  
  
  //todo: delete meta and skip content
  this.findAll = () => {
    var resources = this.getDocuments();
    return resources.chain().data({ removeMeta: true });
      
    // var docArray = resources.chain().find({}).map(
    //     function(doc) {
    //         // ...
    //         return doc
    //     })
    //     .data();    
    // 
    // return docArray;
  }
  
  this.findByAudienceTarget = (targetAudience) => {
    var resources = this.getDocuments();
    var results = resources.find({
      $and: [{
        'targetAudience': targetAudience
      }]
    });

    return results;
  }
  
  this.findDocumentByAndRestrictions = (queryCollection) => {
    var resources = this.getDocuments();
    var results = resources.find({
      $and: queryCollection
    });

    return results;
  }
  
  this.getTreeMenuByAudienceTargetType = (audienceTargetType) => {
    var resources = this.getDocuments();
    var results = resources.find({
      $and: [{
        'targetAudience': audienceTargetType
      }]
    });

    var treeMenu = {};
    results.forEach((menuItem) => {
      this.createInnerMenuFromSimplePaths(menuItem.path, treeMenu, null, resources);
    });    
    return treeMenu;
  }
  
  this.searchByContent = (audienceTargetType, contentPart) => {
    var resources = this.getDocuments();
    var results = resources.find({
      $and: [{
          'targetAudience': audienceTargetType
        },
        {
          'content': {
            '$contains': contentPart
          }
        }
      ]
    });
    
    var foundResources = [];
    results.forEach(function(foundResource){
      let modifiedResource = {...foundResource}
      delete modifiedResource.meta
      delete modifiedResource.$loki
      delete modifiedResource.content 
      foundResources.push(modifiedResource);
    });
    
    return foundResources;
  }  
  

  this.getFixedPath = (baseDir, absolutePath) => {
    return (excludeRootDirInPath === true) ? absolutePath.replace(baseDir, "") : absolutePath
  }

  this.getMarkdownContentIfExist = (absolutePath) => {
    try {
      if (fs.existsSync(absolutePath)) {
        var contents = fs.readFileSync(absolutePath, 'utf8');
        return contents.replace(/^<!--[\s\S]*?-->/g, "");
      }
    } catch (e) {
      console.log(`meta has an error :${file}, ${e}`);
      return;
    }     
  }

  this.getMetaForDirectoryIfExist = (file) => {
    try {
      if (fs.existsSync(file + "/meta.json")) {
        var contents = fs.readFileSync(file + "/meta.json", 'utf8');
        return JSON.parse(contents);
      }
    } catch (e) {
      console.log(`meta has an error :${file}, ${e}`);
      return;
    }    
  }
  
  this.getMetaForDirectoryIfExist = (file) => {
    try {
      if (fs.existsSync(file + "/meta.json")) {
        var contents = fs.readFileSync(file + "/meta.json", 'utf8');
        return JSON.parse(contents);
      }
    } catch (e) {
      console.log(`meta has an error :${file}, ${e}`);
      return;
    }    
  }

  this.getMetaForMarkdownIfExist = (file) => {
    try {
      var contents = fs.readFileSync(file, 'utf8');
      const regex = /^<!--[\s\S]*?-->/g;
      var found = contents.match(regex);
      if (typeof found !== 'undefined' && found != null) {
        var jsonString = found[0].replace("<!--", "").replace("-->", "")
        return JSON.parse(jsonString);
      }
    } catch (e) {
      console.log(`meta has an error :${file}, ${e}`);
      return;
    }
  }

  this.next = () => {
    if (!sequence) {
      sequence = 0;
    }
    return sequence++;
  }

  this.createInnerMenuFromSimplePaths = (path, parentNode, parentPath, collection) => {

    var nodes = path.substring(1).split("/");
    var thisPath = this.getEntirePath(0, nodes);
    var absolutePath = (parentPath) ? parentPath + thisPath : thisPath
    if (typeof parentNode[absolutePath] === 'undefined') {
      var data = collection
        .find({
          'path': absolutePath
        });
        
      var resource = {...data[0]}  
      delete resource.path
      delete resource.meta
      delete resource.$loki
      delete resource.content 

      resource.children = {}
      parentNode[absolutePath] = resource;
    }
    var childPath = this.getNextPath(0, nodes);
    if (childPath.length > 0) {
      return this.createInnerMenuFromSimplePaths(childPath, parentNode[absolutePath].children, absolutePath, collection);
    } else {
      return parentNode;
    }
  }

  this.getEntirePath = (index, nodes) => {
    var entirePath = "";
    for (var a = 0; a < index + 1; a++) {
      entirePath += "/" + nodes[a];
    }
    return entirePath;
  }

  this.getNextPath = (index, nodes) => {
    var nextPath = "";
    for (var a = index + 1; a < nodes.length; a++) {
      nextPath += "/" + nodes[a];
    }
    return nextPath;
  }

}

module.exports = MemoryDatasource;
