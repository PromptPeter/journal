/**
 * Lesezeichen-Skript "Chat holen" — läuft nur, wenn manuell angeklickt,
 * nie im Hintergrund, keine Installation, kein gespeicherter Zugang.
 *
 * Zweck: Auf einer beliebigen Chat-Seite (ChatGPT, Gemini, Claude, …), bei
 * der man bereits selbst eingeloggt ist, automatisch bis zum Anfang des
 * Verlaufs hochscrollen (damit nachgeladene, virtualisierte alte
 * Nachrichten überhaupt im DOM erscheinen) und danach den sichtbaren Text
 * in die Zwischenablage kopieren — bereit zum Einfügen im Journal
 * ("Chat einfügen"-Dialog).
 *
 * Bewusst NICHT anbieterspezifisch: sucht den am stärksten scrollbaren
 * Container per Heuristik statt über feste CSS-Klassen eines Anbieters.
 * Bricht dadurch nicht bei jedem UI-Update — anders als eine Extension,
 * die auf feste Selektoren angewiesen wäre.
 *
 * Einschränkung, ehrlich benannt: kann nicht gegen die echten Anbieter-
 * Seiten getestet werden (kein Browser-Zugriff hier). Funktioniert die
 * Heuristik bei einem Anbieter nicht zuverlässig, bitte Rückmeldung geben
 * (was kam beim Einfügen an?), dann wird hier nachgeschärft.
 *
 * Verwendung: Diese Datei minifizieren/als javascript:-URL einbetten und
 * als Lesezeichen ablegen (der Link im Journal, "Chat einfügen"-Dialog,
 * macht das automatisch — zum Lesezeichen-Leiste ziehen).
 */
(function () {
  'use strict';

  var MAX_STABLE = 3;      // so oft hintereinander unverändert, bevor wir aufhören
  var MAX_ITER = 60;       // Notbremse gegen Endlosschleifen
  var DELAY_MS = 400;      // Wartezeit zwischen Scroll-Versuchen (Nachladen braucht Zeit)

  /**
   * Sucht den Chat-Scrollbereich. Erst nach echten Scroll-Containern
   * filtern (overflow-y: auto/scroll, ausreichend groß) — NICHT einfach
   * nach dem größten aktuellen Überlauf, denn der kann im Moment des
   * Klicks noch klein sein, wenn ältere Nachrichten erst beim Scrollen
   * selbst nachgeladen werden (genau der Fall, den dieses Skript lösen
   * soll). Unter den echten Kandidaten dann den mit dem meisten Inhalt.
   */
  function findScrollable() {
    var candidates = [];
    var all = document.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var cs;
      try { cs = getComputedStyle(el); } catch (e) { continue; }
      if (!/(auto|scroll)/.test(cs.overflowY)) continue;
      if (el.clientHeight < 100) continue; // zu klein fuer den Hauptbereich
      candidates.push(el);
    }
    if (!candidates.length) return document.scrollingElement || document.documentElement;
    candidates.sort(function (a, b) {
      return (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight);
    });
    return candidates[0];
  }

  function showBanner(msg, isError) {
    var b = document.createElement('div');
    b.textContent = msg;
    b.style.cssText = 'position:fixed;top:16px;right:16px;z-index:2147483647;' +
      'background:' + (isError ? '#7a1f1f' : '#111') + ';color:#fff;padding:10px 16px;' +
      'border-radius:8px;font:14px/1.4 -apple-system,Segoe UI,sans-serif;' +
      'box-shadow:0 4px 16px rgba(0,0,0,.35);max-width:340px';
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 5000);
  }

  function copyOrPrompt(text) {
    if (!text || !text.trim()) {
      showBanner('Kein Text gefunden — bitte manuell markieren und kopieren.', true);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showBanner('✓ ' + text.length + ' Zeichen kopiert — zurück zum Journal wechseln und in "Chat einfügen" einfügen.');
        },
        function () {
          window.prompt('Kopieren automatisch fehlgeschlagen — Text ist unten markiert, Strg+C drücken:', text);
        }
      );
    } else {
      window.prompt('Text manuell kopieren (Strg+C):', text);
    }
  }

  function extractAndCopy(container) {
    var raw = container.innerText || container.textContent || '';
    var cleaned = raw.replace(/\n{3,}/g, '\n\n').trim();
    copyOrPrompt(cleaned);
  }

  function run() {
    var container = findScrollable();
    var lastHeight = -1, stableCount = 0, iter = 0;

    showBanner('Lade vollständigen Verlauf … bitte kurz warten.');

    function tick() {
      container.scrollTop = 0; // ganz nach oben -> ältere Nachrichten laden nach
      var h = container.scrollHeight;
      if (h === lastHeight) stableCount++; else stableCount = 0;
      lastHeight = h;
      iter++;

      if (stableCount >= MAX_STABLE || iter >= MAX_ITER) {
        extractAndCopy(container);
      } else {
        setTimeout(tick, DELAY_MS);
      }
    }
    tick();
  }

  run();
})();
