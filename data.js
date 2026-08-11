// Seed data for the Travel Journal. Loaded into localStorage on first run;
// after that, all edits live in localStorage and this file is not touched.

const SEED_TRIPS = [
  {
    id: "seed-trip-kyoto",
    name: "Kyoto in Autumn",
    destination: "Kyoto",
    country: "Japan",
    startDate: "2025-11-03",
    endDate: "2025-11-10",
    theme: "forest",
    icon: "🍁",
    summary: "A week chasing maple leaves through temple gardens, backstreet noodle shops, and the Arashiyama bamboo grove at dawn.",
    tags: ["temples", "food", "autumn", "walking"],
    coverPhoto: null,
    createdAt: "2025-09-01T10:00:00.000Z"
  },
  {
    id: "seed-trip-iceland",
    name: "Ring Road & Northern Lights",
    destination: "Reykjavík",
    country: "Iceland",
    startDate: "2025-02-10",
    endDate: "2025-02-19",
    theme: "arctic",
    icon: "🌌",
    summary: "Nine days circling the island in a rented 4x4 — glacier lagoons, black sand beaches, and three nights the aurora actually showed up.",
    tags: ["aurora", "road trip", "hot springs", "glaciers"],
    coverPhoto: null,
    createdAt: "2024-12-15T10:00:00.000Z"
  },
  {
    id: "seed-trip-lisbon",
    name: "Lisbon & the Algarve",
    destination: "Lisbon",
    country: "Portugal",
    startDate: "2024-06-14",
    endDate: "2024-06-24",
    theme: "ocean",
    icon: "🌊",
    summary: "Tiled hillsides, custard tarts, and a slow drive down the coast to cliffs and empty beaches in the Algarve.",
    tags: ["coastal", "tapas", "history", "beaches"],
    coverPhoto: null,
    createdAt: "2024-04-20T10:00:00.000Z"
  },
  {
    id: "seed-trip-copenhagen",
    name: "Long Weekend in Copenhagen",
    destination: "Copenhagen",
    country: "Denmark",
    startDate: "2026-09-18",
    endDate: "2026-09-21",
    theme: "city",
    icon: "🚲",
    summary: "A short design-and-food trip before autumn gets busy — canal tours, pastry crawls, and hopefully a bike or two.",
    tags: ["city break", "design", "food"],
    coverPhoto: null,
    createdAt: "2026-07-10T10:00:00.000Z"
  },
  {
    id: "seed-trip-patagonia",
    name: "Patagonia Trek",
    destination: "El Chaltén",
    country: "Argentina",
    startDate: "2026-11-05",
    endDate: "2026-11-18",
    theme: "mountain",
    icon: "🏔️",
    summary: "Two weeks based out of El Chaltén for the Fitz Roy and Torres del Paine treks — the trip we've been planning for two years.",
    tags: ["hiking", "mountains", "wildlife"],
    coverPhoto: null,
    createdAt: "2026-05-02T10:00:00.000Z"
  },
  {
    id: "seed-trip-morocco",
    name: "Marrakech & the Atlas Mountains",
    destination: "Marrakech",
    country: "Morocco",
    startDate: "2027-01-08",
    endDate: "2027-01-17",
    theme: "desert",
    icon: "🐪",
    summary: "Medina markets, a night in the desert under the stars, and a trek into the High Atlas — still very much in the research phase.",
    tags: ["markets", "desert", "architecture"],
    coverPhoto: null,
    createdAt: "2026-08-01T10:00:00.000Z"
  }
];

