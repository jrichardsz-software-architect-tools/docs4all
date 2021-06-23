function HashFragmentController(){

  var apiClient = window._context["ApiClient"];
  var markdownConverter = window._context["MarkdownConverter"];

  this.perform = () => {
    window.onhashchange = this.locationHashChanged;
  };

  this.locationHashChanged = () => {
    console.log("new hash fragment:"+location.hash);
    var fragment = location.hash.replace("#", "");

    if(typeof fragment === 'undefined' || fragment===""){
      return;
    }
    //search document by path
    apiClient.findDocumentByPath('document', fragment)
    .then((response) =>{
      console.log(response);
      if(response.code != 200000){
        return;
      }
      var pages = response.content;

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
window._context["HashFragmentController"] =  new HashFragmentController();
