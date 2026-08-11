/* =========================================================================
   Wayfarer — App Logic
   ========================================================================= */

const STORAGE_KEY = "wayfarer_journal_v1";

const TYPE_LABELS = { blog: "📝 Blog Post", story: "📖 Short Story", note: "🗒️ Note", insight: "💡 Insight" };
const EMOJI_CHOICES = ["🧭", "✈️", "🏔️", "🏖️", "🏯", "🌋", "🚂", "🏕️", "🚋", "⛰️", "🥝", "🗺️"];
const STATUS_LABELS = { ongoing: "Happening now", upcoming: "Upcoming", past: "Past", idea: "Bucket list" };
const STATUS_ORDER = ["ongoing", "upcoming", "past", "idea"];

// ---- State -----------------------------------------------------------------

let state = { trips: [], entries: [] };
let currentView = "trips";      // "trips" | "feed" | "tripDetail"
let currentTripId = null;
let editingTripId = null;       // set when trip modal is editing rather than creating
let editingEntryId = null;      // set when entry modal is editing rather than creating
let draftPhotos = [];           // photos attached in the currently-open entry form

// ---- Bootstrap ---------------------------------------------------------------

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to seed data */ }
  return { trips: structuredClone(SEED_TRIPS), entries: structuredClone(SEED_ENTRIES) };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Date / status helpers ---------------------------------------------------

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function tripStatus(trip) {
  if (!trip.startDate) return "idea";
  const today = todayStr();
  const end = trip.endDate || trip.startDate;
  if (end < today) return "past";
  if (trip.startDate > today) return "upcoming";
  return "ongoing";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateRange(trip) {
  if (!trip.startDate) return "Dates not set";
  if (!trip.endDate || trip.endDate === trip.startDate) return formatDate(trip.startDate);
  return `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
}

function tagsToArray(str) {
  return str.split(",").map(t => t.trim()).filter(Boolean);
}

function tripById(id) {
  return state.trips.find(t => t.id === id);
}

function entriesForTrip(tripId) {
  return state.entries.filter(e => e.tripId === tripId).sort((a, b) => a.date.localeCompare(b.date));
}

// ---- Search / filter ---------------------------------------------------------

function matchesQuery(haystackParts, query) {
  if (!query) return true;
  const hay = haystackParts.filter(Boolean).join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}

function getFilters() {
  return {
    query: document.getElementById("search-input").value.trim(),
    status: document.getElementById("status-filter").value
  };
}

function tripMatchesFilters(trip, filters) {
  if (filters.status !== "all" && tripStatus(trip) !== filters.status) return false;
  if (!filters.query) return true;
  const ownMatch = matchesQuery([trip.title, trip.destination, trip.summary, trip.notes, ...(trip.tags || [])], filters.query);
  if (ownMatch) return true;
  return entriesForTrip(trip.id).some(e => entryMatchesQuery(e, filters.query));
}

function entryMatchesQuery(entry, query) {
  return matchesQuery([entry.title, entry.body, entry.location, ...(entry.tags || [])], query);
}

// ---- Rendering: Trips view ---------------------------------------------------

function renderTripsView() {
  const filters = getFilters();
  const groups = document.getElementById("trip-groups");
  groups.innerHTML = "";

  let anyShown = false;
  for (const status of STATUS_ORDER) {
    const trips = state.trips
      .filter(t => tripStatus(t) === status && tripMatchesFilters(t, filters))
      .sort((a, b) => sortKeyForStatus(a, status).localeCompare(sortKeyForStatus(b, status)));
    if (!trips.length) continue;
    anyShown = true;

    const section = document.createElement("div");
    section.className = "trip-group";
    section.innerHTML = `<h2 class="trip-group-title">${STATUS_LABELS[status]}</h2>`;
    const cardWrap = document.createElement("div");
    cardWrap.className = "trip-cards";
    trips.forEach(trip => cardWrap.appendChild(renderTripCard(trip)));
    section.appendChild(cardWrap);
    groups.appendChild(section);
  }

  document.getElementById("no-trip-results").classList.toggle("hidden", anyShown);
}

function sortKeyForStatus(trip, status) {
  if (status === "upcoming" || status === "ongoing") return trip.startDate || "9999";
  if (status === "past") return trip.endDate ? `9999-${(9999 - Number(trip.endDate.slice(0,4))).toString().padStart(4,"0")}${trip.endDate.slice(4)}` : "0000";
  return trip.title;
}

function renderTripCard(trip) {
  const status = tripStatus(trip);
  const card = document.createElement("div");
  card.className = "trip-card";
  card.addEventListener("click", () => openTripDetail(trip.id));
  card.innerHTML = `
    <div class="trip-card-banner status-${status}">${trip.emoji || "🧭"}</div>
    <div class="trip-card-body">
      <div class="trip-card-title">${escapeHtml(trip.title)}</div>
      <div class="trip-card-dest">${escapeHtml(trip.destination)}</div>
      <div class="trip-card-dates">${formatDateRange(trip)}</div>
      <p class="trip-card-summary">${escapeHtml(trip.summary || "")}</p>
      <div class="trip-card-foot">
        <span class="status-badge status-${status}">${STATUS_LABELS[status]}</span>
        <span class="entry-count">${entriesForTrip(trip.id).length} entries</span>
      </div>
    </div>`;
  return card;
}

// ---- Rendering: Journal feed view --------------------------------------------

function renderFeedView() {
  const filters = getFilters();
  const feed = document.getElementById("entry-feed");
  feed.innerHTML = "";

  const entries = state.entries
    .filter(e => {
      const trip = tripById(e.tripId);
      if (!trip) return false;
      if (filters.status !== "all" && tripStatus(trip) !== filters.status) return false;
      if (!filters.query) return true;
      return entryMatchesQuery(e, filters.query) || matchesQuery([trip.title, trip.destination], filters.query);
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  entries.forEach(entry => feed.appendChild(renderEntryCard(entry, { showTripLink: true })));
  document.getElementById("no-feed-results").classList.toggle("hidden", entries.length > 0);
}

// ---- Rendering: shared entry card --------------------------------------------

function renderEntryCard(entry, opts = {}) {
  const trip = tripById(entry.tripId);
  const card = document.createElement("article");
  card.className = "entry-card";

  const bodyHtml = entry.body.split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
  const tagsHtml = (entry.tags || []).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("");
  const metaBits = [formatDate(entry.date), entry.location].filter(Boolean);

  card.innerHTML = `
    <div class="entry-head">
      <div class="entry-head-left">
        ${opts.showTripLink && trip ? `<span class="entry-trip-link" data-trip-id="${trip.id}">${trip.emoji || ""} ${escapeHtml(trip.title)}</span>` : ""}
        <span class="type-pill">${TYPE_LABELS[entry.type] || entry.type}</span>
        <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
        <span class="entry-meta">${metaBits.map(escapeHtml).join(" · ")}</span>
      </div>
      <div class="entry-actions">
        <button class="icon-btn edit-entry-btn" title="Edit entry" aria-label="Edit entry">✏️</button>
      </div>
    </div>
    <div class="entry-body">${bodyHtml}</div>
    ${entry.photos && entry.photos.length ? `<div class="photo-grid entry-photo-grid"></div>` : ""}
    ${tagsHtml ? `<div class="entry-tags">${tagsHtml}</div>` : ""}
  `;

  if (entry.photos && entry.photos.length) {
    const grid = card.querySelector(".entry-photo-grid");
    entry.photos.forEach(photo => grid.appendChild(renderPhotoThumb(photo, entry.title)));
  }

  card.querySelector(".edit-entry-btn").addEventListener("click", (ev) => {
    ev.stopPropagation();
    openEntryModal(entry.tripId, entry.id);
  });
  const tripLink = card.querySelector(".entry-trip-link");
  if (tripLink) tripLink.addEventListener("click", () => openTripDetail(trip.id));

  return card;
}

function renderPhotoThumb(photo, altText) {
  const div = document.createElement("div");
  div.className = "photo-thumb";
  div.innerHTML = `<img src="${photo.dataUrl}" alt="${escapeHtml(photo.caption || altText || "")}">`;
  div.querySelector("img").addEventListener("click", () => openLightbox(photo.dataUrl, photo.caption || ""));
  return div;
}

// ---- Rendering: Trip detail ---------------------------------------------------

function openTripDetail(tripId) {
  currentTripId = tripId;
  currentView = "tripDetail";
  renderTripDetail();
  setActiveView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderTripDetail() {
  const trip = tripById(currentTripId);
  if (!trip) { closeTripDetail(); return; }
  const status = tripStatus(trip);

  const hero = document.getElementById("trip-hero");
  hero.className = `trip-hero status-${status}`;
  hero.style.background = heroBackground(status);
  const tagsHtml = (trip.tags || []).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("");
  hero.innerHTML = `
    <div>
      <div class="trip-hero-title">${trip.emoji || "🧭"} ${escapeHtml(trip.title)}</div>
      <div class="trip-hero-dest">${escapeHtml(trip.destination)} · <span class="status-badge status-${status}" style="background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.4);color:#fdfcf6;">${STATUS_LABELS[status]}</span></div>
      <div class="trip-hero-dates">${formatDateRange(trip)}</div>
      ${trip.summary ? `<p class="trip-hero-summary">${escapeHtml(trip.summary)}</p>` : ""}
      ${tagsHtml ? `<div class="trip-hero-tags">${tagsHtml}</div>` : ""}
    </div>
    <div class="trip-hero-actions">
      <button class="btn btn-secondary btn-small" id="edit-trip-btn">Edit Trip</button>
    </div>
  `;
  document.getElementById("edit-trip-btn").addEventListener("click", () => openTripModal(trip.id));

  document.getElementById("trip-notes-text").textContent = trip.notes || "";
  document.getElementById("trip-notes-text").classList.toggle("hidden", !trip.notes);
  document.getElementById("trip-notes-empty").classList.toggle("hidden", !!trip.notes);
  document.getElementById("edit-trip-notes-btn").onclick = () => openTripModal(trip.id);

  const entries = entriesForTrip(trip.id);
  const photoCard = document.getElementById("trip-photos-card");
  const allPhotos = entries.flatMap(e => (e.photos || []).map(p => ({ photo: p, entry: e })));
  photoCard.classList.toggle("hidden", allPhotos.length === 0);
  const photoGrid = document.getElementById("trip-photo-grid");
  photoGrid.innerHTML = "";
  allPhotos.forEach(({ photo, entry }) => photoGrid.appendChild(renderPhotoThumb(photo, entry.title)));

  const list = document.getElementById("trip-entry-list");
  list.innerHTML = "";
  entries.slice().reverse().forEach(entry => list.appendChild(renderEntryCard(entry, { showTripLink: false })));
  document.getElementById("no-entries").classList.toggle("hidden", entries.length > 0);
}

function heroBackground(status) {
  const gradients = {
    ongoing: "linear-gradient(135deg, var(--accent), #4a8a83)",
    upcoming: "linear-gradient(135deg, var(--gold), #d6ab52)",
    past: "linear-gradient(135deg, var(--stamp), #c76a4f)",
    idea: "linear-gradient(135deg, #8a8371, #a9a18c)"
  };
  return gradients[status] || gradients.idea;
}

function closeTripDetail() {
  currentTripId = null;
  currentView = "trips";
  setActiveView();
  renderTripsView();
}

// ---- View switching -----------------------------------------------------------

function setActiveView() {
  document.getElementById("trips-view").classList.toggle("hidden", currentView !== "trips");
  document.getElementById("feed-view").classList.toggle("hidden", currentView !== "feed");
  document.getElementById("trip-detail").classList.toggle("hidden", currentView !== "tripDetail");
  document.getElementById("view-trips-btn").classList.toggle("active", currentView === "trips");
  document.getElementById("view-feed-btn").classList.toggle("active", currentView === "feed");
}

function rerenderCurrentView() {
  if (currentView === "trips") renderTripsView();
  else if (currentView === "feed") renderFeedView();
  else if (currentView === "tripDetail") renderTripDetail();
}

// ---- Trip modal ---------------------------------------------------------------

function renderEmojiPicker(selected) {
  const wrap = document.getElementById("emoji-picker");
  wrap.innerHTML = "";
  EMOJI_CHOICES.forEach(emoji => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emoji-option" + (emoji === selected ? " selected" : "");
    btn.textContent = emoji;
    btn.addEventListener("click", () => {
      document.getElementById("trip-emoji-input").value = emoji;
      wrap.querySelectorAll(".emoji-option").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    wrap.appendChild(btn);
  });
}

function openTripModal(tripId) {
  editingTripId = tripId || null;
  const trip = tripId ? tripById(tripId) : null;

  document.getElementById("trip-modal-title").textContent = trip ? "Edit Trip" : "New Trip";
  document.getElementById("trip-title-input").value = trip ? trip.title : "";
  document.getElementById("trip-destination-input").value = trip ? trip.destination : "";
  document.getElementById("trip-start-input").value = trip ? (trip.startDate || "") : "";
  document.getElementById("trip-end-input").value = trip ? (trip.endDate || "") : "";
  document.getElementById("trip-summary-input").value = trip ? trip.summary || "" : "";
  document.getElementById("trip-notes-input").value = trip ? trip.notes || "" : "";
  document.getElementById("trip-tags-input").value = trip ? (trip.tags || []).join(", ") : "";
  document.getElementById("trip-emoji-input").value = trip ? (trip.emoji || "🧭") : "🧭";
  renderEmojiPicker(document.getElementById("trip-emoji-input").value);
  document.getElementById("delete-trip-btn").classList.toggle("hidden", !trip);

  document.getElementById("trip-modal").classList.remove("hidden");
}

function closeTripModal() {
  document.getElementById("trip-modal").classList.add("hidden");
  editingTripId = null;
}

function handleTripFormSubmit(ev) {
  ev.preventDefault();
  const startDate = document.getElementById("trip-start-input").value || null;
  const endDate = document.getElementById("trip-end-input").value || null;
  if (startDate && endDate && endDate < startDate) {
    alert("End date can't be before the start date.");
    return;
  }

  const payload = {
    title: document.getElementById("trip-title-input").value.trim(),
    destination: document.getElementById("trip-destination-input").value.trim(),
    emoji: document.getElementById("trip-emoji-input").value || "🧭",
    startDate,
    endDate: startDate ? endDate : null,
    summary: document.getElementById("trip-summary-input").value.trim(),
    notes: document.getElementById("trip-notes-input").value.trim(),
    tags: tagsToArray(document.getElementById("trip-tags-input").value)
  };

  if (editingTripId) {
    Object.assign(tripById(editingTripId), payload);
  } else {
    state.trips.push({ id: makeId("t"), ...payload });
  }
  saveState();
  closeTripModal();
  rerenderCurrentView();
  if (currentView === "tripDetail") renderTripDetail();
}

function handleDeleteTrip() {
  if (!editingTripId) return;
  const deletedTripId = editingTripId;
  const trip = tripById(deletedTripId);
  showConfirm(`Delete "${trip.title}" and all of its journal entries? This can't be undone.`, () => {
    state.trips = state.trips.filter(t => t.id !== deletedTripId);
    state.entries = state.entries.filter(e => e.tripId !== deletedTripId);
    saveState();
    closeTripModal();
    if (currentView === "tripDetail" && currentTripId === deletedTripId) closeTripDetail();
    else rerenderCurrentView();
  });
}

