/**
 * Steuert den ganzen Ablauf, solange das Popup offen ist — kein
 * Hintergrunddienst nötig, ein offenes Popup hat dieselben Rechte.
 * Ablauf: aktiver Tab -> Chat holen (Content-Script scrollt+extrahiert)
 * -> offener Journal-Tab? -> dorthin liefern, sonst in die
 * Zwischenablage kopieren.
 */
const grabBtn = document.getElementById('grab');
const statusEl = document.getElementById('status');
const hintEl = document.getElementById('hint');

const PROVIDER_HOSTS = [
  'chatgpt.com', 'chat.openai.com', 'claude.ai',
  'gemini.google.com', 'chat.deepseek.com', 'grok.com',
];

function isProviderUrl(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return PROVIDER_HOSTS.some(host => h === host || h.endsWith('.' + host));
  } catch { return false; }
}

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

async function findJournalTab() {
  const tabs = await chrome.tabs.query({ url: 'file:///*' });
  return tabs.find(t => /index\.html?$/i.test(t.url || '')) || null;
}

async function init() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab && isProviderUrl(activeTab.url)) {
    grabBtn.disabled = false;
    hintEl.textContent = 'Bereit — scrollt automatisch bis zum Verlaufsanfang und holt den ganzen Chat.';
  } else {
    hintEl.textContent = 'Diese Seite wird nicht erkannt. Geh zu ChatGPT, Claude, Gemini, DeepSeek oder Grok.';
  }
}

grabBtn.addEventListener('click', async () => {
  grabBtn.disabled = true;
  setStatus('Lade vollständigen Verlauf … bitte kurz warten.');

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(activeTab.id, { type: 'GRAB_CHAT' });

    if (!result || !result.text) {
      setStatus('Kein Text gefunden — bitte auf der Chat-Seite prüfen.', 'err');
      grabBtn.disabled = false;
      return;
    }

    const journalTab = await findJournalTab();
    if (journalTab) {
      await chrome.tabs.sendMessage(journalTab.id, {
        type: 'DELIVER_CHAT', text: result.text, modelId: result.modelId,
      });
      setStatus(`✓ ${result.text.length} Zeichen ans Journal geliefert.`, 'ok');
    } else {
      await navigator.clipboard.writeText(result.text);
      setStatus(`✓ ${result.text.length} Zeichen kopiert — kein offener Journal-Tab gefunden, im "Chat einfügen"-Dialog einfügen.`, 'ok');
    }
  } catch (e) {
    setStatus('Fehlgeschlagen: ' + (e && e.message ? e.message : 'unbekannter Fehler'), 'err');
  }
  grabBtn.disabled = false;
});

init();
