const imageTiles = { bologna: "tile-bologna", florence: "tile-florence", venice: "tile-venice", rome: "tile-rome" };
const memories = [
  { id: "bologna-morning", title: "Una mattina sotto i portici", place: "Bologna", country: "Italia", date: "12 giugno 2025", year: 2025, lat: 44.4949, lon: 11.3426, type: "moments", typeLabel: "MOMENTO DI VITA", tile: "bologna", description: "La pioggia si è fermata da poco. Camminare senza fretta, riconoscere la luce, sentirsi a casa in una città che continua a sorprenderti.", coordinates: "44.4949, 11.3426", icon: "✳" },
  { id: "florence-portrait", title: "La stanza dei ritratti", place: "Firenze", country: "Italia", date: "28 maggio 2025", year: 2025, lat: 43.7696, lon: 11.2558, type: "art", typeLabel: "OPERA D'ARTE", tile: "florence", description: "Un ritratto immaginario, una luce quieta. Davanti a un'opera, il tempo si ferma e lascia spazio a una domanda che ti accompagna fuori dal museo.", coordinates: "43.7696, 11.2558", icon: "◈", artwork: "Ritratto della luce · opera dimostrativa" },
  { id: "venice-return", title: "L'acqua trattiene la sera", place: "Venezia", country: "Italia", date: "16 aprile 2025", year: 2025, lat: 45.4408, lon: 12.3155, type: "places", typeLabel: "LUOGO", tile: "venice", description: "Un canale quasi vuoto all'ora blu. Tornare nello stesso posto permette di notare ciò che prima era passato inosservato.", coordinates: "45.4408, 12.3155", icon: "⌖" },
  { id: "rome-square", title: "Una pausa in piazza", place: "Roma", country: "Italia", date: "10 marzo 2025", year: 2025, lat: 41.9028, lon: 12.4964, type: "moments", typeLabel: "MOMENTO DI VITA", tile: "rome", description: "Sedersi per qualche minuto, guardare la città muoversi attorno. Un frammento ordinario che, rivedendolo, diventa una piccola svolta.", coordinates: "41.9028, 12.4964", icon: "✳" },
  { id: "paris-gallery", title: "Un incontro con la pittura", place: "Parigi", country: "Francia", date: "03 novembre 2024", year: 2024, lat: 48.8606, lon: 2.3376, type: "art", typeLabel: "OPERA D'ARTE", tile: "florence", description: "Un dipinto antico, una visita senza programma. La memoria conserva la sensazione prima ancora del nome dell'opera.", coordinates: "48.8606, 2.3376", icon: "◈", artwork: "Studio di colore · ricordo personale" },
  { id: "kyoto-temple", title: "Il giardino prima dell'alba", place: "Kyoto", country: "Giappone", date: "21 settembre 2023", year: 2023, lat: 35.0116, lon: 135.7681, type: "places", typeLabel: "LUOGO", tile: "bologna", description: "Passi lenti tra pietra, muschio e silenzio. Un luogo visitato che diventa una soglia tra il viaggio e il ritorno.", coordinates: "35.0116, 135.7681", icon: "⌖" },
  { id: "new-york-night", title: "La città che non si ferma", place: "New York", country: "Stati Uniti", date: "08 agosto 2022", year: 2022, lat: 40.7128, lon: -74.006, type: "moments", typeLabel: "MOMENTO DI VITA", tile: "rome", description: "Una camminata notturna dopo una giornata lunga. Le luci, la stanchezza e la sensazione di poter ricominciare da capo.", coordinates: "40.7128, -74.0060", icon: "✳" },
  { id: "venice-craft", title: "Materia e memoria", place: "Venezia", country: "Italia", date: "19 giugno 2019", year: 2019, lat: 45.433, lon: 12.338, type: "art", typeLabel: "OPERA D'ARTE", tile: "venice", description: "Un oggetto artigianale visto in una piccola bottega. La sua forma richiama una storia ascoltata da bambina.", coordinates: "45.4330, 12.3380", icon: "◈", artwork: "Forma lagunare · oggetto artigianale" }
];

