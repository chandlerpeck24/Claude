'use strict';

const STORAGE_KEY = 'wayfarer_state_v1';
const TYPE_LABELS = { journal: '📔 Journal', note: '🗒️ Note', insight: '💡 Insight' };

let state = { trips: [], entries: [] };
let currentView = 'trips';
let currentTripId = null;
let journalTypeFilter = 'all';
let journalTripFilter = 'all';
let detailTypeFilter = 'all';
let editingTripId = null;
let editingEntryId = null;
let pendingCover = null;
let pendingPhotos = [];

// ---------- element refs ----------
const searchInput = document.getElementById('search-input');
const addEntryBtn = document.getElementById('add-entry-btn');
const addTripBtn = document.getElementById('add-trip-btn');

const tabTripsBtn = document.getElementById('tab-trips');
const tabJournalBtn = document.getElementById('tab-journal');

const viewTripsEl = document.getElementById('view-trips');
const statsBarEl = document.getElementById('stats-bar');
const upcomingTripsEl = document.getElementById('upcoming-trips');
const pastTripsEl = document.getElementById('past-trips');
const noUpcomingEl = document.getElementById('no-upcoming');
const noPastEl = document.getElementById('no-past');
const noTripResultsEl = document.getElementById('no-trip-results');

const viewJournalEl = document.getElementById('view-journal');
const typeFiltersEl = document.getElementById('type-filters');
const tripFilterSelect = document.getElementById('trip-filter-select');
const journalFeedEl = document.getElementById('journal-feed');
const noJournalResultsEl = document.getElementById('no-journal-results');

const viewTripDetailEl = document.getElementById('view-trip-detail');
const backToTripsBtn = document.getElementById('back-to-trips');
const tripDetailCoverEl = document.getElementById('trip-detail-cover');
const tripDetailStatusEl = document.getElementById('trip-detail-status');
const tripDetailTitleEl = document.getElementById('trip-detail-title');
const tripDetailDestinationEl = document.getElementById('trip-detail-destination');
const tripDetailDatesEl = document.getElementById('trip-detail-dates');
const tripDetailSummaryEl = document.getElementById('trip-detail-summary');
const editTripBtn = document.getElementById('edit-trip-btn');
const deleteTripBtn = document.getElementById('delete-trip-btn');
const detailTypeFiltersEl = document.getElementById('detail-type-filters');
const addEntryForTripBtn = document.getElementById('add-entry-for-trip-btn');
const tripEntriesListEl = document.getElementById('trip-entries-list');
const noTripEntriesEl = document.getElementById('no-trip-entries');

const tripModalEl = document.getElementById('trip-modal');
const tripModalTitleEl = document.getElementById('trip-modal-title');
const tripFormEl = document.getElementById('trip-form');
const tripTitleInput = document.getElementById('trip-title-input');
const tripDestinationInput = document.getElementById('trip-destination-input');
const tripStartInput = document.getElementById('trip-start-input');
const tripEndInput = document.getElementById('trip-end-input');
const tripSummaryInput = document.getElementById('trip-summary-input');
const tripCoverInput = document.getElementById('trip-cover-input');
const tripCoverPreviewEl = document.getElementById('trip-cover-preview');

const entryModalEl = document.getElementById('entry-modal');
const entryModalTitleEl = document.getElementById('entry-modal-title');
const entryFormEl = document.getElementById('entry-form');
const entryTripInput = document.getElementById('entry-trip-input');
const entryTypeInput = document.getElementById('entry-type-input');
const entryTitleInput = document.getElementById('entry-title-input');
const entryDateInput = document.getElementById('entry-date-input');
const entryLocationInput = document.getElementById('entry-location-input');
const entryTagsInput = document.getElementById('entry-tags-input');
const entryBodyInput = document.getElementById('entry-body-input');
const entryPhotosInput = document.getElementById('entry-photos-input');
const entryPhotosPreviewEl = document.getElementById('entry-photos-preview');

const lightboxEl = document.getElementById('lightbox');
const lightboxImgEl = document.getElementById('lightbox-img');

