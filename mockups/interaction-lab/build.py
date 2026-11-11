"""Builds the interaction lab from the current site/ files so its content stays in step.
Run from the repository root: python3 mockups/interaction-lab/build.py"""
import re, shutil, pathlib
site = pathlib.Path("site"); lab = pathlib.Path("mockups/interaction-lab")
index = (site / "index.html").read_text()
request = (site / "request.html").read_text()

inner = re.search(r'<main id="main" class="wrap request">(.*?)</main>', request, re.S).group(1)
section = ('<section id="request-section" aria-label="Request tutoring">\n'
           '  <button class="lab-close" type="button" aria-label="Close the request form">&times;</button>\n'
           '  <div class="wrap request">' + inner + '</div>\n</section>\n')

index = index.replace("<title>", "<title>Interaction lab | ", 1)
index = index.replace('<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">\n<link rel="stylesheet" href="lab.css">')
index = index.replace('<script src="script.js" defer></script>', '<script src="script.js" defer></script>\n<script src="lab.js" defer></script>')
index = index.replace("Request tutoring →", 'Request tutoring <span class="arr" aria-hidden="true">→</span>')
index = index.replace("</main>\n", "</main>\n\n" + section, 1)
assert "request-section" in index and "lab.js" in index
(lab / "index.html").write_text(index)
(lab / "request.html").write_text(request)
shutil.copy(site / "styles.css", lab / "styles.css")
# the lab never sends anything
script = (site / "script.js").read_text()
script = re.sub(r'var FORM_ENDPOINT = ".*?";', 'var FORM_ENDPOINT = "";', script)
script = script.replace("This form is not connected yet, so nothing was sent. It will work once the site launches.", "Preview only: nothing is sent from this page.")
(lab / "script.js").write_text(script)
(lab / "images").mkdir(exist_ok=True); shutil.copy(site / "images/nils.jpg", lab / "images/nils.jpg")
print("lab built")