const embeddedPhotoData = document.querySelector("#embedded-photo-data");
const demoPhotoPlaces = [
  { name: "Roma", country: "Italia", lat: 41.9028, lon: 12.4964 },
  { name: "Parigi", country: "Francia", lat: 48.8566, lon: 2.3522 },
  { name: "Londra", country: "Regno Unito", lat: 51.5072, lon: -0.1276 },
  { name: "Reykjavík", country: "Islanda", lat: 64.1466, lon: -21.9426 },
  { name: "New York", country: "Stati Uniti", lat: 40.7128, lon: -74.0060 },
  { name: "Città del Messico", country: "Messico", lat: 19.4326, lon: -99.1332 },
  { name: "Rio de Janeiro", country: "Brasile", lat: -22.9068, lon: -43.1729 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Marrakech", country: "Marocco", lat: 31.6295, lon: -7.9811 },
  { name: "Il Cairo", country: "Egitto", lat: 30.0444, lon: 31.2357 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Città del Capo", country: "Sudafrica", lat: -33.9249, lon: 18.4241 },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777 },
  { name: "Bangkok", country: "Thailandia", lat: 13.7563, lon: 100.5018 },
  { name: "Tokyo", country: "Giappone", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 }
];
if (embeddedPhotoData) {
  const photos = JSON.parse(embeddedPhotoData.textContent || "[]");
  memories.unshift(...photos.map((photo, index) => {
    const place = demoPhotoPlaces[index % demoPhotoPlaces.length];
    return {
      ...photo,
      place: place.name,
      country: place.country,
      lat: place.lat,
      lon: place.lon,
      coordinates: `${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}`,
      demoPlace: place.name,
      description: `Foto di prova collocata a ${place.name}, ${place.country} per questa demo. La posizione è assegnata, non è il GPS dello scatto.`,
      locationSource: "demo-globe"
    };
  }));
}

const landPolygons = [
  [[-168,70],[-150,60],[-135,58],[-128,50],[-124,42],[-117,32],[-108,24],[-98,18],[-90,20],[-83,9],[-77,8],[-80,25],[-97,29],[-105,38],[-117,49],[-127,55],[-140,61],[-154,66]],
  [[-81,12],[-72,10],[-66,3],[-58,-5],[-51,-1],[-48,-12],[-53,-23],[-58,-35],[-67,-55],[-74,-48],[-77,-30],[-81,-10]],
  [[-11,72],[4,71],[24,68],[37,59],[31,53],[40,48],[31,43],[28,37],[18,34],[11,39],[4,43],[-2,47],[-8,55],[-14,62]],
  [[-17,36],[-7,35],[4,36],[11,33],[20,31],[31,31],[35,22],[42,12],[50,5],[42,-12],[35,-25],[26,-34],[17,-35],[11,-27],[5,-12],[-1,4],[-9,14],[-16,25]],
  [[34,70],[53,70],[70,63],[90,70],[110,64],[130,57],[146,49],[160,58],[178,54],[170,42],[158,35],[145,42],[131,34],[120,23],[111,8],[103,0],[95,9],[86,20],[72,25],[61,31],[48,40],[39,50]],
  [[67,25],[78,29],[88,22],[91,12],[81,7],[75,14]],
  [[112,-11],[130,-10],[145,-17],[153,-27],[146,-39],[132,-44],[116,-35],[113,-23]],
  [[-24,64],[-14,65],[-13,59],[-20,58]],
  [[47,-13],[51,-16],[49,-25],[44,-23]]
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let activeFilter = "all";
let selectedId = memories[0].id;
let rotation = -12;
let pitch = 8;
let zoom = 1;
let dragging = false;
let previousPointer = null;
let hitTargets = [];
let toastTimeout;
let ledger = readLedger();
const importedPhotoUrls = new Set();
let importedPhotoCount = 0;
let googleAccessToken = null;
let activePickerSession = null;
const rangeEnd = new Date();
const rangeStart = new Date(rangeEnd);
rangeStart.setDate(rangeStart.getDate() - 7);

function rangeDate(date) { return date.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(); }
function inImportRange(date) { return date instanceof Date && !Number.isNaN(date.valueOf()) && date >= rangeStart && date <= rangeEnd; }
function photoRoute() { return memories.filter((item) => (item.isPhoto || item.isDemoPhoto) && (item.hasGps || item.isDemoPhoto || item.locationSource === "demo-rome") && (item.isDemoPhoto || inImportRange(item.capturedAt))).sort((a, b) => a.capturedAt - b.capturedAt); }

const demoRomeStops = [
  { name: "Colosseo", lat: 41.8902, lon: 12.4922 },
  { name: "Foro Romano", lat: 41.8925, lon: 12.4853 },
  { name: "Piazza Venezia", lat: 41.8955, lon: 12.4823 },
  { name: "Pantheon", lat: 41.8986, lon: 12.4769 },
  { name: "Fontana di Trevi", lat: 41.9009, lon: 12.4833 },
  { name: "Piazza Navona", lat: 41.8992, lon: 12.4731 }
];

function demoRomeAssignments(items) {
  const byDay = new Map();
  for (const item of items) {
    const day = new Date(item.createTime).toLocaleDateString("sv-SE");
    byDay.set(day, [...(byDay.get(day) || []), item]);
  }
  const dominantDay = [...byDay.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  if (!dominantDay || dominantDay[1].length < Math.max(4, Math.ceil(items.length * 0.65))) return new Map();
  const dayItems = dominantDay[1].sort((a, b) => new Date(a.createTime) - new Date(b.createTime));
  const first = new Date(dayItems[0].createTime).valueOf();
  const last = new Date(dayItems.at(-1).createTime).valueOf();
  return new Map(dayItems.map((item, index) => {
    const progress = last > first ? (new Date(item.createTime).valueOf() - first) / (last - first) : index / Math.max(1, dayItems.length - 1);
    const stop = demoRomeStops[Math.min(demoRomeStops.length - 1, Math.floor(progress * demoRomeStops.length))];
    return [item.id, stop];
  }));
}

function readLedger() {
  try { return JSON.parse(localStorage.getItem("archetype-demo-ledger") || "[]"); }
  catch { return []; }
}

function persistLedger() {
  try { localStorage.setItem("archetype-demo-ledger", JSON.stringify(ledger)); }
  catch { notify("Registro disponibile solo per questa sessione del browser"); }
}

function normalizedName(value) {
  return String(value || "").split(/[\\/]/).pop().toLocaleLowerCase("it").replace(/\.supplemental-metadata\.json$/i, "").replace(/\.json$/i, "");
}

function dateFromMetadata(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "object") value = value.timestamp || value.formatted || value.date || "";
  const text = String(value);
  const numeric = Number(text);
  const date = Number.isFinite(numeric) && /^\d{9,13}$/.test(text) ? new Date(text.length > 10 ? numeric : numeric * 1000) : new Date(text);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function validCoordinates(latitude, longitude) {
  const lat = Number(latitude); const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || (lat === 0 && lon === 0)) return null;
  return { lat, lon };
}

function sidecarCoordinates(metadata) {
  const location = metadata?.geoDataExif || metadata?.geoData || metadata?.location || {};
  return validCoordinates(location.latitude ?? location.lat, location.longitude ?? location.lon);
}

function parseJpegExif(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return {};
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break;
    const length = view.getUint16(offset + 2);
    if (length < 2 || offset + 2 + length > view.byteLength) break;
    const dataStart = offset + 4;
    if (marker === 0xe1 && length >= 10 && String.fromCharCode(...new Uint8Array(buffer, dataStart, 6)) === "Exif\0\0") {
      return parseTiffExif(view, dataStart + 6, dataStart + length - 2);
    }
    offset += 2 + length;
  }
  return {};
}

function parseTiffExif(view, base, end) {
  if (base + 8 > end) return {};
  const byteOrder = view.getUint16(base);
  const little = byteOrder === 0x4949;
  if (!little && byteOrder !== 0x4d4d) return {};
  const safe16 = (offset) => offset + 2 <= end ? view.getUint16(offset, little) : 0;
  const safe32 = (offset) => offset + 4 <= end ? view.getUint32(offset, little) : 0;
  if (safe16(base + 2) !== 42) return {};

  function readIfd(relativeOffset) {
    const start = base + relativeOffset;
    if (start + 2 > end) return new Map();
    const count = Math.min(safe16(start), 512);
    const tags = new Map();
    for (let index = 0; index < count; index++) {
      const entry = start + 2 + index * 12;
      if (entry + 12 > end) break;
      const tag = safe16(entry); const type = safe16(entry + 2); const items = safe32(entry + 4);
      const unit = ({1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8})[type] || 0;
      const byteLength = unit * items;
      const valueStart = byteLength <= 4 ? entry + 8 : base + safe32(entry + 8);
      tags.set(tag, { type, items, valueStart });
    }
    return tags;
  }

  function ascii(tags, tag) {
    const item = tags.get(tag);
    if (!item || item.type !== 2 || item.valueStart >= end) return "";
    const limit = Math.min(end, item.valueStart + item.items);
    let value = "";
    for (let cursor = item.valueStart; cursor < limit; cursor++) {
      const code = view.getUint8(cursor);
      if (!code) break;
      value += String.fromCharCode(code);
    }
    return value.trim();
  }

  function rationals(tags, tag) {
    const item = tags.get(tag);
    if (!item || item.type !== 5 || item.items < 3 || item.valueStart + 24 > end) return null;
    const result = [];
    for (let index = 0; index < 3; index++) {
      const numerator = safe32(item.valueStart + index * 8);
      const denominator = safe32(item.valueStart + index * 8 + 4);
      result.push(denominator ? numerator / denominator : 0);
    }
    return result;
  }

  const ifd0 = readIfd(safe32(base + 4));
  const exifPointer = ifd0.get(0x8769);
  const gpsPointer = ifd0.get(0x8825);
  const exifIfd = exifPointer ? readIfd(safe32(exifPointer.valueStart)) : new Map();
  const gpsIfd = gpsPointer ? readIfd(safe32(gpsPointer.valueStart)) : new Map();
  const date = ascii(exifIfd, 0x9003) || ascii(ifd0, 0x0132);
  let capturedAt = date ? new Date(date.replace(/^([0-9]{4}):([0-9]{2}):([0-9]{2})/, "$1-$2-$3").replace(/ /, "T")) : null;
  if (capturedAt && Number.isNaN(capturedAt.valueOf())) capturedAt = null;
  const latParts = rationals(gpsIfd, 2); const lonParts = rationals(gpsIfd, 4);
  let coordinates = null;
  if (latParts && lonParts) {
    let lat = latParts[0] + latParts[1] / 60 + latParts[2] / 3600;
    let lon = lonParts[0] + lonParts[1] / 60 + lonParts[2] / 3600;
    if (ascii(gpsIfd, 1).toUpperCase().startsWith("S")) lat *= -1;
    if (ascii(gpsIfd, 3).toUpperCase().startsWith("W")) lon *= -1;
    coordinates = validCoordinates(lat, lon);
  }
  return { capturedAt, coordinates, cameraMake: ascii(ifd0, 0x010f), cameraModel: ascii(ifd0, 0x0110) };
}

function updateImportDateLabels() {
  $("#range-start").textContent = rangeDate(rangeStart);
  $("#range-end").textContent = rangeDate(rangeEnd);
  $("#import-window-label").textContent = `${rangeDate(rangeStart)} — ${rangeDate(rangeEnd)}`;
  $("#import-status").textContent = `Foto non ancora importate · intervallo ${rangeDate(rangeStart)} – ${rangeDate(rangeEnd)}`;
}

async function importPhotoFiles(fileList) {
  const files = [...fileList];
  const sidecars = new Map();
  for (const file of files.filter((item) => item.name.toLocaleLowerCase("it").endsWith(".json"))) {
    try {
      const metadata = JSON.parse(await file.text());
      const key = normalizedName(metadata.title || metadata.originalFilename || file.name);
      sidecars.set(key, metadata);
    } catch { /* Le immagini senza sidecar possono comunque contenere EXIF. */ }
  }

  const imageFiles = files.filter((file) => /^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
  let added = 0; let outOfRange = 0; let missingDate = 0; let missingGps = 0; let nonCamera = 0;
  for (const file of imageFiles) {
    const sidecar = sidecars.get(normalizedName(file.name));
    let exif = {};
    if (/\.(jpe?g)$/i.test(file.name) || file.type === "image/jpeg") {
      try { exif = parseJpegExif(await file.arrayBuffer()); } catch { exif = {}; }
    }
    const capturedAt = dateFromMetadata(sidecar?.photoTakenTime || sidecar?.creationTime || sidecar?.date) || exif.capturedAt;
    if (!capturedAt) { missingDate++; continue; }
    if (!inImportRange(capturedAt)) { outOfRange++; continue; }
    if (!(exif.cameraMake || exif.cameraModel || sidecar?.cameraMake || sidecar?.cameraModel)) { nonCamera++; continue; }
    const coordinates = sidecarCoordinates(sidecar) || exif.coordinates;
    const imageUrl = URL.createObjectURL(file);
    importedPhotoUrls.add(imageUrl);
    const title = String(sidecar?.title || file.name.replace(/\.[^.]+$/, "")).replace(/\s*\(\d+\)$/, "");
    const memory = {
      id: `photo-${Date.now()}-${added}-${Math.random().toString(16).slice(2, 6)}`,
      title, place: coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}` : "Luogo non geolocalizzato",
      country: "Foto personale", date: capturedAt.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }),
      year: capturedAt.getFullYear(), lat: coordinates?.lat ?? null, lon: coordinates?.lon ?? null,
      type: "moments", typeLabel: coordinates ? "FOTO GEOLOCALIZZATA" : "FOTO · GPS ASSENTE",
      tile: "bologna", description: sidecar?.description || "Foto importata localmente. Il file originale non è stato modificato.",
      coordinates: coordinates ? `${coordinates.lat.toFixed(5)}, ${coordinates.lon.toFixed(5)}` : null,
      icon: "▧", isPhoto: true, hasGps: Boolean(coordinates), capturedAt, imageUrl, originalName: file.name
    };
    memories.unshift(memory);
    if (coordinates) added++; else missingGps++;
  }

  activeFilter = "all";
  $$('[data-filter]').forEach((button) => button.classList.toggle("filter-active", button.dataset.filter === "all"));
  const result = $("#import-result");
  const imageTotal = imageFiles.length;
  if (!imageTotal) {
    result.className = "import-result warning";
    result.textContent = "Non ho trovato immagini. Seleziona file JPG/HEIC e, se disponibili, i corrispondenti JSON di Google Takeout.";
  } else {
    result.className = `import-result ${added ? "success" : "warning"}`;
    result.textContent = `${added + missingGps} scatti fotocamera nell'intervallo · ${added} con GPS in rotta · ${missingGps} senza GPS · ${nonCamera} non riconosciute come fotocamera · ${outOfRange} fuori intervallo.`;
    $("#import-status").textContent = `${added + missingGps} foto importate · ${added} geolocalizzate · ${rangeDate(rangeStart)} – ${rangeDate(rangeEnd)}`;
  }
  importedPhotoCount = memories.filter((item) => item.isPhoto && inImportRange(item.capturedAt)).length;
  renderList(); renderMemoryCards(); renderLedger();
  const selected = memories.find((item) => item.isPhoto && item.hasGps && inImportRange(item.capturedAt));
  if (selected) selectMemory(selected.id);
  if (added) notify(`${added} foto aggiunte al globo e alla rotta`);
}

function setPickerStatus(message, tone = "") {
  const result = $("#import-result");
  result.className = `import-result ${tone}`.trim();
  result.textContent = message;
}

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]');
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Non riesco a caricare Google Identity Services.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.googleIdentity = "true";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Non riesco a caricare Google Identity Services."));
    document.head.append(script);
  });
}

