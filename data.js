/* =========================================================================
   Wayfarer — Travel Journal — Seed Data
   Starter trips and entries so the app isn't empty on first load. Everything
   here is just example content; the app treats it exactly like user data
   once it's copied into localStorage (editable, deletable, etc).
   ========================================================================= */

const SEED_TRIPS = [
  {
    id: "t1",
    name: "Backpacking Through Portugal",
    destination: "Lisbon & Porto, Portugal",
    startDate: "2024-04-10",
    endDate: "2024-04-22",
    cover: null,
    emoji: "🇵🇹",
    summary: "Twelve days on trains and trams between two hill cities, chasing pastel de nata and the smell of the Atlantic."
  },
  {
    id: "t2",
    name: "Kyoto in Autumn",
    destination: "Kyoto, Japan",
    startDate: "2023-11-02",
    endDate: "2023-11-12",
    cover: null,
    emoji: "🍁",
    summary: "Timed for peak momiji season — temple gardens, backstreet ramen counters, and far too many photos of maple leaves."
  },
  {
    id: "t3",
    name: "Iceland Ring Road",
    destination: "Iceland",
    startDate: "2022-06-15",
    endDate: "2022-06-25",
    cover: null,
    emoji: "🌋",
    summary: "A ten-day loop of Route 1 in a rented hatchback — waterfalls, midnight sun, and one very memorable tire incident."
  },
  {
    id: "t4",
    name: "Croatia Coastal Sail",
    destination: "Dalmatian Coast, Croatia",
    startDate: "2026-08-05",
    endDate: "2026-08-20",
    cover: null,
    emoji: "⛵",
    summary: "Island-hopping the Dalmatian coast by sailboat, from Split down through the Kornati islands to Dubrovnik."
  },
  {
    id: "t5",
    name: "New Zealand South Island",
    destination: "South Island, New Zealand",
    startDate: "2027-01-10",
    endDate: "2027-01-28",
    cover: null,
    emoji: "🥝",
    summary: "A camper-van loop of the South Island in peak summer — fjords, glaciers, and as many trailheads as we can fit."
  },
  {
    id: "t6",
    name: "Patagonia Trek",
    destination: "Patagonia, Chile & Argentina",
    startDate: "2027-11-01",
    endDate: "2027-11-16",
    cover: null,
    emoji: "🏔️",
    summary: "Still mostly an idea — the W trek in Torres del Paine, then across the border to El Chaltén for Fitz Roy."
  }
];

