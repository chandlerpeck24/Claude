/* =========================================================================
   Travel Journal — App Logic
   ========================================================================= */

const STORAGE_KEYS = { trips: "tj_trips", entries: "tj_entries" };

const STATUS_LABELS = {
  idea: "💭 Idea", planning: "🧳 Planning", upcoming: "🔜 Upcoming",
  ongoing: "✈️ Ongoing", past: "✅ Past"
};

const EMOJI_SUGGESTIONS = ["📍", "✈️", "🏖️", "🏔️", "🏙️", "🎒", "🚗", "🗺️", "🚂", "🛶"];

// ---- State ----------------------------------------------------------------

let trips = [];
let entries = [];
let currentTab = "timeline";
let currentTripDetailId = null;
let searchQuery = "";
let formatFilter = "all";
let statusFilter = "all";
let sortNewestFirst = true;
let expandedEntryIds = new Set();

let editingTripId = null;
let pendingCoverPhoto = null; // dataURL or null; undefined means "unchanged" while editing
let editingEntryId = null;
let pendingEntryPhotos = [];

let lightboxPhotos = [];
let lightboxIndex = 0;

// ---- Storage ----------------------------------------------------------------

function loadTrips() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.trips)) || []; }
  catch (e) { return []; }
}
function loadEntries() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.entries)) || []; }
  catch (e) { return []; }
}
function saveTrips() {
  try { localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(trips)); }
  catch (e) { alert("Couldn't save — your browser's storage is full. Try exporting a backup and removing some photos."); }
}
function saveEntries() {
  try { localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries)); }
  catch (e) { alert("Couldn't save — your browser's storage is full. Try exporting a backup and removing some photos."); }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// ---- Utilities: dates -------------------------------------------------------

function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}
function formatDate(str) {
  const d = parseLocalDate(str);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function daysUntil(str) {
  const d = parseLocalDate(str);
  if (!d) return null;
  return Math.round((d - startOfToday()) / 86400000);
}

// ---- Utilities: text --------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function parseTags(str) {
  return (str || "").split(",").map(t => t.trim()).filter(Boolean);
}
function renderBodyHtml(text) {
  const paragraphs = String(text || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
}
function excerptText(text, maxLen) {
  const flat = String(text || "").replace(/\s+/g, " ").trim();
  if (flat.length <= maxLen) return null;
  return flat.slice(0, maxLen).trim() + "…";
}
function readingTime(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ---- Trip helpers ------------------------------------------------------------

function getTrip(id) { return trips.find(t => t.id === id); }

function computeStatus(trip) {
  if (trip.startDate) {
    const today = startOfToday();
    const start = parseLocalDate(trip.startDate);
    const end = trip.endDate ? parseLocalDate(trip.endDate) : start;
    if (end < today) return "past";
    if (start > today) return "upcoming";
    return "ongoing";
  }
  return trip.status === "planning" ? "planning" : "idea";
}

function tripEntries(tripId) { return entries.filter(e => e.tripId === tripId); }

function allPhotos() {
  const photos = [];
  trips.forEach(t => { if (t.coverPhoto) photos.push({ src: t.coverPhoto, caption: t.name, tripId: t.id }); });
  entries.forEach(e => (e.photos || []).forEach(src => {
    const trip = e.tripId ? getTrip(e.tripId) : null;
    photos.push({ src, caption: e.title + (trip ? ` — ${trip.name}` : ""), tripId: e.tripId, entryId: e.id });
  }));
  return photos;
}

// ---- Image compression -------------------------------------------------------

function compressImage(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Couldn't read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Couldn't read file"));
    reader.readAsDataURL(file);
  });
}

// ---- Init -----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  trips = loadTrips();
  entries = loadEntries();
  bindStaticEvents();
  renderAll();
});

function renderAll() {
  renderStats();
  renderTimeline();
  renderTrips();
  renderPhotosView();
  if (currentTripDetailId) renderTripDetail(currentTripDetailId);
}

