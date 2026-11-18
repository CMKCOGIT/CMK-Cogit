/* i18n.js — traduz no navegador o texto que o JavaScript monta (diagnóstico, demonstração,
   preços) nas páginas em inglês (/en/). O HTML fixo já chega traduzido (tools/i18n/build.mjs).
   Dicionário: window.COGIT_I18N, gerado em js/i18n-en.js a partir de tools/i18n/en.json.
   · Troca trechos de texto e os atributos alt, aria-label, title e placeholder por correspondência exata.
   · Corrige links para páginas que ainda não têm versão em inglês (voltam para o site em português).
   · Com ?i18n-debug na URL, guarda em window.__i18nFaltando os textos sem tradução. */
(function () {
  'use strict';
  var D = window.COGIT_I18N;
  if (!D || document.documentElement.lang.indexOf('en') !== 0) return;
  var norm = function (s) { return s.replace(/[\s ]+/g, ' ').trim(); };
  var texts = D.texts || {};
  // [regex, substituição, traduzir os trechos capturados?]
  var pats = (D.patterns || []).map(function (p) { return [new RegExp('^' + p[0] + '$', 'u'), p[1], !!p[2]]; });
  var pages = D.pages || [];
  var DEBUG = /[?&]i18n-debug\b/.test(location.search);
  var faltando = window.__i18nFaltando = DEBUG ? {} : null;
  var ingles = {}; Object.keys(texts).forEach(function (k) { ingles[norm(texts[k])] = 1; });
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, CODE: 1, PRE: 1, NOSCRIPT: 1 };
  var ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];

  var feito = ' ';
  function exato(k) {
    if (Object.prototype.hasOwnProperty.call(texts, k)) return texts[k];
    for (var i = 0; i < pats.length; i++) {
      var m = k.match(pats[i][0]);
      if (m) return pats[i][1].replace(/\$(\d)/g, function (_, n) { return pats[i][2] ? parte(m[n] || '') : (m[n] || ''); });
    }
    return null;
  }
  // trecho capturado: exato, em lista ("a, b e c") ou com a inicial maiúscula ("vídeo em destaque")
  function parte(x) {
    if (Object.prototype.hasOwnProperty.call(texts, x)) return texts[x];
    if (/, | e /.test(x)) return x.split(/(, | e )/).map(function (y) { return y === ', ' ? ', ' : y === ' e ' ? ' and ' : parte(y); }).join('');
    var cap = x.charAt(0).toUpperCase() + x.slice(1);
    if (cap !== x && Object.prototype.hasOwnProperty.call(texts, cap)) { var r = texts[cap]; return r.charAt(0).toLowerCase() + r.slice(1); }
    return x;
  }
  // Exato; senão, partes separadas por " · " (ex.: "Básico · Landing Page Básica"), cada uma traduzida.
  function t(raw) {
    var k = norm(raw);
    if (!k || !/\p{L}{2,}/u.test(k)) return null;
    var r = exato(k);
    if (r == null && k.indexOf(' · ') > 0) {
      var ok = true;
      r = k.split(' · ').map(function (p) { if (!/\p{L}{2,}/u.test(p)) return p; var x = exato(p); if (x == null) ok = false; return x; }).join(' · ');
      if (!ok) r = null;
    }
    if (r != null) { if (DEBUG) feito += r + ' '; return r; }
    if (faltando && !ingles[k] && feito.indexOf(k) === -1) faltando[k] = (faltando[k] || 0) + 1;
    return null;
  }
  // Para o JavaScript do site (ex.: mensagens de confirm/alert)
  window.cogitT = function (s) { var r = t(String(s)); return r == null ? s : r; };

  function skip(el) { for (var n = el; n && n.nodeType === 1; n = n.parentNode) { if (SKIP[n.tagName] || n.getAttribute('translate') === 'no' || n.isContentEditable) return true; } return false; }
  function textNode(n) {
    var v = n.nodeValue, r = t(v);
    if (r == null || r === norm(v)) return;
    n.nodeValue = v.match(/^[\s ]*/)[0] + r + v.match(/[\s ]*$/)[0];
  }
  function attrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v) { var r = t(v); if (r != null && r !== v) el.setAttribute(a, r); }
    }
    if (el.tagName === 'A') link(el);
  }
  // /en/<página sem tradução> -> /<página> (o site em português)
  function link(a) {
    var h = a.getAttribute('href');
    if (!h || /^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(h)) return;
    try {
      var u = new URL(h, location.href);
      if (u.origin !== location.origin || u.pathname.indexOf('/en/') !== 0) return;
      var rel = u.pathname.slice(4) || 'index.html';
      if (/\/$/.test(rel)) rel += 'index.html';
      if (pages.indexOf(rel) === -1) a.setAttribute('href', u.pathname.slice(3) + u.search + u.hash);
    } catch (e) { /* endereço inválido: deixa como está */ }
  }
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentNode && !skip(root.parentNode)) textNode(root); return; }
    if (root.nodeType !== 1 || skip(root)) return;
    attrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeType === 1 && (SKIP[n.tagName] || n.getAttribute('translate') === 'no') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    for (var n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) textNode(n); else attrs(n); }
  }

  var busy = false;
  var mo = new MutationObserver(function (list) {
    if (busy) return;
    busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'childList') for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        else if (m.type === 'characterData') { if (m.target.parentNode && !skip(m.target.parentNode)) textNode(m.target); }
        else if (m.type === 'attributes' && m.target.nodeType === 1 && !skip(m.target)) attrs(m.target);
      }
    } finally { busy = false; }
  });
  function start() {
    walk(document.body);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS.concat(['href']) });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  // título da aba trocado pelo JavaScript
  var title = document.querySelector('title');
  if (title) new MutationObserver(function () { var r = t(document.title); if (r != null && r !== document.title) document.title = r; }).observe(title, { childList: true });
})();