// ---------- persistence ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips) && Array.isArray(parsed.entries)) return parsed;
    }
  } catch (err) {
    console.warn('Could not read saved journal, starting from the sample data.', err);
  }
  const seed = JSON.parse(JSON.stringify(SEED_STATE));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error(err);
    alert('Could not save — your browser storage may be full. Try removing a few photos and saving again.');
  }
}

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- date helpers ----------
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateRange(start, end) {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.toLocaleDateString(undefined, { month: 'short' })} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`;
  }
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString(undefined, opts)} – ${e.toLocaleDateString(undefined, opts)}`;
}

function daysBetween(aISO, bISO) {
  const MS = 86400000;
  return Math.round((new Date(bISO + 'T00:00:00') - new Date(aISO + 'T00:00:00')) / MS);
}

function tripStatus(trip) {
  const today = todayISO();
  if (trip.endDate < today) return 'past';
  if (trip.startDate > today) return 'upcoming';
  return 'ongoing';
}

function statusLabel(trip) {
  const status = tripStatus(trip);
  const today = todayISO();
  if (status === 'ongoing') return 'Happening now';
  if (status === 'upcoming') {
    const d = daysBetween(today, trip.startDate);
    return d === 0 ? 'Departs today' : `In ${d} day${d === 1 ? '' : 's'}`;
  }
  const d = daysBetween(trip.endDate, today);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  if (d < 365) return `${Math.round(d / 30)} month${Math.round(d / 30) === 1 ? '' : 's'} ago`;
  return `${Math.round(d / 365)} year${Math.round(d / 365) === 1 ? '' : 's'} ago`;
}