function requestPhotosToken(clientId) {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/photospicker.mediaitems.readonly",
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || "Autorizzazione Google non completata."));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) => reject(new Error(error.message || "La finestra di autorizzazione Google è stata chiusa."))
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}

async function photosApi(path, token, init = {}) {
  const response = await fetch(`https://photospicker.googleapis.com/v1/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message || `Google Photos Picker ha risposto ${response.status}.`);
  }
  return response.status === 204 ? null : response.json();
}

async function beginPhotosPicker(clientId) {
  if (!/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    setPickerStatus("Il Client ID non sembra un OAuth Client ID Web valido.", "warning");
    return;
  }
  if (location.protocol !== "http:" || !["localhost", "127.0.0.1"].includes(location.hostname)) {
    setPickerStatus("Apri la demo su http://localhost:4173/experience.html: Google OAuth non accetta l’origine file://.", "warning");
    return;
  }
  $("#google-config-dialog").close();
  $("#photo-import-dialog").showModal();
  if (!window.google?.accounts?.oauth2) {
    $("#google-auth-status").textContent = "Google Identity Services non è pronto. Attendi il messaggio SDK pronto e premi di nuovo il pulsante.";
    return;
  }
  setPickerStatus("Richiedo il permesso limitato ai soli media selezionati nel Picker…");
  try {
    googleAccessToken = await requestPhotosToken(clientId);
    const session = await photosApi("sessions", googleAccessToken, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    activePickerSession = { id: session.id, uri: `${session.pickerUri.replace(/\/$/, "")}/autoclose`, token: googleAccessToken };
    $("#picker-state").textContent = "PRONTO";
    setPickerStatus("Seleziona in Google Foto gli scatti dell’intervallo indicato. Al rientro, controllo data e GPS EXIF.", "success");
    const link = document.createElement("a");
    link.href = activePickerSession.uri;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "picker-launch-link";
    link.textContent = "Apri Google Foto e seleziona le immagini →";
    link.addEventListener("click", () => { void pollPickerSession(activePickerSession); });
    $("#import-result").append(document.createElement("br"), link);
  } catch (error) {
    googleAccessToken = null;
    setPickerStatus(`Collegamento non riuscito: ${error.message} Verifica API abilitata, client ID e origine OAuth.`, "warning");
  }
}

async function pollPickerSession(pickerSession) {
  if (!pickerSession || pickerSession.polling) return;
  pickerSession.polling = true;
  const started = Date.now();
  setPickerStatus("Google Foto è aperto. In attesa che tu confermi la selezione…");
  try {
    let session;
    do {
      session = await photosApi(`sessions/${encodeURIComponent(pickerSession.id)}`, pickerSession.token);
      if (session.mediaItemsSet) break;
      if (Date.now() - started > 5 * 60 * 1000) throw new Error("La sessione del Picker è scaduta: riapri la selezione e riprova.");
      const interval = Math.max(1000, Number(session.pollingConfig?.pollInterval) * 1000 || 2000);
      await new Promise((resolve) => setTimeout(resolve, Math.min(interval, 5000)));
    } while (true);
    await importPickedMedia(pickerSession);
  } catch (error) {
    setPickerStatus(`Picker: ${error.message}`, "warning");
  } finally {
    try { await photosApi(`sessions/${encodeURIComponent(pickerSession.id)}`, pickerSession.token, { method: "DELETE" }); } catch { /* La sessione può essere già scaduta. */ }
    activePickerSession = null;
    googleAccessToken = null;
    pickerSession.polling = false;
  }
}

async function listPickedMedia(pickerSession) {
  const items = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ sessionId: pickerSession.id, pageSize: "100" });
    if (pageToken) query.set("pageToken", pageToken);
    const page = await photosApi(`mediaItems?${query}`, pickerSession.token);
    items.push(...(page.mediaItems || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return items;
}

async function importPickedMedia(pickerSession) {
  setPickerStatus("Leggo date e originali selezionati per estrarre eventuali coordinate GPS…");
  const selected = await listPickedMedia(pickerSession);
  const pickedPhotos = selected.filter((item) => item.type === "PHOTO");
  const inRange = pickedPhotos.filter((item) => inImportRange(new Date(item.createTime)));
  const demoLocations = demoRomeAssignments(inRange);
  const existingPhotoIds = new Set(memories.filter((memory) => memory.isPhoto).map((memory) => memory.id));
  let withGps = 0; let demoLocated = 0; let withoutGps = 0; let nonCamera = 0; let duplicates = 0; let failed = 0; let processed = 0;
  const concurrency = Math.min(4, inRange.length);
  let nextIndex = 0;
  const importOne = async (item) => {
    if (existingPhotoIds.has(`photos-${item.id}`)) { duplicates++; return null; }
    const file = item.mediaFile || {};
    const capturedAt = new Date(item.createTime);
    let imageUrl = ""; let coordinates = null; let cameraMake = ""; let cameraModel = "";
    try {
      const response = await fetch(`${file.baseUrl}=d`, { headers: { Authorization: `Bearer ${pickerSession.token}` } });
      if (!response.ok) throw new Error(`Download media ${response.status}`);
      const blob = await response.blob();
      if (/jpe?g/i.test(file.mimeType || "") || /jpe?g$/i.test(file.filename || "")) {
        const exif = parseJpegExif(await blob.arrayBuffer());
        coordinates = exif.coordinates;
        cameraMake = exif.cameraMake;
        cameraModel = exif.cameraModel;
      }
      cameraMake ||= file.mediaFileMetadata?.cameraMake || "";
      cameraModel ||= file.mediaFileMetadata?.cameraModel || "";
      if (!cameraMake && !cameraModel) { nonCamera++; return null; }
      imageUrl = URL.createObjectURL(blob);
      importedPhotoUrls.add(imageUrl);
    } catch {
      failed++;
      return null;
    }
    const demoLocation = coordinates ? null : demoLocations.get(item.id) || null;
    const mapLocation = coordinates || demoLocation;
    const memory = {
      id: `photos-${item.id}`, title: String(file.filename || `Foto ${capturedAt.toLocaleDateString("it-IT")}`).replace(/\.[^.]+$/, ""),
      place: coordinates ? `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}` : demoLocation ? `Roma · ${demoLocation.name} (demo)` : "Luogo non geolocalizzato",
      country: demoLocation ? "Italia" : "Google Foto", date: capturedAt.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }),
      year: capturedAt.getFullYear(), lat: mapLocation?.lat ?? null, lon: mapLocation?.lon ?? null,
      type: "moments", typeLabel: demoLocation ? `TAPPA DEMO · ${demoLocation.name}` : coordinates ? "FOTO GEOLOCALIZZATA" : "FOTO · GPS ASSENTE",
      tile: "bologna", description: demoLocation
        ? `Posizione dimostrativa assegnata per la rotta narrativa di Roma in base alla sequenza temporale. Non è GPS né riconoscimento visivo del luogo. Scatto da ${[cameraMake, cameraModel].filter(Boolean).join(" ")}.`
        : `Scatto da ${[cameraMake, cameraModel].filter(Boolean).join(" ")}. Elaborato solo nel browser.`,
      coordinates: coordinates ? `${coordinates.lat.toFixed(5)}, ${coordinates.lon.toFixed(5)}` : null,
      icon: "▧", isPhoto: true, hasGps: Boolean(coordinates), locationSource: demoLocation ? "demo-rome" : coordinates ? "exif-gps" : "none",
      demoPlace: demoLocation?.name || null, capturedAt, imageUrl, originalName: file.filename || ""
    };
    if (coordinates) withGps++; else if (demoLocation) demoLocated++; else withoutGps++;
    return memory;
  };
  const worker = async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= inRange.length) return;
      const memory = await importOne(inRange[index]);
      if (memory) memories.unshift(memory);
      processed++;
      if (processed % 10 === 0 || processed === inRange.length) {
        setPickerStatus(`Analisi locale: ${processed}/${inRange.length} foto…`);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  importedPhotoCount = memories.filter((item) => item.isPhoto && inImportRange(item.capturedAt)).length;
  activeFilter = "all";
  $$('[data-filter]').forEach((button) => button.classList.toggle("filter-active", button.dataset.filter === "all"));
  renderList(); renderMemoryCards(); renderLedger();
  const firstRouted = photoRoute()[0];
  if (firstRouted) selectMemory(firstRouted.id);
  const outOfRange = pickedPhotos.length - inRange.length;
  const result = `${withGps + withoutGps} scatti fotocamera nell’intervallo · ${withGps} con GPS in rotta · ${withoutGps} senza GPS EXIF · ${nonCamera} senza metadati fotocamera escluse · ${outOfRange} fuori intervallo · ${failed} non scaricate.`;
  $("#import-status").textContent = `${inRange.length} foto dal Picker · ${withGps} geolocalizzate · ${rangeDate(rangeStart)} – ${rangeDate(rangeEnd)}`;
  const gpsNote = withGps === 0 && withoutGps > 0
    ? " Nota: il Picker Google rimuove il GPS dai file scaricati. Per aggiungere la rotta, importa gli originali o i JSON di Google Takeout con il selettore locale."
    : "";
  const locationResult = `${withGps + demoLocated} posizioni in rotta (${withGps} GPS reale, ${demoLocated} demo Roma non verificata)${duplicates ? ` · ${duplicates} già importate` : ""}`;
  const locationNote = demoLocated > 0
    ? " Le tappe Roma sono sintetiche, distribuite fra luoghi noti secondo l’ordine temporale; non sono GPS né riconoscimento visivo."
    : gpsNote;
  setPickerStatus(`${locationResult}${locationNote} · ${nonCamera} senza metadati fotocamera escluse · ${outOfRange} fuori intervallo · ${failed} errori`, withGps || demoLocated ? "success" : "warning");
  if (withGps || demoLocated) notify(`${withGps} GPS reali · ${demoLocated} tappe demo Roma`);
}

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2700);
}

function getMemory(id = selectedId) { return memories.find((memory) => memory.id === id); }

function matches(memory) {
  const query = $("#search").value.trim().toLocaleLowerCase("it");
  const filter = activeFilter === "all" || memory.type === activeFilter;
  const withinRange = !memory.isPhoto || inImportRange(memory.capturedAt);
  const selectedDataSet = importedPhotoCount === 0 || ((memory.isPhoto || memory.isDemoPhoto) && withinRange);
  const search = !query || `${memory.title} ${memory.place} ${memory.country} ${memory.description} ${memory.artwork || ""}`.toLocaleLowerCase("it").includes(query);
  return filter && selectedDataSet && search;
}

function renderList() {
  const list = $("#place-list");
  list.innerHTML = "";
  const visible = memories.filter(matches);
  visible.forEach((memory) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `place-item${memory.id === selectedId ? " current" : ""}`;
    button.dataset.id = memory.id;
    button.innerHTML = `<span class="place-thumb ${imageTiles[memory.tile]}"></span><span class="place-copy"><strong>${escapeHtml(memory.place)} · ${escapeHtml(memory.title)}</strong><small>${escapeHtml(memory.typeLabel)} · ${memory.year}</small></span><i class="place-indicator ${memory.type === "art" ? "art" : memory.type === "places" ? "place" : ""}"></i>`;
    if (memory.imageUrl) $(".place-thumb", button).style.backgroundImage = `url("${memory.imageUrl}")`;
    button.addEventListener("click", () => selectMemory(memory.id));
    list.append(button);
  });
  if (!visible.length) list.innerHTML = '<div class="empty-state">Non ci sono ancora tracce per questa ricerca. Aggiungi un ricordo al tuo atlante.</div>';
  $("#trace-count").textContent = String(visible.length).padStart(2, "0");
  $$(".memory-card").forEach((card) => card.classList.toggle("hidden-item", !visible.some((memory) => memory.id === card.dataset.id)));
  renderGlobe();
}

function renderMemoryCards() {
  const grid = $("#memory-grid");
  grid.innerHTML = "";
  memories.slice(0, 4).forEach((memory) => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.type = "button";
    card.dataset.id = memory.id;
    card.innerHTML = `<span class="memory-thumb ${imageTiles[memory.tile]}"></span><span class="card-arrow">↗</span><span class="memory-card-copy"><span class="memory-card-type">${escapeHtml(memory.typeLabel)}</span><h3>${escapeHtml(memory.title)}</h3><p>${escapeHtml(memory.place)} · ${memory.year}</p></span>`;
    if (memory.imageUrl) $(".memory-thumb", card).style.backgroundImage = `url("${memory.imageUrl}")`;
    if (memory.isDemoPhoto || (memory.isPhoto && (memory.hasGps || memory.locationSource === "demo-rome"))) { const badge = document.createElement("span"); badge.className = "route-photo-badge"; badge.textContent = memory.isDemoPhoto || memory.locationSource === "demo-rome" ? "● POSIZIONE DEMO" : "● GPS REALE"; card.append(badge); }
    card.addEventListener("click", () => { selectMemory(memory.id); $("#globe").scrollIntoView({ behavior: "smooth", block: "center" }); });
    grid.append(card);
  });
}

function renderDetail(memory) {
  if (!memory) return;
  $("#detail-type").textContent = memory.typeLabel;
  $("#detail-image").className = `detail-image ${imageTiles[memory.tile]}${memory.imageUrl ? " imported-detail-image" : ""}`;
  $("#detail-image").style.backgroundImage = memory.imageUrl ? `url("${memory.imageUrl}")` : "";
  $("#image-place-tag").textContent = `${memory.place.toLocaleUpperCase("it")} · ${memory.year}`;
  $("#category-pill").textContent = memory.artwork ? "OPERA · DEMO" : memory.type === "places" ? "LUOGO VISITATO" : "RICORDO";
  $("#category-pill").className = `category-pill type-${memory.type}`;
  $("#detail-title").textContent = memory.title;
  $("#detail-location").innerHTML = `⌖ <span>${escapeHtml(memory.place)}${memory.country ? `, ${escapeHtml(memory.country)}` : ""}</span>`;
  $("#detail-description").textContent = memory.description;
  $("#detail-date").textContent = memory.date;
  $("#detail-coordinates").textContent = memory.isDemoPhoto
    ? `DEMO · ${memory.demoPlace}, ${memory.country} · coordinate sintetiche, non GPS`
    : memory.locationSource === "demo-rome"
    ? `DEMO · ${memory.demoPlace}, Roma · coordinate sintetiche, non GPS`
    : memory.hasGps ? `${Number(memory.lat).toFixed(5)}, ${Number(memory.lon).toFixed(5)}` : "GPS non presente nel file";
  const saved = ledger.some((item) => item.memoryId === memory.id);
  $("#verified-state").innerHTML = saved ? '<i>✓</i> FIRMATO NEL REGISTRO' : '<i>◌</i> NON ANCORA FIRMATO';
  $("#verified-state").classList.toggle("is-saved", saved);
  $("#anchor-button").classList.toggle("is-saved", saved);
}

function selectMemory(id) {
  const memory = getMemory(id);
  if (!memory) return;
  selectedId = id;
  renderDetail(memory);
  $$(".place-item").forEach((item) => item.classList.toggle("current", item.dataset.id === id));
  $("#stage-place").innerHTML = `${escapeHtml(memory.place)} <span>·</span> ${memory.year}`;
  $("#coords").textContent = memory.isDemoPhoto
    ? `POSIZIONE DEMO · ${memory.demoPlace.toLocaleUpperCase("it")} · NON GPS`
    : memory.locationSource === "demo-rome"
    ? `POSIZIONE DEMO · ${memory.demoPlace.toLocaleUpperCase("it")} · NON GPS`
    : memory.hasGps ? `${Math.abs(memory.lat).toFixed(0)}°${Math.round((Math.abs(memory.lat) % 1) * 60)}′ ${memory.lat >= 0 ? "N" : "S"}   ${Math.abs(memory.lon).toFixed(0)}°${Math.round((Math.abs(memory.lon) % 1) * 60)}′ ${memory.lon >= 0 ? "E" : "O"}` : "GPS non disponibile";
  renderGlobe();
}

function pointOnLand(lon, lat) {
  let inside = false;
  for (const polygon of landPolygons) {
    let polygonInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const intersects = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / ((yj - yi) || 0.0001) + xi);
      if (intersects) polygonInside = !polygonInside;
    }
    inside ||= polygonInside;
  }
  return inside;
}

let landDots = [];
for (let lat = -68; lat <= 75; lat += 3.7) {
  for (let lon = -178; lon <= 178; lon += 3.7) {
    const jitter = Math.sin((lat + 80) * 7.3 + lon * 2.1) * 1.5;
    if (pointOnLand(lon + jitter, lat + jitter) && Math.sin(lon * 1.31 + lat * 4.77) > -0.88) {
      landDots.push([lon + jitter, lat + jitter, Math.sin(lon * 19 + lat * 11)]);
    }
  }
}

const canvas = $("#globe");
const ctx = canvas.getContext("2d");

function project(lat, lon, radius, centerX, centerY) {
  const lonRad = (lon + rotation) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const x0 = Math.cos(latRad) * Math.sin(lonRad);
  const y0 = Math.sin(latRad);
  const z0 = Math.cos(latRad) * Math.cos(lonRad);
  const tilt = pitch * Math.PI / 180;
  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt);
  const z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
  return { x: centerX + x0 * radius, y: centerY - y * radius, z };
}

function drawSpherePath(radius, centerX, centerY, latitude) {
  ctx.beginPath();
  let connected = false;
  for (let lon = -180; lon <= 180; lon += 3) {
    const point = project(latitude, lon, radius, centerX, centerY);
    if (point.z > 0.015) {
      if (!connected) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
      connected = true;
    } else connected = false;
  }
  ctx.stroke();
}

function renderGlobe() {
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);
  const centerX = width * 0.5;
  const centerY = height * 0.52;
  const radius = Math.min(height * 0.43, width * 0.35) * zoom;

  const stars = 78;
  for (let i = 0; i < stars; i++) {
    const x = ((i * 127.1 + 17) % width);
    const y = ((i * 71.7 + 11) % height);
    const r = 0.4 + ((i * 3) % 7) / 10;
    ctx.fillStyle = `rgba(186,205,174,${0.12 + (i % 4) * 0.06})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  const sphere = ctx.createRadialGradient(centerX - radius * .38, centerY - radius * .42, radius * .06, centerX, centerY, radius * 1.16);
  sphere.addColorStop(0, "#283b2e"); sphere.addColorStop(.52, "#1b2a21"); sphere.addColorStop(.86, "#101b15"); sphere.addColorStop(1, "#090f0c");
  ctx.save();
  ctx.shadowColor = "#94b487"; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fillStyle = sphere; ctx.fill();
  ctx.shadowBlur = 0;
  ctx.save(); ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.clip();

  for (let lat = -75; lat <= 75; lat += 15) {
    ctx.strokeStyle = lat === 0 ? "rgba(174,196,162,.18)" : "rgba(166,187,157,.09)";
    ctx.lineWidth = lat === 0 ? .8 : .55;
    drawSpherePath(radius, centerX, centerY, lat);
  }
  ctx.strokeStyle = "rgba(166,187,157,.11)"; ctx.lineWidth = .65;
  for (let lon = -150; lon <= 180; lon += 30) {
    ctx.beginPath(); let open = false;
    for (let lat = -88; lat <= 88; lat += 3) {
      const p = project(lat, lon, radius, centerX, centerY);
      if (p.z > 0) { if (!open) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); open = true; }
      else open = false;
    }
    ctx.stroke();
  }

  landDots.forEach(([lon, lat, seed]) => {
    const p = project(lat, lon, radius, centerX, centerY);
    if (p.z <= 0) return;
    const size = (0.65 + ((seed + 1) / 2) * 1.05) * (radius / 150);
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.55, size), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${seed > .2 ? "163,185,142" : "121,153,119"},${.24 + p.z * .44})`; ctx.fill();
  });

  ctx.restore();
  const edge = ctx.createRadialGradient(centerX - radius * .2, centerY - radius * .23, radius * .65, centerX, centerY, radius * 1.03);
  edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(.82, "rgba(2,8,5,.03)"); edge.addColorStop(1, "rgba(1,6,4,.57)");
  ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.fillStyle = edge; ctx.fill();
  ctx.strokeStyle = "rgba(181,207,165,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  const route = photoRoute().map((memory) => ({ memory, point: project(memory.lat, memory.lon, radius, centerX, centerY) }));
  if (route.length > 1) {
    ctx.save(); ctx.beginPath(); let drawing = false;
    route.forEach(({ point }) => {
      if (point.z > 0) {
        if (!drawing) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
        drawing = true;
      } else drawing = false;
    });
    ctx.strokeStyle = "rgba(216,190,148,.8)"; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.restore();
  }

  hitTargets = [];
  memories.filter((memory) => matches(memory) && Number.isFinite(memory.lat) && Number.isFinite(memory.lon)).forEach((memory) => {
    const p = project(memory.lat, memory.lon, radius, centerX, centerY);
    if (p.z <= 0) return;
    hitTargets.push({ memory, x: p.x, y: p.y, z: p.z, r: memory.id === selectedId ? 14 : 11 });
  });
  hitTargets.sort((a, b) => a.z - b.z);
  hitTargets.forEach((target) => {
    const selected = target.memory.id === selectedId;
    const color = target.memory.type === "art" ? [218, 180, 125] : target.memory.type === "places" ? [150, 198, 199] : [196, 216, 168];
    const glow = ctx.createRadialGradient(target.x, target.y, 1, target.x, target.y, selected ? 19 : 15);
    glow.addColorStop(0, `rgba(${color.join(",")},${selected ? .5 : .28})`); glow.addColorStop(1, `rgba(${color.join(",")},0)`);
    ctx.beginPath(); ctx.arc(target.x, target.y, selected ? 19 : 15, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
    ctx.beginPath(); ctx.arc(target.x, target.y, selected ? 5.4 : 4.2, 0, Math.PI * 2); ctx.fillStyle = `rgb(${color.join(",")})`; ctx.fill();
    ctx.beginPath(); ctx.arc(target.x, target.y, selected ? 2.1 : 1.5, 0, Math.PI * 2); ctx.fillStyle = "#102018"; ctx.fill();
    if (selected) {
      ctx.beginPath(); ctx.arc(target.x, target.y, 10, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${color.join(",")},.68)`; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = "9px DM Mono, monospace"; ctx.textAlign = "left"; ctx.fillStyle = "#d9e3d0";
      ctx.fillText(target.memory.place.toLocaleUpperCase("it"), target.x + 12, target.y - 10);
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderLedger() {
  $("#saved-count").textContent = String(ledger.length).padStart(2, "0");
  const list = $("#ledger-list");
  list.innerHTML = "";
  ledger.slice(-3).reverse().forEach((entry) => {
    const memory = memories.find((item) => item.id === entry.memoryId);
    const row = document.createElement("div"); row.className = "ledger-item";
    row.innerHTML = `<span class="ledger-badge">✓</span><div><strong>${escapeHtml(memory?.title || entry.title)}</strong><small>${escapeHtml(entry.block)} · SHA-256 ${escapeHtml(entry.hash)}</small></div><span class="ledger-hash">prev: ${escapeHtml(entry.previousHash)}</span><span class="ledger-state">LOCAL</span>`;
    list.append(row);
  });
  if (!ledger.length) list.innerHTML = '<div class="empty-state">Il registro è vuoto. Firma una traccia dal pannello di dettaglio.</div>';
}

