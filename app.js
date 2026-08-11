/* =========================================================================
   Wayfarer — Travel Journal — App Logic
   ========================================================================= */

const STORAGE_KEYS = { trips: "wf_trips", entries: "wf_entries" };
const PLACEHOLDER_GRADIENTS = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

// ---- State -----------------------------------------------------------------

let trips = [];
let entries = [];
let searchQuery = "";
let activeEntryFilter = "all";
let editingTripId = null;
let editingEntryId = null;
let tripCoverBuffer = null;
let entryPhotoBuffer = [];
let lightboxPhotos = [];
let lightboxIndex = 0;

// ---- Bootstrap / persistence -------------------------------------------------

function loadState() {
  try {
    const storedTrips = JSON.parse(localStorage.getItem(STORAGE_KEYS.trips));
    const storedEntries = JSON.parse(localStorage.getItem(STORAGE_KEYS.entries));
    if (storedTrips && storedEntries) {
      trips = storedTrips;
      entries = storedEntries;
      return;
    }
  } catch (e) { /* fall through to seed */ }
  trips = JSON.parse(JSON.stringify(SEED_TRIPS));
  entries = JSON.parse(JSON.stringify(SEED_ENTRIES));
  saveTrips();
  saveEntries();
}

function saveTrips() {
  try { localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(trips)); }
  catch (e) { alert("Couldn't save — your browser's storage is full. Try removing a few photos."); }
}
function saveEntries() {
  try { localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries)); }
  catch (e) { alert("Couldn't save — your browser's storage is full. Try removing a few photos."); }
}

