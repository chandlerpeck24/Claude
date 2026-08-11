// Waypoint — seed data. Loaded into localStorage on first run only;
// after that, everything the user creates/edits lives in localStorage.

const COUNTRIES = [
  "Argentina","Australia","Austria","Belgium","Bolivia","Brazil","Cambodia",
  "Canada","Chile","China","Colombia","Costa Rica","Croatia","Cuba","Czechia",
  "Denmark","Ecuador","Egypt","Estonia","Ethiopia","Fiji","Finland","France",
  "Germany","Greece","Guatemala","Hungary","Iceland","India","Indonesia",
  "Ireland","Israel","Italy","Japan","Jordan","Kenya","Laos","Malaysia",
  "Mexico","Mongolia","Morocco","Nepal","Netherlands","New Zealand",
  "Nicaragua","Norway","Panama","Peru","Philippines","Poland","Portugal",
  "Romania","Rwanda","Scotland","Singapore","Slovenia","South Africa",
  "South Korea","Spain","Sri Lanka","Sweden","Switzerland","Taiwan",
  "Tanzania","Thailand","Turkey","Uganda","United Kingdom","United States",
  "Uruguay","Vanuatu","Vietnam","Wales","Zambia"
];

const SEED_DATA = {
  trips: [
    {
      id: "trip-kyoto",
      title: "Kyoto in Autumn",
      destination: "Kyoto",
      country: "Japan",
      startDate: "2025-11-10",
      endDate: "2025-11-18",
      summary: "Nine days chasing koyo (autumn leaves) through temples, bamboo groves, and way too many convenience-store snacks.",
      tags: ["solo", "temples", "food"],
      coverPhoto: null,
      pinned: true,
      createdAt: "2025-09-02T10:00:00.000Z"
    },
    {
      id: "trip-patagonia",
      title: "Patagonia W Trek",
      destination: "Torres del Paine",
      country: "Chile",
      startDate: "2027-01-05",
      endDate: "2027-01-20",
      summary: "The big one — four nights of backcountry hiking on the W circuit, bookended by a few soft days in Puerto Natales.",
      tags: ["hiking", "backpacking"],
      coverPhoto: null,
      pinned: true,
      createdAt: "2026-07-20T10:00:00.000Z"
    },
    {
      id: "trip-nz",
      title: "South Island Road Trip",
      destination: "South Island",
      country: "New Zealand",
      startDate: "",
      endDate: "",
      summary: "Someday: campervan down the South Island, glaciers to fjords. Still figuring out timing.",
      tags: ["bucket list", "road trip"],
      coverPhoto: null,
      pinned: false,
      createdAt: "2026-03-14T10:00:00.000Z"
    },
    {
      id: "trip-lisbon",
      title: "Lisbon Long Weekend",
      destination: "Lisbon",
      country: "Portugal",
      startDate: "2026-08-08",
      endDate: "2026-08-14",
      summary: "A friend's wedding turned into a week of tiled alleyways, pastel de nata quality control, and tram-chasing.",
      tags: ["food", "friends"],
      coverPhoto: null,
      pinned: false,
      createdAt: "2026-06-01T10:00:00.000Z"
    }
  ],
  entries: [
    {
      id: "entry-kyoto-1",
      tripId: "trip-kyoto",
      title: "Ten thousand gates and a bad pair of shoes",
      date: "2025-11-11",
      location: "Fushimi Inari Taisha, Kyoto",
      body: "Landed jet-lagged and went straight for the gates anyway, on the theory that walking would beat the fog out of my head. It didn't, not really — but it also didn't matter.\n\nThe first quarter mile of Fushimi Inari is shoulder to shoulder with tour groups, everyone stopping every four feet for a photo through the vermillion tunnel. I almost turned back. Then somewhere past the first rest stop the crowd just... stopped following. Twenty minutes later I was alone on the mountain with a few thousand more gates, a fox statue guarding an abandoned teahouse, and a view over the city that nobody else seemed to want badly enough to earn.\n\nGot back to the guesthouse with blisters already forming and a memory card full of near-identical orange tunnel photos. Worth it.",
      insights: "Go before 7am or be willing to hike past the first rest stop — the crowds thin out fast after that.\nWear real shoes; sandals looked like a good idea at the hotel and were not.\nThe summit view is nice but the walk up is the actual point.",
      photos: [],
      createdAt: "2025-11-11T20:14:00.000Z"
    },
    {
      id: "entry-kyoto-2",
      tripId: "trip-kyoto",
      title: "Bamboo, matcha, and learning to slow down",
      date: "2025-11-14",
      location: "Arashiyama, Kyoto",
      body: "Took the train out to Arashiyama expecting fifteen minutes in a bamboo grove and a quick loop back. Ended up staying most of the day.\n\nThe grove itself is short — you can walk the famous path in under ten minutes — but everything around it rewards loitering. Ducked into a tiny matcha counter near the river with four stools and no English menu, pointed at what the couple next to me was having, and got the best thing I've eaten all trip: a bowl of matcha so thick it was closer to pudding, with a single perfect strawberry on top.\n\nSpent the afternoon just sitting by the Katsura river watching rental boats go by. First day of the trip I haven't been anywhere on a schedule, and easily the one I'll remember longest.",
      insights: "The bamboo grove is genuinely a five-minute stop — don't build a whole day around it, build a day around the neighborhood.\nPointing at someone else's order works everywhere, every time.",
      photos: [],
      createdAt: "2025-11-14T19:40:00.000Z"
    },
    {
      id: "entry-patagonia-1",
      tripId: "trip-patagonia",
      title: "Permits booked, gear list started",
      date: "2026-08-01",
      location: "planning, from home",
      body: "Refugio reservations for the W are famously the hard part, so that's done first: four nights locked in along the circuit for January. Flights into Punta Arenas booked separately since it was noticeably cheaper than flying straight to Puerto Natales.\n\nNow the actual planning starts — gear I already own vs. gear I need to borrow or buy, and how much food to carry vs. buy at the refugios along the way.",
      insights: "Book refugios the moment dates are firm — the popular ones sell out months out.\nFlying into Punta Arenas and taking the bus to Puerto Natales was cheaper than flying direct.",
      photos: [],
      createdAt: "2026-08-01T09:00:00.000Z"
    },
    {
      id: "entry-lisbon-1",
      tripId: "trip-lisbon",
      title: "First night in Alfama",
      date: "2026-08-09",
      location: "Alfama, Lisbon",
      body: "Got in late, dropped bags, and immediately got lost in Alfama on purpose — it's built for it, all switchback stairways and laundry strung between balconies. Ended up at a miradouro I couldn't find again if I tried, with a view over the rooftops down to the Tejo, a couple of guys playing guitar, and cheap vinho verde sold out of a cooler by a guy with no permit and no shortage of customers.\n\nExactly the kind of first night that makes the whole trip feel like it's already worth it before anything's actually on the itinerary.",
      insights: "Alfama rewards getting lost — don't bother navigating, just climb toward whatever's highest.",
      photos: [],
      createdAt: "2026-08-09T23:05:00.000Z"
    },
    {
      id: "note-packing",
      tripId: null,
      title: "Packing philosophy, revised after one too many overweight bags",
      date: "2026-05-20",
      location: "",
      body: "",
      insights: "One bag, always — a backpack that fits carry-on sizing, no exceptions.\nHalf the clothes you think you need, twice the money.\nA packable daypack takes no space and saves every trip.\nBuy the weird toiletries there instead of hauling them; it's part of the trip anyway.",
      photos: [],
      createdAt: "2026-05-20T12:00:00.000Z"
    }
  ]
};
