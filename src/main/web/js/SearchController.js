function SearchController(){
  
  var apiClient = window._context["ApiClient"];
  var markdownConverter = window._context["MarkdownConverter"];  

  this.perform = () => {
    this.addActionListeners();
    window.onhashchange = locationHashChanged;
  };
  
  this.addActionListeners = () => {
    $("#search-input").on("input", this.onSearchAction);
  };
  
  this.onSearchAction = (e) => {
    var input = $("#search-input");
    var val = input.val();  
    if(val.length <3){
      $("#rigthPreview").html("");
      window.location.hash = "/";
      return;
    }
    var query = [
      {
        "content": {
          "$regex": [val,"i"]
        }
      }
    ]    
    apiClient.findDocumentByAndRestrictions('document', query)
    .then((documents) =>{ 
      
      if(typeof documents === 'undefined' || documents.length === 0){
        $("#rigthPreview").html("");
      }      
      
      $("#rigthPreview").html("");
      // window.location.hash = "/";
      // e.preventDefault();
      
      $("#rigthPreview").append('<ul id="searchResultContainer">');
      documents.forEach(function(document){
        $("#searchResultContainer").append(`<li><a href="#${document.path}"><span class="tab">${document.name}</span></a></li>`);
      });    
    });

  };
  
  function locationHashChanged() {
    var fragment = location.hash.replace("#", "");
    
    if(typeof fragment === 'undefined' || fragment===""){
      return;
    }
    
    
    var query = [
      {
        "path": fragment
      }
    ]    
    //search document by path
    apiClient.findDocumentByAndRestrictions('document', query)
    .then((pages) =>{ 
      
      if(typeof pages === 'undefined' || pages.length === 0 || typeof pages[0].content === 'undefined'){
        return;
      }   
      
      var html = markdownConverter.render(pages[0].content);
      //add table style
      html = html.replace(/<table>/g, '<table class="styled-table">');
      $("#rigthPreview").html(html);
    });    
  }      
  
}

if(typeof window._context === 'undefined'){
   window._context = {};
}
window._context["SearchController"] =  new SearchController();
