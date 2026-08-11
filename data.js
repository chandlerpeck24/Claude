/* =========================================================================
   Wayfarer — Seed Data
   A starter set of trips and journal entries so the app isn't empty on
   first load. Everything here is fully editable/deletable — it's just a
   demonstration of the shapes the app expects:

   Trip:  { id, title, destination, emoji, startDate, endDate, summary,
            notes, tags }
     - startDate/endDate use "YYYY-MM-DD"; a trip with no startDate is
       treated as a bucket-list "idea" rather than past/upcoming.

   Entry: { id, tripId, type, title, date, location, tags, body, photos }
     - type is one of "blog" | "story" | "note" | "insight"
     - body holds one or more paragraphs, separated by a blank line
     - photos is a list of { dataUrl, caption } — empty until the user
       attaches their own images (kept out of seed data to keep this file
       small).
   ========================================================================= */

const SEED_TRIPS = [
  {
    id: "t1",
    title: "Kyoto & Osaka",
    destination: "Japan",
    emoji: "🏯",
    startDate: "2025-03-10",
    endDate: "2025-03-20",
    summary: "Ten days chasing cherry blossoms between temples, train platforms, and convenience-store onigiri.",
    notes: "Got the JR Pass wrong — the regional Kansai pass would've been cheaper for this itinerary since we never left the Kansai area. IC card (ICOCA) was worth buying on day one; saved a lot of fumbling at ticket machines. Cherry blossoms peaked almost exactly on the forecast date this year, so it's worth checking the Japan Meteorological Corporation's blossom forecast before locking dates.",
    tags: ["asia", "spring", "food", "cities"]
  },
  {
    id: "t2",
    title: "Lisbon & Porto",
    destination: "Portugal",
    emoji: "🚋",
    startDate: "2025-11-02",
    endDate: "2025-11-11",
    summary: "A slower trip — tiled stairwells, a lot of bacalhau, and a long weekend up the Douro.",
    notes: "November was quiet and cheap — half the crowds of summer and mild enough to still eat outside. The Lisboa Card paid for itself in two tram rides plus the Belém entries. Should've booked the Livraria Lello ticket online in advance; the walk-up line was brutal.",
    tags: ["europe", "food", "wine", "cities"]
  },
  {
    id: "t3",
    title: "Sacred Valley & Machu Picchu",
    destination: "Peru",
    emoji: "⛰️",
    startDate: "2024-06-05",
    endDate: "2024-06-15",
    summary: "Acclimatizing in Cusco, getting lost in the Sacred Valley, and finally reaching the citadel at sunrise.",
    notes: "Spending three nights in Cusco before going any higher made a real difference — no altitude sickness after day two. Buy Machu Picchu entry tickets and the train at least two months out for June (dry season, peak crowds). Soroche pills from the pharmacy in Cusco were more effective than the coca tea.",
    tags: ["south-america", "hiking", "mountains", "history"]
  },
  {
    id: "t4",
    title: "Iceland Ring Road",
    destination: "Iceland",
    emoji: "🌋",
    startDate: "2026-09-14",
    endDate: "2026-09-24",
    summary: "Ten days circling the island by car — glaciers, waterfalls, and hopefully a clear night for the aurora.",
    notes: "",
    tags: ["europe", "road-trip", "nature", "planning"]
  },
  {
    id: "t5",
    title: "Patagonia — The W Trek",
    destination: "Chile & Argentina",
    emoji: "🏔️",
    startDate: "2027-01-05",
    endDate: "2027-01-20",
    summary: "Southern-hemisphere summer, four days on the W circuit in Torres del Paine, then across the border to El Chaltén.",
    notes: "",
    tags: ["south-america", "hiking", "mountains", "planning"]
  },
  {
    id: "t6",
    title: "New Zealand — South Island",
    destination: "New Zealand",
    emoji: "🥝",
    startDate: null,
    endDate: null,
    summary: "No dates yet — just the trip that keeps getting bumped up the list every time someone mentions Milford Sound.",
    notes: "",
    tags: ["oceania", "hiking", "bucket-list"]
  }
];

