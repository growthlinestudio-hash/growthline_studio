/* Growthline v4 : menu mobile et formulaires (mailto). Aucune dépendance ; le site reste utilisable sans JS. */
(function () {
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }
  // Pas de serveur : le formulaire ouvre le client mail avec le message prérempli.
  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form), lines = [];
      form.querySelectorAll("[name]").forEach(function (f) {
        var v = (d.get(f.name) || "").toString().trim();
        if (v) lines.push(f.getAttribute("data-label") + " : " + v);
      });
      var url = "mailto:" + form.getAttribute("data-mailto") + "?subject=" + encodeURIComponent(form.getAttribute("data-subject")) +
        "&body=" + encodeURIComponent(lines.join("\n"));
      window.location.href = url;
      var note = form.querySelector(".hint");
      if (note) note.textContent = "Votre application de messagerie s'ouvre. Si rien ne se passe, écrivez-nous à " + form.getAttribute("data-mailto") + ".";
    });
  });
})();
