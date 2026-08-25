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

  var MAX_STABLE = 5;      // so oft hintereinander unverändert, bevor wir aufhören
  var MAX_ITER = 90;       // Notbremse gegen Endlosschleifen
  var DELAY_MS = 500;      // Wartezeit zwischen Scroll-Versuchen (Nachladen braucht Zeit)

  /**
   * Sucht den Chat-Scrollbereich — NICHT die Chat-Liste in einer
   * Seitenleiste und NICHT den internen Scroll-Kasten eines einzelnen
   * Code-Blocks. Alle drei sind oft "overflow-y: auto", aber:
   *
   *   - eine Seitenleiste ist SCHMAL (Chat-Titel brauchen wenig Breite)
   *   - ein Code-Block-Kasten ist KURZ (auch ein langer Codeblock bleibt
   *     meist auf ein paar hundert Pixel begrenzt, nie die volle
   *     Fensterhoehe -- am 25.08.2026 an einem echten DeepSeek-Export
   *     beobachtet: das Skript kopierte nur reinen Code, keinen
   *     Gespraechstext, weil der Code-Kasten "gewann")
   *   - ein Code-Block-Kasten liegt zudem meist INNERHALB des eigentlichen
   *     Gespraechsbereichs, nie daneben
   *
   * Deshalb dreistufig: erst nach echten Scroll-Containern filtern
   * (overflow-y: auto/scroll), Mindestbreite verlangen (schliesst
   * Seitenleisten aus) UND Mindesthoehe relativ zum Fenster verlangen
   * (schliesst Code-Kaesten aus). Liegt ein Kandidat innerhalb eines
   * anderen, zaehlt nur der aeussere -- der eigentliche Gespraechsbereich
   * umschliesst ja alles Weitere, auch einen internen Code-Scroller.
   * Unter den verbliebenen dann die groesste Flaeche waehlen -- NICHT
   * einfach den groessten aktuellen Ueberlauf, denn der kann im Moment
   * des Klicks noch klein sein, wenn aeltere Nachrichten erst beim
   * Scrollen selbst nachgeladen werden (genau der Fall, den dieses
   * Skript loesen soll).
   */
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
    // Kandidaten, die innerhalb eines anderen Kandidaten liegen, verwerfen --
    // nur den jeweils aeussersten behalten.
    candidates = candidates.filter(function (el) {
      return !candidates.some(function (other) { return other !== el && other.contains(el); });
    });
    candidates.sort(function (a, b) {
      return (b.clientWidth * b.clientHeight) - (a.clientWidth * a.clientHeight);
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