// ---- Stats ------------------------------------------------------------------

function renderStats() {
  const countries = new Set(trips.map(t => t.destination).filter(Boolean));
  const visited = trips.filter(t => computeStatus(t) === "past").length;
  const upcoming = trips.filter(t => ["upcoming", "ongoing"].includes(computeStatus(t))).length;
  const photoCount = allPhotos().length;
  const tiles = [
    ["Trips", trips.length],
    ["Places", countries.size],
    ["Visited", visited],
    ["Upcoming", upcoming],
    ["Entries", entries.length],
    ["Photos", photoCount]
  ];
  document.getElementById("stats-bar").innerHTML = tiles.map(([label, value]) => `
    <div class="stat-tile"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
  `).join("");
}

// ---- Timeline view ------------------------------------------------------------

function matchesSearch(haystack) {
  if (!searchQuery) return true;
  return haystack.toLowerCase().includes(searchQuery.toLowerCase());
}

function filteredEntries() {
  return entries.filter(e => {
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    const trip = e.tripId ? getTrip(e.tripId) : null;
    const haystack = [e.title, e.body, (e.tags || []).join(" "), trip ? trip.name : ""].join(" ");
    return matchesSearch(haystack);
  });
}

function renderUpcomingStrip() {
  const upcoming = trips
    .filter(t => computeStatus(t) === "upcoming" && t.startDate)
    .sort((a, b) => parseLocalDate(a.startDate) - parseLocalDate(b.startDate));
  const el = document.getElementById("upcoming-strip");
  el.innerHTML = upcoming.map(t => {
    const days = daysUntil(t.startDate);
    return `<div class="upcoming-card" data-trip-id="${t.id}">
      <div class="upcoming-emoji">${escapeHtml(t.emoji || "📍")}</div>
      <div class="upcoming-name">${escapeHtml(t.name)}</div>
      <div class="upcoming-countdown">${days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`} · ${formatDate(t.startDate)}</div>
    </div>`;
  }).join("");
  el.querySelectorAll(".upcoming-card").forEach(card => {
    card.addEventListener("click", () => openTripDetail(card.dataset.tripId));
  });
}

function entryCardHtml(entry, opts = {}) {
  const trip = entry.tripId ? getTrip(entry.tripId) : null;
  const expanded = expandedEntryIds.has(entry.id);
  const excerpt = entry.format === "story" ? excerptText(entry.body, 280) : null;
  const photos = entry.photos || [];
  return `
  <article class="entry-card format-${entry.format}" data-entry-id="${entry.id}">
    <div class="entry-meta">
      ${!opts.hideTrip && trip ? `<span class="entry-trip-badge" data-trip-id="${trip.id}">${escapeHtml(trip.emoji || "📍")} ${escapeHtml(trip.name)}</span>` : ""}
      ${!opts.hideTrip && !trip ? `<span class="entry-trip-badge">General</span>` : ""}
      <span class="entry-format-badge">${entry.format === "story" ? "📖 Story" : "📝 Note"}</span>
      <span>${formatDate(entry.date)}</span>
      ${entry.format === "story" ? `<span>· ${readingTime(entry.body)} min read</span>` : ""}
    </div>
    <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
    <div class="entry-body ${excerpt && !expanded ? "collapsed" : ""}">${renderBodyHtml(entry.body)}</div>
    ${photos.length ? `<div class="entry-photos">${photos.map((src, i) => `<img src="${src}" data-entry-id="${entry.id}" data-photo-index="${i}" alt="">`).join("")}</div>` : ""}
    ${(entry.tags || []).length ? `<div class="entry-tags">${entry.tags.map(t => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    <div class="entry-actions">
      ${excerpt ? `<button type="button" class="read-more-btn" data-entry-id="${entry.id}">${expanded ? "Show less" : "Read more"}</button>` : ""}
      <span class="spacer"></span>
      <button type="button" class="btn btn-secondary btn-small edit-entry-btn" data-entry-id="${entry.id}">Edit</button>
    </div>
  </article>`;
}

function renderTimeline() {
  renderUpcomingStrip();
  let list = filteredEntries().slice().sort((a, b) => {
    const diff = parseLocalDate(a.date) - parseLocalDate(b.date);
    return sortNewestFirst ? -diff : diff;
  });
  const feed = document.getElementById("timeline-feed");
  feed.innerHTML = list.map(e => entryCardHtml(e)).join("");
  document.getElementById("timeline-empty").classList.toggle("hidden", entries.length !== 0);
  bindEntryCardEvents(feed);
}

function bindEntryCardEvents(container) {
  container.querySelectorAll(".read-more-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.entryId;
      if (expandedEntryIds.has(id)) expandedEntryIds.delete(id); else expandedEntryIds.add(id);
      renderAll();
    });
  });
  container.querySelectorAll(".edit-entry-btn").forEach(btn => {
    btn.addEventListener("click", () => openEntryModal(btn.dataset.entryId));
  });
  container.querySelectorAll(".entry-trip-badge[data-trip-id]").forEach(badge => {
    badge.addEventListener("click", () => openTripDetail(badge.dataset.tripId));
  });
  container.querySelectorAll(".entry-photos img").forEach(img => {
    img.addEventListener("click", () => {
      const entry = entries.find(e => e.id === img.dataset.entryId);
      openLightbox((entry.photos || []).map(src => ({ src, caption: entry.title })), Number(img.dataset.photoIndex));
    });
  });
}

