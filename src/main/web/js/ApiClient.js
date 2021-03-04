function ApiClient(){

  this.find = (resource) => {
    //add sort param
    var url = `http://localhost:2708/api/${resource}`;
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
    var url = `http://localhost:2708/api/menu-tree`;
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
    var url = `http://localhost:2708/api/${resource}/query/and`;
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
  var addParam = function(url, param, value) {
     param = encodeURIComponent(param);
     var a = document.createElement('a');
     param += (value ? "=" + encodeURIComponent(value) : ""); 
     a.href = url;
     a.search += (a.search ? "&" : "") + param;
     return a.href;
  }  

}

if(typeof window._context === 'undefined'){
   window._context = {};
}
window._context["ApiClient"] =  new ApiClient();
