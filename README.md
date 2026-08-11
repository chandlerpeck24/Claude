# Waypoint

A browser-based travel journal — a single place for trips you're planning,
trips you've taken, and the notes, insights, photos, and blog-style stories
that go with them.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips, past and future** — every trip gets a status computed from its
  dates: **Ongoing**, **Upcoming**, **Past**, or **Bucket List** (no dates
  yet, for the "someday" ideas).
- **Journal entries in blog/short-story format** — write entries with a
  title, date, location, and free-form body text; paragraphs render with a
  serif, story-like layout.
- **Key insights** — a short bullet list on any entry for the practical
  takeaways ("go before 7am to beat the crowds"), separate from the
  narrative.
- **Notes & Insights** — entries that aren't tied to a specific trip (gear
  tips, packing philosophy, general travel wisdom) live in their own view.
- **Photos** — attach photos to any entry or as a trip's cover image;
  they're automatically downscaled and compressed in the browser before
  being stored, and a dedicated "All Photos" view collects every photo
  across every trip. Click any photo for a full-size lightbox view.
- **Search** — a single search box filters across trip titles,
  destinations, countries, tags, and entry text.
- Everything persists in the browser (`localStorage`), so it's still there
  next time you load the page.
- Responsive layout with a collapsible sidebar on mobile, and a light/dark
  theme that follows your system setting.

## Files

- `index.html` — page structure and modals
- `style.css` — styling (light/dark aware, responsive)
- `data.js` — sample seed data (trips, entries, a country list) loaded on
  first run only
- `app.js` — state, rendering, image resizing, and all form/CRUD logic

## Data model

Two flat lists live in `localStorage`, keyed by `waypoint.v1`:

- **Trips** — title, destination, country, optional start/end dates,
  summary, tags, and an optional cover photo. Status (ongoing / upcoming /
  past / bucket list) is derived from the dates rather than stored.
- **Entries** — title, date, optional trip reference (blank = a general
  note, not tied to any trip), location, a free-form body for the
  journal/story text, a line-separated list of key insights, and any
  number of photos.

Photos are stored as compressed JPEG data URLs, resized client-side (max
~1600px) via a canvas before being saved, to keep `localStorage` usage
reasonable.
