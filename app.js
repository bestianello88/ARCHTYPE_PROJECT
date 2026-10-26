const events = [
  { id: "e1", code: "ARC-2025-0612-01", title: "Un momento da ricordare", date: "12 giugno 2025 · 10:42", shortDate: "12 GIU 2025", place: "Bologna, Italia", coordinates: "44.4949° N   11.3426° E", domain: "personal", domainLabel: "PERSONALE", icon: "✳", description: "Una mattina lenta sotto i portici. Il profumo del caffè, la luce che filtra tra le arcate — e la sensazione di essere esattamente dove dovrei essere." },
  { id: "e2", code: "ARC-2025-0528-02", title: "La città vista dall'alto", date: "28 maggio 2025 · 18:16", shortDate: "28 MAG 2025", place: "Firenze, Italia", coordinates: "43.7696° N   11.2558° E", domain: "explore", domainLabel: "ESPLORAZIONE", icon: "⌖", description: "Una deviazione senza meta. Da Piazzale Michelangelo, Firenze sembra raccogliere in una sola immagine tutti i passi fatti fin qui." },
  { id: "e3", code: "ARC-2025-0416-03", title: "Un progetto prende forma", date: "16 aprile 2025 · 09:05", shortDate: "16 APR 2025", place: "Venezia, Italia", coordinates: "45.4408° N   12.3155° E", domain: "professional", domainLabel: "PROFESSIONALE", icon: "↗", description: "Un sopralluogo, una conversazione, un'idea annotata sul posto. La traccia conserva il contesto del lavoro, non solo il punto sulla mappa." },
  { id: "e4", code: "ARC-2025-0310-04", title: "Ritrovare un luogo", date: "10 marzo 2025 · 14:31", shortDate: "10 MAR 2025", place: "Roma, Italia", coordinates: "41.9028° N   12.4964° E", domain: "legal", domainLabel: "LEGALE", icon: "⬡", description: "Un ritorno a distanza di anni. Il luogo è lo stesso; il modo di guardarlo è cambiato. Un ricordo che diventa parte della storia." }
];

const labels = {
  overview: "Panoramica", map: "Mappa della vita", timeline: "Spirale temporale",
  story: "La mia storia", archive: "Archivio verificabile"
};
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let selectedDomain = "all";
let toastTimer;

function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function selectEvent(id) {
  const event = events.find((item) => item.id === id);
  if (!event) return;
  $("#moment-heading").textContent = event.title;
  $("#moment-date").textContent = event.date;
  $("#moment-tag").textContent = event.domainLabel;
  $("#moment-tag").className = `tag tag-${event.domain}`;
  $("#moment-description").textContent = event.description;
  $("#moment-id").textContent = event.code;
  $("#selected-place").textContent = event.place;
  $("#selected-coordinates").textContent = event.coordinates;
  $$(".map-point").forEach((point) => point.classList.toggle("active-point", point.dataset.event === id));
  $$(".event-row").forEach((row) => row.classList.toggle("selected-row", row.dataset.event === id));
}

function renderEvents() {
  const visible = events.filter((event) => selectedDomain === "all" || event.domain === selectedDomain);
  const list = $("#event-list");
  list.innerHTML = "";
  visible.slice(0, 4).forEach((event) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "event-row";
    row.dataset.event = event.id;
    row.innerHTML = `<span class="event-icon">${event.icon}</span><span class="event-row-main"><span class="event-row-title">${escapeHtml(event.title)}</span><span class="event-row-meta">${escapeHtml(event.place)}</span></span><span class="event-row-side"><span class="event-row-date">${escapeHtml(event.shortDate)}</span><span class="event-row-domain">${escapeHtml(event.domainLabel)}</span></span>`;
    row.addEventListener("click", () => selectEvent(event.id));
    list.append(row);
  });
  if (!visible.length) list.innerHTML = '<p class="empty-state">Nessuna traccia per questo ambito. Registra un momento per iniziare.</p>';
  $("#metric-events").textContent = String(24 + Math.max(0, events.length - 4)).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function setView(view) {
  if (!labels[view]) return;
  document.body.dataset.view = view;
  $("#breadcrumb-current").textContent = labels[view];
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const targets = { overview: ".welcome-row", map: ".map-panel", timeline: ".journey-panel", story: ".story-card", archive: ".recent-panel" };
  document.querySelector(targets[view]).scrollIntoView({ behavior: "smooth", block: view === "overview" ? "start" : "center" });
  if (view !== "overview") notify(`${labels[view]} · sezione del prototipo`);
}