// ---- Trips view ------------------------------------------------------------

function filteredTrips() {
  return trips.filter(t => {
    if (statusFilter !== "all" && computeStatus(t) !== statusFilter) return false;
    return matchesSearch([t.name, t.destination, (t.tags || []).join(" ")].join(" "));
  });
}

function tripCardHtml(trip) {
  const status = computeStatus(trip);
  const nEntries = tripEntries(trip.id).length;
  const nPhotos = tripEntries(trip.id).reduce((n, e) => n + (e.photos || []).length, 0) + (trip.coverPhoto ? 1 : 0);
  let dateLabel = "Someday";
  if (trip.startDate && trip.endDate && trip.startDate !== trip.endDate) dateLabel = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
  else if (trip.startDate) dateLabel = formatDate(trip.startDate);
  return `
  <div class="trip-card" data-trip-id="${trip.id}">
    <div class="trip-cover ${trip.coverPhoto ? "" : "no-photo"}" style="${trip.coverPhoto ? `background-image:url('${trip.coverPhoto}')` : ""}">
      ${trip.coverPhoto ? "" : `<span class="trip-emoji-big">${escapeHtml(trip.emoji || "📍")}</span>`}
    </div>
    <div class="trip-body">
      <h3 class="trip-name">${escapeHtml(trip.name)}</h3>
      <div class="trip-destination">${escapeHtml(trip.destination || "")}</div>
      <span class="status-badge status-${status}"><span class="status-dot"></span>${STATUS_LABELS[status]}</span>
      ${trip.summary ? `<p class="trip-summary">${escapeHtml(trip.summary)}</p>` : ""}
      <div class="trip-footer">
        <span>${dateLabel}</span>
        <span>${nEntries} ${nEntries === 1 ? "entry" : "entries"} · ${nPhotos} 📷</span>
      </div>
    </div>
  </div>`;
}

function renderTrips() {
  const grid = document.getElementById("trips-grid");
  const list = filteredTrips();
  grid.innerHTML = list.map(tripCardHtml).join("");
  document.getElementById("trips-empty").classList.toggle("hidden", trips.length !== 0);
  grid.querySelectorAll(".trip-card").forEach(card => {
    card.addEventListener("click", () => openTripDetail(card.dataset.tripId));
  });
}

// ---- Trip detail view --------------------------------------------------------

function openTripDetail(tripId) {
  currentTripDetailId = tripId;
  switchTab("trip-detail");
  renderTripDetail(tripId);
}