const SEED_ENTRIES = [
  // --- Kyoto ---
  {
    id: "seed-entry-kyoto-1",
    tripId: "seed-trip-kyoto",
    title: "Bamboo Before the Crowds",
    date: "2025-11-04",
    mood: "🍃",
    tags: ["temples", "autumn"],
    photos: [],
    body: "Set an alarm for 5:45, which felt insane on vacation, but the internet was right: Arashiyama at sunrise belongs to almost no one. The bamboo grove does this thing where the stalks creak and knock together overhead, and without three hundred people between you and the sound, it's genuinely eerie in a good way.\n\nWe walked down to the river after and watched the fog burn off the hills — the kind of view that gets stapled onto postcards, except it was just sitting there being ordinary and beautiful at seven in the morning. Coffee from a vending machine, still hot. Cannot overstate how good hot canned coffee from a Japanese vending machine tastes when you've been awake since before dawn.\n\nBy nine the tour buses arrived and we left. Correct call, ten out of ten, would set the alarm again."
  },
  {
    id: "seed-entry-kyoto-2",
    tripId: "seed-trip-kyoto",
    title: "Getting Lost Near Nishiki Market",
    date: "2025-11-06",
    mood: "🍜",
    tags: ["food"],
    photos: [],
    body: "No plan today, which is usually when the best stuff happens. We ducked off the main covered arcade of Nishiki into a side alley chasing a smell — turned out to be a six-seat counter place doing nothing but oden, run by a woman who didn't speak much English and didn't need to, since she just kept pointing at things simmering in the broth until we nodded.\n\nDaikon that had clearly been in that broth for hours, a soft-boiled egg gone amber all the way through, some kind of fish cake I still can't identify and don't want to, because not knowing is part of the memory now. Total bill for two: about nine dollars.\n\nWe tried to find the place again two days later to bring a friend and couldn't. Might have dreamed it. Worth it either way."
  },
  {
    id: "seed-entry-kyoto-3",
    tripId: "seed-trip-kyoto",
    title: "Last Morning, Fushimi Inari",
    date: "2025-11-09",
    mood: "⛩️",
    tags: ["temples", "walking"],
    photos: [],
    body: "Saved the famous one for last on purpose. Fushimi Inari's thousand gates are exactly as photogenic as everyone says for the first fifteen minutes near the entrance, and then something better happens: the crowd thins as the trail climbs, and by the halfway point up the mountain it's just you, the gates, and the occasional cat.\n\nStopped at a tiny tea house partway up that's been there, per the sign, since the 1800s. Ordered something we couldn't read the name of. It was sweet and slightly smoky and came with a view over the whole city.\n\nDidn't make it to the summit — ran out of morning — but I've decided that's a reason to come back rather than a regret. Flight's tonight. Already trying to figure out when we can do this again."
  },

  // --- Iceland ---
  {
    id: "seed-entry-iceland-1",
    tripId: "seed-trip-iceland",
    title: "The Lights Finally Showed Up",
    date: "2025-02-13",
    mood: "🌌",
    tags: ["aurora"],
    photos: [],
    body: "Three nights of checking the aurora forecast app like it owed us money, three nights of solid cloud cover. Tonight the sky cleared around 10pm and the forecast said moderate activity, so we drove twenty minutes out of Vík away from the streetlights and just waited in the cold, stamping our feet, half convinced we'd jinxed it by getting our hopes up.\n\nIt started as a faint green smear that could've been a cloud. Then it wasn't. The whole thing moved — not gradually, but in these ribboning pulses, green shifting to a pale violet at the edges, directly overhead. My hands were too cold to hold the camera steady and I didn't care.\n\nWe stood out there for almost two hours until we couldn't feel our feet. Worth every minute of the three nights that came before it."
  },
  {
    id: "seed-entry-iceland-2",
    tripId: "seed-trip-iceland",
    title: "Black Sand and a Very Bad Idea",
    date: "2025-02-15",
    mood: "🌊",
    tags: ["road trip"],
    photos: [],
    body: "Reynisfjara is beautiful and every sign around it is very clear about not turning your back on the ocean, because the waves here are unpredictable and have killed people. We knew this. We stood well back on the dry sand, admired the basalt columns, took some photos, and were feeling smug about being responsible tourists.\n\nThen one wave decided the 'safe' line was a suggestion and came in about fifteen feet further than every wave before it. Soaked to the knee, camera bag saved by pure luck and a very fast grab. We laughed about it for the rest of the drive, mostly out of relief, and I now understand exactly why those signs exist.\n\nStopped for hot chocolate in Vík to warm up. Ten minutes of shivering in wet boots to look at black rock formations: honestly still worth it."
  },
  {
    id: "seed-entry-iceland-3",
    tripId: "seed-trip-iceland",
    title: "A Hot Spring With No Name",
    date: "2025-02-17",
    mood: "♨️",
    tags: ["hot springs"],
    photos: [],
    body: "Skipped the Blue Lagoon on purpose — wanted something that felt less like a resort. A guy at our guesthouse in the East Fjords scribbled a location on a napkin: no sign, no parking lot, just a pull-off on a gravel road and a fifteen-minute walk along a stream that got warmer with every step.\n\nThe pool itself was maybe big enough for four people, rock-lined, steam rising off it into air that had to be around 20°F. We had it entirely to ourselves for over an hour. At one point it started snowing, lightly, and we just sat there with only our heads above the water, watching it land on the black rock around us and disappear.\n\nI don't know the name of that spring and I'm choosing not to look it up. Some places are better as a napkin and a memory."
  },

  // --- Lisbon ---
  {
    id: "seed-entry-lisbon-1",
    tripId: "seed-trip-lisbon",
    title: "Tram 28 and a Sore Neck",
    date: "2024-06-15",
    mood: "🚋",
    tags: ["history"],
    photos: [],
    body: "Everyone says ride the 28 and everyone is right, though nobody mentions you'll spend the whole ride craning your neck at tiled building facades instead of watching where the tram is going, which is probably fine since the tram knows the route better than you do.\n\nGot off wherever looked interesting, which turned out to be Graça, and wandered uphill until we found a miradouro with a view over the whole city and a guy selling beer out of a cooler for a euro. Sat there for an hour doing nothing. This seems to be the correct way to spend an afternoon in Lisbon — pick a viewpoint, sit, drink something cheap, watch the light change.\n\nDinner was grilled sardines at a place with plastic chairs and no menu in English. Best fish I've had in years, and I include restaurants that charge ten times as much."
  },
  {
    id: "seed-entry-lisbon-2",
    tripId: "seed-trip-lisbon",
    title: "Pastéis de Nata, a Scientific Study",
    date: "2024-06-17",
    mood: "🥧",
    tags: ["tapas", "food"],
    photos: [],
    body: "In the interest of thoroughness we compared the original at Belém against three other bakeries around the city. Findings: Belém earns the hype — the pastry is thinner and shatters properly, the custard has a deeper caramelization, and the cinnamon on top is optional but correct. That said, a tiny place near our apartment in Alfama, no name we could find, served one still warm from the oven that may have won on pure texture alone.\n\nWe are calling it a tie and reserving the right to keep testing on future trips. This is not a hardship.\n\nWalked it all off, or told ourselves we did, wandering the steep Alfama alleys until we found a fado bar with a single guitarist and no tourists. Stayed two hours longer than planned."
  },
  {
    id: "seed-entry-lisbon-3",
    tripId: "seed-trip-lisbon",
    title: "Empty Beaches Near Sagres",
    date: "2024-06-22",
    mood: "🏖️",
    tags: ["beaches", "coastal"],
    photos: [],
    body: "Drove west until the road basically ran out at Sagres, the very southwestern tip of Europe, where the cliffs drop straight into the Atlantic and the wind never seems to stop. Found a beach on the way — Praia do Beliche — reachable only by a long staircase down the cliff face, which apparently filters out most people, because we had maybe a fifth of it to ourselves on a warm June afternoon.\n\nThe water was colder than it looked, in the specific way Atlantic beaches always undersell themselves. Worth it anyway. Spent the afternoon reading, swimming when we got too hot, watching surfers further down the coast catch waves that looked entirely too big for a casual Saturday.\n\nLast stop before the drive back to Lisbon and the flight home. Hard trip to end, in the best way."
  },

  // --- Copenhagen (upcoming, planning notes) ---
  {
    id: "seed-entry-copenhagen-1",
    tripId: "seed-trip-copenhagen",
    title: "Planning Notes: Three Days, No Overreaching",
    date: "2026-08-05",
    mood: "📝",
    tags: ["planning"],
    photos: [],
    body: "Keeping this one deliberately light — it's a long weekend, not an expedition. Loose plan so far:\n\nDay 1: land midday, walk the canals in Nyhavn and Christianshavn, dinner somewhere unfussy. Day 2: bike rental (need to check if our hotel has one included), Torvehallerne market for lunch, an afternoon at either Designmuseum Danmark or just wandering Nørrebro. Day 3: day trip out to Louisiana Museum of Modern Art if the weather cooperates — heard the sculpture garden overlooking the sound is worth the train ride alone.\n\nRestaurant list is already too long, which tracks. Want to get to at least one proper smørrebrød lunch and one bakery crawl. Booked an apartment instead of a hotel this time, mostly for the kitchen — might actually cook one night instead of eating out every meal, we'll see if that survives contact with the itinerary."
  },

  // --- Patagonia (upcoming, planning notes) ---
  {
    id: "seed-entry-patagonia-1",
    tripId: "seed-trip-patagonia",
    title: "Two Years in the Making",
    date: "2026-06-20",
    mood: "🥾",
    tags: ["planning", "hiking"],
    photos: [],
    body: "We first talked about this trip during a rainy weekend two Novembers ago, looking at photos of Fitz Roy and saying 'someday' the way you do about most big trips. Flights are booked now, which makes it real in a way it wasn't before.\n\nRough shape of the plan: fly into El Calafate, bus to El Chaltén as a base for the Laguna de los Tres and Laguna Torre day hikes, then cross into Chile for a few days in Torres del Paine if the border logistics work out. November should mean long daylight and (hopefully) the trails before the peak summer crowds.\n\nGear list is half done. Need to actually test the new boots on real trails before we go instead of just around the block, and I keep hearing that Patagonia weather changes on a dime regardless of forecast, so layers over anything fancy. Excited in a way that's hard to write down without sounding corny, so: excited."
  },
  {
    id: "seed-entry-patagonia-2",
    tripId: "seed-trip-patagonia",
    title: "The Gear List, Finalized (Probably)",
    date: "2026-07-28",
    mood: "🎒",
    tags: ["planning"],
    photos: [],
    body: "Third pass at the packing list and I think it's actually done. Base layers, a proper wind shell (apparently non-negotiable in that region, wind gets mentioned in every single trip report), microspikes just in case there's early snow on the higher trail sections, and a dry bag for the river crossing on the Laguna Torre route that half the reviews warn about and half don't mention at all.\n\nStill debating whether to bring the good camera or just lean on the phone and stay more present on the trail. Leaning toward bringing it — Fitz Roy at sunrise is not a moment I want to only half-remember.\n\nFour months out. Booked the last of the refugio nights this week, which felt like the final piece clicking into place."
  },

  // --- Morocco (upcoming, planning notes) ---
  {
    id: "seed-entry-morocco-1",
    tripId: "seed-trip-morocco",
    title: "Still in the Research Phase",
    date: "2026-08-08",
    mood: "🗺️",
    tags: ["planning", "markets"],
    photos: [],
    body: "Booked the flights on a whim during a sale and now have to actually figure out the trip. Current thinking: a few days in Marrakech's medina to get properly lost in the souks, then out to the Atlas Mountains for a couple of nights in a village guesthouse, then maybe a night in the Agafay or Sahara desert before flying home — though the desert leg depends on how much driving we're willing to do on a nine-day trip.\n\nReading conflicting advice on riads versus hotels; leaning riad for the rooftop breakfasts alone. Need to look into a guide for the medina, since apparently getting cheerfully lost is part of the experience but getting lost while late for a train is not.\n\nMore research to do on the Atlas trekking routes. This entry is mostly just a place to dump open questions before they slip my mind."
  }
];
