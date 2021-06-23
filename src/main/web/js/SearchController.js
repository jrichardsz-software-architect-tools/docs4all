function SearchController(){

  var apiClient = window._context["ApiClient"];
  var markdownConverter = window._context["MarkdownConverter"];

  this.perform = () => {
    this.addActionListeners();
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
    apiClient.findDocumentByContent('document', val)
    .then((response) =>{

      console.log(response);
      if(response.code != 200000){
        return;
      }

      var documents = response.content;
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

}

if(typeof window._context === 'undefined'){
   window._context = {};
}
window._context["SearchController"] =  new SearchController();
