function MarkdownConverter(){

  var markdownConverter = window.markdownit({
    html: true
  });  

  this.render = (markdownString) => {
    return markdownConverter.render(markdownString)
  };
  
}

if(typeof window._context === 'undefined'){
   window._context = {};
}
window._context["MarkdownConverter"] =  new MarkdownConverter();
