var chai = require('chai');
var path = require('path');
var expect = chai.expect;
var assert = chai.assert;
const MemoryDatasource = require("datasource/default/MemoryDatasource.js");
const SetupTest = require("SetupTest.js");
var finder = require('find-package-json');
var f = finder(__dirname);
var rootDirectory = path.dirname(f.next().filename);

var testDocumentsPath = `${rootDirectory}/src/test/datasource/default/docs_for_test`;

describe('datasource/default/MemoryDatasource.js', function() {
  it('loadDocuments', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var loadedResources = memoryDatasource.getDocuments();
    // console.log(JSON.stringify(loadedResources, null, 4));
    //29 resources
    expect(loadedResources.data.length).to.equal(30);

    //must exist /about resource
    var aboutResource = memoryDatasource.getDocuments().find({'path': "/about"});

    // /about/contributing.md is child of /about

    // get /about parent
    var parent = aboutResource[0];
    expect(parent.path).to.equal("/about");
    expect(parent.type).to.equal("node");

    // get /about/contributing.md child
    var aboutContributingResource = memoryDatasource.getDocuments().find({'path': "/about/contributing.md"});
    var child1 = aboutContributingResource[0];
    expect(child1.path).to.equal("/about/contributing.md");
    expect(child1.type).to.equal("child");
    //must be child of about
    expect(child1.parent).to.equal(parent.id);

    //another third level child asseert
    var install = memoryDatasource.getDocuments().find({'path': "/install"});
    expect(install.length).to.equal(1);
    var installRaneto = memoryDatasource.getDocuments().find({'path': "/install/raneto"});
    expect(installRaneto.length).to.equal(1);
    var installRanetoInstallingRaneto = memoryDatasource.getDocuments().find({'path': "/install/raneto/installing-raneto.md"});
    expect(installRanetoInstallingRaneto.length).to.equal(1);

    expect(installRaneto[0].parent, "/install/raneto must be child of /install").to.equal(install[0].id);
    expect(installRanetoInstallingRaneto[0].parent, "/install/raneto/installing-raneto.md must be child of /install/raneto").to.equal(installRaneto[0].id);

  });

  it('findAll with filterColumns', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findAll(filter);
    expect(loadedResources.length).to.equal(30);
    expect(loadedResources[0].meta).to.equal(undefined);
    expect(loadedResources[0]['$loki']).to.equal(undefined);
    expect(loadedResources[0].content).to.equal(undefined);
  });

  it('getTreeMenuByAudienceTargetType', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    // console.log(JSON.stringify(memoryDatasource.getDocuments().data, null, 4));
    var treeMenu = memoryDatasource.getTreeMenuByAudienceTargetType("user")
    // console.log(JSON.stringify(treeMenu, null, 4));
    //assert parent nodes
    assert(treeMenu["/about"]);
    assert(treeMenu["/install"]);
    assert(treeMenu["/tutorials"]);

    //assert about children
    var aboutChildren = treeMenu["/about"].children;
    expect(Object.keys(aboutChildren).length).to.equal(4);
    expect(aboutChildren["/about/contributing.md"].parent).to.equal(treeMenu["/about"].id);

    //assert install children
    var installChildren = treeMenu["/install"].children;
    expect(Object.keys(installChildren).length).to.equal(3);
    expect(installChildren["/install/production-notes.md"].parent).to.equal(treeMenu["/install"].id);
    expect(installChildren["/install/raneto"].parent).to.equal(treeMenu["/install"].id);
    //third level children
    var thirdLevelChild = installChildren["/install/raneto"].children
    expect(Object.keys(thirdLevelChild).length).to.equal(1);
    expect(thirdLevelChild["/install/raneto/installing-raneto.md"].parent).to.equal(installChildren["/install/raneto"].id);

    //assert tutorials children
    var tutorialsChildren = treeMenu["/tutorials"].children;
    expect(Object.keys(tutorialsChildren).length).to.equal(3);

  });

  it('searchByContent', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());

    var oneResult = memoryDatasource.searchByContent("user", "google")
    expect(oneResult.length).to.equal(1);
    expect(oneResult[0].path).to.equal("/tutorials/google-oauth-setup.md");
    expect(oneResult[0].name).to.equal("google-oauth-setup.md");

    var severalResults = memoryDatasource.searchByContent("user", "install")
    expect(severalResults.length).to.equal(6);
    // console.log(JSON.stringify(severalResults, null, 4));
  });

  it('findByPaths path does not exist', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findByPaths(filter, ["/foo/bar"]);
    console.log(JSON.stringify(loadedResources, null, 4));
    expect(loadedResources.length).to.equal(0);
  });

  it('findByPaths one path - 2 levels', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findByPaths(filter, ["/about/related-projects.md"]);
    console.log(JSON.stringify(loadedResources, null, 4));
    expect(loadedResources.length).to.equal(2);
  });

  it('findByPaths one path - 3 levels', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findByPaths(filter, ["/install/raneto/installing-raneto.md"]);
    console.log(JSON.stringify(loadedResources, null, 4));
    expect(loadedResources.length).to.equal(3);
  });

  it('findByPaths 2 paths - several levels', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findByPaths(filter, ["/install/raneto/installing-raneto.md", "/usage/sorting.md"]);
    console.log(JSON.stringify(loadedResources, null, 4));
    expect(loadedResources.length).to.equal(5);
  });

  it('findByPaths one path - no-child', function() {
    var memoryDatasource = new MemoryDatasource();
    memoryDatasource.setDocumentsBaseDir(testDocumentsPath);
    assert(memoryDatasource);
    memoryDatasource.loadDocuments(memoryDatasource.getDocumentsBaseDir());
    var filter = ["meta","$loki","content"];
    var loadedResources = memoryDatasource.findByPaths(filter, ["/no_child"]);
    console.log(JSON.stringify(loadedResources, null, 4));
    expect(loadedResources.length).to.equal(1);
  });

});