function renderTripDetail(tripId) {
  const trip = getTrip(tripId);
  if (!trip) { switchTab("trips"); return; }
  const status = computeStatus(trip);
  let dateLabel = "No dates yet";
  if (trip.startDate && trip.endDate && trip.startDate !== trip.endDate) dateLabel = `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
  else if (trip.startDate) dateLabel = formatDate(trip.startDate);

  document.getElementById("trip-detail-header").innerHTML = `
    ${trip.coverPhoto ? `<div class="trip-cover-banner" style="background-image:url('${trip.coverPhoto}')"></div>` : ""}
    <div class="trip-detail-top">
      <div>
        <h2>${escapeHtml(trip.emoji || "📍")} ${escapeHtml(trip.name)}</h2>
        <div class="trip-destination">${escapeHtml(trip.destination || "")}</div>
        <span class="status-badge status-${status}"><span class="status-dot"></span>${STATUS_LABELS[status]}</span>
        <p class="trip-detail-dates">${dateLabel}</p>
        ${trip.summary ? `<p>${escapeHtml(trip.summary)}</p>` : ""}
        ${(trip.tags || []).length ? `<div class="entry-tags">${trip.tags.map(t => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      </div>
      <button type="button" class="btn btn-secondary btn-small" id="edit-trip-btn">Edit Trip</button>
    </div>`;
  document.getElementById("edit-trip-btn").addEventListener("click", () => openTripModal(trip.id));

  const entriesList = tripEntries(tripId).sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date));
  const entriesEl = document.getElementById("trip-detail-entries");
  entriesEl.innerHTML = entriesList.map(e => entryCardHtml(e, { hideTrip: true })).join("")
    || `<p class="empty-state">No entries for this trip yet.</p>`;
  bindEntryCardEvents(entriesEl);

  const photos = tripEntries(tripId).flatMap(e => (e.photos || []).map(src => ({ src, caption: e.title })));
  const photosEl = document.getElementById("trip-detail-photos");
  photosEl.innerHTML = photos.map((p, i) => `<img src="${p.src}" data-index="${i}" alt="">`).join("");
  photosEl.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => openLightbox(photos, Number(img.dataset.index)));
  });
}

// ---- Photos view --------------------------------------------------------------

function renderPhotosView() {
  const select = document.getElementById("photos-trip-filter");
  const prevValue = select.value || "all";
  select.innerHTML = `<option value="all">All trips</option>` +
    trips.map(t => `<option value="${t.id}">${escapeHtml(t.emoji || "📍")} ${escapeHtml(t.name)}</option>`).join("");
  select.value = [...select.options].some(o => o.value === prevValue) ? prevValue : "all";

  const photos = allPhotos().filter(p => select.value === "all" || p.tripId === select.value);
  const grid = document.getElementById("photos-grid-main");
  grid.innerHTML = photos.map((p, i) => `<img src="${p.src}" data-index="${i}" alt="">`).join("");
  document.getElementById("photos-empty").classList.toggle("hidden", allPhotos().length !== 0);
  grid.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => openLightbox(photos, Number(img.dataset.index)));
  });
}

// ---- Lightbox -----------------------------------------------------------------

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex = index;
  showLightboxPhoto();
  document.getElementById("lightbox").classList.remove("hidden");
}
function showLightboxPhoto() {
  const p = lightboxPhotos[lightboxIndex];
  if (!p) return;
  document.getElementById("lightbox-img").src = p.src;
  document.getElementById("lightbox-caption").textContent = p.caption || "";
  const multi = lightboxPhotos.length > 1;
  document.getElementById("lightbox-prev").classList.toggle("hidden", !multi);
  document.getElementById("lightbox-next").classList.toggle("hidden", !multi);
}
function closeLightbox() { document.getElementById("lightbox").classList.add("hidden"); }

// ---- Tabs -----------------------------------------------------------------

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  if (tab === "trip-detail") {
    document.getElementById("view-trip-detail").classList.remove("hidden");
  } else {
    document.getElementById(`view-${tab}`).classList.remove("hidden");
  }
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
}