async function digest(value) {
  if (globalThis.crypto?.subtle) {
    const data = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return [...new Uint8Array(data)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  let h1 = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) { h1 ^= value.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
  return `demo-${(h1 >>> 0).toString(16).padStart(8, "0")}`;
}

async function anchorSelected() {
  const memory = getMemory();
  if (ledger.some((entry) => entry.memoryId === memory.id)) { notify("Questa traccia è già nel registro"); return; }
  const previousHash = ledger.at(-1)?.hash || "genesis";
  const payload = JSON.stringify({ id: memory.id, title: memory.title, date: memory.date, lat: memory.lat, lon: memory.lon, previousHash });
  const hash = (await digest(payload)).slice(0, 32);
  ledger.push({ memoryId: memory.id, title: memory.title, block: `ARC-${String(ledger.length + 1).padStart(5, "0")}`, hash, previousHash: previousHash.slice(0, 12), timestamp: new Date().toISOString(), payload });
  persistLedger(); renderLedger(); renderDetail(memory); notify("Traccia firmata e aggiunta al registro demo");
}

function downloadFile(filename, contents, mime = "application/json") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function sharePayload() {
  const memory = getMemory();
  const payload = { archetype_share: "demo.v1", title: memory.title, type: memory.typeLabel, date: memory.date };
  if ($("#include-location").checked) payload.place = `${memory.place}, ${memory.country}`;
  if ($("#include-story").checked) payload.story = memory.description;
  return payload;
}

function shareUrl() { return `${location.href.split("#")[0]}#traccia=${toBase64(JSON.stringify(sharePayload()))}`; }

$("#place-list").addEventListener("click", (event) => { const row = event.target.closest("[data-id]"); if (row) selectMemory(row.dataset.id); });
$$('[data-filter]').forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  $$('[data-filter]').forEach((item) => item.classList.toggle("filter-active", item === button));
  const first = memories.find(matches);
  if (first) selectMemory(first.id);
  renderList();
}));

