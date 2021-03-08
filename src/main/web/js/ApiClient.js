function ApiClient(){

  var apiBaseUrl = getLocationBasePath();

  this.find = (resource) => {
    //add sort param
    var url = `${apiBaseUrl}/api/${resource}`;
    return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          type: "GET",
          dataType: "JSON",
          success: function(data) {
            resolve(data);
          }
        });
    });
  };

  this.getTreeMenuByAudienceTargetType = () => {
    //add sort param
    var url = `${apiBaseUrl}/api/menu-tree`;
    url = addParam(url, "audienceTarget", "user");
    return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          type: "GET",
          dataType: "JSON",
          success: function(data) {
            resolve(data);
          }
        });
    });
  };

  this.findDocumentByAndRestrictions = (resource, query) => {
    //add sort param
    var url = `${apiBaseUrl}/api/${resource}/query/and`;
    return new Promise(function(resolve, reject) {
        $.ajax({
          url: url,
          type: "POST",
          data: JSON.stringify(query),
          contentType:"application/json; charset=utf-8",
          dataType: "JSON",
          success: function(data) {
            resolve(data);
          }
        });
    });
  };


  /**
  * Add a URL parameter
  * @param {string} url
  * @param {string} param the key to set
  * @param {string} value
  */
  function addParam(url, param, value) {
     param = encodeURIComponent(param);
     var a = document.createElement('a');
     param += (value ? "=" + encodeURIComponent(value) : "");
     a.href = url;
     a.search += (a.search ? "&" : "") + param;
     return a.href;
  }

  function getLocationBasePath() {

    if (typeof window === "undefined") {
      console.error("ReferenceError: window is not defined. Are you in frontend javascript layer?");
      return;
    }

    if (typeof window.location === "undefined") {
      console.error("ReferenceError: window.location is not defined. Are you in frontend javascript layer?");
      return;
    }

    if(window.location.port){
      return window.location.protocol+"//"+window.location.hostname+":"+window.location.port
    }else {
      return window.location.protocol+"//"+window.location.hostname
    }
  }

}

if(typeof window._context === 'undefined'){
   window._context = {};
}
window._context["ApiClient"] =  new ApiClient();