const SEED_ENTRIES = [
  {
    id: "e1", tripId: "t1", type: "blog",
    title: "Landing in the Rain",
    date: "2025-03-11", location: "Kyoto",
    tags: ["arrival", "kyoto", "food"],
    body: "We landed in Osaka to a grey, steady rain and a train system that made immediate and total sense, which felt like a trick after twenty hours of travel. By the time we reached Kyoto Station it was dark, and the rain had turned the platform lights into long orange smears on the wet concrete.\n\nDinner was standing-room ramen in a six-seat counter shop two blocks from the hotel, the kind of place you'd walk past without a second glance if the line hadn't been out the door. Nobody spoke much English, we spoke no Japanese beyond arigatou, and it did not matter at all — point at the vending machine, take the ticket, hand it over, sit down. Best bowl of the entire trip, and we didn't know it yet.\n\nFell asleep before nine, jet-lagged and completely happy.",
    photos: []
  },
  {
    id: "e2", tripId: "t1", type: "story",
    title: "The Vending Machine at 2 AM",
    date: "2025-03-14", location: "Gion, Kyoto",
    tags: ["night", "story"],
    body: "The machine hummed on the corner like it was the only thing awake in Gion. Every shop was shuttered, every lantern dark except the one over a doorway three buildings down where someone was quietly hosing down a step.\n\nI'd come out for water and stayed for the light. It threw a soft blue-white square onto the lane, onto the wet stone, onto a cat that had claimed the warm vent at the base of the machine and had no intention of moving for a stranger in pajama pants. We looked at each other for a while. The cat won.\n\nI bought a can of something with a peach on the label I never did identify, and walked back slower than I needed to, just to keep being the only person in the frame.",
    photos: []
  },
  {
    id: "e3", tripId: "t1", type: "insight",
    title: "What I'd Pack Differently Next Time",
    date: "2025-03-20", location: "Kyoto",
    tags: ["packing", "lessons"],
    body: "One pair of shoes that slip on and off easily was worth more than any other packing decision — temples and traditional restaurants expect shoes off constantly, and laces get old fast.\n\nA portable battery mattered less than a physical coin purse. IC card top-ups, temple entry fees, and vending machines all lean on coins, and Japan still produces a lot of them.\n\nNext time: pack one fewer outfit and leave room for a second suitcase's worth of restraint at the depachika food halls, because we did not, and paying the overweight bag fee on the way home to bring back rice crackers was a choice.",
    photos: []
  },
  {
    id: "e4", tripId: "t2", type: "blog",
    title: "Tiles and Tram 28",
    date: "2025-11-03", location: "Lisbon",
    tags: ["tram", "lisbon"],
    body: "Every building in Alfama seems to be wearing a different pattern of tile, like the whole neighborhood got dressed without checking in with itself first, and somehow it works. We rode Tram 28 twice — once packed shoulder to shoulder with tourists, once nearly empty at 8am with a driver who took the tightest corner I have ever felt in a vehicle without a single change of expression.\n\nLunch was a hole-in-the-wall near Graça with three tables and a menu that was really just whatever the owner's mother had cooked that morning. Bacalhau à Brás, a glass of vinho verde, and a view down toward the river between two buildings that couldn't have been more than a meter apart.",
    photos: []
  },
  {
    id: "e5", tripId: "t2", type: "note",
    title: "Porto Wine Cellar Notes",
    date: "2025-11-07", location: "Porto",
    tags: ["port wine", "notes"],
    body: "Croft and Graham's both do solid tastings on the Vila Nova de Gaia side, but Graham's terrace view over the river is worth the slightly higher price on its own.\n\nTawny ports (10-year and up) traveled better in the suitcase than the vintage bottle we were tempted by — screw caps vs. wax-sealed corks made customs and packing much less stressful.\n\nBooked the Graham's tasting online the night before and got a same-day slot; walk-ins at Calém were turned away twice while we watched.",
    photos: []
  },
  {
    id: "e6", tripId: "t2", type: "story",
    title: "The Fisherman Who Wouldn't Take My Money",
    date: "2025-11-09", location: "Porto",
    tags: ["story"],
    body: "He was mending a net on the steps down to the Douro, and I'd stopped just to watch the motion of it — the same fold and pull, over and over, faster than seemed possible for hands that looked seventy years old.\n\nI asked, badly, in the four words of Portuguese I had, if I could take a photo. He waved me down to sit instead, and for ten minutes tried to teach me the knot, laughing every time I made a mess of it, refusing the few coins I tried to leave when I finally stood to go.\n\nI never got the photo. I got a much better story, and a knot I still can't quite replicate.",
    photos: []
  },
  {
    id: "e7", tripId: "t3", type: "blog",
    title: "Altitude and Altitude Sickness",
    date: "2024-06-07", location: "Cusco",
    tags: ["altitude", "cusco"],
    body: "Cusco sits at 3,400 meters and it announces itself immediately — three flights of stairs to our room left me winded in a way that had nothing to do with fitness. The plan to spend two full days here before going anywhere higher felt excessive on paper and turned out to be exactly right.\n\nWe filled the acclimatization days slowly: the San Pedro market for fruit we couldn't name, a very long lunch, and a lot of coca tea that a woman running our guesthouse insisted on every few hours whether we asked for it or not.\n\nBy day three, the stairs didn't register anymore.",
    photos: []
  },
  {
    id: "e8", tripId: "t3", type: "story",
    title: "Sunrise at the Sun Gate",
    date: "2024-06-12", location: "Machu Picchu",
    tags: ["sunrise", "story"],
    body: "We left the checkpoint in the dark, headlamps bobbing up a trail that was mostly guesswork underfoot, and reached Inti Punku with maybe a hundred other people who'd had the same idea and none of the view yet — just fog, thick and grey and giving away nothing.\n\nThen it thinned in patches, the way fog does when it's about to lose, and the citadel came up out of it in pieces: a wall, a terrace, the shape of the mountain behind it, before the whole thing arrived at once and the fog just gave up.\n\nNobody on that ridge said anything for a solid minute. Then everyone started talking at once.",
    photos: []
  },
  {
    id: "e9", tripId: "t3", type: "insight",
    title: "Booking Machu Picchu — What I Got Wrong",
    date: "2024-06-15", location: "Cusco",
    tags: ["planning", "tickets"],
    body: "I booked the citadel entry ticket without realizing the Huayna Picchu add-on sells out separately and months earlier — by the time I noticed, it was gone for our dates. Book both at the same time, as early as the system allows.\n\nThe train from Ollantaytambo is cheaper and just as scenic as the one from Poroy, and it cuts an hour off the return trip. Use it if your itinerary allows starting from the Sacred Valley rather than Cusco directly.\n\nBring cash soles for the bus up from Aguas Calientes — the ticket booth's card reader was down both days we were there, and it did not seem like a rare occurrence.",
    photos: []
  },
  {
    id: "e10", tripId: "t4", type: "note",
    title: "Route Draft: 10 Days Around the Island",
    date: "2026-08-01", location: "Reykjavik (planning)",
    tags: ["itinerary", "planning"],
    body: "Rough loop: Reykjavik → Vik (2 nights, black sand beaches, Reynisfjara) → Jökulsárlón glacier lagoon (1 night) → Höfn → Egilsstaðir → Akureyri (2 nights, whale watching) → Snæfellsnes peninsula on the way back → Reykjavik.\n\nStill deciding whether to add a detour into the Westfjords — adds two days and a lot of gravel road, but Dynjandi waterfall keeps coming up in every recommendation thread.\n\nSeptember should split the difference between summer crowds and winter road closures, with a real shot at the aurora on clear nights.",
    photos: []
  },
  {
    id: "e11", tripId: "t4", type: "insight",
    title: "Renting a Car in September — Weather Notes",
    date: "2026-08-05", location: "Iceland",
    tags: ["driving", "weather"],
    body: "Booked a small 4x4 instead of a sedan after reading enough stories about F-road closures and sudden gravel on the Ring Road itself, not just the interior routes.\n\nAdding gravel protection to the rental insurance — apparently the single most common claim, and standard coverage often excludes it entirely.\n\nPlanning to check road.is every morning before setting out; conditions on Route 1 can apparently change within hours in September as the season turns.",
    photos: []
  },
  {
    id: "e12", tripId: "t5", type: "note",
    title: "Gear List for the W Trek",
    date: "2026-07-20", location: "Torres del Paine",
    tags: ["gear", "hiking"],
    body: "Layers over one heavy jacket — Patagonia wind reports read like a different kind of weather than anything either of us has hiked in, with sun, hail, and 60mph gusts all inside one afternoon apparently normal.\n\nRefugio beds mean we can go lighter than a full camping kit: sleeping bag liner instead of a bag, no tent, no stove. Trekking poles are non-negotiable for the descent off the John Gardner-adjacent sections.\n\nStill need: a proper rain cover for the pack, since the one that came with it looks more decorative than functional.",
    photos: []
  },
  {
    id: "e13", tripId: "t5", type: "insight",
    title: "Why We Booked Refugios Instead of Camping",
    date: "2026-07-25", location: "Patagonia",
    tags: ["lodging"],
    body: "Camping is cheaper, but refugio beds and the included dinners sell out five to six months ahead for January, which is peak season in the southern summer — camping spots seem to hold out a little longer but not by much.\n\nBooking directly through the two refugio operators (rather than a single bundled agency) turned out to be more flexible for stitching together exactly the nights we wanted, though it took more emails than expected to confirm everything lined up.\n\nDecided the extra cost was worth not carrying a tent and stove across four days of trail with unpredictable wind.",
    photos: []
  },
  {
    id: "e14", tripId: "t6", type: "note",
    title: "Why This Is Next on the List",
    date: "2026-06-01", location: "—",
    tags: ["bucket-list", "hiking"],
    body: "Every person who's done the Milford Track or driven the Southern Scenic Route describes it slightly differently, which is usually a good sign that a place has more going on than one trip report can cover.\n\nNo dates yet — probably waiting for a season we can commit two to three weeks to, since everyone says a rushed version of the South Island misses the point entirely.\n\nStarting a running list below of tracks and routes people have recommended, to sort through once we're actually picking dates.",
    photos: []
  }
];