function getTrip(id) { return trips.find(t => t.id === id); }
function getEntry(id) { return entries.find(e => e.id === id); }
function tripEntries(tripId) { return entries.filter(e => e.tripId === tripId); }

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Date helpers ------------------------------------------------------------

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function startOfToday() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
function todayStr() {
  const t = startOfToday();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function formatDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatDateRange(startStr, endStr) {
  const s = parseDate(startStr), e = parseDate(endStr);
  const monthShort = d => d.toLocaleDateString("en-US", { month: "short" });
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();
  if (sameMonth) return `${monthShort(s)} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  if (sameYear) return `${monthShort(s)} ${s.getDate()} – ${monthShort(e)} ${e.getDate()}, ${e.getFullYear()}`;
  return `${monthShort(s)} ${s.getDate()}, ${s.getFullYear()} – ${monthShort(e)} ${e.getDate()}, ${e.getFullYear()}`;
}
function friendlyDuration(days) {
  const ad = Math.abs(Math.round(days));
  if (ad < 1) return "today";
  if (ad < 60) return `${ad} day${ad === 1 ? "" : "s"}`;
  if (ad < 730) { const m = Math.round(ad / 30); return `${m} month${m === 1 ? "" : "s"}`; }
  const y = Math.round(ad / 365); return `${y} year${y === 1 ? "" : "s"}`;
}
function statusMeta(trip) {
  const today = startOfToday();
  const s = parseDate(trip.startDate), e = parseDate(trip.endDate);
  if (today < s) {
    const days = (s - today) / 86400000;
    return { status: "upcoming", label: days === 0 ? "Starts today" : `In ${friendlyDuration(days)}` };
  }
  if (today > e) {
    const days = (today - e) / 86400000;
    return { status: "past", label: `${friendlyDuration(days)} ago` };
  }
  const totalDays = Math.round((e - s) / 86400000) + 1;
  const dayNum = Math.round((today - s) / 86400000) + 1;
  return { status: "ongoing", label: `Day ${dayNum} of ${totalDays}` };
}

// ---- Small utils ---------------------------------------------------------

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  const cut = str.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}
function gradientClassFor(id) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return PLACEHOLDER_GRADIENTS[Math.abs(h) % PLACEHOLDER_GRADIENTS.length];
}
function paragraphsHtml(body) {
  return (body || "").split(/\n\s*\n/).filter(p => p.trim()).map(p =>
    `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`
  ).join("");
}
function bodyMatches(text, q) { return text.toLowerCase().includes(q); }

// ---- Image handling -----------------------------------------------------

function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
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
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- Router -----------------------------------------------------------------

function currentRoute() {
  const hash = location.hash || "#/";
  const m = hash.match(/^#\/trip\/(.+)$/);
  if (m) return { name: "trip", id: decodeURIComponent(m[1]) };
  return { name: "home" };
}

function render() {
  const route = currentRoute();
  if (route.name === "trip" && getTrip(route.id)) {
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("trip-view").classList.remove("hidden");
    renderTripDetail(route.id);
  } else {
    document.getElementById("trip-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");
    renderHome();
  }
}

// ---- Cover / placeholder markup -------------------------------------------

function coverMarkup(trip, extraClass) {
  if (trip.cover) {
    return `<img class="cover-img ${extraClass || ""}" src="${trip.cover}" alt="${escapeHtml(trip.name)}">`;
  }
  return `<div class="cover-placeholder ${gradientClassFor(trip.id)} ${extraClass || ""}"><span>${trip.emoji || "🧭"}</span></div>`;
}

// ---- Home view ------------------------------------------------------------

function tripSearchText(trip) {
  const own = [trip.name, trip.destination, trip.summary || ""].join(" ");
  const entryText = tripEntries(trip.id).map(e =>
    [e.title, e.body, e.location || "", (e.tags || []).join(" ")].join(" ")
  ).join(" ");
  return (own + " " + entryText).toLowerCase();
}

function renderStats() {
  const past = trips.filter(t => statusMeta(t).status === "past").length;
  const journalCount = entries.filter(e => e.type === "journal").length;
  const photoCount = entries.reduce((sum, e) => sum + (e.photos ? e.photos.length : 0), 0);
  document.getElementById("stats-bar").innerHTML = `
    <div class="stat"><span class="stat-num">${trips.length}</span><span class="stat-label">Trip${trips.length === 1 ? "" : "s"}</span></div>
    <div class="stat"><span class="stat-num">${past}</span><span class="stat-label">Completed</span></div>
    <div class="stat"><span class="stat-num">${journalCount}</span><span class="stat-label">Journal Entries</span></div>
    <div class="stat"><span class="stat-num">${photoCount}</span><span class="stat-label">Photo${photoCount === 1 ? "" : "s"}</span></div>
  `;
}

function buildTripCardHtml(trip) {
  const meta = statusMeta(trip);
  const es = tripEntries(trip.id);
  const journalN = es.filter(e => e.type === "journal").length;
  return `
    <div class="trip-card" data-id="${trip.id}">
      ${coverMarkup(trip, "trip-card-cover")}
      <div class="trip-card-body">
        <span class="status-badge status-${meta.status}">${meta.status === "ongoing" ? "● Ongoing" : meta.status === "upcoming" ? "Upcoming" : "Past"}</span>
        <h3 class="trip-card-name">${escapeHtml(trip.name)}</h3>
        <p class="trip-card-dest">${escapeHtml(trip.destination)}</p>
        <p class="trip-card-dates">${formatDateRange(trip.startDate, trip.endDate)} · ${meta.label}</p>
        <p class="trip-card-count">${journalN} journal ${journalN === 1 ? "entry" : "entries"}</p>
      </div>
    </div>`;
}

function renderHome() {
  renderStats();
  const q = searchQuery.trim().toLowerCase();
  const filtered = trips.filter(t => !q || bodyMatches(tripSearchText(t), q));

  const groups = {
    ongoing: filtered.filter(t => statusMeta(t).status === "ongoing").sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate)),
    upcoming: filtered.filter(t => statusMeta(t).status === "upcoming").sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate)),
    past: filtered.filter(t => statusMeta(t).status === "past").sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate))
  };
  const sectionLabels = { ongoing: "🧳 Currently Traveling", upcoming: "🗺️ Upcoming", past: "📔 Past Trips" };

  const container = document.getElementById("trip-groups");
  container.innerHTML = ["ongoing", "upcoming", "past"].map(key => {
    if (groups[key].length === 0) return "";
    return `
      <div class="trip-group">
        <h3 class="trip-group-title">${sectionLabels[key]}</h3>
        <div class="trip-grid">${groups[key].map(buildTripCardHtml).join("")}</div>
      </div>`;
  }).join("");

  document.getElementById("no-trips").classList.toggle("hidden", trips.length === 0 || filtered.length > 0);

  // Latest from the road: most recent journal entries across all trips.
  const latest = entries
    .filter(e => e.type === "journal" && (!q || bodyMatches([e.title, e.body, e.location || "", (e.tags || []).join(" ")].join(" "), q)))
    .sort((a, b) => parseDate(b.date) - parseDate(a.date))
    .slice(0, 4);
  const latestSection = document.getElementById("latest-entries-section");
  latestSection.classList.toggle("hidden", latest.length === 0);
  document.getElementById("latest-entries").innerHTML = latest.map(e => {
    const trip = getTrip(e.tripId);
    const photo = e.photos && e.photos[0];
    return `
      <div class="latest-entry-card" data-trip-id="${e.tripId}">
        ${photo ? `<img class="latest-entry-photo" src="${photo}" alt="">` : `<div class="latest-entry-photo cover-placeholder ${gradientClassFor(e.id)}"><span>${trip ? trip.emoji : "📓"}</span></div>`}
        <div class="latest-entry-body">
          <span class="latest-entry-trip">${trip ? escapeHtml(trip.name) : ""}</span>
          <h4>${escapeHtml(e.title)}</h4>
          <p>${escapeHtml(truncate((e.body || "").replace(/\n+/g, " "), 130))}</p>
          <span class="latest-entry-date">${formatDate(e.date)}</span>
        </div>
      </div>`;
  }).join("");
}

// ---- Trip detail view -------------------------------------------------------

function renderTripHeader(trip) {
  const meta = statusMeta(trip);
  document.getElementById("trip-header").innerHTML = `
    ${coverMarkup(trip, "trip-header-cover")}
    <div class="trip-header-body">
      <div class="trip-header-top">
        <div>
          <span class="status-badge status-${meta.status}">${meta.status === "ongoing" ? "● Ongoing — " + meta.label : meta.status === "upcoming" ? meta.label : meta.label}</span>
          <h2>${escapeHtml(trip.name)}</h2>
          <p class="trip-header-dest">${escapeHtml(trip.destination)} · ${formatDateRange(trip.startDate, trip.endDate)}</p>
        </div>
        <div class="trip-header-actions">
          <button type="button" id="edit-trip-btn" class="btn btn-secondary btn-small">Edit Trip</button>
          <button type="button" id="delete-trip-btn-inline" class="btn btn-danger btn-small">Delete</button>
        </div>
      </div>
      ${trip.summary ? `<p class="trip-header-summary">${escapeHtml(trip.summary)}</p>` : ""}
    </div>`;
  document.getElementById("edit-trip-btn").addEventListener("click", () => openTripModal(trip.id));
  document.getElementById("delete-trip-btn-inline").addEventListener("click", () => {
    if (deleteTrip(trip.id)) { location.hash = "#/"; render(); }
  });
}

function buildEntryCardHtml(entry) {
  const isPlan = entry.type === "plan";
  const photos = entry.photos || [];
  const checklist = entry.checklist || [];
  const doneCount = checklist.filter(c => c.done).length;
  return `
    <article class="entry-card ${isPlan ? "entry-plan" : "entry-journal"}" data-id="${entry.id}">
      <div class="entry-card-head">
        <span class="entry-type-badge">${isPlan ? "🗒️ Plan" : "📓 Journal"}</span>
        <span class="entry-meta">${formatDate(entry.date)}${entry.location ? " · " + escapeHtml(entry.location) : ""}</span>
        <span class="entry-card-actions">
          <button type="button" class="icon-btn edit-entry-btn" title="Edit entry">✎</button>
          <button type="button" class="icon-btn delete-entry-btn" title="Delete entry">🗑</button>
        </span>
      </div>
      <h3 class="entry-title">${escapeHtml(entry.title)}</h3>
      ${entry.body ? `<div class="entry-body">${paragraphsHtml(entry.body)}</div>` : ""}
      ${photos.length ? `<div class="photo-grid">${photos.map((p, i) => `<img class="photo-thumb" data-index="${i}" src="${p}" alt="">`).join("")}</div>` : ""}
      ${isPlan && checklist.length ? `
        <div class="checklist-block">
          <div class="checklist-progress">${doneCount} / ${checklist.length} done</div>
          <ul class="checklist-list">
            ${checklist.map((c, i) => `<li class="check-item ${c.done ? "done" : ""}" data-index="${i}"><span class="check-box">${c.done ? "☑" : "☐"}</span><span class="check-text">${escapeHtml(c.text)}</span></li>`).join("")}
          </ul>
        </div>` : ""}
      ${entry.tags && entry.tags.length ? `<div class="tag-row">${entry.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    </article>`;
}

function renderTripDetail(tripId) {
  const trip = getTrip(tripId);
  renderTripHeader(trip);

  document.querySelectorAll("#entry-tabs .tab").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === activeEntryFilter)
  );

  const q = searchQuery.trim().toLowerCase();
  let list = tripEntries(tripId);
  if (activeEntryFilter !== "all") list = list.filter(e => e.type === activeEntryFilter);
  if (q) list = list.filter(e => bodyMatches([e.title, e.body, e.location || "", (e.tags || []).join(" ")].join(" "), q));
  list = list.slice().sort((a, b) => parseDate(a.date) - parseDate(b.date));

  document.getElementById("entries-list").innerHTML = list.map(buildEntryCardHtml).join("");
  document.getElementById("no-entries").classList.toggle("hidden", list.length > 0);
}