$("#search").addEventListener("input", () => { const first = memories.find(matches); if (first) selectMemory(first.id); renderList(); });
$("#search").addEventListener("keydown", (event) => { if (event.key === "Escape") { event.target.value = ""; renderList(); } });
function canvasPoint(event) { const rect = canvas.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; }
canvas.addEventListener("pointerdown", (event) => { dragging = true; previousPointer = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener("pointermove", (event) => {
  if (dragging && previousPointer) {
    const dx = event.clientX - previousPointer.x;
    const dy = event.clientY - previousPointer.y;
    rotation += dx * .42; pitch = Math.max(-40, Math.min(40, pitch + dy * .32));
    previousPointer = { x: event.clientX, y: event.clientY };
    renderGlobe();
  }
});
canvas.addEventListener("pointerup", (event) => { dragging = false; previousPointer = null; const p = canvasPoint(event); const target = [...hitTargets].reverse().find((item) => Math.hypot(item.x - p.x, item.y - p.y) < item.r + 5); if (target) selectMemory(target.memory.id); });
canvas.addEventListener("pointercancel", () => { dragging = false; previousPointer = null; });
$("#rotate-left").addEventListener("click", () => { rotation -= 18; renderGlobe(); });
$("#rotate-right").addEventListener("click", () => { rotation += 18; renderGlobe(); });
$("#reset-globe").addEventListener("click", () => { rotation = -12; pitch = 8; zoom = 1; renderGlobe(); notify("Globo centrato sull'Europa"); });
$("#zoom-in").addEventListener("click", () => { zoom = Math.min(1.45, zoom + .08); renderGlobe(); });
$("#zoom-out").addEventListener("click", () => { zoom = Math.max(.78, zoom - .08); renderGlobe(); });
$("#view-switch").addEventListener("click", () => { $(".globe-stage").classList.toggle("timeline-mode"); notify($(".globe-stage").classList.contains("timeline-mode") ? "Vista temporale · le tracce più recenti si illuminano" : "Vista globo · esplora i luoghi"); });

$("#new-memory").addEventListener("click", () => $("#memory-dialog").showModal());
$("#open-photo-import").addEventListener("click", () => { updateImportDateLabels(); $("#photo-import-dialog").showModal(); });
$("#configure-picker").addEventListener("click", () => {
  $("#google-client-id").value = localStorage.getItem("archetype-google-client-id") || "";
  $("#google-auth-status").textContent = "Carico Google Identity Services…";
  $("#google-config-dialog").showModal();
  void loadGoogleIdentity().then(() => { $("#google-auth-status").textContent = "SDK pronto. Inserisci il Client ID e avvia il collegamento."; }).catch((error) => { $("#google-auth-status").textContent = error.message; });
});
$("#connect-google-photos").addEventListener("click", () => {
  const clientId = $("#google-client-id").value.trim();
  if (clientId) localStorage.setItem("archetype-google-client-id", clientId);
  void beginPhotosPicker(clientId);
});
$("#choose-photo-files").addEventListener("click", () => $("#photo-files").click());
$("#choose-photo-folder").addEventListener("click", () => $("#photo-folder").click());
$("#photo-files").addEventListener("change", async (event) => { await importPhotoFiles(event.target.files); event.target.value = ""; });
$("#photo-folder").addEventListener("change", async (event) => { await importPhotoFiles(event.target.files); event.target.value = ""; });
$$(".modal-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$("#memory-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const placeParts = String(form.get("place")).split(",").map((part) => part.trim());
  const type = String(form.get("type"));
  const numericLat = Number(form.get("lat")); const numericLon = Number(form.get("lon"));
  const item = {
    id: `local-${Date.now()}`, title: String(form.get("title")).trim(), place: placeParts[0], country: placeParts[1] || "Luogo personale",
    date: new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" }), year: new Date().getFullYear(),
    lat: Number.isFinite(numericLat) && form.get("lat") !== "" ? numericLat : 0, lon: Number.isFinite(numericLon) && form.get("lon") !== "" ? numericLon : 0,
    type, typeLabel: { moments: "MOMENTO DI VITA", art: "OPERA D'ARTE", places: "LUOGO" }[type],
    tile: "bologna", description: String(form.get("description")).trim(), coordinates: `${numericLat.toFixed(4)}, ${numericLon.toFixed(4)}`, icon: "✳"
  };
  memories.unshift(item);
  event.currentTarget.reset(); $("#memory-dialog").close(); selectMemory(item.id); renderList(); renderMemoryCards(); notify("Il nuovo ricordo è nell'atlante");
});

$("#anchor-button").addEventListener("click", anchorSelected);
$("#chain-info").addEventListener("click", () => $("#chain-dialog").showModal());
$("#open-share").addEventListener("click", () => $("#share-dialog").showModal());
$("#share-item").addEventListener("click", () => $("#share-dialog").showModal());
$("#copy-share").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(shareUrl()); notify("Link demo copiato · condivisione simulata"); }
  catch { notify("Apri la demo via localhost per copiare il link; puoi esportare il file .archtype"); }
});
$("#download-memory").addEventListener("click", async () => {
  const memory = getMemory();
  const body = { schema: "archetype.demo.v1", event_id: memory.id, timestamp_utc: new Date().toISOString(), location: { name: `${memory.place}, ${memory.country}`, latitude: memory.lat, longitude: memory.lon }, payload: { type: memory.type, title: memory.title, description: memory.description }, integrity: { algorithm: "SHA-256", hash: await digest(JSON.stringify(memory)), chain_anchor: null }, notice: "Esportazione dimostrativa: nessuna scrittura su blockchain pubblica." };
  downloadFile(`${memory.id}.archtype`, JSON.stringify(body, null, 2));
});
$("#export-ledger").addEventListener("click", () => downloadFile("archetype-registro-demo.json", JSON.stringify({ schema: "archetype.ledger.demo.v1", network: "local-only", entries: ledger, warning: "Registro dimostrativo locale, non blockchain pubblica." }, null, 2)));
$("#compose-story").addEventListener("click", () => { const ordered = [...memories].sort((a, b) => a.year - b.year); const story = ordered.map((item) => `${item.year} · ${item.place} — ${item.title}`).join("\n"); downloadFile("la-mia-storia-demo.txt", `LA MIA STORIA · BOZZA DIMOSTRATIVA\n\n${story}\n\nRacconto generato dai ricordi selezionati nell'atlante Archetype.` , "text/plain"); notify("Bozza autobiografica esportata"); });
$("#all-memories").addEventListener("click", () => { activeFilter = "all"; $$('[data-filter]').forEach((item) => item.classList.toggle("filter-active", item.dataset.filter === "all")); renderList(); notify("Tutte le tracce mostrate"); });
$$('[data-section]').forEach((button) => button.addEventListener("click", () => {
  const target = { globe: "#explore-world", memories: "#memories", proof: "#proof" }[button.dataset.section];
  $$("[data-section]").forEach((item) => item.classList.toggle("nav-active", item === button));
  document.querySelector(target).scrollIntoView({ behavior: "smooth", block: "start" });
}));
$("#privacy").addEventListener("click", () => $("#chain-dialog").showModal());
$("#image-expand").addEventListener("click", () => notify("Anteprima del luogo selezionato"));
window.addEventListener("resize", renderGlobe);

renderMemoryCards(); renderLedger(); updateImportDateLabels(); renderList(); selectMemory(selectedId);
$("#close-detail").addEventListener("click", () => { $(".explorer-layout").classList.toggle("detail-hidden"); notify($(".explorer-layout").classList.contains("detail-hidden") ? "Dettaglio chiuso · seleziona un punto per riaprirlo" : "Dettaglio riaperto"); });
$("#globe").addEventListener("dblclick", () => { $(".explorer-layout").classList.remove("detail-hidden"); });
window.addEventListener("keydown", (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase("it") === "k") { event.preventDefault(); $("#search").focus(); } });
