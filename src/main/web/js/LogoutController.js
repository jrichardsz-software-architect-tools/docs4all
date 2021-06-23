function LogoutController() {

  $(document).ready(function() {
    $("#logout").on("click", function() {
      var logoutUrl;
      window.location.href = "/logout";
    });
  });
}

if (typeof window._context === 'undefined') {
  window._context = {};
}
window._context["LogoutController"] = new LogoutController();