// ---- Trip modal -------------------------------------------------------------

function updateTripCoverPreview() {
  const wrap = document.getElementById("trip-cover-preview");
  const img = document.getElementById("trip-cover-preview-img");
  if (tripCoverBuffer) { img.src = tripCoverBuffer; wrap.classList.remove("hidden"); }
  else { wrap.classList.add("hidden"); img.src = ""; }
}

function openTripModal(tripId) {
  editingTripId = tripId || null;
  const trip = tripId ? getTrip(tripId) : null;
  document.getElementById("trip-modal-title").textContent = trip ? "Edit Trip" : "New Trip";
  document.getElementById("trip-form").reset();
  document.getElementById("trip-name-input").value = trip ? trip.name : "";
  document.getElementById("trip-destination-input").value = trip ? trip.destination : "";
  document.getElementById("trip-start-input").value = trip ? trip.startDate : "";
  document.getElementById("trip-end-input").value = trip ? trip.endDate : "";
  document.getElementById("trip-summary-input").value = trip ? (trip.summary || "") : "";
  tripCoverBuffer = trip ? trip.cover : null;
  updateTripCoverPreview();
  document.getElementById("trip-modal").classList.remove("hidden");
}
function closeTripModal() {
  document.getElementById("trip-modal").classList.add("hidden");
  editingTripId = null;
  tripCoverBuffer = null;
}

