/**
 * Content-Script auf der Journal-Seite selbst. Läuft in einer eigenen,
 * isolierten JS-Welt (Chrome-Vorgabe für Content-Scripts) und kann die
 * Funktionen der echten Seite (index.html) deshalb nicht direkt
 * aufrufen — window.postMessage() ist die dafür vorgesehene Brücke.
 * Die Seite selbst hört darauf (siehe index.html, Handler für
 * 'okf-import-chat').
 */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg && msg.type === 'DELIVER_CHAT') {
    window.postMessage({ type: 'okf-import-chat', text: msg.text, modelId: msg.modelId }, '*');
    sendResponse({ ok: true });
  }
});
