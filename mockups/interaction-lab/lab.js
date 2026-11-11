// Interaction lab. Lets Nils switch each scroll, hover and linking behaviour
// on and off to compare them. Not part of the live site.
(function () {
  var root = document.documentElement;

  var GROUPS = [
    { heading: "Scrolling" },
    { key: "reveal", label: "As you scroll, sections", type: "radio", def: "up",
      options: [["off", "Just appear"], ["fade", "Fade in"], ["up", "Fade in and rise"]] },
    { key: "header", label: "Top menu", type: "radio", def: "sticky",
      options: [["static", "Scrolls away with the page"], ["sticky", "Stays at the top"], ["hide", "Hides going down, returns going up"]] },
    { key: "extras", label: "Scroll helpers", type: "check",
      options: [["progress", "Progress bar across the top", "off"], ["spy", "Highlight the current section in the menu", "on"], ["totop", "Back-to-top button", "off"]] },
    { key: "arrows", label: "Scroll arrows at the top and bottom", type: "radio", def: "on",
      options: [["on", "On: gentle on mouseover, fast after a click"], ["off", "Off"]] },
    { heading: "Mouseover" },
    { key: "cardhover", label: "Cards", type: "radio", def: "lift",
      options: [["none", "No change"], ["lift", "Lift with a shadow"], ["outline", "Green outline and title"], ["tilt", "Tilt toward the mouse"], ["spot", "Green glow follows the mouse"], ["number", "Number fills in, title underlines"]] },
    { key: "btn", label: "Buttons and links", type: "radio", def: "nudge",
      options: [["plain", "Colour change only"], ["nudge", "Button lifts, arrow slides, links underline"], ["fill", "Colour sweeps across the button"]] },
    { key: "photo", label: "Your photo", type: "radio", def: "none",
      options: [["none", "Still"], ["zoom", "Gentle zoom on mouseover"], ["tilt", "Tilted, straightens on mouseover"]] },
    { heading: "About section" },
    { key: "aboutfont", label: "Heading font", type: "radio", def: "serif",
      options: [["serif", "Classic serif (current)"], ["fraunces", "Softer serif"], ["grotesk", "Modern sans"], ["mono", "Typewriter"]] },
    { key: "aboutcolor", label: "Colours", type: "radio", def: "paper",
      options: [["paper", "Same as the page (current)"], ["panel", "Soft tinted panel"], ["dark", "Dark band"], ["green", "Green band"]] },
    { key: "aboutwords", label: "Heading words", type: "radio", def: "plain",
      options: [["plain", "Plain (current)"], ["reveal", "Appear one word at a time"], ["accent", "Key words in green"]] },
    { key: "abouthl", label: "Paragraph", type: "radio", def: "plain",
      options: [["plain", "Plain (current)"], ["highlight", "Key phrases highlighted"]] },
    { key: "aboutfacts", label: "Facts row", type: "radio", def: "numbers",
      options: [["numbers", "Big numbers (current)"], ["pills", "Pills"], ["list", "Simple list"]] },
    { heading: "Request form" },
    { key: "request", label: "“Request tutoring” opens", type: "radio", def: "page",
      options: [["page", "A separate page"], ["panel", "A panel that slides in"], ["inline", "A form further down this page"]] }
  ];

  var state = {};
  function defaults() {
    GROUPS.forEach(function (g) {
      if (g.heading) return;
      if (g.type === "radio") state[g.key] = g.def;
      else g.options.forEach(function (o) { state[o[0]] = o[2]; });
    });
  }
  defaults();
  try {
    var saved = JSON.parse(localStorage.getItem("lab-state-v3") || "null");
    if (saved) Object.keys(state).forEach(function (k) { if (saved[k]) state[k] = saved[k]; });
  } catch (e) {}

  function save() { try { localStorage.setItem("lab-state-v3", JSON.stringify(state)); } catch (e) {} }

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

  // ---- cards: tilt and spotlight follow the pointer ----
  var hoverCards = Array.prototype.slice.call(document.querySelectorAll(".card, .work"));
  function resetCards() { hoverCards.forEach(function (c) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }); }
  hoverCards.forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (x * 100) + "%"); card.style.setProperty("--my", (y * 100) + "%");
      if (state.cardhover === "tilt") { card.style.setProperty("--ry", ((x - 0.5) * 10) + "deg"); card.style.setProperty("--rx", ((0.5 - y) * 10) + "deg"); }
    });
    card.addEventListener("pointerleave", function () { card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); });
  });

  // ---- About heading: split into words so they can appear one by one or be coloured ----
  var aboutHeading = document.querySelector(".about h2");
  var KEY_WORDS = ["whole", "range", "learners."];
  if (aboutHeading) {
    var words = aboutHeading.textContent.trim().split(/\s+/);
    aboutHeading.setAttribute("aria-label", words.join(" "));
    aboutHeading.textContent = "";
    words.forEach(function (w, i) {
      var span = document.createElement("span"); span.className = "w" + (KEY_WORDS.indexOf(w) > -1 ? " key" : "");
      span.style.setProperty("--i", i); span.setAttribute("aria-hidden", "true"); span.textContent = w;
      aboutHeading.appendChild(span); aboutHeading.appendChild(document.createTextNode(" "));
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) aboutHeading.classList.add("words-in"); });
      }, { threshold: 0.6 }).observe(aboutHeading);
    } else aboutHeading.classList.add("words-in");
  }
  function replayWords() {
    if (!aboutHeading) return;
    aboutHeading.classList.remove("words-in");
    setTimeout(function () {
      var r = aboutHeading.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) aboutHeading.classList.add("words-in");
    }, 60);
  }

  // ---- scroll arrows: gentle while the mouse is over one, fast after a click ----
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GENTLE = 4, FAST = 26;
  var arrowFrame = null, arrowDir = 0, arrowSpeed = 0;
  function makeArrow(dir) {
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "lab-arrow " + (dir < 0 ? "up" : "down");
    btn.setAttribute("aria-label", dir < 0 ? "Scroll up" : "Scroll down");
    btn.innerHTML = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="' + (dir < 0 ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6") + '"></path></svg>';
    var viaMouse = false;
    btn.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      viaMouse = true; arrowDir = dir; arrowSpeed = GENTLE; btn.classList.remove("fast");
      if (!arrowFrame) arrowFrame = requestAnimationFrame(arrowStep);
    });
    btn.addEventListener("pointerleave", function () { viaMouse = false; arrowDir = 0; btn.classList.remove("fast"); });
    btn.addEventListener("click", function () {
      if (viaMouse && !reduceMotion) {            // mouse: switch to fast until the pointer leaves
        arrowDir = dir; arrowSpeed = FAST; btn.classList.add("fast");
        if (!arrowFrame) arrowFrame = requestAnimationFrame(arrowStep);
      } else {                                     // keyboard or touch: move one screen
        window.scrollBy({ top: dir * window.innerHeight * 0.85, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
    document.body.appendChild(btn);
    return btn;
  }
  var arrowUp = makeArrow(-1), arrowDown = makeArrow(1);
  function arrowStep() {
    arrowFrame = null;
    if (!arrowDir || state.arrows !== "on" || reduceMotion) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if ((arrowDir < 0 && window.scrollY <= 0) || (arrowDir > 0 && window.scrollY >= max - 1)) return;
    window.scrollBy({ top: arrowDir * arrowSpeed, behavior: "instant" });
    arrowFrame = requestAnimationFrame(arrowStep);
  }
  function updateArrows() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    arrowUp.classList.toggle("off", window.scrollY <= 4);
    arrowDown.classList.toggle("off", window.scrollY >= max - 4);
  }
  window.addEventListener("scroll", updateArrows, { passive: true });

  // ---- apply the current choices ----
  function apply(changed) {
    ["reveal", "header", "cardhover", "btn", "photo", "request", "progress", "spy", "totop", "arrows", "aboutfont", "aboutcolor", "aboutfacts"].forEach(function (k) {
      root.setAttribute("data-" + k, state[k]);
    });
    // heading-word mode and paragraph highlight share one attribute so they can be combined
    root.setAttribute("data-aboutwords", state.aboutwords === "plain" ? (state.abouthl === "highlight" ? "highlight" : "plain") : state.aboutwords);
    root.classList.toggle("about-hl", state.abouthl === "highlight");
    if (changed === "aboutwords") replayWords();
    if (changed === "cardhover") resetCards();
    if (state.request === "panel") { if (!requestSection.classList.contains("open")) requestSection.setAttribute("inert", ""); }
    else { requestSection.classList.remove("open"); backdrop.classList.remove("open"); requestSection.removeAttribute("inert"); }
    if (!changed || changed === "reveal") setupReveal();
    onScroll(); updateArrows();
  }

  // ---- control panel ----
  var lab = document.createElement("div"); lab.className = "lab";
  var panel = document.createElement("div"); panel.className = "lab-panel"; panel.id = "lab-panel"; panel.hidden = true;
  var intro = document.createElement("p");
  intro.textContent = "Switch options, then scroll and move your mouse over the page to compare. This panel is only for trying things out and is not part of the site.";
  panel.appendChild(intro);

  GROUPS.forEach(function (g) {
    if (g.heading) { var h = document.createElement("h3"); h.textContent = g.heading; panel.appendChild(h); return; }
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