function handleSaveTrip(e) {
  e.preventDefault();
  const name = document.getElementById("trip-name-input").value.trim();
  const destination = document.getElementById("trip-destination-input").value.trim();
  const startDate = document.getElementById("trip-start-input").value;
  const endDate = document.getElementById("trip-end-input").value;
  const summary = document.getElementById("trip-summary-input").value.trim();

  if (!name || !destination || !startDate || !endDate) {
    alert("Please fill in the trip name, destination, and both dates.");
    return;
  }
  if (endDate < startDate) {
    alert("End date can't be before the start date.");
    return;
  }

  if (editingTripId) {
    const trip = getTrip(editingTripId);
    Object.assign(trip, { name, destination, startDate, endDate, summary, cover: tripCoverBuffer });
  } else {
    const emojiPool = ["🧭", "✈️", "🗺️", "🏝️", "🚞", "🏕️", "🛶", "🚐"];
    trips.push({
      id: uid("t"), name, destination, startDate, endDate, summary,
      cover: tripCoverBuffer, emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)]
    });
  }
  saveTrips();
  const newId = editingTripId || trips[trips.length - 1].id;
  closeTripModal();
  location.hash = `#/trip/${newId}`;
  render();
}

function deleteTrip(id) {
  const trip = getTrip(id);
  if (!trip) return false;
  const count = tripEntries(id).length;
  const msg = count > 0
    ? `Delete "${trip.name}" and all ${count} of its entries? This cannot be undone.`
    : `Delete "${trip.name}"? This cannot be undone.`;
  if (!confirm(msg)) return false;
  trips = trips.filter(t => t.id !== id);
  entries = entries.filter(e => e.tripId !== id);
  saveTrips();
  saveEntries();
  return true;
}

