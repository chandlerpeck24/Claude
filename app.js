// Waypoint — travel journal app logic.
// No framework, no build step: state lives in localStorage, everything
// renders via template strings + a handful of DOM passes for photos.

const STORAGE_KEY = "waypoint.v1";
const MAX_PHOTO_DIM = 1600;
const MAX_COVER_DIM = 1600;

let state = loadState();
let currentView = { type: "home" };
let entryPhotosTemp = [];
let tripCoverTemp = null;

// ---------- persistence ----------

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips) && Array.isArray(parsed.entries)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read saved journal, starting from sample data.", e);
  }
  return JSON.parse(JSON.stringify(SEED_DATA));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error(e);
    showToast("Couldn't save — storage may be full. Try removing a few photos.");
  }
}

// ---------- helpers ----------

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateRange(trip) {
  if (!trip.startDate) return "Bucket list";
  if (!trip.endDate || trip.endDate === trip.startDate) return formatDate(trip.startDate);
  return `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;
}

function tripStatus(trip) {
  if (!trip.startDate) return "bucket";
  const today = todayStr();
  const end = trip.endDate || trip.startDate;
  if (today < trip.startDate) return "upcoming";
  if (today > end) return "past";
  return "ongoing";
}

function statusLabel(status) {
  return { ongoing: "Ongoing", upcoming: "Upcoming", bucket: "Bucket List", past: "Past" }[status] || "";
}

function tripById(id) {
  return state.trips.find((t) => t.id === id);
}

function tripTitleFor(tripId) {
  const t = tripById(tripId);
  return t ? t.title : "General note";
}

function entriesForTrip(tripId) {
  return state.entries
    .filter((e) => e.tripId === tripId)
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt.localeCompare(a.createdAt));
}

function generalNotes() {
  return state.entries
    .filter((e) => !e.tripId)
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt.localeCompare(a.createdAt));
}

function journalEntries() {
  return state.entries
    .filter((e) => e.body && e.body.trim())
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.createdAt.localeCompare(a.createdAt));
}

function allPhotos() {
  const items = [];
  state.trips.forEach((t) => {
    if (t.coverPhoto) items.push({ src: t.coverPhoto, tripTitle: t.title, date: t.startDate || t.createdAt, label: "cover" });
  });
  state.entries.forEach((e) => {
    (e.photos || []).forEach((src) => {
      items.push({ src, tripTitle: tripTitleFor(e.tripId), date: e.date, label: e.title });
    });
  });
  items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return items;
}

function renderBody(body) {
  const paras = escapeHtml(body).trim().split(/\n{2,}/).filter(Boolean);
  return paras.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
}

function renderInsightsList(insights) {
  const lines = String(insights || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return "";
  return `<div class="insights-box"><div class="insights-label">💡 Key insights</div><ul>${
    lines.map((l) => `<li>${escapeHtml(l)}</li>`).join("")
  }</ul></div>`;
}

function renderPhotoGrid(photos) {
  if (!photos || !photos.length) return "";
  return `<div class="photo-grid">${
    photos.map((src) => `<img class="photo-thumb" src="${src}" alt="">`).join("")
  }</div>`;
}

function tagsChips(tags) {
  if (!tags || !tags.length) return "";
  return `<div class="chips">${tags.map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join("")}</div>`;
}

function coverStyle(src, fallbackSeed) {
  if (src) return `background-image:url('${src}')`;
  const hue = Math.abs(hashStr(fallbackSeed || "")) % 360;
  return `background-image:linear-gradient(135deg, hsl(${hue} 45% 32%), hsl(${(hue + 40) % 360} 55% 22%))`;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function showToast(msg, ms = 2600) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), ms);
}

// ---------- image handling ----------

function resizeImage(file, maxDim, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// ---------- rendering: sidebar ----------

function renderSidebar() {
  document.querySelectorAll(".side-nav-item").forEach((btn) => {
    btn.classList.toggle("active", currentView.type === btn.dataset.view);
  });

  const groupsEl = document.getElementById("tripGroups");
  const order = [
    ["ongoing", "In Progress"],
    ["upcoming", "Upcoming"],
    ["bucket", "Bucket List"],
    ["past", "Past Trips"],
  ];
  const byStatus = { ongoing: [], upcoming: [], bucket: [], past: [] };
  state.trips.forEach((t) => byStatus[tripStatus(t)].push(t));
  byStatus.ongoing.sort((a, b) => a.startDate.localeCompare(b.startDate));
  byStatus.upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate));
  byStatus.bucket.sort((a, b) => a.title.localeCompare(b.title));
  byStatus.past.sort((a, b) => b.startDate.localeCompare(a.startDate));

  groupsEl.innerHTML = order.map(([key, label]) => {
    const trips = byStatus[key];
    if (!trips.length) return "";
    return `<div class="trip-group">
      <div class="trip-group-label">${label}</div>
      ${trips.map((t) => `
        <button class="trip-list-item ${currentView.type === "trip" && currentView.tripId === t.id ? "active" : ""}" data-trip="${t.id}">
          <span class="dot status-${key}"></span>
          <span class="trip-list-title">${escapeHtml(t.title)}</span>
        </button>
      `).join("")}
    </div>`;
  }).join("") || `<p class="empty-hint">No trips yet — add your first one above.</p>`;
}

// ---------- rendering: views ----------

function render() {
  renderSidebar();
  const main = document.getElementById("mainView");
  if (currentView.type === "trip") {
    const trip = tripById(currentView.tripId);
    main.innerHTML = trip ? renderTripDetail(trip) : renderMissing();
  } else if (currentView.type === "notes") {
    main.innerHTML = renderNotes();
  } else if (currentView.type === "photos") {
    main.innerHTML = renderPhotosView();
  } else if (currentView.type === "search") {
    main.innerHTML = renderSearch(currentView.query);
  } else {
    main.innerHTML = renderHome();
  }
  window.scrollTo({ top: 0 });
}

function renderMissing() {
  return `<div class="empty-state"><p>That trip doesn't exist anymore.</p></div>`;
}

