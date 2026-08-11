// Wayfarer travel journal — state, rendering, and interactions.
// All data lives in localStorage after first load; SEED_TRIPS/SEED_ENTRIES
// (from data.js) only seed that storage the very first time the app runs.

const STORAGE_KEY = "wayfarer.journal.v1";

let state = { trips: [], entries: [] };
let currentView = "trips";
let activeTripId = null;
let activeEntryId = null;
let editingTripId = null;
let editingEntryId = null;
let pendingTripPhoto = null;      // data URL staged from the file input
let pendingEntryPhotos = [];      // array of data URLs staged from the file input
let searchQuery = "";
let activeTagFilter = null;

const THEME_GRADIENTS = {
  ocean: "linear-gradient(135deg, #0f6d8a, #6fd0c5)",
  mountain: "linear-gradient(135deg, #4b5a6b, #9fb3c8)",
  forest: "linear-gradient(135deg, #7a3b2e, #d98e3f)",
  desert: "linear-gradient(135deg, #b8672f, #f0c987)",
  city: "linear-gradient(135deg, #2b3a67, #8a6fd0)",
  arctic: "linear-gradient(135deg, #1c3a52, #7fd9c4)",
  tropical: "linear-gradient(135deg, #0d7a4f, #7fe0a0)"
};

// ---------- persistence ----------

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      return;
    } catch (e) {
      // fall through to reseed on corrupt data
    }
  }
  state = {
    trips: JSON.parse(JSON.stringify(SEED_TRIPS)),
    entries: JSON.parse(JSON.stringify(SEED_ENTRIES))
  };
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- helpers ----------

function parseDate(s) {
  return new Date(s + "T00:00:00");
}

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function tripStatus(trip) {
  const t = today();
  const start = parseDate(trip.startDate);
  const end = parseDate(trip.endDate);
  if (end < t) return "past";
  if (start > t) return "upcoming";
  return "ongoing";
}