function makeEventCode(date) {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `ARC-${datePart}-${String(events.length + 1).padStart(2, "0")}`;
}

function addMapPoint(event) {
  const map = $(".map-art");
  const locations = [[118, 104], [195, 244], [620, 108], [585, 272], [356, 300], [665, 190]];
  const [x, y] = locations[(events.length - 1) % locations.length];
  const point = document.createElementNS("http://www.w3.org/2000/svg", "g");
  point.setAttribute("class", "map-point");
  point.setAttribute("transform", `translate(${x} ${y})`);
  point.dataset.event = event.id;
  point.innerHTML = '<circle r="18" class="point-glow"/><circle r="8" class="point-core"/><circle r="3" class="point-center"/>';
  point.addEventListener("click", () => selectEvent(event.id));
  map.append(point);
}

async function exportArchetype(event) {
  const payload = {
    schema: "archetype.demo.v1",
    event_id: event.code,
    user_id: "demo-user",
    timestamp_utc: new Date().toISOString(),
    location: { name: event.place, latitude: null, longitude: null, precision: "illustrative-demo" },
    payload: { title: event.title, domain: event.domain, description: event.description },
    integrity: { algorithm: "SHA-256", digest: "demo-only", blockchain_anchor: null },
    notice: "Prototipo: coordinate GPS e ancoraggio blockchain non sono implementati."
  };
  const canonical = JSON.stringify(payload);
  try {
    if (globalThis.crypto?.subtle) {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      payload.integrity.digest = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    payload.integrity.digest = "non-disponibile-in-questa-preview";
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${event.code.toLowerCase()}.archtype`;
  link.click();
  URL.revokeObjectURL(link.href);
  notify("File .archtype dimostrativo esportato");
}

$$(".nav-item").forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
$$('[data-open-view]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.openView)));
$$('[data-domain]').forEach((button) => button.addEventListener("click", () => {
  selectedDomain = button.dataset.domain;
  $$('[data-domain]').forEach((item) => item.classList.toggle("selected", item === button));
  renderEvents();
  const firstVisible = events.find((event) => selectedDomain === "all" || event.domain === selectedDomain);
  if (firstVisible) selectEvent(firstVisible.id);
}));

$$('[data-event]').forEach((item) => item.addEventListener("click", () => selectEvent(item.dataset.event)));
$("#new-event").addEventListener("click", () => $("#event-dialog").showModal());
$("#privacy-info").addEventListener("click", () => $("#info-dialog").showModal());
$(".help-link").addEventListener("click", () => $("#info-dialog").showModal());
$$(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$("#copy-id").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#moment-id").textContent);
    notify("ID copiato negli appunti");
  } catch {
    notify(`ID: ${$("#moment-id").textContent}`);
  }
});

$("#event-form").addEventListener("submit", async (submitEvent) => {
  submitEvent.preventDefault();
  const form = new FormData(submitEvent.currentTarget);
  const now = new Date();
  const domain = form.get("domain");
  const domainLabels = { personal: "PERSONALE", professional: "PROFESSIONALE", legal: "LEGALE", explore: "ESPLORAZIONE" };
  const event = {
    id: `local-${events.length + 1}`,
    code: makeEventCode(now),
    title: form.get("title").trim(),
    date: now.toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" }),
    shortDate: now.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
    place: form.get("place").trim(),
    coordinates: "coordinate non impostate · demo",
    domain,
    domainLabel: domainLabels[domain],
    icon: { personal: "✳", professional: "↗", legal: "⬡", explore: "⌖" }[domain],
    description: form.get("description").trim()
  };
  events.unshift(event);
  addMapPoint(event);
  submitEvent.currentTarget.reset();
  $("#event-dialog").close();
  renderEvents();
  selectEvent(event.id);
  await exportArchetype(event);
});

$("#event-form").addEventListener("keydown", (event) => {
  if (event.key === "Escape") $("#event-dialog").close();
});
$$('.period-button').forEach((button) => button.addEventListener("click", () => {
  $$('.period-button').forEach((item) => item.classList.toggle("active", item === button));
  notify(button.dataset.period === "year" ? "Vista 2025 · dati dimostrativi" : "Vista completa · dati dimostrativi");
}));

renderEvents();
selectEvent("e1");
