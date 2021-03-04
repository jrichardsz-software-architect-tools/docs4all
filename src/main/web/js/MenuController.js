function MenuController(){
  
  var markdownConverter = window._context["MarkdownConverter"];
  var menuEnhancer = window._context["MenuEnhancer"];
  var leftMenuHtmlGenerator = window._context["LeftMenuHtmlGenerator"];
  var apiClient = window._context["ApiClient"];

  this.perform = () => {
    this.loadMenu();
  };

  this.loadMenu = () => {
    apiClient.find('document')
    .then((menu) =>{
      var enhancedMenu = menuEnhancer.perform(menu.data);
      var menuString = leftMenuHtmlGenerator.createComplexMenu(enhancedMenu);
      $("#menuContainer").append(menuString)    
      $("#menuContainer").navgoco({
          caretHtml: '',
          accordion: true,
          openClass: 'open',
          save: true,
          cookie: {
              name: 'navgoco',
              expires: false,
              path: '/'
          },
          slide: {
              duration: 400,
              easing: 'swing'
          },
          // Add Active class to clicked menu item
          onClickAfter: this.menuItemOnclick,
      });      
      
      var padding = 25;
      $("#leftPane").height($(window).height() - padding)
      $("#rigthPane").height($(window).height() - padding)

      $("#leftPane").resizable();
      $('#leftPane').resize(function() {
        $('#rigthPane').width($("#mainContainer").width() - $("#leftPane").width() - 50);
      });    
      
    }); 
  };
  
  this.menuItemOnclick = (event) => {
    if(typeof event.currentTarget.attributes['page-path'] === "undefined"){
      console.log(`menu does not have page-path attribute.`);
      return;
    }
    var documentPath = event.currentTarget.attributes['page-path'].nodeValue;
    console.log(`Go to ${documentPath}`);
    //this.performDocumentVisualization(event.currentTarget.attributes['page-path'].nodeValue);
    window.location.hash = documentPath;
    event.preventDefault();
  }  
  
  this.performDocumentVisualization = (documentPath) => {
    if(typeof documentPath === "undefined"){
      console.log(`document path is undefined.`);
      return;
    }
    var query = [
      {
        "path": documentPath
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
window._context["MenuController"] =  new MenuController();