// ---- Trip modal -----------------------------------------------------------

function openTripModal(tripId) {
  editingTripId = tripId || null;
  pendingCoverPhoto = undefined;
  const trip = tripId ? getTrip(tripId) : null;

  document.getElementById("trip-modal-title").textContent = trip ? "Edit Trip" : "New Trip";
  document.getElementById("trip-name-input").value = trip ? trip.name : "";
  document.getElementById("trip-destination-input").value = trip ? trip.destination || "" : "";
  document.getElementById("trip-start-input").value = trip ? trip.startDate || "" : "";
  document.getElementById("trip-end-input").value = trip ? trip.endDate || "" : "";
  document.getElementById("trip-status-input").value = trip ? trip.status || "idea" : "idea";
  document.getElementById("trip-emoji-input").value = trip ? trip.emoji || "" : "";
  document.getElementById("trip-summary-input").value = trip ? trip.summary || "" : "";
  document.getElementById("trip-tags-input").value = trip ? (trip.tags || []).join(", ") : "";
  document.getElementById("trip-cover-input").value = "";
  renderTripCoverPreview(trip ? trip.coverPhoto : null);
  document.getElementById("delete-trip-btn").classList.toggle("hidden", !trip);

  document.getElementById("emoji-suggestions").innerHTML = EMOJI_SUGGESTIONS.map(em =>
    `<button type="button" data-emoji="${em}">${em}</button>`).join("");
  document.getElementById("emoji-suggestions").querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => { document.getElementById("trip-emoji-input").value = btn.dataset.emoji; });
  });

  openModal("trip-modal");
}

function renderTripCoverPreview(src) {
  const el = document.getElementById("trip-cover-preview");
  const effective = pendingCoverPhoto !== undefined ? pendingCoverPhoto : src;
  el.innerHTML = effective ? `<div class="photo-thumb"><img src="${effective}"><button type="button" class="remove-photo-btn" id="remove-cover-btn">✕</button></div>` : "";
  const removeBtn = document.getElementById("remove-cover-btn");
  if (removeBtn) removeBtn.addEventListener("click", () => { pendingCoverPhoto = null; renderTripCoverPreview(null); });
}

function saveTripForm(e) {
  e.preventDefault();
  const name = document.getElementById("trip-name-input").value.trim();
  if (!name) return;
  const coverPhoto = pendingCoverPhoto !== undefined ? pendingCoverPhoto : (getTrip(editingTripId)?.coverPhoto || null);
  const data = {
    name,
    destination: document.getElementById("trip-destination-input").value.trim(),
    startDate: document.getElementById("trip-start-input").value || null,
    endDate: document.getElementById("trip-end-input").value || null,
    status: document.getElementById("trip-status-input").value,
    emoji: document.getElementById("trip-emoji-input").value.trim() || "📍",
    coverPhoto,
    summary: document.getElementById("trip-summary-input").value.trim(),
    tags: parseTags(document.getElementById("trip-tags-input").value)
  };
  if (editingTripId) {
    const trip = getTrip(editingTripId);
    Object.assign(trip, data, { updatedAt: Date.now() });
  } else {
    trips.push({ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), ...data });
  }
  saveTrips();
  closeModal("trip-modal");
  renderAll();
}

function deleteTrip() {
  if (!editingTripId) return;
  const trip = getTrip(editingTripId);
  const n = tripEntries(editingTripId).length;
  const msg = n ? `Delete "${trip.name}"? Its ${n} journal ${n === 1 ? "entry" : "entries"} will become unassigned (not deleted).` : `Delete "${trip.name}"? This cannot be undone.`;
  if (!confirm(msg)) return;
  trips = trips.filter(t => t.id !== editingTripId);
  entries.forEach(e => { if (e.tripId === editingTripId) e.tripId = null; });
  saveTrips(); saveEntries();
  closeModal("trip-modal");
  if (currentTripDetailId === editingTripId) switchTab("trips");
  renderAll();
}