// ---- Entry modal -------------------------------------------------------------

function populateTripSelect(selectedId) {
  const sel = document.getElementById("entry-trip-input");
  sel.innerHTML = trips.slice()
    .sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate))
    .map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");
  if (selectedId) sel.value = selectedId;
}

function refreshTagDatalist() {
  const all = new Set();
  entries.forEach(e => (e.tags || []).forEach(t => all.add(t)));
  document.getElementById("tag-options").innerHTML =
    [...all].sort().map(t => `<option value="${escapeHtml(t)}">`).join("");
}

function toggleChecklistSection() {
  const type = document.querySelector('input[name="entry-type"]:checked').value;
  document.getElementById("checklist-section").classList.toggle("hidden", type !== "plan");
}

function addChecklistRow(item) {
  const wrapper = document.createElement("div");
  wrapper.className = "checklist-row";
  wrapper.innerHTML = `
    <input type="checkbox" class="check-done-input" ${item && item.done ? "checked" : ""}>
    <input type="text" class="check-text-input" placeholder="Checklist item" value="${item ? escapeHtml(item.text) : ""}">
    <button type="button" class="remove-row-btn" title="Remove">✕</button>
  `;
  document.getElementById("checklist-rows").appendChild(wrapper);
  wrapper.querySelector(".remove-row-btn").addEventListener("click", () => wrapper.remove());
}

function renderPhotoPreviews() {
  const container = document.getElementById("entry-photo-previews");
  container.innerHTML = entryPhotoBuffer.map((p, i) => `
    <div class="photo-preview-item">
      <img src="${p}" alt="">
      <button type="button" class="remove-photo-btn" data-index="${i}" aria-label="Remove photo">✕</button>
    </div>`).join("");
  container.querySelectorAll(".remove-photo-btn").forEach(btn =>
    btn.addEventListener("click", () => {
      entryPhotoBuffer.splice(Number(btn.dataset.index), 1);
      renderPhotoPreviews();
    })
  );
}

