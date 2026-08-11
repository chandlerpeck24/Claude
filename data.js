/* Seed data for Waypoints — a starter set of trips/entries shown the first
   time the app runs (no localStorage yet). Photos are generated inline as
   SVG data URIs so the app has zero external dependencies. */

function svgPhoto(bg, fg, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">
    <rect width="480" height="320" fill="${bg}"/>
    <text x="240" y="168" font-family="Georgia, serif" font-size="30" fill="${fg}"
      text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

const SEED_TRIPS = [
  {
    id: "trip-portugal",
    title: "Two Weeks in Portugal",
    destination: "Lisbon & the Algarve",
    startDate: "2025-09-01",
    endDate: "2025-09-15",
    coverPhoto: svgPhoto("#c1552c", "#fffdf8", "Lisbon & the Algarve"),
    notes: "Rented a car in Lisbon for the second week to drive down the coast. Should have booked the Belém bakery reservation earlier next time — line out the door every morning.",
    entries: [
      {
        id: "e-portugal-1",
        type: "journal",
        title: "Getting lost in Alfama",
        date: "2025-09-02",
        location: "Alfama, Lisbon",
        body: "The map said the miradouro was six minutes away. It took forty.\n\nAlfama doesn't believe in straight lines. Every alley narrows, doubles back, or dead-ends into someone's laundry line, and by the third wrong turn I'd given up on the map entirely and just followed the sound of a guitar drifting down from somewhere above. It led to a tiny terrace bar with three plastic tables and a view clear across the rooftops to the Tagus, all of it going gold as the sun dropped.\n\nAn old man at the next table told me, in the patient English of someone who has explained this many times, that getting lost here isn't a failure of navigation. It's the whole point of the neighborhood. I believed him completely by the second glass of vinho verde.",
        photos: [svgPhoto("#e3a97e", "#22201b", "Alfama rooftops"), svgPhoto("#f0c68f", "#22201b", "Miradouro view")]
      },
      {
        id: "e-portugal-2",
        type: "note",
        title: "Tram 28 logistics",
        date: "2025-09-03",
        location: "Lisbon",
        body: "Buy the Viva Viagem card at any metro station — cheaper per ride than paying cash on the tram, and works on the metro/buses too. Ride Tram 28 before 8am or after 7pm; midday it's a 40-minute wait and a sardine can once you're on.",
        photos: []
      },
      {
        id: "e-portugal-3",
        type: "insight",
        title: "Slow down the itinerary",
        date: "2025-09-08",
        location: "Lagos, Algarve",
        body: "Packed the first week too tight and burned out by day five. The trips that stick with me are the ones with fewer pins on the map and more empty afternoons — the Algarve leg, where we picked one beach a day and just stayed, ended up the best part of the whole trip. Next time: half as many bookings.",
        photos: [svgPhoto("#4a7a8f", "#fffdf8", "Praia Dona Ana")]
      },
      {
        id: "e-portugal-4",
        type: "journal",
        title: "The last night in Lagos",
        date: "2025-09-14",
        location: "Lagos, Algarve",
        body: "We ate dinner at the same little grill place three nights running, mostly because the owner started remembering our order and it felt rude to go anywhere else. Grilled sardines, a jug of house wine, bread that showed up before we asked.\n\nAfterward we walked down to the marina and sat on the seawall until it got properly dark, watching the fishing boats come in one by one. Nobody said much. Two weeks in, that quiet felt earned rather than awkward — the kind you only get to the end of a trip.\n\nFlight home tomorrow at eleven. Already plotting an excuse to come back for the São Martinho do Porto stretch of coast we never made it to.",
        photos: [svgPhoto("#1f3547", "#f2ede2", "Lagos marina at dusk")]
      }
    ]
  },
  {
    id: "trip-pnw",
    title: "Pacific Northwest Road Trip",
    destination: "Seattle to Olympic National Park",
    startDate: "2026-08-05",
    endDate: "2026-08-20",
    coverPhoto: svgPhoto("#3f6b52", "#fffdf8", "Olympic National Park"),
    notes: "Loop: Seattle -> Port Angeles -> Hoh Rainforest -> Kalaloch -> back via Olympia. Campsites booked for the coast nights; motels in between as backup for bad weather.",
    entries: [
      {
        id: "e-pnw-1",
        type: "journal",
        title: "Rain in the Hoh Rainforest",
        date: "2026-08-09",
        location: "Hoh Rainforest, WA",
        body: "It rained the whole hike and somehow that made it better. The moss here doesn't just grow on the trees, it grows off them, in curtains, dripping onto the trail so the whole forest sounds like a held breath being slowly let out.\n\nWe didn't see another person for almost two hours on the Hall of Mosses loop. Just the light coming down green through everything, and the occasional creak of a branch settling somewhere overhead. Wet boots for the rest of the day, no regrets.",
        photos: [svgPhoto("#3f6b52", "#f2ede2", "Hall of Mosses"), svgPhoto("#2e4a3a", "#f2ede2", "Hoh River")]
      },
      {
        id: "e-pnw-2",
        type: "note",
        title: "Campsite for tonight",
        date: "2026-08-10",
        location: "Kalaloch, WA",
        body: "Kalaloch Campground, site 34 — close enough to the bluff to hear the surf all night. No signal here at all, downloaded the next two days' directions before we lost it back in Forks.",
        photos: []
      }
    ]
  },
  {
    id: "trip-kyoto",
    title: "Kyoto in Autumn",
    destination: "Kyoto, Japan",
    startDate: "2026-11-03",
    endDate: "2026-11-12",
    coverPhoto: svgPhoto("#a9822f", "#22201b", "Kyoto in Autumn"),
    notes: "Timed for peak koyo (autumn leaves) — historically mid-to-late November around Kyoto. Staying in Higashiyama for walkability. Need to book the Arashiyama bamboo grove for early morning before the tour buses arrive.",
    entries: [
      {
        id: "e-kyoto-1",
        type: "note",
        title: "Ryokan booked",
        date: "2026-08-01",
        location: "Higashiyama, Kyoto",
        body: "Confirmed four nights at a small ryokan near Kiyomizu-dera — kaiseki dinner included the first and last night. Bring slip-on shoes, we'll be in and out of them constantly.",
        photos: []
      },
      {
        id: "e-kyoto-2",
        type: "insight",
        title: "Learned from the Portugal trip: leave gaps",
        date: "2026-08-01",
        location: "",
        body: "Building the Kyoto itinerary with the Portugal lesson in mind — one temple or district per day, max, with the afternoons unplanned. Better to wander into a quiet backstreet shrine we didn't plan for than rush through three famous ones on a checklist.",
        photos: []
      }
    ]
  }
];