// ---- Entry modal ------------------------------------------------------------

function populateTripSelect(selectedId) {
  const select = document.getElementById("entry-trip-select");
  select.innerHTML = `<option value="">— General (no trip) —</option>` +
    trips.map(t => `<option value="${t.id}">${escapeHtml(t.emoji || "📍")} ${escapeHtml(t.name)}</option>`).join("");
  select.value = selectedId || "";
}

function openEntryModal(entryId, defaultTripId) {
  editingEntryId = entryId || null;
  const entry = entryId ? entries.find(e => e.id === entryId) : null;
  pendingEntryPhotos = entry ? [...(entry.photos || [])] : [];

  document.getElementById("entry-modal-title").textContent = entry ? "Edit Entry" : "New Entry";
  document.querySelector(`input[name="entry-format"][value="${entry ? entry.format : "story"}"]`).checked = true;
  document.getElementById("entry-title-input").value = entry ? entry.title : "";
  document.getElementById("entry-date-input").value = entry ? entry.date : new Date().toISOString().slice(0, 10);
  populateTripSelect(entry ? entry.tripId : defaultTripId);
  document.getElementById("entry-body-input").value = entry ? entry.body : "";
  document.getElementById("entry-tags-input").value = entry ? (entry.tags || []).join(", ") : "";
  document.getElementById("entry-photos-input").value = "";
  renderEntryPhotosPreview();
  document.getElementById("delete-entry-btn").classList.toggle("hidden", !entry);

  openModal("entry-modal");
}

function renderEntryPhotosPreview() {
  const el = document.getElementById("entry-photos-preview");
  el.innerHTML = pendingEntryPhotos.map((src, i) =>
    `<div class="photo-thumb"><img src="${src}"><button type="button" class="remove-photo-btn" data-index="${i}">✕</button></div>`).join("");
  el.querySelectorAll(".remove-photo-btn").forEach(btn => {
    btn.addEventListener("click", () => { pendingEntryPhotos.splice(Number(btn.dataset.index), 1); renderEntryPhotosPreview(); });
  });
}

async function handleEntryPhotosInput(e) {
  const files = [...e.target.files];
  for (const file of files) {
    try { pendingEntryPhotos.push(await compressImage(file)); }
    catch (err) { console.error(err); }
  }
  renderEntryPhotosPreview();
  e.target.value = "";
}

async function handleTripCoverInput(e) {
  const file = e.target.files[0];
  if (!file) return;
  try { pendingCoverPhoto = await compressImage(file, 1400, 0.75); renderTripCoverPreview(null); }
  catch (err) { console.error(err); }
  e.target.value = "";
}

function saveEntryForm(e) {
  e.preventDefault();
  const title = document.getElementById("entry-title-input").value.trim();
  const body = document.getElementById("entry-body-input").value.trim();
  if (!title || !body) return;
  const data = {
    format: document.querySelector('input[name="entry-format"]:checked').value,
    title,
    date: document.getElementById("entry-date-input").value,
    tripId: document.getElementById("entry-trip-select").value || null,
    body,
    photos: [...pendingEntryPhotos],
    tags: parseTags(document.getElementById("entry-tags-input").value)
  };
  if (editingEntryId) {
    const entry = entries.find(e2 => e2.id === editingEntryId);
    Object.assign(entry, data, { updatedAt: Date.now() });
  } else {
    entries.push({ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), ...data });
  }
  saveEntries();
  closeModal("entry-modal");
  renderAll();
}

function deleteEntry() {
  if (!editingEntryId) return;
  if (!confirm("Delete this entry? This cannot be undone.")) return;
  entries = entries.filter(e => e.id !== editingEntryId);
  expandedEntryIds.delete(editingEntryId);
  saveEntries();
  closeModal("entry-modal");
  renderAll();
}

// ---- Modals (generic) --------------------------------------------------------

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// ---- Import / Export ----------------------------------------------------------

