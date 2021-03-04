$(document).ready(function() {
  console.log("ready!");

  var menuController = window._context["MenuController"];
  menuController.perform();
  var searchController = window._context["SearchController"];
  searchController.perform();
  var locationUrl = location.hash.replace("#", "");
  if(typeof locationUrl !== 'undefined' && locationUrl.length > 0){
    menuController.performDocumentVisualization(locationUrl);
  }  
});
