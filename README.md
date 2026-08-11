# Wayfarer — Travel Journal

A browser-based travel journal for logging both past and future trips —
notes, insights, photos, and journal entries in blog/short-story format.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips, past and future** — every trip has a destination, date range,
  summary, tags, and cover photo, and is automatically sorted into
  Upcoming or Past based on today's date.
- **Journal entries in blog/short-story format** — write freeform entries
  attached to a trip (or standalone), with a title, date, mood/icon,
  tags, and a body that renders as proper paragraphs.
- **Photos** — attach a cover photo to a trip and multiple photos to any
  entry via file upload; they're stored as part of the entry/trip and
  shown in cards, trip heroes, and the entry reader's photo grid.
- **Notes & insights** — tag entries and trips freely (e.g. `food`,
  `hiking`, `planning`) and filter the whole journal by tag or free-text
  search across trips and entries.
- **Journal feed** — a blog-style feed of every entry across all trips,
  most recent first, independent of the trip view.
- **Trip detail pages** — a hero view per trip with its own timeline of
  entries, so a single trip reads like a mini travelogue.
- Everything persists in the browser (`localStorage`), so trips and
  entries are still there next time you load the page. Ships with a set
  of sample past and upcoming trips to show the app in action.

## Files

- `index.html` — page structure, views, and modals
- `style.css` — styling (light/dark aware)
- `data.js` — seed trips and journal entries (used only to initialize
  storage the first time the app runs)
- `app.js` — state management, rendering, search/filtering, and the
  trip/entry forms (including photo uploads)

## Data model

Each **trip** has a name, destination/country, start/end dates, a theme
(used for its placeholder cover art when no photo is set), a summary,
and tags. Its status (Upcoming / Ongoing / Past) is computed from its
dates against today.

Each **entry** has a title, date, optional mood/icon, tags, one or more
photos, and a body. An entry can belong to a trip or stand alone as a
general note. Paragraphs are separated by a blank line in the editor and
rendered as separate `<p>` elements in the reader view.
