# Wayfarer — Travel Journal

A browser-based travel journal for trips past and future: log blog/short-story
style entries with photos and tags, keep planning notes and checklists for
trips you haven't taken yet, and browse everything on one timeline.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips, past and future** — every trip gets a name, destination, date
  range, cover photo, and summary. The home page automatically groups them
  into Currently Traveling, Upcoming, and Past sections, each with a
  human-friendly countdown ("In 3 months", "Day 7 of 16", "8 months ago").
- **Two kinds of entries per trip** — **Journal entries** for blog/short-story
  style writing about what actually happened (title, date, location, prose
  body, photos, tags), and **Plans & Notes** for future trips: ideas,
  logistics, and checklists you can check off as you sort them out.
- **Photos** — attach multiple photos to any entry or a cover photo to any
  trip. Images are downscaled and compressed client-side before saving, and
  clicking any photo opens a full-screen lightbox with keyboard navigation.
- **Insights via tags** — free-form tags (e.g. `favorite`, `mistake-to-avoid`,
  `tip`, `food`) on every entry, searchable and reused via autocomplete.
- **Checklists** — plan entries can carry a checklist of prep items with
  live progress ("3 / 5 done"), toggled with a click.
- **"Latest from the Road"** — a blog-style teaser feed of your most recent
  journal entries across every trip, right on the home page.
- **Search** — one search box filters trips and entries by title, body,
  location, and tags, everywhere in the app.
- Everything persists in the browser (`localStorage`) — trips, entries,
  photos, and checklist state are all still there next time you load the
  page. Comes seeded with a few example trips so it isn't empty on first
  run; edit or delete them freely.

## Files

- `index.html` — page structure, modals, and the lightbox
- `style.css` — styling (passport/map visual identity, light/dark aware)
- `data.js` — seed trips and entries shown on first load
- `app.js` — routing, state, rendering, photo handling, and all CRUD logic

## How it's put together

Trips and entries are two flat arrays kept in `localStorage`. A trip's status
(*ongoing* / *upcoming* / *past*) is derived from today's date against its
start/end dates rather than stored, so it's always up to date. Navigation
between the home view and a trip's detail view is a tiny hash router
(`#/` and `#/trip/<id>`), so the back button and reloads both behave. Photos
are read via `FileReader`, downscaled through an offscreen `<canvas>`, and
stored as JPEG data URLs directly on the trip/entry objects — no server or
external storage involved.
