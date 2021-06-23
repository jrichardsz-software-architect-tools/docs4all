$(document).ready(function() {
  console.log("ready!");

  var menuController = window._context["MenuController"];
  menuController.perform();
  var searchController = window._context["SearchController"];
  searchController.perform();

  var req = new XMLHttpRequest();
  req.open('GET', document.location, false);
  req.send(null);
  var headers = parseHttpHeaders(req.getAllResponseHeaders());

  var initialUrl = headers['x-initial'] ? headers['x-initial'].replace(/(\r\n|\n|\r)/gm, "") : undefined;
  console.log("initialUrl:"+initialUrl);
  var locationUrl = location.hash.replace("#", "");
  console.log("locationUrl:"+locationUrl);

  if(typeof initialUrl !== 'undefined' && initialUrl.length > 0){
    menuController.performDocumentVisualization(initialUrl);
    return;
  }

  if(typeof locationUrl !== 'undefined' && locationUrl.length > 0){
    menuController.performDocumentVisualization(locationUrl);
  }

  function parseHttpHeaders(httpHeaders) {
      return httpHeaders.split("\n")
       .map(x=>x.split(/: */,2))
       .filter(x=>x[0])
       .reduce((ac, x)=>{ac[x[0]] = x[1];return ac;}, {});
  }

});