// ---- Entry modal ----------------------------------------------------------------

function populateTripSelect(selectedTripId) {
  const select = document.getElementById("entry-trip-input");
  select.innerHTML = "";
  state.trips
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach(trip => {
      const opt = document.createElement("option");
      opt.value = trip.id;
      opt.textContent = `${trip.emoji || ""} ${trip.title}`;
      select.appendChild(opt);
    });
  if (selectedTripId) select.value = selectedTripId;
}

function renderPhotoDraftPreview() {
  const grid = document.getElementById("entry-photo-preview");
  grid.innerHTML = "";
  draftPhotos.forEach((photo, idx) => {
    const thumb = renderPhotoThumb(photo, "");
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "photo-thumb-remove";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      draftPhotos.splice(idx, 1);
      renderPhotoDraftPreview();
    });
    thumb.appendChild(removeBtn);
    grid.appendChild(thumb);
  });
}

function openEntryModal(tripId, entryId) {
  editingEntryId = entryId || null;
  const entry = entryId ? state.entries.find(e => e.id === entryId) : null;
  draftPhotos = entry ? structuredClone(entry.photos || []) : [];

  document.getElementById("entry-modal-title").textContent = entry ? "Edit Journal Entry" : "New Journal Entry";
  populateTripSelect(entry ? entry.tripId : tripId);
  document.getElementById("entry-type-input").value = entry ? entry.type : "blog";
  document.getElementById("entry-title-input").value = entry ? entry.title : "";
  document.getElementById("entry-date-input").value = entry ? entry.date : todayStr();
  document.getElementById("entry-location-input").value = entry ? entry.location || "" : "";
  document.getElementById("entry-body-input").value = entry ? entry.body : "";
  document.getElementById("entry-tags-input").value = entry ? (entry.tags || []).join(", ") : "";
  document.getElementById("entry-photo-input").value = "";
  document.getElementById("delete-entry-btn").classList.toggle("hidden", !entry);
  renderPhotoDraftPreview();

  document.getElementById("entry-modal").classList.remove("hidden");
}

