# Travel Journal

A browser-based journal for travel — plan trips before you go, and write
them up (blog/short-story entries, quick notes, and photos) once you're
back. Everything lives in one place: past trips, future trips, ideas you
haven't booked yet, and the journal entries tied to any of them.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips** — track destinations from idea/someday through planning,
  upcoming, ongoing, and past. Status badges update automatically once you
  add start/end dates.
- **Journal entries in two formats** — write a full **story** (blog /
  short-story style, with an automatic reading-time estimate and
  "read more" collapsing in the feed) or jot a quick **note** (an insight,
  tip, or reminder). Entries can belong to a trip or stand alone.
- **Timeline** — every entry across every trip, newest or oldest first,
  filterable by format, plus a strip of upcoming trips with day countdowns.
- **Photos** — attach photos to entries and trip covers; a dedicated
  Photos tab galleries everything (filterable by trip) with a lightbox
  viewer. Photos are resized/compressed client-side before storage.
- **Search & filters** — search across trip names, destinations, entry
  text, and tags; filter trips by status and entries by format.
- **Backup** — export your whole journal to a JSON file and import it back
  later (or on another device), since everything is otherwise only stored
  in this browser's `localStorage`.

## Files

- `index.html` — page structure, views, and modals
- `style.css` — styling (light/dark aware)
- `app.js` — data model, storage, rendering, and all interactions

## Data model

Two record types are stored in `localStorage`:

- **Trip** — name, destination, optional start/end dates, status, emoji,
  optional cover photo, summary, tags.
- **Entry** — title, date, format (`story` or `note`), body text
  (paragraphs separated by blank lines), optional trip association,
  photos, tags.

A trip's displayed status is derived from its dates when present (today
falls before/within/after the range → upcoming/ongoing/past); otherwise it
falls back to the manually chosen idea/planning status.
