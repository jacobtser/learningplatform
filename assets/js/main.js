/* ==========================================================================
   Dangme Learning Platform — AI Startup Credits site
   Vanilla JS only. No dependencies, no network calls.
   - Mobile nav toggle (aria-expanded, keyboard accessible)
   - Reveal-on-scroll (respects prefers-reduced-motion)
   - Application form: validates, composes a mailto:, live preview,
     Copy-message + Download-as-.txt fallbacks
   - Print / Save-as-PDF
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var CONTACT_EMAIL = "jacobtser20@gmail.com";
  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------- */
  /* 1. Mobile navigation                                                    */
  /* ---------------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) close(); else open();
    });

    // Close when a link is followed.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    // Close on Escape, returning focus to the toggle.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    // Close when resizing back to the desktop layout.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && nav.classList.contains("is-open")) close();
    });

    // Close when clicking outside.
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 2. Reveal on scroll                                                     */
  /* ---------------------------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    function show(el) {
      if (el.classList.contains("is-visible")) return;
      el.classList.add("is-visible");
      io.unobserve(el);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

    items.forEach(function (el) { io.observe(el); });

    // Safety net. An anchor jump (e.g. clicking a nav link) or a fast
    // programmatic scroll can move an element from below the fold to above it
    // between two observations, so the IntersectionObserver never fires and the
    // element would stay at opacity 0 forever. Sweep anything now at or above
    // the fold on scroll/resize/load so content can never remain hidden.
    var ticking = false;
    function sweep() {
      ticking = false;
      var line = window.innerHeight * 0.9;
      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < line) show(el);
      });
    }
    function queueSweep() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
    }
    window.addEventListener("scroll", queueSweep, { passive: true });
    window.addEventListener("resize", queueSweep, { passive: true });
    window.addEventListener("hashchange", queueSweep);

    // Run once after all resources settle, so a page opened at an anchor
    // (#section) still reveals everything above it. Deferred to the load event
    // because layout is not final at DOMContentLoaded (web fonts / the logo
    // image can still change page height).
    if (document.readyState === "complete") queueSweep();
    else window.addEventListener("load", queueSweep);
  }

  /* ---------------------------------------------------------------------- */
  /* 3. Print / Save as PDF                                                  */
  /* ---------------------------------------------------------------------- */
  function initPrint() {
    document.querySelectorAll("[data-print]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.print(); });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 4. Footer year                                                          */
  /* ---------------------------------------------------------------------- */
  function initYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = y; });
  }

  /* ---------------------------------------------------------------------- */
  /* 5. Application form                                                     */
  /* ---------------------------------------------------------------------- */
  function initForm() {
    var form = document.getElementById("applyForm");
    if (!form) return;

    // Native constraint validation stands in when JS is unavailable;
    // when JS is present we take over with friendlier, inline messages.
    form.noValidate = true;

    var els = {
      name: document.getElementById("f-name"),
      email: document.getElementById("f-email"),
      org: document.getElementById("f-org"),
      amount: document.getElementById("f-amount"),
      provider: document.getElementById("f-provider"),
      message: document.getElementById("f-message"),
      copyDeliverables: document.getElementById("f-deliverables"),
      preview: document.getElementById("compose-body"),
      status: document.getElementById("form-status"),
      copyBtn: document.getElementById("btn-copy"),
      downloadBtn: document.getElementById("btn-download")
    };

    var errEls = {
      name: document.getElementById("err-name"),
      email: document.getElementById("err-email"),
      message: document.getElementById("err-message")
    };

    var SUBJECT = "AI Startup Credits \u2014 Application \u2014 Dangme Learning Platform";
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function value(el) { return el && typeof el.value === "string" ? el.value.trim() : ""; }
    function isChecked(el) { return !!(el && el.checked); }

    function buildSubject() { return SUBJECT; }

    function buildBody() {
      var name = value(els.name) || "\u2014";
      var email = value(els.email) || "\u2014";
      var org = value(els.org) || "\u2014";
      var amount = value(els.amount) || "$1,000";
      var provider = value(els.provider) || "\u2014";
      var message = value(els.message);

      var lines = [];
      lines.push(SUBJECT);
      lines.push("======================================================================");
      lines.push("");
      lines.push("Applicant");
      lines.push("----------------------------------------------------------------------");
      lines.push("Full name:               " + name);
      lines.push("Email:                   " + email);
      lines.push("Organisation / program:  " + org);
      lines.push("Requested credit amount: " + amount);
      lines.push("Preferred model/provider:" + " " + provider);
      lines.push("Deliverables copy:       " + (isChecked(els.copyDeliverables) ? "Yes \u2014 please share corpus, grammar tables and evaluation reports" : "No"));
      lines.push("");
      lines.push("Message / notes");
      lines.push("----------------------------------------------------------------------");
      lines.push(message || "(none)");
      lines.push("");
      lines.push("----------------------------------------------------------------------");
      lines.push("Venture: Dangme Learning Platform (\u201cD\u00e3\u0301ngme K\u00e3n\u00e9l\u0254\u201d)");
      lines.push("A low-resource Dangme\u2013English learning & translation platform.");
      lines.push("Contact: " + CONTACT_EMAIL);
      return lines.join("\n");
    }

    function mailtoUrl() {
      return "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(buildSubject()) +
        "&body=" + encodeURIComponent(buildBody());
    }

    function refreshPreview() {
      if (els.preview) els.preview.textContent = buildBody();
    }

    function setStatus(msg) {
      if (els.status) els.status.textContent = msg || "";
    }

    /* ---- validation (client-side only) ---- */
    function validate() {
      var ok = true;

      // name
      if (!value(els.name)) {
        if (errEls.name) errEls.name.textContent = "Please enter your full name.";
        if (els.name) els.name.setAttribute("aria-invalid", "true");
        ok = false;
      } else {
        if (errEls.name) errEls.name.textContent = "";
        if (els.name) els.name.removeAttribute("aria-invalid");
      }

      // email
      var em = value(els.email);
      if (!em) {
        if (errEls.email) errEls.email.textContent = "Please enter an email address.";
        if (els.email) els.email.setAttribute("aria-invalid", "true");
        ok = false;
      } else if (!EMAIL_RE.test(em)) {
        if (errEls.email) errEls.email.textContent = "That doesn\u2019t look like a valid email address.";
        if (els.email) els.email.setAttribute("aria-invalid", "true");
        ok = false;
      } else {
        if (errEls.email) errEls.email.textContent = "";
        if (els.email) els.email.removeAttribute("aria-invalid");
      }

      // message (optional but keep the field's own error cleared)
      if (errEls.message) errEls.message.textContent = "";

      return ok;
    }

    // ARIA live region for the copy/download feedback.
    if (!els.status) {
      var live = document.createElement("p");
      live.id = "form-status";
      live.className = "compose__status";
      live.setAttribute("aria-live", "polite");
      form.appendChild(live);
      els.status = live;
    } else {
      els.status.setAttribute("aria-live", "polite");
    }

    // Clear a single field's error state (message + aria-invalid) as soon as
    // the learner edits that field, so a stale error never lingers while they
    // are fixing it.
    function clearFieldError(field, errEl) {
      if (errEl) errEl.textContent = "";
      if (field) field.removeAttribute("aria-invalid");
    }

    form.addEventListener("input", function (e) {
      refreshPreview();
      var t = e.target;
      if (t === els.name) clearFieldError(els.name, errEls.name);
      else if (t === els.email) clearFieldError(els.email, errEls.email);
      else if (t === els.message) clearFieldError(els.message, errEls.message);
      if (els.status && els.status.textContent) setStatus("");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus();
        setStatus("Please fix the highlighted fields, then send again.");
        return;
      }
      refreshPreview();
      var url = mailtoUrl();
      setStatus("Opening your email app with the application pre-filled\u2026");
      // Hand off to the OS mail client.
      try {
        window.location.href = url;
      } catch (err) {
        setStatus("Couldn\u2019t open a mail app. Use \u201cCopy message\u201d or \u201cDownload as .txt\u201d below.");
      }
    });

    /* ---- copy fallback ---- */
    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand("copy"); } catch (err) { done = false; }
      document.body.removeChild(ta);
      return done;
    }

    if (els.copyBtn) {
      els.copyBtn.addEventListener("click", function () {
        var text = "Subject: " + buildSubject() + "\n\n" + buildBody();
        function ok() { setStatus("Message copied to your clipboard."); }
        function fail() { setStatus("Copy failed \u2014 select the message above and copy it manually."); }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok, function () {
            if (fallbackCopy(text)) ok(); else fail();
          });
        } else if (fallbackCopy(text)) {
          ok();
        } else {
          fail();
        }
      });
    }

    /* ---- download .txt fallback ---- */
    if (els.downloadBtn) {
      els.downloadBtn.addEventListener("click", function () {
        var text = buildBody();
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "dangme-ai-credits-application.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        setStatus("Downloaded dangme-ai-credits-application.txt");
      });
    }

    refreshPreview();
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */
  function boot() {
    initNav();
    initReveal();
    initPrint();
    initYear();
    initForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