function exportData() {
  const payload = { version: 1, exportedAt: new Date().toISOString(), trips, entries };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `travel-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = e => {
    let payload;
    try { payload = JSON.parse(e.target.result); }
    catch (err) { alert("That doesn't look like a valid backup file."); return; }
    if (!Array.isArray(payload.trips) || !Array.isArray(payload.entries)) {
      alert("That doesn't look like a valid Travel Journal backup file."); return;
    }
    if (!confirm(`Import ${payload.trips.length} trips and ${payload.entries.length} entries? This will replace everything currently in your journal.`)) return;
    trips = payload.trips;
    entries = payload.entries;
    saveTrips(); saveEntries();
    currentTripDetailId = null;
    switchTab("timeline");
    renderAll();
  };
  reader.readAsText(file);
}

// ---- Event wiring ---------------------------------------------------------

function bindStaticEvents() {
  document.getElementById("tabs").addEventListener("click", e => {
    const btn = e.target.closest(".tab-btn");
    if (btn) switchTab(btn.dataset.tab);
  });
  document.getElementById("back-to-trips").addEventListener("click", () => { currentTripDetailId = null; switchTab("trips"); });

  document.getElementById("search-input").addEventListener("input", e => { searchQuery = e.target.value; renderTimeline(); renderTrips(); });

  document.getElementById("format-filter").addEventListener("click", e => {
    const btn = e.target.closest(".chip-btn");
    if (!btn) return;
    formatFilter = btn.dataset.format;
    document.querySelectorAll("#format-filter .chip-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderTimeline();
  });
  document.getElementById("status-filter").addEventListener("click", e => {
    const btn = e.target.closest(".chip-btn");
    if (!btn) return;
    statusFilter = btn.dataset.status;
    document.querySelectorAll("#status-filter .chip-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderTrips();
  });
  document.getElementById("sort-toggle-btn").addEventListener("click", () => {
    sortNewestFirst = !sortNewestFirst;
    document.getElementById("sort-toggle-btn").textContent = sortNewestFirst ? "Newest first" : "Oldest first";
    renderTimeline();
  });
  document.getElementById("photos-trip-filter").addEventListener("change", renderPhotosView);

  document.getElementById("new-trip-btn").addEventListener("click", () => openTripModal(null));
  document.getElementById("new-entry-btn").addEventListener("click", () => openEntryModal(null));
  document.getElementById("timeline-empty-cta").addEventListener("click", () => openEntryModal(null));
  document.getElementById("trips-empty-cta").addEventListener("click", () => openTripModal(null));
  document.getElementById("trip-add-entry-btn").addEventListener("click", () => openEntryModal(null, currentTripDetailId));

  document.getElementById("trip-form").addEventListener("submit", saveTripForm);
  document.getElementById("delete-trip-btn").addEventListener("click", deleteTrip);
  document.getElementById("trip-cover-input").addEventListener("change", handleTripCoverInput);

  document.getElementById("entry-form").addEventListener("submit", saveEntryForm);
  document.getElementById("delete-entry-btn").addEventListener("click", deleteEntry);
  document.getElementById("entry-photos-input").addEventListener("change", handleEntryPhotosInput);

  document.querySelectorAll(".close-modal-btn").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.modal));
  });
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(modal.id); });
  });

  document.getElementById("export-btn").addEventListener("click", exportData);
  document.getElementById("import-btn").addEventListener("click", () => document.getElementById("import-file").click());
  document.getElementById("import-file").addEventListener("change", e => { if (e.target.files[0]) importData(e.target.files[0]); });

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
  document.getElementById("lightbox-prev").addEventListener("click", () => { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; showLightboxPhoto(); });
  document.getElementById("lightbox-next").addEventListener("click", () => { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; showLightboxPhoto(); });
  document.addEventListener("keydown", e => {
    if (document.getElementById("lightbox").classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") document.getElementById("lightbox-prev").click();
    if (e.key === "ArrowRight") document.getElementById("lightbox-next").click();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal:not(.hidden)").forEach(m => closeModal(m.id));
  });
}