function statCard(value, label) {
  return `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;
}

function renderHome() {
  const countries = new Set(state.trips.filter((t) => t.country).map((t) => t.country));
  const photosCount = allPhotos().length;
  const activeTrips = state.trips.filter((t) => ["ongoing", "upcoming", "bucket"].includes(tripStatus(t)));
  const pastTrips = state.trips.filter((t) => tripStatus(t) === "past").sort((a, b) => b.startDate.localeCompare(a.startDate));
  const recentEntries = journalEntries().slice(0, 5);

  activeTrips.sort((a, b) => {
    const rank = { ongoing: 0, upcoming: 1, bucket: 2 };
    if (rank[tripStatus(a)] !== rank[tripStatus(b)]) return rank[tripStatus(a)] - rank[tripStatus(b)];
    return (a.startDate || "9999").localeCompare(b.startDate || "9999");
  });

  return `
    <div class="view-header">
      <h2>Welcome back</h2>
      <p class="view-sub">Here's where things stand.</p>
    </div>

    <div class="stats-row">
      ${statCard(state.trips.length, "Trips")}
      ${statCard(countries.size, "Countries")}
      ${statCard(journalEntries().length, "Journal entries")}
      ${statCard(photosCount, "Photos")}
    </div>

    <section class="section">
      <div class="section-head">
        <h3>Upcoming &amp; Bucket List</h3>
        <button class="btn btn-small" id="quickNewTrip">+ New Trip</button>
      </div>
      ${activeTrips.length
        ? `<div class="trip-card-grid">${activeTrips.map(tripCard).join("")}</div>`
        : `<p class="empty-hint">Nothing on the horizon yet. Add a trip — dates optional.</p>`}
    </section>

    ${pastTrips.length ? `
    <section class="section">
      <details class="collapsible" ${pastTrips.length <= 4 ? "open" : ""}>
        <summary><h3>Past Trips <span class="count-badge">${pastTrips.length}</span></h3></summary>
        <div class="trip-card-grid">${pastTrips.map(tripCard).join("")}</div>
      </details>
    </section>` : ""}

    <section class="section">
      <div class="section-head">
        <h3>Latest Journal Entries</h3>
      </div>
      ${recentEntries.length
        ? recentEntries.map((e) => entryCard(e, { compact: true })).join("")
        : `<p class="empty-hint">No journal entries yet. Open a trip and write the first one.</p>`}
    </section>
  `;
}

function tripCard(trip) {
  const status = tripStatus(trip);
  const count = entriesForTrip(trip.id).length;
  return `
    <button class="trip-card" data-trip="${trip.id}">
      <div class="trip-card-cover" style="${coverStyle(trip.coverPhoto, trip.id)}">
        <span class="status-badge status-${status}">${statusLabel(status)}</span>
      </div>
      <div class="trip-card-body">
        <h4>${escapeHtml(trip.title)}</h4>
        <p class="trip-card-place">${escapeHtml([trip.destination, trip.country].filter(Boolean).join(", "))}</p>
        <p class="trip-card-dates">${formatDateRange(trip)}</p>
        <p class="trip-card-meta">${count} ${count === 1 ? "entry" : "entries"}</p>
      </div>
    </button>
  `;
}

function entryCard(entry, opts = {}) {
  const compact = !!opts.compact;
  const trip = entry.tripId ? tripById(entry.tripId) : null;
  const excerpt = compact && entry.body ? escapeHtml(entry.body).slice(0, 220) + (entry.body.length > 220 ? "…" : "") : null;
  return `
    <article class="entry-card" data-entry="${entry.id}">
      <div class="entry-card-head">
        <div>
          <h4>${escapeHtml(entry.title)}</h4>
          <p class="entry-meta">
            ${formatDate(entry.date)}${entry.location ? " · " + escapeHtml(entry.location) : ""}
            ${trip ? `<span class="trip-badge" data-trip="${trip.id}">${escapeHtml(trip.title)}</span>` : `<span class="trip-badge trip-badge-general">General note</span>`}
          </p>
        </div>
        <div class="entry-card-actions">
          <button class="icon-btn" data-edit-entry="${entry.id}" title="Edit">✎</button>
        </div>
      </div>
      ${compact
        ? (excerpt ? `<p class="entry-excerpt">${excerpt}</p>` : "")
        : (entry.body ? renderBody(entry.body) : "")}
      ${!compact ? renderInsightsList(entry.insights) : (entry.insights && !entry.body ? renderInsightsList(entry.insights) : "")}
      ${!compact ? renderPhotoGrid(entry.photos) : ""}
    </article>
  `;
}

function renderTripDetail(trip) {
  const status = tripStatus(trip);
  const entries = entriesForTrip(trip.id);
  return `
    <div class="trip-header" style="${coverStyle(trip.coverPhoto, trip.id)}">
      <div class="trip-header-overlay">
        <span class="status-badge status-${status}">${statusLabel(status)}</span>
        <h2>${escapeHtml(trip.title)}</h2>
        <p class="trip-header-place">${escapeHtml([trip.destination, trip.country].filter(Boolean).join(", "))}</p>
        <p class="trip-header-dates">${formatDateRange(trip)}</p>
      </div>
    </div>

    <div class="trip-toolbar">
      <button class="btn" id="editTripBtn">✎ Edit Trip</button>
      <button class="btn btn-primary" id="newEntryForTripBtn">+ New Entry</button>
      <div class="spacer"></div>
      <button class="btn btn-danger-ghost" id="deleteTripQuickBtn">Delete Trip</button>
    </div>

    ${trip.summary ? `<p class="trip-summary">${escapeHtml(trip.summary)}</p>` : ""}
    ${tagsChips(trip.tags)}

    <section class="section">
      <div class="section-head"><h3>Journal</h3></div>
      ${entries.length
        ? `<div class="entry-feed">${entries.map((e) => entryCard(e)).join("")}</div>`
        : `<div class="empty-state">
             <p>No entries yet for this trip.</p>
             <button class="btn btn-primary" id="emptyNewEntryBtn">+ Write the first entry</button>
           </div>`}
    </section>
  `;
}

function renderNotes() {
  const notes = generalNotes();
  return `
    <div class="view-header">
      <h2>Notes &amp; Insights</h2>
      <p class="view-sub">Quick thoughts that aren't tied to a specific trip — packing lists, gear tips, ideas.</p>
    </div>
    <div class="section-head"><button class="btn btn-primary" id="newNoteBtn">+ New Note</button></div>
    ${notes.length
      ? `<div class="entry-feed">${notes.map((e) => entryCard(e)).join("")}</div>`
      : `<p class="empty-hint">No general notes yet.</p>`}
  `;
}

function renderPhotosView() {
  const photos = allPhotos();
  return `
    <div class="view-header">
      <h2>All Photos</h2>
      <p class="view-sub">${photos.length} photo${photos.length === 1 ? "" : "s"} across every trip.</p>
    </div>
    ${photos.length
      ? `<div class="photo-grid photo-grid-large">${photos.map((p) => `<img class="photo-thumb" src="${p.src}" title="${escapeHtml(p.tripTitle)}${p.date ? " · " + formatDate(p.date) : ""}" alt="">`).join("")}</div>`
      : `<p class="empty-hint">No photos yet. Add some from a journal entry or trip cover.</p>`}
  `;
}

function renderSearch(query) {
  const q = query.toLowerCase();
  const trips = state.trips.filter((t) =>
    [t.title, t.destination, t.country, (t.tags || []).join(" ")].join(" ").toLowerCase().includes(q)
  );
  const entries = state.entries.filter((e) =>
    [e.title, e.location, e.body, e.insights].join(" ").toLowerCase().includes(q)
  ).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return `
    <div class="view-header">
      <h2>Search results for "${escapeHtml(query)}"</h2>
    </div>
    <section class="section">
      <div class="section-head"><h3>Trips (${trips.length})</h3></div>
      ${trips.length ? `<div class="trip-card-grid">${trips.map(tripCard).join("")}</div>` : `<p class="empty-hint">No matching trips.</p>`}
    </section>
    <section class="section">
      <div class="section-head"><h3>Entries &amp; Notes (${entries.length})</h3></div>
      ${entries.length ? `<div class="entry-feed">${entries.map((e) => entryCard(e, { compact: true })).join("")}</div>` : `<p class="empty-hint">No matching entries.</p>`}
    </section>
  `;
}

// ---------- modals ----------

function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

function openTripModal(tripId) {
  const form = document.getElementById("tripForm");
  form.reset();
  tripCoverTemp = null;
  document.getElementById("tripCoverPreview").innerHTML = "";
  const trip = tripId ? tripById(tripId) : null;

  document.getElementById("tripModalTitle").textContent = trip ? "Edit Trip" : "New Trip";
  document.getElementById("tripId").value = trip ? trip.id : "";
  document.getElementById("tripTitle").value = trip ? trip.title : "";
  document.getElementById("tripDestination").value = trip ? trip.destination : "";
  document.getElementById("tripCountry").value = trip ? trip.country : "";
  document.getElementById("tripStart").value = trip ? trip.startDate : "";
  document.getElementById("tripEnd").value = trip ? trip.endDate : "";
  document.getElementById("tripSummary").value = trip ? trip.summary : "";
  document.getElementById("tripTags").value = trip && trip.tags ? trip.tags.join(", ") : "";
  document.getElementById("deleteTripBtn").style.display = trip ? "" : "none";

  if (trip && trip.coverPhoto) {
    tripCoverTemp = trip.coverPhoto;
    document.getElementById("tripCoverPreview").innerHTML = `<img src="${trip.coverPhoto}" alt="">`;
  }

  openModal("tripModalOverlay");
}

function renderEntryPhotoPreview() {
  const wrap = document.getElementById("entryPhotoPreview");
  wrap.innerHTML = "";
  entryPhotosTemp.forEach((src, i) => {
    const item = document.createElement("div");
    item.className = "photo-thumb-wrap";
    const img = document.createElement("img");
    img.src = src;
    img.className = "photo-thumb";
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "photo-remove";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      entryPhotosTemp.splice(i, 1);
      renderEntryPhotoPreview();
    });
    item.appendChild(img);
    item.appendChild(removeBtn);
    wrap.appendChild(item);
  });
}

function populateEntryTripSelect(selectedId) {
  const select = document.getElementById("entryTrip");
  const trips = [...state.trips].sort((a, b) => a.title.localeCompare(b.title));
  select.innerHTML = `<option value="">— General note —</option>` +
    trips.map((t) => `<option value="${t.id}">${escapeHtml(t.title)}</option>`).join("");
  select.value = selectedId || "";
}

function openEntryModal(entryId, prefillTripId) {
  const form = document.getElementById("entryForm");
  form.reset();
  const entry = entryId ? state.entries.find((e) => e.id === entryId) : null;

  document.getElementById("entryModalTitle").textContent = entry ? "Edit Entry" : "New Journal Entry";
  document.getElementById("entryId").value = entry ? entry.id : "";
  document.getElementById("entryTitle").value = entry ? entry.title : "";
  document.getElementById("entryDate").value = entry ? entry.date : todayStr();
  document.getElementById("entryLocation").value = entry ? entry.location : "";
  document.getElementById("entryBody").value = entry ? entry.body : "";
  document.getElementById("entryInsights").value = entry ? entry.insights : "";
  document.getElementById("deleteEntryBtn").style.display = entry ? "" : "none";

  populateEntryTripSelect(entry ? entry.tripId : prefillTripId);
  entryPhotosTemp = entry && entry.photos ? [...entry.photos] : [];
  renderEntryPhotoPreview();

  openModal("entryModalOverlay");
}

// ---------- event wiring ----------

function wireEvents() {
  document.getElementById("newTripBtn").addEventListener("click", () => openTripModal(null));

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  document.querySelectorAll(".side-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentView = { type: btn.dataset.view };
      document.getElementById("searchInput").value = "";
      closeSidebarMobile();
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const q = e.target.value.trim();
    currentView = q ? { type: "search", query: q } : { type: "home" };
    render();
  });

  // Trip form
  document.getElementById("tripCoverInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      tripCoverTemp = await resizeImage(file, MAX_COVER_DIM, 0.85);
      document.getElementById("tripCoverPreview").innerHTML = `<img src="${tripCoverTemp}" alt="">`;
    } catch (err) {
      showToast("Couldn't load that image.");
    }
  });

  document.getElementById("tripForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("tripId").value;
    const tags = document.getElementById("tripTags").value.split(",").map((t) => t.trim()).filter(Boolean);
    const data = {
      title: document.getElementById("tripTitle").value.trim(),
      destination: document.getElementById("tripDestination").value.trim(),
      country: document.getElementById("tripCountry").value.trim(),
      startDate: document.getElementById("tripStart").value,
      endDate: document.getElementById("tripEnd").value,
      summary: document.getElementById("tripSummary").value.trim(),
      tags,
      coverPhoto: tripCoverTemp,
    };
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      showToast("End date can't be before the start date.");
      return;
    }
    let savedTripId = id;
    if (id) {
      Object.assign(tripById(id), data);
    } else {
      savedTripId = uid();
      state.trips.push({ id: savedTripId, createdAt: new Date().toISOString(), pinned: false, ...data });
    }
    saveState();
    closeModal("tripModalOverlay");
    currentView = { type: "trip", tripId: savedTripId };
    render();
    showToast("Trip saved.");
  });

  document.getElementById("deleteTripBtn").addEventListener("click", () => {
    const id = document.getElementById("tripId").value;
    if (!id) return;
    if (!confirm("Delete this trip and all of its journal entries? This can't be undone.")) return;
    state.trips = state.trips.filter((t) => t.id !== id);
    state.entries = state.entries.filter((e) => e.tripId !== id);
    saveState();
    closeModal("tripModalOverlay");
    currentView = { type: "home" };
    render();
    showToast("Trip deleted.");
  });

  // Entry form
  document.getElementById("entryPhotosInput").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      try {
        const dataUrl = await resizeImage(file, MAX_PHOTO_DIM, 0.8);
        entryPhotosTemp.push(dataUrl);
      } catch (err) {
        showToast("Couldn't load one of those images.");
      }
    }
    renderEntryPhotoPreview();
    e.target.value = "";
  });

  document.getElementById("entryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("entryId").value;
    const data = {
      title: document.getElementById("entryTitle").value.trim(),
      date: document.getElementById("entryDate").value,
      tripId: document.getElementById("entryTrip").value || null,
      location: document.getElementById("entryLocation").value.trim(),
      body: document.getElementById("entryBody").value.trim(),
      insights: document.getElementById("entryInsights").value.trim(),
      photos: [...entryPhotosTemp],
    };
    let savedTripId = data.tripId;
    if (id) {
      Object.assign(state.entries.find((e) => e.id === id), data);
    } else {
      state.entries.push({ id: uid(), createdAt: new Date().toISOString(), ...data });
    }
    saveState();
    closeModal("entryModalOverlay");
    currentView = savedTripId ? { type: "trip", tripId: savedTripId } : { type: "notes" };
    render();
    showToast("Entry saved.");
  });

  document.getElementById("deleteEntryBtn").addEventListener("click", () => {
    const id = document.getElementById("entryId").value;
    if (!id) return;
    if (!confirm("Delete this entry? This can't be undone.")) return;
    const entry = state.entries.find((e) => e.id === id);
    const tripId = entry ? entry.tripId : null;
    state.entries = state.entries.filter((e) => e.id !== id);
    saveState();
    closeModal("entryModalOverlay");
    currentView = tripId ? { type: "trip", tripId } : { type: "notes" };
    render();
    showToast("Entry deleted.");
  });

  // Lightbox
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Sidebar mobile toggle
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("sidebarScrim").classList.toggle("open");
  });
  document.getElementById("sidebarScrim").addEventListener("click", closeSidebarMobile);

  // Delegated clicks across the app (trip cards, entry cards, dynamic buttons)
  document.addEventListener("click", (e) => {
    const photo = e.target.closest(".photo-thumb");
    if (photo && photo.tagName === "IMG") {
      openLightbox(photo.src);
      return;
    }

    const tripListItem = e.target.closest("[data-trip]");
    if (tripListItem && !e.target.closest("form")) {
      currentView = { type: "trip", tripId: tripListItem.dataset.trip };
      document.getElementById("searchInput").value = "";
      closeSidebarMobile();
      render();
      return;
    }

    const editEntryBtn = e.target.closest("[data-edit-entry]");
    if (editEntryBtn) {
      openEntryModal(editEntryBtn.dataset.editEntry);
      return;
    }

    if (e.target.id === "quickNewTrip") { openTripModal(null); return; }
    if (e.target.id === "editTripBtn") { openTripModal(currentView.tripId); return; }
    if (e.target.id === "newEntryForTripBtn" || e.target.id === "emptyNewEntryBtn") {
      openEntryModal(null, currentView.tripId);
      return;
    }
    if (e.target.id === "newNoteBtn") { openEntryModal(null, ""); return; }
    if (e.target.id === "deleteTripQuickBtn") {
      const trip = tripById(currentView.tripId);
      if (trip && confirm(`Delete "${trip.title}" and all of its journal entries? This can't be undone.`)) {
        state.trips = state.trips.filter((t) => t.id !== trip.id);
        state.entries = state.entries.filter((e2) => e2.tripId !== trip.id);
        saveState();
        currentView = { type: "home" };
        render();
        showToast("Trip deleted.");
      }
      return;
    }
  });
}

function closeSidebarMobile() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarScrim").classList.remove("open");
}

function openLightbox(src) {
  document.getElementById("lightboxImg").src = src;
  document.getElementById("lightbox").classList.add("open");
}
function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.getElementById("lightboxImg").src = "";
}

// ---------- init ----------

function init() {
  const datalist = document.getElementById("countryList");
  datalist.innerHTML = COUNTRIES.map((c) => `<option value="${escapeHtml(c)}">`).join("");
  wireEvents();
  render();
}

init();
