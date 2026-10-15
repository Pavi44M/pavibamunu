/* PB · 2050 layer. Adds the heads-up bar, the living background and the pointer light. Safe to fail. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, here = (location.pathname.split("/").pop() || "index.html");
  var still = false; try { still = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var LINKS = [["index.html", "Work"], ["catchment-slab.html", "Study"], ["method.html", "Method"], ["catchment-command.html", "Dashboard"], ["cv.html", "CV"],
               ["https://pavi44m.github.io/Agent-Shelly-0.3/", "Shelly ↗"]];

  /* ---- heads-up bar */
  var bar = doc.createElement("div"); bar.className = "hud"; bar.setAttribute("role", "navigation"); bar.setAttribute("aria-label", "Portfolio");
  bar.innerHTML = '<div class="hud-in"><a class="hud-mark" href="index.html" aria-label="Pavithra Bamunu, home">' +
    '<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="hudg" x1="0" x2="1"><stop offset="0" stop-color="#5fe1ff"/><stop offset="1" stop-color="#9b7bff"/></linearGradient></defs>' +
    '<circle cx="16" cy="16" r="14.5" fill="none" stroke="url(#hudg)" stroke-width="1.2"/><circle cx="16" cy="16" r="10" fill="none" stroke="rgba(120,190,230,.35)" stroke-dasharray="2 3"/>' +
    '<text x="16" y="20" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" font-weight="600" fill="#eaf0f6">PB</text></svg><b>Pavithra Bamunu</b></a>' +
    '<nav class="hud-nav">' + LINKS.map(function (l) {
      var ext = /^https?:/.test(l[0]);
      return '<a href="' + l[0] + '"' + (l[0] === here ? ' aria-current="page"' : "") + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + l[1] + "</a>";
    }).join("") + "</nav>" +
    '<span class="hud-clock" title="Time in Auckland"><span class="hud-dot" aria-hidden="true"></span><span class="hud-t">AKL <span id="hud-time">--:--</span></span></span></div><i class="hud-prog" aria-hidden="true"></i>';
  doc.body.insertBefore(bar, doc.body.firstChild);
  function tick() {
    try { doc.getElementById("hud-time").textContent = new Intl.DateTimeFormat("en-NZ", { timeZone: "Pacific/Auckland", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); } catch (e) {}
  }
  tick(); setInterval(tick, 20000);
  var prog = bar.querySelector(".hud-prog");
  function onScroll() { var h = root.scrollHeight - innerHeight; prog.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h) : 0); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- pointer light */
  if (!still && matchMedia("(pointer:fine)").matches) {
    var g = doc.createElement("div"); g.id = "hud-glow"; doc.body.appendChild(g);
    addEventListener("pointermove", function (e) { root.classList.add("hud-pointer"); g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; }, { passive: true });
    doc.addEventListener("pointerleave", function () { root.classList.remove("hud-pointer"); });
    /* cards light up where the pointer is */
    doc.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest("[data-spot]"); if (!c) return;
      var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---- living background: aurora, a horizon grid and drifting particles */
  if (root.getAttribute("data-hud-bg") === "off") return;
  var cv = doc.createElement("canvas"); cv.id = "hud-bg"; cv.setAttribute("aria-hidden", "true"); doc.body.insertBefore(cv, doc.body.firstChild);
  var cx = cv.getContext("2d"); if (!cx) return;
  var W, H, DPR, P = [], t0 = performance.now(), run = true;
  function size() {
    DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(90, W * H / 16000)); P = [];
    for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, z: .3 + Math.random() * .7, v: .05 + Math.random() * .18 });
  }
  function draw(now) {
    var t = (now - t0) / 1000, sy = scrollY * .15;
    cx.clearRect(0, 0, W, H);
    // aurora: three soft blobs breathing slowly
    var B = [[.18, .12, "95,225,255", .10], [.82, .22, "155,123,255", .10], [.55, .78, "95,242,195", .05]];
    for (var i = 0; i < B.length; i++) {
      var b = B[i], x = W * (b[0] + Math.sin(t * .07 + i * 2) * .05), y = H * (b[1] + Math.cos(t * .05 + i) * .05) - sy * (i + 1) * .3, r = Math.max(W, H) * .55;
      var gr = cx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(" + b[2] + "," + b[3] + ")"); gr.addColorStop(1, "rgba(" + b[2] + ",0)");
      cx.fillStyle = gr; cx.fillRect(0, 0, W, H);
    }
    // horizon grid in perspective, rolling toward the viewer
    var hy = H * .72, vx = W / 2; cx.lineWidth = 1;
    for (var k = 0; k < 16; k++) {
      var p = ((k + (t * .25) % 1) / 16), y2 = hy + Math.pow(p, 2.2) * (H - hy + 40);
      cx.strokeStyle = "rgba(95,225,255," + (0.02 + p * .07).toFixed(3) + ")"; cx.beginPath(); cx.moveTo(0, y2); cx.lineTo(W, y2); cx.stroke();
    }
    for (var j = -12; j <= 12; j++) {
      cx.strokeStyle = "rgba(155,123,255,0.05)"; cx.beginPath(); cx.moveTo(vx + j * 14, hy); cx.lineTo(vx + j * W * .16, H + 40); cx.stroke();
    }
    var fade = cx.createLinearGradient(0, hy - 30, 0, hy + 90); fade.addColorStop(0, "rgba(5,8,14,0)"); fade.addColorStop(.3, "rgba(5,8,14,.75)"); fade.addColorStop(1, "rgba(5,8,14,0)");
    cx.fillStyle = fade; cx.fillRect(0, hy - 30, W, 120);
    // particles, with faint links between near neighbours
    for (var a = 0; a < P.length; a++) {
      var q = P[a]; q.y -= q.v * q.z; if (q.y < -10) { q.y = H + 10; q.x = Math.random() * W; }
      cx.fillStyle = "rgba(200,235,255," + (.25 + q.z * .45).toFixed(2) + ")"; cx.beginPath(); cx.arc(q.x, q.y - sy * q.z * .4 % H, q.z * 1.3, 0, 6.283); cx.fill();
    }
    for (a = 0; a < P.length; a++) for (var c = a + 1; c < P.length; c++) {
      var dx = P[a].x - P[c].x, dy = P[a].y - P[c].y, d = dx * dx + dy * dy;
      if (d < 9000) { cx.strokeStyle = "rgba(95,225,255," + (.08 * (1 - d / 9000)).toFixed(3) + ")"; cx.beginPath(); cx.moveTo(P[a].x, P[a].y - sy * P[a].z * .4 % H); cx.lineTo(P[c].x, P[c].y - sy * P[c].z * .4 % H); cx.stroke(); }
    }
    if (run && !still) requestAnimationFrame(draw);
  }
  size(); addEventListener("resize", size);
  doc.addEventListener("visibilitychange", function () { var was = run; run = !doc.hidden; if (run && !was && !still) requestAnimationFrame(draw); });
  requestAnimationFrame(draw);
})();
