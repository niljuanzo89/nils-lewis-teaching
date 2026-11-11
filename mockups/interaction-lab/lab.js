// Interaction lab. Lets Nils switch each scroll, hover and linking behaviour
// on and off to compare them. Not part of the live site.
(function () {
  var root = document.documentElement;

  var GROUPS = [
    { key: "reveal", label: "As you scroll, sections", type: "radio", def: "up",
      options: [["off", "Just appear"], ["fade", "Fade in"], ["up", "Fade in and rise"]] },
    { key: "header", label: "Top menu", type: "radio", def: "sticky",
      options: [["static", "Scrolls away with the page"], ["sticky", "Stays at the top"], ["hide", "Hides going down, returns going up"]] },
    { key: "extras", label: "Scroll helpers", type: "check",
      options: [["progress", "Progress bar across the top", "off"], ["spy", "Highlight the current section in the menu", "on"], ["totop", "Back-to-top button", "off"]] },
    { key: "cardhover", label: "Cards on mouseover", type: "radio", def: "lift",
      options: [["none", "No change"], ["lift", "Lift with a shadow"], ["outline", "Green outline and title"]] },
    { key: "btn", label: "Buttons and links on mouseover", type: "radio", def: "nudge",
      options: [["plain", "Colour change only"], ["nudge", "Button lifts, arrow slides, links underline"]] },
    { key: "photo", label: "Your photo", type: "radio", def: "none",
      options: [["none", "Still"], ["zoom", "Gentle zoom on mouseover"], ["tilt", "Tilted, straightens on mouseover"]] },
    { key: "request", label: "“Request tutoring” opens", type: "radio", def: "page",
      options: [["page", "A separate page"], ["panel", "A panel that slides in"], ["inline", "A form further down this page"]] }
  ];

  var state = {};
  function defaults() {
    GROUPS.forEach(function (g) {
      if (g.type === "radio") state[g.key] = g.def;
      else g.options.forEach(function (o) { state[o[0]] = o[2]; });
    });
  }
  defaults();
  try {
    var saved = JSON.parse(localStorage.getItem("lab-state") || "null");
    if (saved) Object.keys(state).forEach(function (k) { if (saved[k]) state[k] = saved[k]; });
  } catch (e) {}

  function save() { try { localStorage.setItem("lab-state", JSON.stringify(state)); } catch (e) {} }

  // ---- elements the lab adds ----
  var progress = document.createElement("div"); progress.className = "lab-progress"; progress.setAttribute("aria-hidden", "true");
  var toTop = document.createElement("button"); toTop.className = "lab-top"; toTop.type = "button"; toTop.setAttribute("aria-label", "Back to top"); toTop.textContent = "↑";
  var backdrop = document.createElement("div"); backdrop.className = "lab-backdrop";
  document.body.appendChild(progress); document.body.appendChild(toTop); document.body.appendChild(backdrop);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  // ---- scroll reveal ----
  var targets = Array.prototype.slice.call(document.querySelectorAll(
    ".hero-text, .photo, main h2.label, .card, .steps li, .about .main > *, .work, .band"));
  targets.forEach(function (el) { el.classList.add("rv"); });
  var revealObserver = null;
  function setupReveal() {
    if (revealObserver) revealObserver.disconnect();
    targets.forEach(function (el) { el.classList.remove("in"); });
    if (!("IntersectionObserver" in window)) { targets.forEach(function (el) { el.classList.add("in"); }); return; }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    // wait a frame so the hidden state paints before the reveal starts
    requestAnimationFrame(function () { targets.forEach(function (el) { revealObserver.observe(el); }); });
  }

  // ---- current section in the menu ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function updateSpy() {
    var line = window.innerHeight * 0.35, current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    navLinks.forEach(function (a, i) { a.classList.toggle("current", i === current); });
  }

  // ---- scroll listener: progress, header, back to top ----
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    root.classList.toggle("scrolled", y > 8);
    root.classList.toggle("scrolled-far", y > 600);
    if (y > lastY + 4 && y > 160) root.classList.add("hdr-away");
    else if (y < lastY - 4) root.classList.remove("hdr-away");
    lastY = y;
    updateSpy();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- request form: page, panel or inline ----
  var requestSection = document.getElementById("request-section");
  var closeButton = requestSection.querySelector(".lab-close");
  var opener = null;
  function closePanel() {
    requestSection.classList.remove("open"); backdrop.classList.remove("open");
    requestSection.setAttribute("inert", "");
    if (opener) { opener.focus(); opener = null; }
  }
  function openPanel(from) {
    opener = from; requestSection.removeAttribute("inert");
    requestSection.classList.add("open"); backdrop.classList.add("open");
    closeButton.focus();
  }
  closeButton.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && requestSection.classList.contains("open")) closePanel(); });
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="request.html"]');
    if (!link || state.request === "page") return;
    e.preventDefault();
    if (state.request === "panel") openPanel(link);
    else requestSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ---- apply the current choices ----
  function apply(changed) {
    ["reveal", "header", "cardhover", "btn", "photo", "request", "progress", "spy", "totop"].forEach(function (k) {
      root.setAttribute("data-" + k, state[k]);
    });
    if (state.request === "panel") { if (!requestSection.classList.contains("open")) requestSection.setAttribute("inert", ""); }
    else { requestSection.classList.remove("open"); backdrop.classList.remove("open"); requestSection.removeAttribute("inert"); }
    if (!changed || changed === "reveal") setupReveal();
    onScroll();
  }

  // ---- control panel ----
  var lab = document.createElement("div"); lab.className = "lab";
  var panel = document.createElement("div"); panel.className = "lab-panel"; panel.id = "lab-panel"; panel.hidden = true;
  var intro = document.createElement("p");
  intro.textContent = "Switch options, then scroll and move your mouse over the page to compare. This panel is only for trying things out and is not part of the site.";
  panel.appendChild(intro);

  GROUPS.forEach(function (g) {
    var fs = document.createElement("fieldset"), lg = document.createElement("legend");
    lg.textContent = g.label; fs.appendChild(lg);
    g.options.forEach(function (o) {
      var label = document.createElement("label"), input = document.createElement("input");
      if (g.type === "radio") {
        input.type = "radio"; input.name = "lab-" + g.key; input.value = o[0]; input.checked = state[g.key] === o[0];
        input.addEventListener("change", function () { state[g.key] = o[0]; save(); apply(g.key); });
      } else {
        input.type = "checkbox"; input.checked = state[o[0]] === "on"; input.setAttribute("data-key", o[0]);
        input.addEventListener("change", function () { state[o[0]] = input.checked ? "on" : "off"; save(); apply(o[0]); });
      }
      label.appendChild(input); label.appendChild(document.createTextNode(o[1])); fs.appendChild(label);
    });
    panel.appendChild(fs);
  });

  var reset = document.createElement("button"); reset.type = "button"; reset.className = "lab-reset"; reset.textContent = "Reset to my suggestions";
  reset.addEventListener("click", function () {
    defaults(); save();
    panel.querySelectorAll("input[type=radio]").forEach(function (i) { i.checked = state[i.name.slice(4)] === i.value; });
    panel.querySelectorAll("input[type=checkbox]").forEach(function (i) { i.checked = state[i.getAttribute("data-key")] === "on"; });
    apply();
  });
  panel.appendChild(reset);

  var toggle = document.createElement("button"); toggle.type = "button"; toggle.className = "lab-toggle";
  toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-controls", "lab-panel"); toggle.textContent = "Try interactions";
  toggle.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    toggle.setAttribute("aria-expanded", String(!panel.hidden));
    toggle.textContent = panel.hidden ? "Try interactions" : "Close options";
  });
  lab.appendChild(panel); lab.appendChild(toggle); document.body.appendChild(lab);

  apply();
})();