function formatDate(s) {
  return parseDate(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateRange(startS, endS) {
  const start = parseDate(startS);
  const end = parseDate(endS);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endFmt = sameMonth
    ? end.toLocaleDateString(undefined, { day: "numeric", year: "numeric" })
    : end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${startFmt} – ${endFmt}`;
}

function tripById(id) {
  return state.trips.find(t => t.id === id);
}

function entriesForTrip(tripId) {
  return state.entries
    .filter(e => e.tripId === tripId)
    .sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function parseTags(raw) {
  return raw.split(",").map(t => t.trim()).filter(Boolean);
}

function allTags() {
  const set = new Set();
  state.trips.forEach(t => (t.tags || []).forEach(tag => set.add(tag)));
  state.entries.forEach(e => (e.tags || []).forEach(tag => set.add(tag)));
  return Array.from(set).sort();
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- rendering: placeholder / cover art ----------

function coverStyle(theme) {
  return THEME_GRADIENTS[theme] || THEME_GRADIENTS.ocean;
}

function renderCover(trip, className) {
  if (trip.coverPhoto) {
    return `<div class="${className}"><img src="${trip.coverPhoto}" alt="${escapeHtml(trip.name)}"></div>`;
  }
  return `<div class="${className} cover-placeholder" style="background:${coverStyle(trip.theme)}">
    <span class="cover-icon">${trip.icon || "📍"}</span>
  </div>`;
}

// ---------- rendering: trips ----------

function matchesSearch(haystack) {
  if (!searchQuery) return true;
  return haystack.toLowerCase().includes(searchQuery.toLowerCase());
}

function matchesTagFilter(tags) {
  if (!activeTagFilter) return true;
  return (tags || []).includes(activeTagFilter);
}

function tripMatches(trip) {
  const haystack = [trip.name, trip.destination, trip.country, trip.summary, ...(trip.tags || [])].join(" ");
  return matchesSearch(haystack) && matchesTagFilter(trip.tags);
}

function entryMatches(entry) {
  const haystack = [entry.title, entry.body, ...(entry.tags || [])].join(" ");
  return matchesSearch(haystack) && matchesTagFilter(entry.tags);
}

function renderTagFilters() {
  const container = document.getElementById("tag-filters");
  const tags = allTags();
  container.innerHTML = tags.map(tag => `
    <button class="tag-chip ${tag === activeTagFilter ? "active" : ""}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
  `).join("");
}

function renderTripCard(trip) {
  const status = tripStatus(trip);
  const entryCount = entriesForTrip(trip.id).length;
  return `
    <div class="trip-card" data-trip-id="${trip.id}">
      ${renderCover(trip, "trip-card-cover")}
      <div class="trip-card-body">
        <span class="status-pill status-${status}">${status}</span>
        <h4>${escapeHtml(trip.name)}</h4>
        <p class="trip-card-place">${escapeHtml(trip.destination)}${trip.country ? ", " + escapeHtml(trip.country) : ""}</p>
        <p class="trip-card-dates">${formatDateRange(trip.startDate, trip.endDate)}</p>
        <p class="trip-card-summary">${escapeHtml(trip.summary || "")}</p>
        <div class="tag-row">${(trip.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <p class="trip-card-count">${entryCount} ${entryCount === 1 ? "entry" : "entries"}</p>
      </div>
    </div>
  `;
}

function renderTripsView() {
  const upcoming = state.trips.filter(t => tripMatches(t) && tripStatus(t) !== "past")
    .sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  const past = state.trips.filter(t => tripMatches(t) && tripStatus(t) === "past")
    .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate));

  document.getElementById("upcoming-trips").innerHTML = upcoming.map(renderTripCard).join("");
  document.getElementById("past-trips").innerHTML = past.map(renderTripCard).join("");
  document.getElementById("upcoming-empty").classList.toggle("hidden", upcoming.length > 0);
  document.getElementById("past-empty").classList.toggle("hidden", past.length > 0);
}

// ---------- rendering: journal feed ----------

function renderEntryCard(entry) {
  const trip = entry.tripId ? tripById(entry.tripId) : null;
  const photo = entry.photos && entry.photos[0];
  return `
    <article class="entry-card" data-entry-id="${entry.id}">
      ${photo ? `<div class="entry-card-photo"><img src="${photo}" alt=""></div>` : ""}
      <div class="entry-card-body">
        <p class="entry-byline">${entry.mood ? entry.mood + " " : ""}${trip ? escapeHtml(trip.name) + " · " : ""}${formatDate(entry.date)}</p>
        <h4>${escapeHtml(entry.title)}</h4>
        <p class="entry-card-excerpt">${escapeHtml(excerpt(entry.body))}</p>
        <div class="tag-row">${(entry.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      </div>
    </article>
  `;
}

function excerpt(body) {
  const firstPara = body.split(/\n\s*\n/)[0] || "";
  return firstPara.length > 220 ? firstPara.slice(0, 217) + "…" : firstPara;
}

function renderJournalView() {
  const entries = state.entries.filter(entryMatches).sort((a, b) => parseDate(b.date) - parseDate(a.date));
  document.getElementById("journal-feed").innerHTML = entries.map(renderEntryCard).join("");
  document.getElementById("journal-empty").classList.toggle("hidden", entries.length > 0);
}

// ---------- rendering: trip detail ----------

function showTripDetail(tripId) {
  activeTripId = tripId;
  const trip = tripById(tripId);
  if (!trip) return showView("trips");

  const status = tripStatus(trip);
  document.getElementById("trip-hero").innerHTML = renderCover(trip, "trip-hero-cover");
  document.getElementById("trip-status-pill").textContent = status;
  document.getElementById("trip-status-pill").className = `status-pill status-${status}`;
  document.getElementById("trip-detail-name").textContent = trip.name;
  document.getElementById("trip-detail-meta").textContent =
    `${trip.destination}${trip.country ? ", " + trip.country : ""} · ${formatDateRange(trip.startDate, trip.endDate)}`;
  document.getElementById("trip-detail-summary").textContent = trip.summary || "";
  document.getElementById("trip-detail-tags").innerHTML = (trip.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const entries = entriesForTrip(tripId);
  document.getElementById("trip-entries-list").innerHTML = entries.map(renderEntryCard).join("");
  document.getElementById("trip-entries-empty").classList.toggle("hidden", entries.length > 0);

  showView("trip-detail");
}

// ---------- rendering: entry reader ----------

function showEntryReader(entryId, cameFrom) {
  activeEntryId = entryId;
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return showView("journal");
  const trip = entry.tripId ? tripById(entry.tripId) : null;

  document.getElementById("reader-title").textContent = entry.title;
  document.getElementById("reader-byline").textContent =
    `${entry.mood ? entry.mood + " " : ""}${trip ? trip.name + " · " : ""}${formatDate(entry.date)}`;
  document.getElementById("reader-tags").innerHTML = (entry.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const photos = entry.photos || [];
  document.getElementById("reader-photos").innerHTML = photos.length
    ? `<div class="entry-photo-grid">${photos.map(p => `<img src="${p}" alt="">`).join("")}</div>`
    : "";

  const paragraphs = entry.body.split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
  document.getElementById("reader-body").innerHTML = paragraphs;

  document.getElementById("entry-back-btn").dataset.back = cameFrom || (trip ? "trip-detail" : "journal");
  showView("entry-reader");
}

// ---------- view switching ----------

function showView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach(el => el.classList.add("hidden"));
  document.getElementById(`${view}-view`).classList.remove("hidden");
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAll() {
  renderTagFilters();
  renderTripsView();
  renderJournalView();
  if (currentView === "trip-detail" && activeTripId) showTripDetail(activeTripId);
  if (currentView === "entry-reader" && activeEntryId) {
    const entry = state.entries.find(e => e.id === activeEntryId);
    if (entry) showEntryReader(activeEntryId); else showView("journal");
  }
}

// ---------- modals ----------

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function populateTripSelect(selectedTripId) {
  const select = document.getElementById("entry-trip-input");
  const options = ['<option value="">No trip (standalone note)</option>']
    .concat(state.trips
      .slice()
      .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate))
      .map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`));
  select.innerHTML = options.join("");
  select.value = selectedTripId || "";
}

function openTripModal(tripId) {
  editingTripId = tripId || null;
  pendingTripPhoto = null;
  const form = document.getElementById("trip-form");
  form.reset();
  document.getElementById("trip-photo-preview").classList.add("hidden");
  document.getElementById("trip-photo-preview").innerHTML = "";

  if (tripId) {
    const trip = tripById(tripId);
    document.getElementById("trip-modal-title").textContent = "Edit Trip";
    document.getElementById("trip-name-input").value = trip.name;
    document.getElementById("trip-destination-input").value = trip.destination;
    document.getElementById("trip-country-input").value = trip.country || "";
    document.getElementById("trip-start-input").value = trip.startDate;
    document.getElementById("trip-end-input").value = trip.endDate;
    document.getElementById("trip-theme-input").value = trip.theme || "ocean";
    document.getElementById("trip-summary-input").value = trip.summary || "";
    document.getElementById("trip-tags-input").value = (trip.tags || []).join(", ");
    if (trip.coverPhoto) {
      pendingTripPhoto = trip.coverPhoto;
      showPhotoPreview("trip-photo-preview", [trip.coverPhoto]);
    }
  } else {
    document.getElementById("trip-modal-title").textContent = "New Trip";
  }
  openModal("trip-modal");
}

function openEntryModal(tripId, entryId) {
  editingEntryId = entryId || null;
  pendingEntryPhotos = [];
  const form = document.getElementById("entry-form");
  form.reset();
  populateTripSelect(tripId);
  document.getElementById("entry-photo-preview").classList.add("hidden");
  document.getElementById("entry-photo-preview").innerHTML = "";

  if (entryId) {
    const entry = state.entries.find(e => e.id === entryId);
    document.getElementById("entry-modal-title").textContent = "Edit Entry";
    document.getElementById("entry-trip-input").value = entry.tripId || "";
    document.getElementById("entry-title-input").value = entry.title;
    document.getElementById("entry-date-input").value = entry.date;
    document.getElementById("entry-mood-input").value = entry.mood || "";
    document.getElementById("entry-tags-input").value = (entry.tags || []).join(", ");
    document.getElementById("entry-body-input").value = entry.body;
    pendingEntryPhotos = (entry.photos || []).slice();
    if (pendingEntryPhotos.length) showPhotoPreview("entry-photo-preview", pendingEntryPhotos);
  } else {
    document.getElementById("entry-modal-title").textContent = "New Entry";
    document.getElementById("entry-date-input").value = new Date().toISOString().slice(0, 10);
  }
  openModal("entry-modal");
}

function showPhotoPreview(containerId, dataUrls) {
  const container = document.getElementById(containerId);
  container.innerHTML = dataUrls.map(url => `<img src="${url}" alt="">`).join("");
  container.classList.toggle("hidden", dataUrls.length === 0);
}

// ---------- form submit handlers ----------

function handleTripSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("trip-name-input").value.trim();
  const destination = document.getElementById("trip-destination-input").value.trim();
  const country = document.getElementById("trip-country-input").value.trim();
  const startDate = document.getElementById("trip-start-input").value;
  const endDate = document.getElementById("trip-end-input").value;
  const theme = document.getElementById("trip-theme-input").value;
  const summary = document.getElementById("trip-summary-input").value.trim();
  const tags = parseTags(document.getElementById("trip-tags-input").value);

  if (parseDate(endDate) < parseDate(startDate)) {
    alert("End date can't be before the start date.");
    return;
  }

  if (editingTripId) {
    const trip = tripById(editingTripId);
    Object.assign(trip, { name, destination, country, startDate, endDate, theme, summary, tags, coverPhoto: pendingTripPhoto });
  } else {
    state.trips.push({
      id: makeId("trip"),
      name, destination, country, startDate, endDate, theme, summary, tags,
      icon: "📍",
      coverPhoto: pendingTripPhoto,
      createdAt: new Date().toISOString()
    });
  }
  saveState();
  closeModal("trip-modal");
  renderAll();
  if (editingTripId && currentView === "trip-detail") showTripDetail(editingTripId);
}

function handleEntrySubmit(e) {
  e.preventDefault();
  const tripId = document.getElementById("entry-trip-input").value || null;
  const title = document.getElementById("entry-title-input").value.trim();
  const date = document.getElementById("entry-date-input").value;
  const mood = document.getElementById("entry-mood-input").value.trim();
  const tags = parseTags(document.getElementById("entry-tags-input").value);
  const body = document.getElementById("entry-body-input").value.trim();

  if (editingEntryId) {
    const entry = state.entries.find(ent => ent.id === editingEntryId);
    Object.assign(entry, { tripId, title, date, mood, tags, body, photos: pendingEntryPhotos.slice() });
  } else {
    state.entries.push({
      id: makeId("entry"),
      tripId, title, date, mood, tags, body,
      photos: pendingEntryPhotos.slice(),
      createdAt: new Date().toISOString()
    });
  }
  saveState();
  closeModal("entry-modal");
  renderAll();
  if (currentView === "trip-detail" && activeTripId) showTripDetail(activeTripId);
}

// ---------- delete handlers ----------

function deleteTrip(tripId) {
  if (!confirm("Delete this trip? Its journal entries will be kept as standalone notes.")) return;
  state.trips = state.trips.filter(t => t.id !== tripId);
  state.entries.forEach(e => { if (e.tripId === tripId) e.tripId = null; });
  saveState();
  showView("trips");
  renderAll();
}

function deleteEntry(entryId) {
  if (!confirm("Delete this entry? This can't be undone.")) return;
  const entry = state.entries.find(e => e.id === entryId);
  const backTripId = entry ? entry.tripId : null;
  state.entries = state.entries.filter(e => e.id !== entryId);
  saveState();
  if (backTripId) showTripDetail(backTripId); else showView("journal");
  renderAll();
}

// ---------- event wiring ----------

function wireEvents() {
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.back));
  });

  document.getElementById("search-input").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTripsView();
    renderJournalView();
  });

  document.getElementById("tag-filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".tag-chip");
    if (!chip) return;
    activeTagFilter = activeTagFilter === chip.dataset.tag ? null : chip.dataset.tag;
    renderTagFilters();
    renderTripsView();
    renderJournalView();
  });

  document.getElementById("add-trip-btn").addEventListener("click", () => openTripModal());
  document.getElementById("add-entry-btn").addEventListener("click", () => openEntryModal());
  document.getElementById("add-entry-for-trip-btn").addEventListener("click", () => openEntryModal(activeTripId));

  document.querySelectorAll(".close-modal").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  });

  document.getElementById("trip-form").addEventListener("submit", handleTripSubmit);
  document.getElementById("entry-form").addEventListener("submit", handleEntrySubmit);

  document.getElementById("trip-photo-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingTripPhoto = await readFileAsDataURL(file);
    showPhotoPreview("trip-photo-preview", [pendingTripPhoto]);
  });

  document.getElementById("entry-photos-input").addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const dataUrls = await Promise.all(files.map(readFileAsDataURL));
    pendingEntryPhotos = pendingEntryPhotos.concat(dataUrls);
    showPhotoPreview("entry-photo-preview", pendingEntryPhotos);
  });

  document.getElementById("upcoming-trips").addEventListener("click", (e) => {
    const card = e.target.closest(".trip-card");
    if (card) showTripDetail(card.dataset.tripId);
  });
  document.getElementById("past-trips").addEventListener("click", (e) => {
    const card = e.target.closest(".trip-card");
    if (card) showTripDetail(card.dataset.tripId);
  });

  document.getElementById("journal-feed").addEventListener("click", (e) => {
    const card = e.target.closest(".entry-card");
    if (card) showEntryReader(card.dataset.entryId, "journal");
  });
  document.getElementById("trip-entries-list").addEventListener("click", (e) => {
    const card = e.target.closest(".entry-card");
    if (card) showEntryReader(card.dataset.entryId, "trip-detail");
  });

  document.getElementById("edit-trip-btn").addEventListener("click", () => openTripModal(activeTripId));
  document.getElementById("delete-trip-btn").addEventListener("click", () => deleteTrip(activeTripId));

  document.getElementById("edit-entry-btn").addEventListener("click", () => {
    const entry = state.entries.find(e => e.id === activeEntryId);
    openEntryModal(entry.tripId, activeEntryId);
  });
  document.getElementById("delete-entry-btn").addEventListener("click", () => deleteEntry(activeEntryId));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
    }
  });
}

// ---------- init ----------

loadState();
wireEvents();
renderAll();