// ---------- misc helpers ----------
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function renderBody(body) {
  const paras = (body || '').split(/\n\s*\n/).filter(p => p.trim().length > 0);
  return paras.map(p => `<p>${escapeHTML(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function matchesQuery(entry, query) {
  return entry.title.toLowerCase().includes(query)
    || (entry.body || '').toLowerCase().includes(query)
    || (entry.location || '').toLowerCase().includes(query)
    || (entry.tags || []).some(t => t.toLowerCase().includes(query));
}

function fileToResizedDataURL(file, maxDim = 1600, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// ---------- view switching ----------
function setView(view) {
  currentView = view;
  viewTripsEl.classList.toggle('hidden', view !== 'trips');
  viewJournalEl.classList.toggle('hidden', view !== 'journal');
  viewTripDetailEl.classList.toggle('hidden', view !== 'trip-detail');
  tabTripsBtn.classList.toggle('active', view === 'trips');
  tabJournalBtn.classList.toggle('active', view === 'journal');
  if (view === 'trips') renderTripsView();
  else if (view === 'journal') renderJournalView();
  else if (view === 'trip-detail') renderTripDetail();
}

function refreshCurrentView() {
  if (currentView === 'trips') renderTripsView();
  else if (currentView === 'journal') renderJournalView();
  else if (currentView === 'trip-detail') renderTripDetail();
}

// ---------- trips view ----------
function renderStats() {
  const trips = state.trips;
  const pastTrips = trips.filter(t => tripStatus(t) === 'past');
  const photoCount = state.entries.reduce((n, e) => n + (e.photos ? e.photos.length : 0), 0)
    + trips.filter(t => t.cover).length;
  statsBarEl.innerHTML = `
    <div class="stat"><strong>${trips.length}</strong><span>Trips</span></div>
    <div class="stat"><strong>${pastTrips.length}</strong><span>Completed</span></div>
    <div class="stat"><strong>${state.entries.length}</strong><span>Journal Entries</span></div>
    <div class="stat"><strong>${photoCount}</strong><span>Photos</span></div>
  `;
}

function tripCardHTML(trip) {
  const status = tripStatus(trip);
  const entryCount = state.entries.filter(e => e.tripId === trip.id).length;
  const coverStyle = trip.cover ? `style="background-image:url('${trip.cover}')"` : '';
  return `
    <div class="trip-card" data-id="${trip.id}">
      <div class="trip-card-cover" ${coverStyle}>${trip.cover ? '' : '<span class="cover-fallback">🧭</span>'}</div>
      <div class="trip-card-body">
        <span class="status-badge status-${status}">${statusLabel(trip)}</span>
        <h3>${escapeHTML(trip.title)}</h3>
        <p class="trip-destination">📍 ${escapeHTML(trip.destination)}</p>
        <p class="trip-dates">${fmtDateRange(trip.startDate, trip.endDate)}</p>
        <p class="trip-entry-count">${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}</p>
      </div>
    </div>`;
}

function renderTripsView() {
  const query = searchInput.value.trim().toLowerCase();
  const trips = state.trips.filter(t => !query
    || t.title.toLowerCase().includes(query)
    || t.destination.toLowerCase().includes(query)
    || (t.summary || '').toLowerCase().includes(query));

  const upcoming = trips.filter(t => tripStatus(t) !== 'past').sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = trips.filter(t => tripStatus(t) === 'past').sort((a, b) => b.startDate.localeCompare(a.startDate));

  upcomingTripsEl.innerHTML = upcoming.map(tripCardHTML).join('');
  pastTripsEl.innerHTML = past.map(tripCardHTML).join('');

  noUpcomingEl.classList.toggle('hidden', query.length > 0 || upcoming.length > 0);
  noPastEl.classList.toggle('hidden', query.length > 0 || past.length > 0);
  noTripResultsEl.classList.toggle('hidden', !(query.length > 0 && trips.length === 0));

  renderStats();
}

// ---------- entry cards (shared by journal feed + trip detail) ----------
function entryCardHTML(entry, showTripLink) {
  const trip = entry.tripId ? state.trips.find(t => t.id === entry.tripId) : null;
  const photosHTML = (entry.photos && entry.photos.length)
    ? `<div class="entry-photos">${entry.photos.map(p => `<img src="${p}" class="entry-photo-thumb" alt="">`).join('')}</div>`
    : '';
  const tagsHTML = (entry.tags && entry.tags.length)
    ? `<div class="entry-tags">${entry.tags.map(t => `<span class="tag-chip">#${escapeHTML(t)}</span>`).join('')}</div>`
    : '';
  let tripLine = '';
  if (showTripLink) {
    tripLine = trip
      ? `<p class="entry-trip-link" data-trip-id="${trip.id}">✈️ ${escapeHTML(trip.title)}</p>`
      : `<p class="entry-trip-link general">General note</p>`;
  }
  return `
    <article class="entry-card entry-type-${entry.type}" data-id="${entry.id}">
      <div class="entry-meta">
        <span class="entry-type-badge">${TYPE_LABELS[entry.type] || entry.type}</span>
        <span class="entry-date">${fmtDate(entry.date)}</span>
        ${entry.location ? `<span class="entry-location">📍 ${escapeHTML(entry.location)}</span>` : ''}
      </div>
      ${tripLine}
      <h3 class="entry-title">${escapeHTML(entry.title)}</h3>
      ${photosHTML}
      <div class="entry-body">${renderBody(entry.body)}</div>
      ${tagsHTML}
      <div class="entry-actions">
        <button type="button" class="btn btn-secondary btn-small entry-edit-btn">Edit</button>
        <button type="button" class="btn btn-danger btn-small entry-delete-btn">Delete</button>
      </div>
    </article>`;
}

function applyReadMore(container) {
  container.querySelectorAll('.entry-body').forEach(body => {
    if (body.scrollHeight > body.clientHeight + 4) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'read-more-btn';
      btn.textContent = 'Read more';
      btn.addEventListener('click', () => {
        body.classList.toggle('expanded');
        btn.textContent = body.classList.contains('expanded') ? 'Show less' : 'Read more';
      });
      body.after(btn);
    }
  });
}

// ---------- journal feed view ----------
function populateTripFilterSelect() {
  const current = tripFilterSelect.value || 'all';
  const trips = state.trips.slice().sort((a, b) => a.title.localeCompare(b.title));
  tripFilterSelect.innerHTML = '<option value="all">All trips</option>'
    + '<option value="">General (no trip)</option>'
    + trips.map(t => `<option value="${t.id}">${escapeHTML(t.title)}</option>`).join('');
  tripFilterSelect.value = current;
  if (tripFilterSelect.value !== current) tripFilterSelect.value = 'all';
}

function renderJournalView() {
  populateTripFilterSelect();
  const query = searchInput.value.trim().toLowerCase();
  let entries = state.entries.slice();
  if (journalTypeFilter !== 'all') entries = entries.filter(e => e.type === journalTypeFilter);
  if (journalTripFilter !== 'all') entries = entries.filter(e => (e.tripId || '') === journalTripFilter);
  if (query) entries = entries.filter(e => matchesQuery(e, query));
  entries.sort((a, b) => b.date.localeCompare(a.date));

  journalFeedEl.innerHTML = entries.map(e => entryCardHTML(e, true)).join('');
  noJournalResultsEl.classList.toggle('hidden', entries.length > 0);
  requestAnimationFrame(() => applyReadMore(journalFeedEl));
}

// ---------- trip detail view ----------
function openTripDetail(tripId) {
  currentTripId = tripId;
  detailTypeFilter = 'all';
  [...detailTypeFiltersEl.children].forEach(c => c.classList.toggle('active', c.dataset.type === 'all'));
  setView('trip-detail');
}

function renderTripDetail() {
  const trip = state.trips.find(t => t.id === currentTripId);
  if (!trip) { setView('trips'); return; }

  tripDetailCoverEl.style.backgroundImage = trip.cover ? `url('${trip.cover}')` : '';
  tripDetailCoverEl.classList.toggle('no-cover', !trip.cover);
  const status = tripStatus(trip);
  tripDetailStatusEl.textContent = statusLabel(trip);
  tripDetailStatusEl.className = `status-badge status-${status}`;
  tripDetailTitleEl.textContent = trip.title;
  tripDetailDestinationEl.textContent = `📍 ${trip.destination}`;
  tripDetailDatesEl.textContent = fmtDateRange(trip.startDate, trip.endDate);
  tripDetailSummaryEl.textContent = trip.summary || '';

  let entries = state.entries.filter(e => e.tripId === trip.id);
  if (detailTypeFilter !== 'all') entries = entries.filter(e => e.type === detailTypeFilter);
  const query = searchInput.value.trim().toLowerCase();
  if (query) entries = entries.filter(e => matchesQuery(e, query));
  entries.sort((a, b) => b.date.localeCompare(a.date));

  tripEntriesListEl.innerHTML = entries.map(e => entryCardHTML(e, false)).join('');
  noTripEntriesEl.classList.toggle('hidden', entries.length > 0);
  requestAnimationFrame(() => applyReadMore(tripEntriesListEl));
}

// ---------- trip modal ----------
function renderCoverPreview() {
  tripCoverPreviewEl.innerHTML = pendingCover
    ? `<div class="photo-preview"><img src="${pendingCover}" alt=""><button type="button" class="photo-remove-btn" title="Remove photo">✕</button></div>`
    : '';
}

function openTripModal(tripId) {
  editingTripId = tripId || null;
  pendingCover = null;
  tripFormEl.reset();
  if (tripId) {
    const trip = state.trips.find(t => t.id === tripId);
    tripModalTitleEl.textContent = 'Edit Trip';
    tripTitleInput.value = trip.title;
    tripDestinationInput.value = trip.destination;
    tripStartInput.value = trip.startDate;
    tripEndInput.value = trip.endDate;
    tripSummaryInput.value = trip.summary || '';
    pendingCover = trip.cover || null;
  } else {
    tripModalTitleEl.textContent = 'New Trip';
  }
  renderCoverPreview();
  tripModalEl.classList.remove('hidden');
}

function closeTripModal() {
  tripModalEl.classList.add('hidden');
}

// ---------- entry modal ----------
function populateEntryTripSelect() {
  const trips = state.trips.slice().sort((a, b) => a.title.localeCompare(b.title));
  entryTripInput.innerHTML = '<option value="">— General (no trip) —</option>'
    + trips.map(t => `<option value="${t.id}">${escapeHTML(t.title)}</option>`).join('');
}

function renderEntryPhotosPreview() {
  entryPhotosPreviewEl.innerHTML = pendingPhotos.map((src, i) =>
    `<div class="photo-preview" data-index="${i}"><img src="${src}" alt=""><button type="button" class="photo-remove-btn" title="Remove photo">✕</button></div>`
  ).join('');
}

function openEntryModal(entryId, presetTripId) {
  editingEntryId = entryId || null;
  pendingPhotos = [];
  entryFormEl.reset();
  populateEntryTripSelect();

  if (entryId) {
    const entry = state.entries.find(e => e.id === entryId);
    entryModalTitleEl.textContent = 'Edit Entry';
    entryTripInput.value = entry.tripId || '';
    entryTypeInput.value = entry.type;
    entryTitleInput.value = entry.title;
    entryDateInput.value = entry.date;
    entryLocationInput.value = entry.location || '';
    entryTagsInput.value = (entry.tags || []).join(', ');
    entryBodyInput.value = entry.body;
    pendingPhotos = [...(entry.photos || [])];
  } else {
    entryModalTitleEl.textContent = 'New Entry';
    entryDateInput.value = todayISO();
    entryTripInput.value = presetTripId || '';
  }
  renderEntryPhotosPreview();
  entryModalEl.classList.remove('hidden');
}

function closeEntryModal() {
  entryModalEl.classList.add('hidden');
}

// ---------- CRUD ----------
function deleteTrip(tripId) {
  const trip = state.trips.find(t => t.id === tripId);
  if (!trip) return;
  const entryCount = state.entries.filter(e => e.tripId === tripId).length;
  const msg = entryCount > 0
    ? `Delete "${trip.title}"? This will also delete its ${entryCount} journal ${entryCount === 1 ? 'entry' : 'entries'}.`
    : `Delete "${trip.title}"?`;
  if (!confirm(msg)) return;
  state.trips = state.trips.filter(t => t.id !== tripId);
  state.entries = state.entries.filter(e => e.tripId !== tripId);
  saveState();
  setView('trips');
}

function deleteEntry(entryId) {
  const entry = state.entries.find(e => e.id === entryId);
  if (!entry) return;
  if (!confirm(`Delete "${entry.title}"?`)) return;
  state.entries = state.entries.filter(e => e.id !== entryId);
  saveState();
  refreshCurrentView();
}

// ---------- lightbox ----------
function openLightbox(src) {
  lightboxImgEl.src = src;
  lightboxEl.classList.remove('hidden');
}

function closeLightbox() {
  lightboxEl.classList.add('hidden');
  lightboxImgEl.src = '';
}

// ---------- event listeners ----------
tabTripsBtn.addEventListener('click', () => setView('trips'));
tabJournalBtn.addEventListener('click', () => setView('journal'));
backToTripsBtn.addEventListener('click', () => setView('trips'));

searchInput.addEventListener('input', refreshCurrentView);

addTripBtn.addEventListener('click', () => openTripModal(null));
addEntryBtn.addEventListener('click', () => openEntryModal(null, currentView === 'trip-detail' ? currentTripId : null));
addEntryForTripBtn.addEventListener('click', () => openEntryModal(null, currentTripId));

editTripBtn.addEventListener('click', () => openTripModal(currentTripId));
deleteTripBtn.addEventListener('click', () => deleteTrip(currentTripId));

typeFiltersEl.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  [...typeFiltersEl.children].forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  journalTypeFilter = btn.dataset.type;
  renderJournalView();
});

detailTypeFiltersEl.addEventListener('click', e => {
  const btn = e.target.closest('.chip');
  if (!btn) return;
  [...detailTypeFiltersEl.children].forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  detailTypeFilter = btn.dataset.type;
  renderTripDetail();
});

tripFilterSelect.addEventListener('change', () => {
  journalTripFilter = tripFilterSelect.value;
  renderJournalView();
});

document.getElementById('close-trip-modal').addEventListener('click', closeTripModal);
document.getElementById('cancel-trip-btn').addEventListener('click', closeTripModal);
tripModalEl.addEventListener('click', e => { if (e.target === tripModalEl) closeTripModal(); });

document.getElementById('close-entry-modal').addEventListener('click', closeEntryModal);
document.getElementById('cancel-entry-btn').addEventListener('click', closeEntryModal);
entryModalEl.addEventListener('click', e => { if (e.target === entryModalEl) closeEntryModal(); });

document.getElementById('close-lightbox').addEventListener('click', closeLightbox);
lightboxEl.addEventListener('click', e => { if (e.target === lightboxEl) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeTripModal();
  closeEntryModal();
  closeLightbox();
});

tripCoverInput.addEventListener('change', async () => {
  const file = tripCoverInput.files[0];
  if (!file) return;
  pendingCover = await fileToResizedDataURL(file);
  renderCoverPreview();
  tripCoverInput.value = '';
});

tripCoverPreviewEl.addEventListener('click', e => {
  if (!e.target.closest('.photo-remove-btn')) return;
  pendingCover = null;
  renderCoverPreview();
});

tripFormEl.addEventListener('submit', e => {
  e.preventDefault();
  if (tripEndInput.value < tripStartInput.value) {
    alert('End date must be on or after the start date.');
    return;
  }
  const data = {
    title: tripTitleInput.value.trim(),
    destination: tripDestinationInput.value.trim(),
    startDate: tripStartInput.value,
    endDate: tripEndInput.value,
    summary: tripSummaryInput.value.trim(),
    cover: pendingCover,
  };
  if (editingTripId) {
    Object.assign(state.trips.find(t => t.id === editingTripId), data);
  } else {
    state.trips.push({ id: uid(), ...data });
  }
  saveState();
  closeTripModal();
  refreshCurrentView();
});

entryPhotosInput.addEventListener('change', async () => {
  const files = [...entryPhotosInput.files];
  for (const file of files) {
    try {
      pendingPhotos.push(await fileToResizedDataURL(file));
    } catch (err) {
      console.error(err);
    }
  }
  renderEntryPhotosPreview();
  entryPhotosInput.value = '';
});

entryPhotosPreviewEl.addEventListener('click', e => {
  const removeBtn = e.target.closest('.photo-remove-btn');
  if (!removeBtn) return;
  const index = Number(removeBtn.closest('.photo-preview').dataset.index);
  pendingPhotos.splice(index, 1);
  renderEntryPhotosPreview();
});

entryFormEl.addEventListener('submit', e => {
  e.preventDefault();
  const tags = entryTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
  const data = {
    tripId: entryTripInput.value || null,
    type: entryTypeInput.value,
    title: entryTitleInput.value.trim(),
    date: entryDateInput.value,
    location: entryLocationInput.value.trim(),
    tags,
    body: entryBodyInput.value.trim(),
    photos: [...pendingPhotos],
  };
  if (editingEntryId) {
    Object.assign(state.entries.find(e => e.id === editingEntryId), data);
  } else {
    state.entries.push({ id: uid(), ...data });
  }
  saveState();
  closeEntryModal();
  refreshCurrentView();
});

// delegated clicks for dynamically-rendered trip cards + entry cards
document.addEventListener('click', e => {
  const tripCard = e.target.closest('.trip-card');
  if (tripCard) { openTripDetail(tripCard.dataset.id); return; }

  const tripLink = e.target.closest('.entry-trip-link[data-trip-id]');
  if (tripLink) { openTripDetail(tripLink.dataset.tripId); return; }

  const photo = e.target.closest('.entry-photo-thumb');
  if (photo) { openLightbox(photo.src); return; }

  const editBtn = e.target.closest('.entry-edit-btn');
  if (editBtn) { openEntryModal(editBtn.closest('.entry-card').dataset.id); return; }

  const delBtn = e.target.closest('.entry-delete-btn');
  if (delBtn) { deleteEntry(delBtn.closest('.entry-card').dataset.id); return; }
});

// ---------- init ----------
state = loadState();
setView('trips');