function closeEntryModal() {
  document.getElementById("entry-modal").classList.add("hidden");
  editingEntryId = null;
  draftPhotos = [];
}

// Resize/compress an image file client-side before storing it as a data URL,
// since localStorage has a small (~5MB) quota shared across the whole app.
function readAndResizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1400;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handlePhotoInputChange(ev) {
  const files = Array.from(ev.target.files || []);
  for (const file of files) {
    try {
      const dataUrl = await readAndResizeImage(file);
      draftPhotos.push({ dataUrl, caption: "" });
    } catch (e) { /* skip files that fail to load */ }
  }
  renderPhotoDraftPreview();
  ev.target.value = "";
}

function handleEntryFormSubmit(ev) {
  ev.preventDefault();
  const payload = {
    tripId: document.getElementById("entry-trip-input").value,
    type: document.getElementById("entry-type-input").value,
    title: document.getElementById("entry-title-input").value.trim(),
    date: document.getElementById("entry-date-input").value,
    location: document.getElementById("entry-location-input").value.trim(),
    body: document.getElementById("entry-body-input").value.trim(),
    tags: tagsToArray(document.getElementById("entry-tags-input").value),
    photos: draftPhotos
  };

  if (editingEntryId) {
    Object.assign(state.entries.find(e => e.id === editingEntryId), payload);
  } else {
    state.entries.push({ id: makeId("e"), ...payload });
  }
  saveState();
  closeEntryModal();
  rerenderCurrentView();
  if (currentView === "tripDetail") renderTripDetail();
}

