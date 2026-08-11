// Wayfarer — seed data. Only used the very first time the app runs
// (i.e. when localStorage has no saved state yet). Everything here is
// just normal data the user can edit or delete like anything else.

function placeholderPhoto(emoji, bg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320">`
    + `<rect width="100%" height="100%" fill="${bg}"/>`
    + `<text x="50%" y="56%" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text>`
    + `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const SEED_STATE = {
  trips: [
    {
      id: 'trip_kyoto',
      title: 'Kyoto in Autumn',
      destination: 'Kyoto, Japan',
      startDate: '2023-11-02',
      endDate: '2023-11-12',
      summary: 'Ten days chasing maple leaves through temples, tea houses, and back-alley ramen shops. Booked mostly on a whim after seeing a photo of Tofuku-ji in full color.',
      cover: placeholderPhoto('🍁', '#b3552f'),
    },
    {
      id: 'trip_pch',
      title: 'Pacific Coast Highway',
      destination: 'California, USA',
      startDate: '2025-06-09',
      endDate: '2025-06-16',
      summary: 'A week-long drive from San Francisco to Los Angeles, hugging Highway 1 the whole way. No fixed itinerary — just a rented convertible and a list of lookout points.',
      cover: placeholderPhoto('🛣️', '#3c6e8f'),
    },
    {
      id: 'trip_patagonia',
      title: 'Patagonia Trek',
      destination: 'Patagonia, Chile & Argentina',
      startDate: '2026-11-05',
      endDate: '2026-11-20',
      summary: 'The W Trek in Torres del Paine, then across the border to El Chaltén for Fitz Roy. Two weeks of tents, wind, and hopefully clear skies for the towers at sunrise.',
      cover: placeholderPhoto('🏔️', '#2f6f6b'),
    },
    {
      id: 'trip_nz',
      title: 'New Zealand South Island',
      destination: 'South Island, New Zealand',
      startDate: '2027-03-01',
      endDate: '2027-03-18',
      summary: 'Still in the early planning stage — thinking Queenstown, Milford Sound, and a stretch of the Routeburn Track. Nothing booked yet.',
      cover: placeholderPhoto('🥝', '#5c7a3a'),
    },
  ],

  entries: [
    {
      id: 'entry_kyoto_1',
      tripId: 'trip_kyoto',
      type: 'journal',
      title: 'Maple Leaves and Temple Bells',
      date: '2023-11-05',
      location: 'Fushimi Inari, Kyoto',
      tags: ['temples', 'hiking', 'solo'],
      photos: [placeholderPhoto('⛩️', '#b3552f')],
      body: "I got to Fushimi Inari before seven, while the tour buses were still asleep. The thousand gates went up the hillside in that impossible orange, and for the first twenty minutes I didn't see another person — just the occasional fox statue watching me climb.\n\nBy the summit the crowds had caught up, so I didn't linger. Coming back down through Senbon Torii a second time, slower, was better than the climb itself. Stopped at a stall by the base for grilled mochi and ate it on a bench, watching a school group take turns bowing to a shrine cat that clearly ran the place.\n\nTonight: ramen in a six-seat counter near the station, recommended by the hostel owner. Worth the twenty-minute wait outside in the cold.",
    },
    {
      id: 'entry_kyoto_2',
      tripId: 'trip_kyoto',
      type: 'journal',
      title: 'Getting Lost in Gion',
      date: '2023-11-08',
      location: 'Gion District, Kyoto',
      tags: ['food', 'walking'],
      photos: [placeholderPhoto('🏮', '#8a4a63')],
      body: "No plan today, which turned out to be the right call. Wandered into Gion around dusk and just followed whichever alley had the better light. Wooden facades, lanterns coming on one by one, a single geiko crossing the street so fast I almost missed her.\n\nFound a tiny izakaya with no English menu and pointed at whatever the table next to us was having. Turned out to be grilled yuba and a local sake I still don't know the name of. This is the kind of night that doesn't photograph well but is the whole reason I travel.",
    },
    {
      id: 'entry_kyoto_3',
      tripId: 'trip_kyoto',
      type: 'insight',
      title: 'Pack lighter next time',
      date: '2023-11-11',
      location: '',
      tags: ['packing', 'lessons-learned'],
      photos: [],
      body: "Carried a 45L pack for ten days and used maybe 60% of what's in it. Kyoto has coin laundromats everywhere — should have packed five days of clothes, not ten. Also: one good pair of walking shoes beats three mediocre pairs of everything.",
    },
    {
      id: 'entry_pch_1',
      tripId: 'trip_pch',
      type: 'journal',
      title: 'Fog Over Big Sur',
      date: '2025-06-12',
      location: 'Big Sur, California',
      tags: ['road-trip', 'nature'],
      photos: [placeholderPhoto('🌊', '#3c6e8f'), placeholderPhoto('🌲', '#2c5f4a')],
      body: "Left Monterey at sunrise to beat the fog and lost that race by about an hour. Bixby Bridge was completely socked in — could hear the ocean but not see it. Waited it out with coffee from a thermos and by nine the fog had burned off just enough to see the arch of the bridge against the cliffs.\n\nMcWay Falls in the afternoon was the postcard shot everyone said it would be, but the real highlight was an unmarked pullout twenty minutes south where we had a whole cove to ourselves for an hour. Didn't even see another car.",
    },
    {
      id: 'entry_pch_2',
      tripId: 'trip_pch',
      type: 'note',
      title: 'Best stops between SF and LA',
      date: '2025-06-16',
      location: '',
      tags: ['tips', 'road-trip'],
      photos: [],
      body: "For next time (or anyone else doing this drive): Bixby Bridge and McWay Falls are worth the crowds, but the unmarked pullouts south of Lucia are better if you want quiet. Gas up in Cambria — long stretch with nothing after that. San Simeon in the early morning for the elephant seals, before the tour groups arrive. Give yourself two nights in Big Sur if you can; doing it in one day is rushed.",
    },
    {
      id: 'entry_patagonia_1',
      tripId: 'trip_patagonia',
      type: 'note',
      title: 'Flights and permits booked',
      date: '2026-07-20',
      location: '',
      tags: ['planning', 'logistics'],
      photos: [],
      body: "Flights into Punta Arenas confirmed for Nov 5. Torres del Paine refugio reservations booked for the full W Trek — these sell out fast, glad we did it in January. Still need: bus from Puerto Natales to the park, and a rental car for the El Chaltén leg after we cross into Argentina.",
    },
    {
      id: 'entry_patagonia_2',
      tripId: 'trip_patagonia',
      type: 'insight',
      title: 'Packing list for the W Trek',
      date: '2026-08-02',
      location: '',
      tags: ['packing', 'gear'],
      photos: [],
      body: "Patagonia weather is famous for doing all four seasons in one afternoon, so layers over anything heavy. Plan: base layer, fleece, hardshell rain/wind jacket, and a warm hat even though it's technically their spring. Trekking poles for the descent from the Towers viewpoint — heard it's loose scree. Bringing a battery pack since refugios charge for outlets.",
    },
  ],
};
