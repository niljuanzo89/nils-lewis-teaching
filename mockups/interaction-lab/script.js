// ---- Settings -------------------------------------------------------------
// Paste the form endpoint here once the form service account exists,
// e.g. "https://formspree.io/f/abcdwxyz". While empty, the form explains
// that it is not connected yet instead of pretending to send.
var FORM_ENDPOINT = "";

// ---- Theme toggle ---------------------------------------------------------
(function () {
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  document.addEventListener("click", function (event) {
    var button = event.target.closest(".theme-toggle");
    if (!button) return;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

// ---- Tutoring request form ------------------------------------------------
(function () {
  var form = document.querySelector("form.intake");
  if (!form) return;
  var status = form.querySelector(".status");
  var button = form.querySelector("button[type=submit]");

  function show(message, isError) {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle("error", !!isError);
    status.focus();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements["_gotcha"].value) return; // spam trap

    if (!FORM_ENDPOINT) {
      show("Preview only: nothing is sent from this page.", true);
      return;
    }

    button.disabled = true;
    button.textContent = "Sending...";
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error("send failed");
        form.reset();
        show("Thank you. Your request is on its way, and I'll be in touch soon.", false);
      })
      .catch(function () {
        show("Sorry, that didn't send. Please try again in a moment.", true);
      })
      .then(function () {
        button.disabled = false;
        button.textContent = "Send request";
      });
  });
})();