function handleDeleteEntry() {
  if (!editingEntryId) return;
  const deletedEntryId = editingEntryId;
  showConfirm("Delete this journal entry? This can't be undone.", () => {
    state.entries = state.entries.filter(e => e.id !== deletedEntryId);
    saveState();
    closeEntryModal();
    rerenderCurrentView();
    if (currentView === "tripDetail") renderTripDetail();
  });
}

// ---- Confirm dialog (in-page, not the blocked native confirm()) ---------------------

let confirmCallback = null;

function showConfirm(message, onConfirm) {
  document.getElementById("confirm-modal-message").textContent = message;
  confirmCallback = onConfirm;
  document.getElementById("confirm-modal").classList.remove("hidden");
}

function closeConfirmModal() {
  document.getElementById("confirm-modal").classList.add("hidden");
  confirmCallback = null;
}

// ---- Lightbox -----------------------------------------------------------------

function openLightbox(dataUrl, caption) {
  document.getElementById("lightbox-img").src = dataUrl;
  document.getElementById("lightbox-caption").textContent = caption || "";
  document.getElementById("lightbox").classList.remove("hidden");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
  document.getElementById("lightbox-img").src = "";
}

// ---- Misc helpers ---------------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---- Wire up events ---------------------------------------------------------------

function init() {
  state = loadState();

  document.getElementById("search-input").addEventListener("input", rerenderCurrentView);
  document.getElementById("status-filter").addEventListener("change", rerenderCurrentView);

  document.getElementById("view-trips-btn").addEventListener("click", () => { currentView = "trips"; setActiveView(); renderTripsView(); });
  document.getElementById("view-feed-btn").addEventListener("click", () => { currentView = "feed"; setActiveView(); renderFeedView(); });
  document.getElementById("back-to-trips-btn").addEventListener("click", closeTripDetail);

  document.getElementById("add-trip-btn").addEventListener("click", () => openTripModal());
  document.getElementById("close-trip-modal").addEventListener("click", closeTripModal);
  document.getElementById("cancel-trip-btn").addEventListener("click", closeTripModal);
  document.getElementById("trip-form").addEventListener("submit", handleTripFormSubmit);
  document.getElementById("delete-trip-btn").addEventListener("click", handleDeleteTrip);

  document.getElementById("add-entry-btn").addEventListener("click", () => openEntryModal(currentTripId));
  document.getElementById("close-entry-modal").addEventListener("click", closeEntryModal);
  document.getElementById("cancel-entry-btn").addEventListener("click", closeEntryModal);
  document.getElementById("entry-form").addEventListener("submit", handleEntryFormSubmit);
  document.getElementById("delete-entry-btn").addEventListener("click", handleDeleteEntry);
  document.getElementById("entry-photo-input").addEventListener("change", handlePhotoInputChange);

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox").addEventListener("click", (ev) => { if (ev.target.id === "lightbox") closeLightbox(); });

  document.getElementById("confirm-cancel-btn").addEventListener("click", closeConfirmModal);
  document.getElementById("confirm-ok-btn").addEventListener("click", () => {
    const callback = confirmCallback;
    closeConfirmModal();
    if (callback) callback();
  });
  document.getElementById("confirm-modal").addEventListener("click", (ev) => { if (ev.target.id === "confirm-modal") closeConfirmModal(); });

  [document.getElementById("trip-modal"), document.getElementById("entry-modal")].forEach(modal => {
    modal.addEventListener("click", (ev) => { if (ev.target === modal) modal.classList.add("hidden"); });
  });

  setActiveView();
  renderTripsView();
}

document.addEventListener("DOMContentLoaded", init);
