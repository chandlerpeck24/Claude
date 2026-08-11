# Wayfarer — Travel Journal

A browser-based travel journal for keeping past and future trips, planning
notes, insights, photos, and journal entries (blog posts or short stories)
all in one place.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips, automatically grouped** into Happening Now, Upcoming, Past, and
  Bucket List, based on the start/end dates you give each trip (leave dates
  blank for a someday/bucket-list idea).
- **Journal entries per trip** in four flavors — Blog Post, Short Story,
  Note, or Insight — so a day's write-up, a bit of fiction, a packing list,
  and a lesson learned can all live side by side.
- **Journal Feed** — every entry across every trip, newest first, with the
  same search and status filtering as the Trips view.
- **Trip-level notes & insights** for planning tips, lessons learned, and
  things to remember next time, separate from the day-by-day entries.
- **Photos** — attach images to any entry; they're resized client-side and
  stored as part of the entry, then aggregated into a per-trip photo
  gallery. Click any photo for a full-size lightbox view.
- **Search and filter** across trip titles, destinations, notes, entry text,
  locations, and tags.
- Everything persists in the browser (`localStorage`), including edits to
  the built-in sample trips — there's no server or account involved.
- Seeded with 6 sample trips (past, upcoming, and one bucket-list idea) and
  14 journal entries so the app isn't empty on first load; all of it is
  freely editable or deletable.

## Files

- `index.html` — page structure and modals
- `style.css` — styling (light/dark aware)
- `data.js` — seed trips and journal entries
- `app.js` — state management, rendering, search/filter, and the trip/entry
  forms (including client-side photo resizing)

## Data model

Each **trip** has a title, destination, cover emoji, optional start/end
dates, a summary, free-form notes/insights, and tags. Its status (Happening
Now / Upcoming / Past / Bucket List) is derived from today's date rather
than stored, so it stays correct as time passes.

Each **journal entry** belongs to one trip and has a type (blog / story /
note / insight), title, date, optional location, tagged body text, and a
list of photos. Entries render in a shared blog-style card used by both the
per-trip entry list and the global Journal Feed.
