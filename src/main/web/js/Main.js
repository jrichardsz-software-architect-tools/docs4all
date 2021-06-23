$(document).ready(function() {
  console.log("ready!");

  var menuController = window._context["MenuController"];
  menuController.perform();
  var searchController = window._context["SearchController"];
  searchController.perform();
  var hashFragmentController = window._context["HashFragmentController"];
  hashFragmentController.perform();

  var headers = getHttpHeaders();

  var initialUrl = headers['x-initial'] ? headers['x-initial'] : undefined;
  var locationUrl = location.hash ? location.hash.replace("#", "") : undefined;

  console.log("initialUrl:"+initialUrl);
  console.log("locationUrl:"+locationUrl);

  //after login, is user used a full url
  if(typeof locationUrl !== 'undefined' && locationUrl.length > 0){
    menuController.performDocumentVisualization(locationUrl);
  }

  //if user used a full url in login, go to path
  if(typeof initialUrl !== 'undefined' && initialUrl.length > 0){
    menuController.performDocumentVisualization(initialUrl);
    return;
  }

  //no document is loaded, just the menu

  function parseHttpHeaders(httpHeaders) {
      return httpHeaders.split("\n")
       .map(x=>x.split(/: */,2))
       .filter(x=>x[0])
       .reduce((ac, x)=>{ac[x[0]] = x[1];return ac;}, {});
  }

  /**
   * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
   * headers according to the format described here:
   * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
   * This method parses that string into a user-friendly key/value pair object.
   */
  function parseResponseHeaders(headerStr) {
    var headers = {};
    if (!headerStr) {
      return headers;
    }
    var headerPairs = headerStr.split('\u000d\u000a');
    for (var i = 0; i < headerPairs.length; i++) {
      var headerPair = headerPairs[i];
      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf('\u003a\u0020');
      if (index > 0) {
        var key = headerPair.substring(0, index).replace(/(\r\n|\n|\r)/gm, "");
        var val = headerPair.substring(index + 2).replace(/(\r\n|\n|\r)/gm, "");
        headers[key] = val;
      }
    }
    return headers;
  }

  function getHttpHeaders() {
    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    return parseResponseHeaders(req.getAllResponseHeaders());
  }

});
