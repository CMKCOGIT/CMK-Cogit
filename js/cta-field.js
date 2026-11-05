/* Campo de partículas dos CTAs finais (seções navy).
   Rede de nós ancorados numa grade irregular: derivam devagar, ligam-se aos vizinhos,
   reagem ao cursor e recebem "sinais" que percorrem as ligações.
   Pausa fora da tela / aba oculta; com movimento reduzido desenha um quadro estático. */
(function () {
  'use strict';
  var SELECTOR = 'main section.tone-navy';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function Field(section) {
    var canvas = document.createElement('canvas');
    canvas.className = 'cta-field';
    canvas.setAttribute('aria-hidden', 'true');
    section.insertBefore(canvas, section.firstChild);
    section.classList.add('has-cta-field');

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, nodes = [], links = [], pulses = [];
    var mouse = { x: -9999, y: -9999, on: false };
    var running = false, visible = false, raf = 0, last = 0, t = 0, nextPulse = 0;
    var LINK = 150;

    function build() {
      var r = section.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      LINK = W < 700 ? 110 : 150;
      var step = W < 700 ? 74 : 96;
      nodes = [];
      for (var y = -step / 2; y < H + step; y += step) {
        for (var x = -step / 2; x < W + step; x += step) {
          var ax = x + (Math.random() - 0.5) * step * 0.8;
          var ay = y + (Math.random() - 0.5) * step * 0.8;
          nodes.push({ ax: ax, ay: ay, x: ax, y: ay, vx: 0, vy: 0,
            ph: Math.random() * Math.PI * 2, sp: 0.25 + Math.random() * 0.5,
            amp: 10 + Math.random() * 18, r: Math.random() < 0.16 ? 2.2 : 1.3, glow: 0 });
        }
      }
      links = [];
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].ax - nodes[j].ax, dy = nodes[i].ay - nodes[j].ay;
          if (dx * dx + dy * dy < LINK * LINK) links.push([i, j]);
        }
      }
      pulses = [];
    }

    function spawnPulse() {
      if (!links.length) return;
      var l = links[(Math.random() * links.length) | 0];
      pulses.push({ a: l[0], b: l[1], p: 0, hops: 3 + ((Math.random() * 4) | 0), v: 0.9 + Math.random() * 0.8 });
    }

    function nextLinkFrom(n, prev) {
      var opts = [];
      for (var k = 0; k < links.length; k++) {
        var l = links[k];
        if (l[0] === n && l[1] !== prev) opts.push(l[1]);
        else if (l[1] === n && l[0] !== prev) opts.push(l[0]);
      }
      return opts.length ? opts[(Math.random() * opts.length) | 0] : -1;
    }

    function step(dt) {
      t += dt;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var tx = n.ax + Math.cos(t * n.sp + n.ph) * n.amp;
        var ty = n.ay + Math.sin(t * n.sp * 0.8 + n.ph) * n.amp;
        if (mouse.on) {
          var mx = n.x - mouse.x, my = n.y - mouse.y, d2 = mx * mx + my * my, R = 170;
          if (d2 < R * R) {
            var d = Math.sqrt(d2) || 1, f = (1 - d / R);
            tx += (mx / d) * f * 34; ty += (my / d) * f * 34;
            n.glow = Math.max(n.glow, f);
          }
        }
        n.vx += (tx - n.x) * 2.2 * dt; n.vy += (ty - n.y) * 2.2 * dt;
        n.vx *= 0.9; n.vy *= 0.9;
        n.x += n.vx; n.y += n.vy;
        n.glow *= 0.94;
      }
      if (t > nextPulse) { spawnPulse(); nextPulse = t + 0.35 + Math.random() * 0.6; }
      for (var p = pulses.length - 1; p >= 0; p--) {
        var q = pulses[p];
        q.p += dt * q.v;
        if (q.p >= 1) {
          nodes[q.b].glow = 1;
          var nx = --q.hops > 0 ? nextLinkFrom(q.b, q.a) : -1;
          if (nx < 0) { pulses.splice(p, 1); continue; }
          q.a = q.b; q.b = nx; q.p = 0;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (var k = 0; k < links.length; k++) {
        var a = nodes[links[k][0]], b = nodes[links[k][1]];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d > LINK * 1.15) continue;
        var o = (1 - d / (LINK * 1.15)) * 0.22 + Math.max(a.glow, b.glow) * 0.35;
        ctx.strokeStyle = 'rgba(142,166,216,' + o.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      if (mouse.on) {
        for (var m = 0; m < nodes.length; m++) {
          var n0 = nodes[m], ex = n0.x - mouse.x, ey = n0.y - mouse.y, dd = Math.sqrt(ex * ex + ey * ey);
          if (dd < 190) {
            ctx.strokeStyle = 'rgba(243,243,241,' + ((1 - dd / 190) * 0.4).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(n0.x, n0.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        ctx.fillStyle = 'rgba(169,182,207,' + (0.45 + n.glow * 0.55).toFixed(3) + ')';
        var s = n.r + n.glow * 1.6;
        ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      }
      for (var p = 0; p < pulses.length; p++) {
        var q = pulses[p], A = nodes[q.a], B = nodes[q.b];
        var px = A.x + (B.x - A.x) * q.p, py = A.y + (B.y - A.y) * q.p;
        var tail = Math.max(0, q.p - 0.35);
        var qx = A.x + (B.x - A.x) * tail, qy = A.y + (B.y - A.y) * tail;
        var g = ctx.createLinearGradient(qx, qy, px, py);
        g.addColorStop(0, 'rgba(243,243,241,0)'); g.addColorStop(1, 'rgba(243,243,241,.9)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
        ctx.lineWidth = 1;
        ctx.fillStyle = '#F3F3F1'; ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
      }
    }

    function frame(now) {
      if (!running) return;
      var dt = Math.min(0.05, ((now - last) || 16) / 1000); last = now;
      step(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduce.matches || !visible || document.hidden) return;
      running = true; last = performance.now(); raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { stop(); t = 0; for (var i = 0; i < nodes.length; i++) { nodes[i].x = nodes[i].ax; nodes[i].y = nodes[i].ay; } pulses = []; draw(); }

    build();
    if (reduce.matches) still();

    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: '120px 0px' }).observe(section);

    var rt = 0, lastW = 0;
    new ResizeObserver(function () {
      var w = section.offsetWidth, h = section.offsetHeight;
      if (Math.abs(w - lastW) < 2 && Math.abs(h - H) < 40) return;
      lastW = w; clearTimeout(rt);
      rt = setTimeout(function () { build(); if (!running) draw(); }, 150);
    }).observe(section);

    section.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = section.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true;
    }, { passive: true });
    section.addEventListener('pointerleave', function () { mouse.on = false; }, { passive: true });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    var onReduce = function () { if (reduce.matches) still(); else start(); };
    if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  }

  function init() {
    if (!window.IntersectionObserver || !window.ResizeObserver) return;
    var list = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < list.length; i++) if (!list[i].querySelector('.cta-field')) Field(list[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
