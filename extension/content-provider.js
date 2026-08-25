/**
 * Content-Script auf den Chat-Anbieter-Seiten (ChatGPT, Claude, Gemini, …).
 * Tut NICHTS von selbst — keine Beobachtung, kein automatischer Versand.
 * Wird nur aktiv, wenn das Popup ("Chat holen"-Knopf) eine Nachricht
 * schickt. Dieselbe Scroll-und-Extrahier-Logik wie im Lesezeichen-Skript
 * (tools/bookmarklet-import.js) — anbieterunabhängig, sucht den
 * Gesprächsbereich per Heuristik statt über feste CSS-Klassen, und
 * unterscheidet ihn bewusst von einer schmalen Chat-Listen-Seitenleiste.
 */
(function () {
  'use strict';

  var MAX_STABLE = 5;
  var MAX_ITER = 90;
  var DELAY_MS = 500;

  var PLATFORM_MAP = [
    { host: 'chatgpt.com', id: 'chatgpt' },
    { host: 'chat.openai.com', id: 'chatgpt' },
    { host: 'claude.ai', id: 'claude' },
    { host: 'gemini.google.com', id: 'gemini' },
    { host: 'chat.deepseek.com', id: 'deepseek' },
    { host: 'grok.com', id: 'grok' },
  ];

  function detectModelId() {
    var h = location.hostname.toLowerCase();
    for (var i = 0; i < PLATFORM_MAP.length; i++) {
      if (h === PLATFORM_MAP[i].host || h.endsWith('.' + PLATFORM_MAP[i].host)) return PLATFORM_MAP[i].id;
    }
    return '';
  }

  function findScrollable() {
    var candidates = [];
    var all = document.querySelectorAll('*');
    var minWidth = Math.min(480, window.innerWidth * 0.4);
    var minHeight = window.innerHeight * 0.5;
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var cs;
      try { cs = getComputedStyle(el); } catch (e) { continue; }
      if (!/(auto|scroll)/.test(cs.overflowY)) continue;
      if (el.clientHeight < minHeight) continue; // zu kurz -> vermutlich Code-/Widget-Kasten
      if (el.clientWidth < minWidth) continue;   // zu schmal -> vermutlich Seitenleiste
      candidates.push(el);
    }
    if (!candidates.length) return document.scrollingElement || document.documentElement;
    candidates = candidates.filter(function (el) {
      return !candidates.some(function (other) { return other !== el && other.contains(el); });
    });
    candidates.sort(function (a, b) {
      return (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight);
    });
    return candidates[0];
  }

  function extractText(container) {
    var raw = container.innerText || container.textContent || '';
    return raw.replace(/\n{3,}/g, '\n\n').trim();
  }

  /** @returns {Promise<{text:string, modelId:string}>} */
  function grabChat() {
    return new Promise(function (resolve) {
      var container = findScrollable();
      var lastHeight = -1, stableCount = 0, iter = 0;

      function tick() {
        container.scrollTop = 0;
        var h = container.scrollHeight;
        if (h === lastHeight) stableCount++; else stableCount = 0;
        lastHeight = h;
        iter++;

        if (stableCount >= MAX_STABLE || iter >= MAX_ITER) {
          resolve({ text: extractText(container), modelId: detectModelId() });
        } else {
          setTimeout(tick, DELAY_MS);
        }
      }
      tick();
    });
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg && msg.type === 'GRAB_CHAT') {
      grabChat().then(sendResponse);
      return true; // asynchrone Antwort
    }
  });
})();