const SEED_ENTRIES = [
  // ---- Portugal (past) ----
  {
    id: "e1", tripId: "t1", type: "journal",
    title: "Landing in Lisbon, Getting Lost on Purpose",
    date: "2024-04-11", location: "Alfama, Lisbon",
    body: "The Alfama district doesn't believe in straight lines. We dropped our bags at the guesthouse and just started walking uphill, which in Lisbon is a philosophy as much as a direction. Every third turn opened onto a miradouro with the whole city tumbling down to the Tagus in terracotta rooftops.\n\nDinner was a hole-in-the-wall tasca with four tables and no menu — the owner just brought grilled sardines, bread, and a carafe of vinho verde and told us that was dinner. It was exactly right. A trio played fado two doors down and we stood in the alley and listened until it got cold.",
    photos: [], tags: ["food", "walking", "first-night", "favorite"], checklist: []
  },
  {
    id: "e2", tripId: "t1", type: "journal",
    title: "The Tram 28 Gauntlet",
    date: "2024-04-13", location: "Graça, Lisbon",
    body: "Everyone warns you about Tram 28 and everyone is right to. We queued forty minutes at Martim Moniz, got wedged between a tour group and someone's very patient dog, and rattled through streets so narrow the tram's wing mirrors nearly clip the doorframes. Worth it anyway.\n\nInsight worth remembering: ride it at 8am instead of midday and you'll get a seat and the same views. We didn't figure that out until day four.",
    photos: [], tags: ["transit", "tip", "mistake-to-avoid"], checklist: []
  },
  {
    id: "e3", tripId: "t1", type: "journal",
    title: "Porto, Rain, and Too Much Port",
    date: "2024-04-19", location: "Vila Nova de Gaia, Porto",
    body: "Porto greeted us with sideways rain, which turned out to be the best possible excuse to spend an entire afternoon in a cellar on the Gaia side of the river doing tastings. We picked a small family-run lodge over the big-name ones and got a much better story out of it — the guide's grandfather had literally rowed port barrels down the Douro on the old rabelo boats.\n\nBy the third glass of tawny the rain had stopped and the whole riverside had gone gold with evening light. Crossed back over the Dom Luís bridge on the upper deck, which is not for anyone afraid of heights.",
    photos: [], tags: ["wine", "rain", "favorite", "views"], checklist: []
  },

  // ---- Kyoto (past) ----
  {
    id: "e4", tripId: "t2", type: "journal",
    title: "Arashiyama Before the Crowds",
    date: "2023-11-03", location: "Arashiyama, Kyoto",
    body: "Set an alarm for 5:45am to beat the tour buses to the bamboo grove and it worked completely — for about twenty minutes we had the whole path to ourselves, just the creak of bamboo overhead and gravel underfoot. By 7am it was a river of umbrellas and selfie sticks, so the early start earned its keep.\n\nInsight: this trip taught us that in Kyoto, the golden hour before opening times is worth more than any ticket. Applied the same trick at Fushimi Inari two days later with the same result.",
    photos: [], tags: ["sunrise", "tip", "favorite"], checklist: []
  },
  {
    id: "e5", tripId: "t2", type: "journal",
    title: "Ten Thousand Gates, More or Less",
    date: "2023-11-05", location: "Fushimi Inari Taisha, Kyoto",
    body: "The postcard shot is at the bottom of the mountain, but almost nobody keeps climbing. We did, and past the first thirty minutes the vermillion tunnels thin out to a scattering of gates, mossy stone foxes, and small tea stalls run by the same families for generations. The view over Kyoto from the top clearing was worth every one of the 233 meters of elevation.\n\nStopped at a stall halfway up for kitsune udon — named, appropriately, for the fox spirit the shrine honors — and it remains the best bowl of noodles either of us has had anywhere.",
    photos: [], tags: ["hiking", "food", "favorite"], checklist: []
  },
  {
    id: "e6", tripId: "t2", type: "journal",
    title: "A Quiet Afternoon in Philosopher's Path",
    date: "2023-11-09", location: "Philosopher's Path, Kyoto",
    body: "Some days the plan is just to walk slowly. We followed the canal path from Ginkaku-ji down toward Nanzen-ji with no schedule, ducking into whichever side-temple looked interesting. The maples were at their absolute peak — that two-week window everyone plans a year in advance for — and the canal was carrying as many fallen leaves as water.\n\nEnded up at a tiny café along the path that only serves one thing: matcha and a single seasonal wagashi sweet. Sat by the window for an hour watching the leaves come down. No insight here, just a good afternoon.",
    photos: [], tags: ["walking", "food", "relaxed"], checklist: []
  },

  // ---- Iceland (past) ----
  {
    id: "e7", tripId: "t3", type: "journal",
    title: "Midnight Sun on the South Coast",
    date: "2022-06-16", location: "Vík í Mýrdal, Iceland",
    body: "It never really got dark, which messed with our sense of time in a way no amount of reading about the midnight sun had prepared us for. We stood on the black sand at Reynisfjara at what should have been 11pm and it was full daylight, waves crashing against the basalt columns like it was mid-afternoon.\n\nWe learned the hard way to bring a sleep mask — the guesthouse curtains did nothing against a sky that stayed bright until 2am.",
    photos: [], tags: ["sunset", "mistake-to-avoid", "favorite"], checklist: []
  },
  {
    id: "e8", tripId: "t3", type: "journal",
    title: "The Tire, the Gravel Road, and a Very Kind Farmer",
    date: "2022-06-20", location: "Kirkjubæjarklaustur, Iceland",
    body: "Rule one of Route F-roads: check that your rental actually allows you on them. We took a 'shortcut' on a gravel spur toward a waterfall that wasn't on the main map and blew a tire about six kilometers in, no cell signal, nothing but moss-covered lava fields in every direction.\n\nA farmer doing fence repairs a kilometer up the road saw us struggling with the jack and drove down on his ATV to help — had the spare on in ten minutes and refused any payment, just pointed us toward a better waterfall than the one we were originally chasing. Insight: always, always check the rental agreement's road restrictions, and never underestimate Icelandic hospitality.",
    photos: [], tags: ["mishap", "mistake-to-avoid", "kindness", "favorite"], checklist: []
  },

  // ---- Croatia (ongoing) ----
  {
    id: "e9", tripId: "t4", type: "journal",
    title: "First Days Out of Split",
    date: "2026-08-06", location: "Split, Croatia",
    body: "Provisioned the boat at the marina in Split — bread, cheese, way too many tomatoes, and enough water for a week even though we're never more than a day from a harbor. First overnight anchorage was a quiet cove off Šolta, water so clear you could read a book through six meters of it.\n\nSkipper's rule for the trip: no engine before 10am unless we have to. So far we've kept to it.",
    photos: [], tags: ["sailing", "first-days"], checklist: []
  },
  {
    id: "e10", tripId: "t4", type: "journal",
    title: "Kornati Islands, Day by Day",
    date: "2026-08-10", location: "Kornati National Park, Croatia",
    body: "Five days into the Kornati chain now and it's exactly the barren, stony maze of islands the guidebooks promised — over 150 of them, most uninhabited, water in every shade of blue there is a name for. Anchored last night at a tiny konoba that only exists because the family who runs it also has the only fresh water cistern on the island; they grilled the fish we'd caught that afternoon.\n\nInsight so far: book the Kornati park entry permit online before you leave the marina — the harbor office signal is unreliable and we nearly sailed in without one.",
    photos: [], tags: ["sailing", "food", "tip", "favorite"], checklist: []
  },

  // ---- Croatia (upcoming leg — still a plan) ----
  {
    id: "e11", tripId: "t4", type: "plan",
    title: "Final Week: Dubrovnik & Handoff",
    date: "2026-08-16", location: "Dubrovnik, Croatia",
    body: "Notes for the last stretch before we hand the boat back — want to leave two full days in Dubrovnik itself rather than just passing through, and everyone says to see the Old Town walls at opening time before the cruise-ship crowds arrive.",
    photos: [], tags: ["planning"],
    checklist: [
      { text: "Confirm marina handoff time in Dubrovnik ACI marina", done: true },
      { text: "Book city wall walk for 8am", done: false },
      { text: "Dinner reservation somewhere with a sunset view over the Adriatic", done: false },
      { text: "Ferry or flight back to Split for the return flight?", done: false }
    ]
  },

  // ---- New Zealand (upcoming) ----
  {
    id: "e12", tripId: "t5", type: "plan",
    title: "Route Draft: Christchurch to Queenstown",
    date: "2027-01-10", location: "South Island, New Zealand",
    body: "Rough loop idea: fly into Christchurch, camper van down the east coast to Dunedin, cut across to Te Anau and Milford Sound, up through Queenstown and Wanaka, then over Arthur's Pass back to Christchurch. About 18 days total including buffer for weather days at Milford — everyone says it's the one place worth waiting out a bad forecast for.",
    photos: [], tags: ["planning", "route"],
    checklist: [
      { text: "Book camper van rental (need 4WD for gravel roads)", done: true },
      { text: "Reserve Milford Sound overnight cruise", done: false },
      { text: "Check Great Walks hut bookings open date for Routeburn Track", done: false },
      { text: "Look into freedom camping rules — many spots need self-contained vehicles", done: false }
    ]
  },
  {
    id: "e13", tripId: "t5", type: "plan",
    title: "Packing & Gear Notes",
    date: "2027-01-05", location: "South Island, New Zealand",
    body: "Summer in NZ but Milford Sound gets 6+ meters of rain a year, so packing for four seasons in one bag. Bringing proper rain shells over ponchos this time after the Iceland lesson.",
    photos: [], tags: ["packing", "gear"],
    checklist: [
      { text: "Waterproof hiking boots, broken in beforehand", done: false },
      { text: "Sandflies are apparently brutal at Milford — bring repellent", done: false },
      { text: "Download offline maps — cell coverage is patchy south of Te Anau", done: false },
      { text: "Merino base layers for glacier-adjacent mornings", done: true }
    ]
  },

  // ---- Patagonia (upcoming, idea stage) ----
  {
    id: "e14", tripId: "t6", type: "plan",
    title: "The W Trek — Still Deciding on Refugios vs Camping",
    date: "2027-11-01", location: "Torres del Paine, Chile",
    body: "Trying to decide between booking refugio beds the whole way (easier, but books out almost a year ahead) or carrying full camping gear and staying at the campsites instead. Leaning toward a mix — refugios for the first and last nights, camping in the middle where it's cheaper and quieter.",
    photos: [], tags: ["idea", "planning"],
    checklist: [
      { text: "Check refugio availability calendar — opens roughly 12 months out", done: false },
      { text: "Decide: full pack vs guided/supported trek", done: false },
      { text: "Research permit requirements for Torres del Paine NP", done: false }
    ]
  },
  {
    id: "e15", tripId: "t6", type: "plan",
    title: "Crossing to El Chaltén — Border Logistics",
    date: "2027-11-10", location: "El Chaltén, Argentina",
    body: "The border crossing from Chilean Patagonia into Argentina near El Calafate looks straightforward by bus but schedules are apparently sparse this far south. Idea is to overnight in Puerto Natales, cross the next morning, and give ourselves a full buffer day in case of delays before the Fitz Roy hike.",
    photos: [], tags: ["idea", "logistics"],
    checklist: [
      { text: "Research bus companies crossing Chile–Argentina border near Natales", done: false },
      { text: "Check if a visa or reciprocity fee is needed", done: false }
    ]
  }
];
