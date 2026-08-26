/**
 * Postet einen Text-Beitrag auf Reddit über die offizielle API (OAuth
 * "password"-Grant, wie es Reddit für Skript-Apps vorsieht). Zugangsdaten
 * kommen ausschliesslich aus .reddit-credentials (gitignored, nie im Repo,
 * nie im Chat) -- dieses Skript gibt sie nirgends aus.
 *
 * Einrichtung: reddit.com/prefs/apps -> "create app" -> Typ "script" ->
 * Client-ID/Secret in .reddit-credentials eintragen (Vorlage:
 * .reddit-credentials.example).
 *
 * Aufruf:
 *   node tools/reddit-post.mjs --subreddit SideProject \
 *     --title "..." --body-file pfad/zum/text.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CRED_FILE = path.join(HERE, '..', '.reddit-credentials');

function parseArgs(argv){
  const out = {};
  for (let i = 0; i < argv.length; i++){
    if (argv[i].startsWith('--')){
      const key = argv[i].slice(2);
      out[key] = argv[i + 1];
      i++;
    }
  }
  return out;
}

function loadCredentials(){
  if (!fs.existsSync(CRED_FILE)){
    throw new Error(`Zugangsdaten fehlen: ${CRED_FILE} nicht gefunden. Siehe .reddit-credentials.example.`);
  }
  const raw = fs.readFileSync(CRED_FILE, 'utf8');
  const creds = {};
  for (const line of raw.split('\n')){
    const m = line.match(/^(\w+)=(.*)$/);
    if (m) creds[m[1]] = m[2].trim();
  }
  for (const key of ['CLIENT_ID', 'CLIENT_SECRET', 'USERNAME', 'PASSWORD']){
    if (!creds[key]) throw new Error(`${key} fehlt in .reddit-credentials`);
  }
  return creds;
}

async function getAccessToken(creds){
  const basic = Buffer.from(`${creds.CLIENT_ID}:${creds.CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'promptpeter-journal-poster/1.0 (by /u/' + creds.USERNAME + ')',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: creds.USERNAME,
      password: creds.PASSWORD,
    }),
  });
  const json = await res.json();
  if (!json.access_token){
    throw new Error('Kein Access-Token erhalten: ' + JSON.stringify(json));
  }
  return json.access_token;
}

async function submitPost({ token, username, subreddit, title, text }){
  const res = await fetch('https://oauth.reddit.com/api/submit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'promptpeter-journal-poster/1.0 (by /u/' + username + ')',
    },
    body: new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title,
      text,
      api_type: 'json',
    }),
  });
  const json = await res.json();
  const errors = json?.json?.errors;
  if (errors && errors.length){
    throw new Error('Reddit lehnte den Post ab: ' + JSON.stringify(errors));
  }
  return json?.json?.data;
}

const args = parseArgs(process.argv.slice(2));
if (!args.subreddit || !args.title || !args['body-file']){
  console.error('Aufruf: node tools/reddit-post.mjs --subreddit NAME --title "..." --body-file pfad.txt');
  process.exit(1);
}

const body = fs.readFileSync(args['body-file'], 'utf8');
const creds = loadCredentials();
const token = await getAccessToken(creds);
const data = await submitPost({
  token,
  username: creds.USERNAME,
  subreddit: args.subreddit,
  title: args.title,
  text: body,
});

console.log('Gepostet: ' + JSON.stringify(data, null, 2));
