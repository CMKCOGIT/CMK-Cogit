// rebrand-motion.js — camada de movimento da identidade 2026 (sem dependências).
// Barra de leitura, faixa que reage à rolagem, manifesto palavra a palavra,
// títulos que sobem por máscara, tipografia cinética (eixo de largura da Anybody),
// holofote nos cartões, botões magnéticos e pilha de etapas.
// Tudo respeita prefers-reduced-motion: sem animação, o conteúdo aparece inteiro.
(function () {
  'use strict';
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ── 1. Barra de progresso da leitura ──
  const bar = document.createElement('div');
  bar.className = 'cmk-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  // ── 2. Manifesto: divide em palavras preservando <em> ──
  function splitWords(root, wordClass, inner) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = wordClass;
            w.style.setProperty('--wi', i++);
            if (inner) { const s = document.createElement('span'); s.textContent = part; w.appendChild(s); }
            else w.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    walk(root);
    return root.querySelectorAll('.' + wordClass);
  }

  const scrubs = [...document.querySelectorAll('[data-scrub-words]')].map((el) => {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    return { el, words: [...splitWords(el, 'w', false)] };
  });
  scrubs.forEach(({ words }) => words.forEach((w) => w.setAttribute('aria-hidden', 'true')));

  // ── 3. Faixa em movimento: duplica para laço contínuo ──
  const marquees = [...document.querySelectorAll('[data-marquee]')].map((track) => {
    track.innerHTML += track.innerHTML;
    return { track, x: 0, w: track.scrollWidth / 2 };
  });

  // ── 4. Tipografia cinética: a largura da letra responde à rolagem ──
  const kinetic = [...document.querySelectorAll('.cmk-kinetic')].map((el) => {
    const [min, max] = (el.dataset.k || '100,132').split(',').map(Number);
    return { el, min, max };
  });

  // ── 5. Pilha de etapas ──
  const stackCards = [...document.querySelectorAll('.cmk-stack > *')];

  let lastY = window.scrollY, velocity = 0, dir = 1, ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const max = Math.max(1, doc.scrollHeight - vh);
    bar.style.setProperty('--p', (y / max).toFixed(4));
    if (reduce) return;

    scrubs.forEach(({ el, words }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    });

    if (window.innerWidth >= 768) kinetic.forEach(({ el, min, max }) => {
      const r = el.getBoundingClientRect();
      const center = (r.top + r.height / 2) / vh; // 0 = topo, 1 = base
      const t = clamp(1 - Math.abs(center - 0.45) * 1.6, 0, 1);
      el.style.fontStretch = (min + t * (max - min)).toFixed(1) + '%';
    });

    stackCards.forEach((card, i) => {
      const next = stackCards[i + 1];
      if (!next) return;
      const rn = next.getBoundingClientRect();
      const p = clamp(1 - (rn.top - card.getBoundingClientRect().top) / vh, 0, 1);
      card.style.setProperty('--s', (1 - p * 0.06).toFixed(4));
    });
  }

  function requestFrame() {
    const y = window.scrollY;
    velocity = y - lastY;
    if (velocity) dir = velocity > 0 ? 1 : -1;
    lastY = y;
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', () => { marquees.forEach((m) => { m.w = m.track.scrollWidth / 2; }); requestFrame(); });
  requestFrame();

  if (!reduce && marquees.length) {
    let boost = 0;
    const loop = () => {
      boost = boost * 0.92 + Math.min(40, Math.abs(velocity)) * 0.08;
      velocity *= 0.9;
      marquees.forEach((m) => {
        m.x -= (0.6 + boost * 0.35) * dir;
        if (m.x <= -m.w) m.x += m.w;
        if (m.x > 0) m.x -= m.w;
        m.track.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,0,0)';
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  if (reduce) return;

  // ── 6. Títulos de seção sobem por máscara; cortinas abrem ──
  const splitTargets = document.querySelectorAll('.section-header h2, .cta-final h2, .cmk-split-me');
  splitTargets.forEach((h) => {
    if (h.closest('[data-scrub-words]')) return;
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    splitWords(h, 'cmk-word', true).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    h.classList.add('cmk-split');
  });
  document.querySelectorAll('.cta-final, #cases .container').forEach((el) => el.setAttribute('data-curtain', ''));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add(e.target.hasAttribute('data-curtain') ? 'is-open' : 'is-split-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  document.querySelectorAll('.cmk-split, [data-curtain]').forEach((el) => io.observe(el));

  // ── 7. Holofote e botões magnéticos (somente mouse) ──
  if (!finePointer) return;
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest && e.target.closest('.home-frente, .case-card, .cmk-pillar');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  document.querySelectorAll('.btn-lg, .header-cta').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.translate = (dx * 10).toFixed(1) + 'px ' + (dy * 8).toFixed(1) + 'px';
    });
    btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
  });
})();
