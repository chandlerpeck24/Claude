(function () {
  "use strict";

  var STORAGE_KEY = "waypoints.trips";

  var state = {
    trips: [],
    selectedTripId: null,
    entryTypeFilter: "all",
    searchQuery: "",
    entryModalTripId: null,
    entryModalPhotos: [],
    entryModalType: "journal",
    tripModalCover: null
  };

  // ---------- persistence ----------

  function loadTrips() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    var seed = JSON.parse(JSON.stringify(SEED_TRIPS));
    saveTrips(seed);
    return seed;
  }

  function saveTrips(trips) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error("Could not save to localStorage", e);
    }
  }

  function persist() {
    saveTrips(state.trips);
  }

  // ---------- date helpers ----------

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function parseLocalDate(str) {
    var parts = str.split("-");
    return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  }

  function formatDate(str) {
    if (!str) return "";
    return parseLocalDate(str).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatDateRange(start, end) {
    var s = parseLocalDate(start);
    var e = parseLocalDate(end);
    var sameYear = s.getFullYear() === e.getFullYear();
    var startFmt = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    var endFmt = e.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    if (!sameYear) {
      startFmt = s.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }
    return startFmt + " – " + endFmt;
  }

  function tripStatus(trip) {
    var t = todayStr();
    if (t < trip.startDate) return "upcoming";
    if (t > trip.endDate) return "past";
    return "ongoing";
  }

  // ---------- element helper ----------

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else if (key.indexOf("on") === 0 && typeof attrs[key] === "function") {
        node.addEventListener(key.slice(2), attrs[key]);
      } else {
        node.setAttribute(key, attrs[key]);
      }
    });
    (children || []).forEach(function (c) {
      if (c) node.appendChild(c);
    });
    return node;
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ---------- trip lookups ----------

  function getTrip(id) {
    return state.trips.find(function (t) {
      return t.id === id;
    });
  }

  function sortedTrips() {
    return state.trips.slice().sort(function (a, b) {
      return a.startDate < b.startDate ? -1 : 1;
    });
  }

  // ---------- sidebar ----------

  function renderSidebar() {
    var nav = document.getElementById("tripNav");
    nav.innerHTML = "";

    if (state.searchQuery.trim()) {
      renderSearchResults(nav);
      return;
    }

    if (state.trips.length === 0) {
      nav.appendChild(el("div", { class: "trip-nav-empty", text: "No trips yet — start one above." }));
      return;
    }

    var groups = { ongoing: [], upcoming: [], past: [] };
    sortedTrips().forEach(function (trip) {
      groups[tripStatus(trip)].push(trip);
    });
    groups.past.reverse();

    var sections = [
      ["ongoing", "Ongoing"],
      ["upcoming", "Upcoming"],
      ["past", "Past"]
    ];

    sections.forEach(function (pair) {
      var key = pair[0],
        label = pair[1];
      if (groups[key].length === 0) return;
      nav.appendChild(el("div", { class: "trip-group-label", text: label }));
      groups[key].forEach(function (trip) {
        nav.appendChild(renderTripNavItem(trip));
      });
    });
  }

  function renderTripNavItem(trip) {
    var btn = el(
      "button",
      {
        class: "trip-nav-item" + (trip.id === state.selectedTripId ? " active" : ""),
        onclick: function () {
          selectTrip(trip.id);
        }
      },
      [
        el("span", { class: "trip-nav-title", text: trip.title }),
        el("span", {
          class: "trip-nav-meta",
          text: trip.destination + " · " + formatDateRange(trip.startDate, trip.endDate)
        })
      ]
    );
    return btn;
  }

  function renderSearchResults(nav) {
    var q = state.searchQuery.trim().toLowerCase();
    var matches = [];

    state.trips.forEach(function (trip) {
      var tripHay = (trip.title + " " + trip.destination + " " + (trip.notes || "")).toLowerCase();
      if (tripHay.indexOf(q) !== -1) {
        matches.push({ kind: "trip", trip: trip });
      }
      trip.entries.forEach(function (entry) {
        var entryHay = (entry.title + " " + entry.body + " " + (entry.location || "")).toLowerCase();
        if (entryHay.indexOf(q) !== -1) {
          matches.push({ kind: "entry", trip: trip, entry: entry });
        }
      });
    });

    if (matches.length === 0) {
      nav.appendChild(el("div", { class: "trip-nav-empty", text: "No matches for “" + state.searchQuery + "”" }));
      return;
    }

    nav.appendChild(el("div", { class: "trip-group-label", text: matches.length + " result" + (matches.length === 1 ? "" : "s") }));

    matches.forEach(function (m) {
      var titleText = m.kind === "trip" ? m.trip.title : m.entry.title;
      var metaText = m.kind === "trip" ? "Trip · " + m.trip.destination : m.trip.title + " · " + formatDate(m.entry.date);
      nav.appendChild(
        el(
          "div",
          {
            class: "search-hit",
            onclick: function () {
              state.searchQuery = "";
              document.getElementById("tripSearch").value = "";
              selectTrip(m.trip.id);
              if (m.kind === "entry") {
                setTimeout(function () {
                  var node = document.getElementById("entry-" + m.entry.id);
                  if (node) {
                    node.scrollIntoView({ behavior: "smooth", block: "center" });
                    node.classList.add("flash");
                    setTimeout(function () {
                      node.classList.remove("flash");
                    }, 1200);
                  }
                }, 30);
              }
            }
          },
          [el("div", { class: "search-hit-title", text: titleText }), el("div", { class: "search-hit-meta", text: metaText })]
        )
      );
    });
  }

  function selectTrip(id) {
    state.selectedTripId = id;
    state.entryTypeFilter = "all";
    render();
  }

  // ---------- content / trip detail ----------

  function render() {
    renderSidebar();
    renderContent();
  }

  function renderContent() {
    var content = document.getElementById("content");
    content.innerHTML = "";

    var trip = getTrip(state.selectedTripId);
    if (!trip) {
      content.appendChild(
        el("div", { class: "empty-state" }, [
          el("p", { class: "empty-glyph", html: "&#128506;" }),
          el("h2", { text: "No trip selected" }),
          el("p", { text: "Pick a trip from the list, or start a new one to begin logging entries." })
        ])
      );
      return;
    }

    content.appendChild(renderTripHeader(trip));
    content.appendChild(renderFeedToolbar(trip));
    content.appendChild(renderEntryFeed(trip));
  }

  function renderTripHeader(trip) {
    var status = tripStatus(trip);
    var statusLabel = status === "ongoing" ? "Ongoing" : status === "upcoming" ? "Upcoming" : "Past";

    var children = [];
    if (trip.coverPhoto) {
      children.push(el("img", { class: "trip-cover", src: trip.coverPhoto, alt: trip.title }));
    }

    var titleRow = el("div", { class: "trip-title-row" }, [
      el("div", {}, [
        el("h1", { class: "trip-title", text: trip.title }),
        el("p", { class: "trip-destination", text: trip.destination }),
        el("span", { class: "trip-dates", text: formatDateRange(trip.startDate, trip.endDate) }),
        el("span", { class: "trip-status-badge trip-status-" + status, text: statusLabel })
      ]),
      el("div", { class: "trip-actions" }, [
        el("button", {
          class: "btn btn-ghost btn-sm",
          text: "Edit Trip",
          onclick: function () {
            openTripModal(trip.id);
          }
        }),
        el("button", {
          class: "btn btn-accent btn-sm",
          text: "+ New Entry",
          onclick: function () {
            openEntryModal(trip.id, null);
          }
        })
      ])
    ]);
    children.push(titleRow);

    if (trip.notes) {
      children.push(el("div", { class: "trip-notes", text: trip.notes }));
    }

    return el("div", { class: "trip-header" }, children);
  }

  var TYPE_LABELS = { journal: "Journal", note: "Note", insight: "Insight" };

  function renderFeedToolbar(trip) {
    var filters = [
      ["all", "All"],
      ["journal", "Journal"],
      ["note", "Notes"],
      ["insight", "Insights"]
    ];
    var chips = filters.map(function (pair) {
      var key = pair[0],
        label = pair[1];
      var count = key === "all" ? trip.entries.length : trip.entries.filter(function (e) { return e.type === key; }).length;
      return el("button", {
        class: "filter-chip" + (state.entryTypeFilter === key ? " active" : ""),
        text: label + " (" + count + ")",
        onclick: function () {
          state.entryTypeFilter = key;
          renderContent();
        }
      });
    });
    return el("div", { class: "feed-toolbar" }, [el("div", { class: "type-filters" }, chips)]);
  }

  function renderEntryFeed(trip) {
    var wrap = el("div", { class: "entry-feed" });
    var entries = trip.entries
      .filter(function (e) {
        return state.entryTypeFilter === "all" || e.type === state.entryTypeFilter;
      })
      .slice()
      .sort(function (a, b) {
        return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
      });

    if (entries.length === 0) {
      wrap.appendChild(
        el("div", { class: "entry-empty", text: trip.entries.length === 0 ? "No entries yet. Add your first one." : "Nothing in this category yet." })
      );
      return wrap;
    }

    entries.forEach(function (entry) {
      wrap.appendChild(renderEntryCard(trip, entry));
    });
    return wrap;
  }

  function renderEntryCard(trip, entry) {
    var badges = el("div", { class: "entry-badges" }, [
      el("span", { class: "entry-type-badge entry-type-" + entry.type, text: TYPE_LABELS[entry.type] }),
      el("span", {
        class: "entry-meta",
        text: formatDate(entry.date) + (entry.location ? " · " + entry.location : "")
      })
    ]);

    var head = el("div", { class: "entry-card-head" }, [
      el("div", {}, [badges, el("h3", { class: "entry-title", text: entry.title })]),
      el("div", { class: "entry-actions" }, [
        el("button", {
          class: "icon-btn",
          html: "&#9998;",
          title: "Edit entry",
          onclick: function () {
            openEntryModal(trip.id, entry.id);
          }
        })
      ])
    ]);

    var bodyEl = el("div", { class: "entry-body" + (entry.type === "journal" ? " story" : "") });
    entry.body.split(/\n{2,}/).forEach(function (para) {
      bodyEl.appendChild(el("p", { text: para }));
    });

    var card = el("div", { class: "entry-card", id: "entry-" + entry.id }, [head, bodyEl]);

    if (entry.photos && entry.photos.length) {
      var grid = el("div", { class: "photo-grid entry-photos" });
      entry.photos.forEach(function (src) {
        grid.appendChild(
          el("img", {
            src: src,
            alt: entry.title,
            onclick: function () {
              openLightbox(src);
            }
          })
        );
      });
      card.appendChild(grid);
    }

    return card;
  }

  // ---------- trip modal ----------

  function openTripModal(tripId) {
    var backdrop = document.getElementById("tripModalBackdrop");
    var form = document.getElementById("tripForm");
    form.reset();
    state.tripModalCover = null;

    var deleteBtn = document.getElementById("deleteTripBtn");
    var preview = document.getElementById("tripCoverPreview");
    var clearBtn = document.getElementById("tripCoverClear");
    preview.hidden = true;
    clearBtn.hidden = true;

    if (tripId) {
      var trip = getTrip(tripId);
      document.getElementById("tripModalTitle").textContent = "Edit Trip";
      document.getElementById("tripId").value = trip.id;
      document.getElementById("tripTitle").value = trip.title;
      document.getElementById("tripDestination").value = trip.destination;
      document.getElementById("tripStart").value = trip.startDate;
      document.getElementById("tripEnd").value = trip.endDate;
      document.getElementById("tripNotes").value = trip.notes || "";
      state.tripModalCover = trip.coverPhoto || null;
      if (state.tripModalCover) {
        preview.src = state.tripModalCover;
        preview.hidden = false;
        clearBtn.hidden = false;
      }
      deleteBtn.hidden = false;
    } else {
      document.getElementById("tripModalTitle").textContent = "New Trip";
      document.getElementById("tripId").value = "";
      deleteBtn.hidden = true;
    }

    backdrop.classList.add("open");
  }

  function closeTripModal() {
    document.getElementById("tripModalBackdrop").classList.remove("open");
  }

  function handleTripSubmit(ev) {
    ev.preventDefault();
    var id = document.getElementById("tripId").value;
    var start = document.getElementById("tripStart").value;
    var end = document.getElementById("tripEnd").value;
    if (end < start) {
      alert("End date can't be before the start date.");
      return;
    }

    if (id) {
      var trip = getTrip(id);
      trip.title = document.getElementById("tripTitle").value.trim();
      trip.destination = document.getElementById("tripDestination").value.trim();
      trip.startDate = start;
      trip.endDate = end;
      trip.notes = document.getElementById("tripNotes").value.trim();
      trip.coverPhoto = state.tripModalCover;
    } else {
      var newTrip = {
        id: "trip-" + Date.now().toString(36),
        title: document.getElementById("tripTitle").value.trim(),
        destination: document.getElementById("tripDestination").value.trim(),
        startDate: start,
        endDate: end,
        notes: document.getElementById("tripNotes").value.trim(),
        coverPhoto: state.tripModalCover,
        entries: []
      };
      state.trips.push(newTrip);
      state.selectedTripId = newTrip.id;
    }

    persist();
    closeTripModal();
    render();
  }

  function handleDeleteTrip() {
    var id = document.getElementById("tripId").value;
    if (!id) return;
    if (!confirm("Delete this trip and all its entries? This can't be undone.")) return;
    state.trips = state.trips.filter(function (t) {
      return t.id !== id;
    });
    if (state.selectedTripId === id) state.selectedTripId = null;
    persist();
    closeTripModal();
    render();
  }

  // ---------- entry modal ----------

  function openEntryModal(tripId, entryId) {
    var backdrop = document.getElementById("entryModalBackdrop");
    var form = document.getElementById("entryForm");
    form.reset();
    state.entryModalTripId = tripId;
    state.entryModalPhotos = [];
    state.entryModalType = "journal";

    var deleteBtn = document.getElementById("deleteEntryBtn");

    if (entryId) {
      var trip = getTrip(tripId);
      var entry = trip.entries.find(function (e) {
        return e.id === entryId;
      });
      document.getElementById("entryModalTitle").textContent = "Edit Entry";
      document.getElementById("entryId").value = entry.id;
      document.getElementById("entryTitle").value = entry.title;
      document.getElementById("entryDate").value = entry.date;
      document.getElementById("entryLocation").value = entry.location || "";
      document.getElementById("entryBody").value = entry.body;
      state.entryModalPhotos = (entry.photos || []).slice();
      state.entryModalType = entry.type;
      deleteBtn.hidden = false;
    } else {
      document.getElementById("entryModalTitle").textContent = "New Entry";
      document.getElementById("entryId").value = "";
      document.getElementById("entryDate").value = todayStr();
      deleteBtn.hidden = true;
    }

    updateTypePicker();
    renderEntryPhotoGrid();
    backdrop.classList.add("open");
  }

  function closeEntryModal() {
    document.getElementById("entryModalBackdrop").classList.remove("open");
  }

  function updateTypePicker() {
    var chips = document.querySelectorAll("#entryTypePicker .type-chip");
    chips.forEach(function (chip) {
      chip.classList.toggle("active", chip.dataset.type === state.entryModalType);
    });
  }

  function renderEntryPhotoGrid() {
    var grid = document.getElementById("entryPhotoGrid");
    grid.innerHTML = "";
    state.entryModalPhotos.forEach(function (src, idx) {
      var wrap = el("div", { class: "photo-thumb-wrap" }, [
        el("img", { class: "photo-thumb", src: src }),
        el("button", {
          type: "button",
          class: "photo-remove-btn",
          html: "&times;",
          title: "Remove photo",
          onclick: function () {
            state.entryModalPhotos.splice(idx, 1);
            renderEntryPhotoGrid();
          }
        })
      ]);
      grid.appendChild(wrap);
    });
  }

  function handleEntrySubmit(ev) {
    ev.preventDefault();
    var id = document.getElementById("entryId").value;
    var trip = getTrip(state.entryModalTripId);
    if (!trip) return;

    var data = {
      type: state.entryModalType,
      title: document.getElementById("entryTitle").value.trim(),
      date: document.getElementById("entryDate").value,
      location: document.getElementById("entryLocation").value.trim(),
      body: document.getElementById("entryBody").value.trim(),
      photos: state.entryModalPhotos.slice()
    };

    if (id) {
      var entry = trip.entries.find(function (e) {
        return e.id === id;
      });
      Object.assign(entry, data);
    } else {
      data.id = "entry-" + Date.now().toString(36);
      trip.entries.push(data);
    }

    persist();
    closeEntryModal();
    render();
  }

  function handleDeleteEntry() {
    var id = document.getElementById("entryId").value;
    var trip = getTrip(state.entryModalTripId);
    if (!id || !trip) return;
    if (!confirm("Delete this entry?")) return;
    trip.entries = trip.entries.filter(function (e) {
      return e.id !== id;
    });
    persist();
    closeEntryModal();
    render();
  }

  // ---------- lightbox ----------

  function openLightbox(src) {
    var backdrop = document.getElementById("lightboxBackdrop");
    document.getElementById("lightboxImg").src = src;
    backdrop.classList.add("open");
  }

  function closeLightbox() {
    document.getElementById("lightboxBackdrop").classList.remove("open");
    document.getElementById("lightboxImg").src = "";
  }

  // ---------- wiring ----------

  function init() {
    state.trips = loadTrips();

    document.getElementById("newTripBtn").addEventListener("click", function () {
      openTripModal(null);
    });

    document.getElementById("tripForm").addEventListener("submit", handleTripSubmit);
    document.getElementById("deleteTripBtn").addEventListener("click", handleDeleteTrip);

    document.getElementById("tripCoverInput").addEventListener("change", function (ev) {
      var file = ev.target.files[0];
      if (!file) return;
      fileToDataUrl(file).then(function (dataUrl) {
        state.tripModalCover = dataUrl;
        var preview = document.getElementById("tripCoverPreview");
        preview.src = dataUrl;
        preview.hidden = false;
        document.getElementById("tripCoverClear").hidden = false;
      });
    });
    document.getElementById("tripCoverClear").addEventListener("click", function () {
      state.tripModalCover = null;
      document.getElementById("tripCoverInput").value = "";
      document.getElementById("tripCoverPreview").hidden = true;
      document.getElementById("tripCoverClear").hidden = true;
    });

    document.getElementById("entryForm").addEventListener("submit", handleEntrySubmit);
    document.getElementById("deleteEntryBtn").addEventListener("click", handleDeleteEntry);

    document.querySelectorAll("#entryTypePicker .type-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.entryModalType = chip.dataset.type;
        updateTypePicker();
      });
    });

    document.getElementById("entryPhotosInput").addEventListener("change", function (ev) {
      var files = Array.prototype.slice.call(ev.target.files);
      Promise.all(files.map(fileToDataUrl)).then(function (dataUrls) {
        state.entryModalPhotos = state.entryModalPhotos.concat(dataUrls);
        renderEntryPhotoGrid();
        ev.target.value = "";
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeTripModal();
        closeEntryModal();
      });
    });
    [document.getElementById("tripModalBackdrop"), document.getElementById("entryModalBackdrop")].forEach(function (backdrop) {
      backdrop.addEventListener("click", function (ev) {
        if (ev.target === backdrop) {
          closeTripModal();
          closeEntryModal();
        }
      });
    });

    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxBackdrop").addEventListener("click", function (ev) {
      if (ev.target === ev.currentTarget) closeLightbox();
    });

    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        closeTripModal();
        closeEntryModal();
        closeLightbox();
      }
    });

    document.getElementById("tripSearch").addEventListener("input", function (ev) {
      state.searchQuery = ev.target.value;
      renderSidebar();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
