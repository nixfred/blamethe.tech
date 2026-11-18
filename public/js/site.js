(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = document.getElementById("hero");
  var bsod = document.getElementById("bsod");
  var termText = document.getElementById("term-text");
  var termActions = document.getElementById("term-actions");
  var flipped = false;

  var lines = [
    { cls: "prompt", text: "nixfred@omarchy:~$ " },
    { cls: "cmd", text: "dmesg | tail -n 4" },
    { cls: "", text: "\n[  0.000001] boot: hyprland session is up" },
    { cls: "", text: "\n[  0.000002] ads: 0   telemetry nag: 0   forced reboot: 0" },
    { cls: "", text: "\n[  0.000003] " },
    { cls: "err", text: "Your PC ran into a problem. The problem is Windows." },
    { cls: "", text: "\n\n" },
    { cls: "ok", text: "Stop blaming yourself. Blame the tech." },
    { cls: "", text: "\n" },
    { cls: "prompt", text: "nixfred@omarchy:~$ " }
  ];

  function typeLines(done) {
    if (!termText) { if (done) done(); return; }
    termText.textContent = "";
    var i = 0;
    function nextLine() {
      if (i >= lines.length) {
        var caret = document.createElement("span");
        caret.className = "caret";
        caret.setAttribute("aria-hidden", "true");
        termText.appendChild(caret);
        if (done) done();
        return;
      }
      var item = lines[i++];
      var span = document.createElement("span");
      if (item.cls) span.className = item.cls;
      termText.appendChild(span);
      if (reduce) {
        span.textContent = item.text;
        nextLine();
        return;
      }
      var j = 0;
      var delay = item.cls === "cmd" ? 38 : item.cls === "prompt" ? 12 : 10;
      function tick() {
        j += 1;
        span.textContent = item.text.slice(0, j);
        if (j < item.text.length) {
          setTimeout(tick, delay);
        } else {
          setTimeout(nextLine, item.cls === "cmd" ? 280 : 40);
        }
      }
      tick();
    }
    nextLine();
  }

  function flip() {
    if (flipped || !hero) return;
    flipped = true;
    if (reduce) {
      hero.classList.add("is-flipped");
      typeLines(function () {
        if (termActions) termActions.hidden = false;
      });
      return;
    }
    hero.classList.add("is-glitching");
    setTimeout(function () {
      hero.classList.add("is-flipped");
      hero.classList.remove("is-glitching");
      typeLines(function () {
        if (termActions) termActions.hidden = false;
      });
    }, 560);
  }

  if (bsod) {
    bsod.addEventListener("click", flip);
    window.addEventListener("keydown", function (e) {
      if (flipped) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Tab" || e.key === "Shift") return;
      flip();
    });
    if (!reduce) {
      setTimeout(flip, 4200);
    }
  }

  /* Comparison tabs (phone). Desktop CSS reveals all three columns. */
  document.querySelectorAll(".task").forEach(function (task) {
    var tabs = task.querySelectorAll("[data-tab]");
    var panels = task.querySelectorAll(".os");
    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-tab");
        tabs.forEach(function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        panels.forEach(function (p) {
          var show = p.getAttribute("data-os") === id;
          p.hidden = !show;
        });
      });
    });
  });

  /* Fake Windows Update, stuck at 99%. Press O or tap to escape. */
  var theater = document.getElementById("update-stage");
  var pctEl = document.getElementById("update-pct");
  var escapeBox = document.getElementById("escape");
  var freed = false;
  var pct = 0;
  var timer;

  function setPct(n) {
    pct = n;
    if (pctEl) pctEl.textContent = n + "% complete";
  }

  function crawl() {
    if (freed || !pctEl) return;
    if (pct < 97) {
      setPct(pct + 1);
      timer = setTimeout(crawl, reduce ? 20 : 70 + Math.random() * 120);
    } else if (pct < 99) {
      setPct(pct + 1);
      timer = setTimeout(crawl, reduce ? 40 : 900);
    } else {
      setPct(99);
      if (escapeBox) escapeBox.hidden = false;
    }
  }

  function freeUpdate() {
    if (freed || !theater) return;
    freed = true;
    if (timer) clearTimeout(timer);
    theater.classList.add("is-freed");
  }

  if (theater) {
    var io = "IntersectionObserver" in window
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              io.disconnect();
              crawl();
            }
          });
        }, { threshold: 0.35 })
      : null;
    if (io) io.observe(theater);
    else crawl();
  }

  document.getElementById("escape-btn") &&
    document.getElementById("escape-btn").addEventListener("click", freeUpdate);

  window.addEventListener("keydown", function (e) {
    if (freed) return;
    if (!theater) return;
    if (e.key === "o" || e.key === "O") {
      var rect = theater.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      e.preventDefault();
      freeUpdate();
    }
  });

  /* Forced-reboot counter, stored in this browser only. */
  var KEY = "blamethe.tech:restarts";
  var countEl = document.getElementById("restart-count");
  var flash = document.getElementById("boot-flash");
  function readCount() {
    try { return parseInt(localStorage.getItem(KEY) || "0", 10) || 0; }
    catch (e) { return 0; }
  }
  function writeCount(n) {
    try { localStorage.setItem(KEY, String(n)); } catch (e) {}
  }
  function renderCount() {
    if (countEl) countEl.textContent = String(readCount());
  }
  renderCount();

  var restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      var n = readCount() + 1;
      writeCount(n);
      if (!flash) {
        renderCount();
        return;
      }
      flash.classList.add("show");
      flash.textContent = reduce
        ? "Restart required. Again."
        : "Installing update 1 of 1\nDo not turn off your computer.\n\n";
      var p = 0;
      function tick() {
        p += reduce ? 50 : 7;
        if (p < 99) {
          flash.textContent =
            "Installing update 1 of 1\nDo not turn off your computer.\n\n" + p + "% complete";
          setTimeout(tick, reduce ? 0 : 40);
        } else {
          flash.textContent = "Working on updates\n99% complete\n\nJust kidding.\nRestart #" + n + " is on you.";
          setTimeout(function () {
            flash.classList.remove("show");
            renderCount();
          }, reduce ? 200 : 1400);
        }
      }
      tick();
    });
  }
})();
