function LogoutController() {

  var baseUrl = getLocationBasePath();

  $(document).ready(function() {
    $("#logout").on("click", function() {
      console.log(baseUrl);
      var logoutUrl;
      window.location.href = baseUrl+"/logout";

      // if (baseUrl.includes("http://")) {
      //   logoutUrl = baseUrl.replace("http://", "http://logout@");
      // }
      //
      // if(typeof logoutUrl === 'undefined'){
      //   console.log(`base url is not supported yet`);
      //   return;
      // }
      //
      // var content = 'Logout';
      // document.getElementsByTagName('body')[0].innerHTML = content;
      // setTimeout(function() {
      //   window.location.href = logoutUrl;
      // }, 3000);
    });
  });

  function getLocationBasePath() {

    if (typeof window === "undefined") {
      console.error("ReferenceError: window is not defined. Are you in frontend javascript layer?");
      return;
    }

    if (typeof window.location === "undefined") {
      console.error("ReferenceError: window.location is not defined. Are you in frontend javascript layer?");
      return;
    }

    if (window.location.port) {
      return window.location.protocol + "//" + window.location.hostname + ":" + window.location.port
    } else {
      return window.location.protocol + "//" + window.location.hostname
    }
  }
}

if (typeof window._context === 'undefined') {
  window._context = {};
}
window._context["LogoutController"] = new LogoutController();
