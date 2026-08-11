# Wayfarer — Travel Journal

A browser-based travel journal for trips you're planning and trips you've
already taken. Log blog-style journal entries, quick notes, and insights —
each with photos, tags, and a location — and organize them under trips with
their own dates, destination, and cover photo.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Trips** with a destination, date range, summary, and cover photo.
  Automatically sorted into "Upcoming & Planning" and "Past Trips," with a
  countdown ("in 86 days") or a relative timestamp ("3 months ago").
- **Journal entries** in three flavors — 📔 Journal (blog/short-story
  format), 🗒️ Note (practical info, planning, tips), and 💡 Insight
  (lessons learned) — each with a title, date, optional location, tags,
  photos, and free-form body text rendered as proper paragraphs.
- **Entries can stand alone** (not tied to any trip) for general travel
  wisdom, or be attached to a specific trip's timeline.
- **Photos** — upload any number of images per entry (and one cover photo
  per trip); they're resized and compressed client-side before being
  stored, and click any photo to view it full-size.
- **Journal Feed** — browse every entry across every trip in one place,
  filterable by type and by trip, with full-text search across titles,
  body text, locations, and tags.
- **Trip detail view** — a per-trip timeline of its entries with the same
  type filters and search.
- Everything persists in the browser (`localStorage`) — trips and entries
  are still there next time you load the page. Ships with a few sample
  trips/entries to show the format; edit or delete them freely.

## Files

- `index.html` — page structure and modals
- `style.css` — styling (light/dark aware)
- `data.js` — seed data used only the first time the app runs
- `app.js` — state management, rendering, filtering/search, photo
  resizing, and the trip/entry CRUD forms

## How data is stored

Trips and entries live in a single `localStorage` key as JSON. Trip status
(upcoming/ongoing/past) is computed from today's date vs. the trip's start
and end dates, not stored — so trips automatically move between sections as
their dates arrive and pass. Uploaded photos are downscaled to at most
1600px on the long edge and re-encoded as JPEG before being stored as data
URLs, to keep well within `localStorage`'s size limits.
