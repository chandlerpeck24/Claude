# Waypoints

A browser-based travel journal. Organize trips — past, ongoing, or still
just an idea — and log entries against each one: blog-style journal
stories, quick notes, and insights, all with photos attached.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser `file://` restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips** with a title, destination, date range, cover photo, and
  free-form notes (itinerary ideas, logistics, anything worth
  remembering). Automatically grouped in the sidebar as Ongoing,
  Upcoming, or Past based on today's date.
- **Three entry types** per trip — **Journal** (blog/short-story format
  for writing up what happened), **Note** (quick logistics or reminders),
  and **Insight** (a lesson or reflection) — each with its own badge and
  filter.
- **Photos** on both trips (cover photo) and individual entries (multiple
  photos per entry), uploaded from your device and stored inline. Click
  any photo to view it full-size.
- **Search** across every trip and entry by title, body, location, or
  destination, right from the sidebar.
- **Everything persists in the browser** (`localStorage`) — trips and
  entries are still there next time you load the page. Seeded with a
  few sample trips the first time you open it.

## Files

- `index.html` — page structure and modals (new/edit trip, new/edit
  entry, photo lightbox)
- `style.css` — styling (light/dark aware)
- `data.js` — starter/seed trips and entries shown before you've added
  your own
- `app.js` — state management, rendering, search, and the trip/entry
  CRUD forms (including photo-to-`localStorage` handling)

## Data model

Each trip owns its list of entries. A trip's status (ongoing / upcoming
/ past) is derived from comparing today's date against its start and end
dates, rather than stored — so trips automatically move between sidebar
groups as time passes. Entries are sorted newest-first within a trip and
can be filtered by type.