function openEntryModal(tripId, entryToEdit) {
  if (trips.length === 0) { alert("Create a trip first, then log an entry to it."); return; }
  editingEntryId = entryToEdit ? entryToEdit.id : null;
  document.getElementById("entry-modal-title").textContent = entryToEdit ? "Edit Entry" : "New Entry";
  document.getElementById("entry-form").reset();
  populateTripSelect(entryToEdit ? entryToEdit.tripId : tripId);

  const type = entryToEdit ? entryToEdit.type : "journal";
  document.querySelector(`input[name="entry-type"][value="${type}"]`).checked = true;

  document.getElementById("entry-title-input").value = entryToEdit ? entryToEdit.title : "";
  document.getElementById("entry-date-input").value = entryToEdit ? entryToEdit.date : todayStr();
  document.getElementById("entry-location-input").value = entryToEdit ? (entryToEdit.location || "") : "";
  document.getElementById("entry-body-input").value = entryToEdit ? entryToEdit.body : "";
  document.getElementById("entry-tags-input").value = entryToEdit ? (entryToEdit.tags || []).join(", ") : "";

  entryPhotoBuffer = entryToEdit ? [...(entryToEdit.photos || [])] : [];
  renderPhotoPreviews();

  document.getElementById("checklist-rows").innerHTML = "";
  (entryToEdit && entryToEdit.checklist ? entryToEdit.checklist : []).forEach(addChecklistRow);
  toggleChecklistSection();
  refreshTagDatalist();

  document.getElementById("delete-entry-btn").classList.toggle("hidden", !entryToEdit);
  document.getElementById("entry-modal").classList.remove("hidden");
}
function closeEntryModal() {
  document.getElementById("entry-modal").classList.add("hidden");
  editingEntryId = null;
  entryPhotoBuffer = [];
}

function handleSaveEntry(e) {
  e.preventDefault();
  const tripId = document.getElementById("entry-trip-input").value;
  const type = document.querySelector('input[name="entry-type"]:checked').value;
  const title = document.getElementById("entry-title-input").value.trim();
  const date = document.getElementById("entry-date-input").value;
  const location = document.getElementById("entry-location-input").value.trim();
  const body = document.getElementById("entry-body-input").value.trim();
  const tags = document.getElementById("entry-tags-input").value.split(",").map(t => t.trim()).filter(Boolean);

  if (!tripId || !title || !date) {
    alert("Please choose a trip and fill in a title and date.");
    return;
  }

  const checklist = type === "plan"
    ? [...document.querySelectorAll("#checklist-rows .checklist-row")].map(row => ({
        text: row.querySelector(".check-text-input").value.trim(),
        done: row.querySelector(".check-done-input").checked
      })).filter(c => c.text)
    : [];

  if (editingEntryId) {
    const entry = getEntry(editingEntryId);
    Object.assign(entry, { tripId, type, title, date, location, body, tags, checklist, photos: [...entryPhotoBuffer] });
  } else {
    entries.push({
      id: uid("e"), tripId, type, title, date, location, body, tags, checklist,
      photos: [...entryPhotoBuffer], createdAt: new Date().toISOString()
    });
  }
  saveEntries();
  closeEntryModal();
  location.hash = `#/trip/${tripId}`;
  render();
}

function deleteEntry(id) {
  const entry = getEntry(id);
  if (!entry) return false;
  if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return false;
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  return true;
}

function toggleChecklistItem(entryId, index) {
  const entry = getEntry(entryId);
  if (!entry || !entry.checklist || !entry.checklist[index]) return;
  entry.checklist[index].done = !entry.checklist[index].done;
  saveEntries();
  render();
}

// ---- Lightbox -----------------------------------------------------------

function openLightbox(photos, index) {
  lightboxPhotos = photos;
  lightboxIndex = index;
  updateLightbox();
  document.getElementById("lightbox").classList.remove("hidden");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
}
function updateLightbox() {
  document.getElementById("lightbox-img").src = lightboxPhotos[lightboxIndex];
  document.getElementById("lightbox-count").textContent = `${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  const multi = lightboxPhotos.length > 1;
  document.getElementById("lightbox-prev").classList.toggle("hidden", !multi);
  document.getElementById("lightbox-next").classList.toggle("hidden", !multi);
}
function lightboxStep(delta) {
  lightboxIndex = (lightboxIndex + delta + lightboxPhotos.length) % lightboxPhotos.length;
  updateLightbox();
}

// ---- Wiring ---------------------------------------------------------------

function init() {
  loadState();
  render();

  window.addEventListener("hashchange", render);

  // Search
  document.getElementById("search-input").addEventListener("input", e => {
    searchQuery = e.target.value;
    render();
  });

  // Global "log entry" button
  document.getElementById("new-entry-btn").addEventListener("click", () => {
    const route = currentRoute();
    openEntryModal(route.name === "trip" ? route.id : (trips[0] && trips[0].id));
  });

  // New trip
  document.getElementById("new-trip-btn").addEventListener("click", () => openTripModal(null));

  // Trip modal wiring
  document.getElementById("close-trip-modal").addEventListener("click", closeTripModal);
  document.getElementById("cancel-trip-btn").addEventListener("click", closeTripModal);
  document.getElementById("trip-form").addEventListener("submit", handleSaveTrip);
  document.getElementById("trip-cover-input").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    tripCoverBuffer = await resizeImageFile(file, 1600, 0.82);
    updateTripCoverPreview();
  });
  document.getElementById("remove-trip-cover-btn").addEventListener("click", () => {
    tripCoverBuffer = null;
    document.getElementById("trip-cover-input").value = "";
    updateTripCoverPreview();
  });

  // Entry modal wiring
  document.getElementById("close-entry-modal").addEventListener("click", closeEntryModal);
  document.getElementById("cancel-entry-btn").addEventListener("click", closeEntryModal);
  document.getElementById("entry-form").addEventListener("submit", handleSaveEntry);
  document.querySelectorAll('input[name="entry-type"]').forEach(r => r.addEventListener("change", toggleChecklistSection));
  document.getElementById("add-checklist-row-btn").addEventListener("click", () => addChecklistRow());
  document.getElementById("delete-entry-btn").addEventListener("click", () => {
    if (deleteEntry(editingEntryId)) { closeEntryModal(); render(); }
  });
  document.getElementById("entry-photos-input").addEventListener("change", async e => {
    const files = [...e.target.files];
    for (const file of files) {
      entryPhotoBuffer.push(await resizeImageFile(file, 1600, 0.82));
    }
    renderPhotoPreviews();
    e.target.value = "";
  });

  // Trip view: entry tabs + new-entry-for-this-trip button
  document.getElementById("entry-tabs").addEventListener("click", e => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    activeEntryFilter = btn.dataset.filter;
    render();
  });
  document.getElementById("new-trip-entry-btn").addEventListener("click", () => {
    openEntryModal(currentRoute().id);
  });

  // Home view delegated clicks
  document.getElementById("trip-groups").addEventListener("click", e => {
    const card = e.target.closest(".trip-card");
    if (card) location.hash = `#/trip/${card.dataset.id}`;
  });
  document.getElementById("latest-entries").addEventListener("click", e => {
    const card = e.target.closest(".latest-entry-card");
    if (card) location.hash = `#/trip/${card.dataset.tripId}`;
  });

  // Entries list delegated clicks (photos, checklist, edit, delete)
  document.getElementById("entries-list").addEventListener("click", e => {
    const card = e.target.closest(".entry-card");
    if (!card) return;
    const id = card.dataset.id;

    const photoEl = e.target.closest(".photo-thumb");
    if (photoEl) {
      const entry = getEntry(id);
      openLightbox(entry.photos, Number(photoEl.dataset.index));
      return;
    }
    const checkEl = e.target.closest(".check-item");
    if (checkEl) { toggleChecklistItem(id, Number(checkEl.dataset.index)); return; }

    if (e.target.closest(".edit-entry-btn")) { openEntryModal(null, getEntry(id)); return; }
    if (e.target.closest(".delete-entry-btn")) { if (deleteEntry(id)) render(); return; }
  });

  // Lightbox wiring
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", () => lightboxStep(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => lightboxStep(1));
  document.getElementById("lightbox").addEventListener("click", e => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", e => {
    if (document.getElementById("lightbox").classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lightboxStep(-1);
    if (e.key === "ArrowRight") lightboxStep(1);
  });
}

document.addEventListener("DOMContentLoaded", init);
