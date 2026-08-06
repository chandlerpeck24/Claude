/* =========================================================================
   Recipe Calculator — Nutrition Data
   All nutrition values are per 100g (or 100ml for liquids) of the raw
   ingredient, sourced from typical USDA-style averages. "units" gives
   ingredient-specific gram weights for common kitchen measures (cup, tbsp,
   tsp, each, clove, stick) on top of the universal mass/volume units
   handled globally in app.js (g, kg, oz, lb, ml, l).
   ========================================================================= */

const GLOBAL_UNITS_TO_GRAMS = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,      // approximation: 1ml ~= 1g for water-based kitchen liquids
  l: 1000
};

// Units that only make sense in the context of a specific ingredient.
const INGREDIENT_ONLY_UNITS = ["cup", "tbsp", "tsp", "each", "clove", "stick", "slice"];

const INGREDIENTS = [
  { id: "flour", name: "All-purpose flour", category: "Baking",
    per100g: { calories: 364, protein: 10.3, carbs: 76.3, fat: 1.0, fiber: 2.7, sugar: 0.3, sodium: 2 },
    units: { cup: 120, tbsp: 7.5, tsp: 2.5 } },

  { id: "granulated_sugar", name: "Granulated sugar", category: "Baking",
    per100g: { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sugar: 100, sodium: 1 },
    units: { cup: 200, tbsp: 12.5, tsp: 4.2 } },

  { id: "brown_sugar", name: "Brown sugar, packed", category: "Baking",
    per100g: { calories: 380, protein: 0.1, carbs: 98.1, fat: 0, fiber: 0, sugar: 97, sodium: 28 },
    units: { cup: 220, tbsp: 13.75, tsp: 4.6 } },

  { id: "butter", name: "Butter", category: "Dairy",
    per100g: { calories: 717, protein: 0.9, carbs: 0.1, fat: 81.1, fiber: 0, sugar: 0.1, sodium: 643 },
    units: { cup: 227, tbsp: 14.2, tsp: 4.7, stick: 113 } },

  { id: "egg", name: "Egg, large", category: "Dairy & Eggs",
    per100g: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0, sugar: 0.4, sodium: 142 },
    units: { each: 50 } },

  { id: "milk", name: "Milk, whole", category: "Dairy",
    per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 43 },
    units: { cup: 245, tbsp: 15.3, tsp: 5.1 } },

  { id: "vanilla_extract", name: "Vanilla extract", category: "Baking",
    per100g: { calories: 288, protein: 0.1, carbs: 12.7, fat: 0.1, fiber: 0, sugar: 12.7, sodium: 9 },
    units: { tbsp: 13, tsp: 4.2 } },

  { id: "baking_soda", name: "Baking soda", category: "Baking",
    per100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 27360 },
    units: { tbsp: 13.8, tsp: 4.6 } },

  { id: "baking_powder", name: "Baking powder", category: "Baking",
    per100g: { calories: 53, protein: 0, carbs: 27.7, fat: 0, fiber: 0.2, sugar: 0, sodium: 10600 },
    units: { tbsp: 13.8, tsp: 4.6 } },

  { id: "salt", name: "Salt", category: "Spices",
    per100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 38758 },
    units: { tbsp: 18, tsp: 6 } },

  { id: "chocolate_chips", name: "Chocolate chips, semisweet", category: "Baking",
    per100g: { calories: 479, protein: 4.2, carbs: 63.1, fat: 26.9, fiber: 5.9, sugar: 51 },
    units: { cup: 170, tbsp: 10.6, tsp: 3.5 } },

  { id: "rolled_oats", name: "Rolled oats, dry", category: "Grains",
    per100g: { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sugar: 1 },
    units: { cup: 90, tbsp: 5.6, tsp: 1.9 } },

  { id: "honey", name: "Honey", category: "Sweeteners",
    per100g: { calories: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2, sugar: 82.1, sodium: 4 },
    units: { cup: 340, tbsp: 21, tsp: 7 } },

  { id: "olive_oil", name: "Olive oil", category: "Oils",
    per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2 },
    units: { cup: 216, tbsp: 13.5, tsp: 4.5 } },

  { id: "vegetable_oil", name: "Vegetable oil", category: "Oils",
    per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
    units: { cup: 218, tbsp: 13.6, tsp: 4.5 } },

  { id: "chicken_breast", name: "Chicken breast, raw, skinless", category: "Meat & Poultry",
    per100g: { calories: 120, protein: 22.5, carbs: 0, fat: 2.6, fiber: 0, sugar: 0, sodium: 45 },
    units: {} },

  { id: "ground_beef", name: "Ground beef, 85% lean, raw", category: "Meat & Poultry",
    per100g: { calories: 215, protein: 19, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 66 },
    units: {} },

  { id: "ground_turkey", name: "Ground turkey, 93% lean, raw", category: "Meat & Poultry",
    per100g: { calories: 143, protein: 20, carbs: 0, fat: 6.9, fiber: 0, sugar: 0, sodium: 75 },
    units: {} },

  { id: "shrimp", name: "Shrimp, raw", category: "Seafood",
    per100g: { calories: 85, protein: 20.3, carbs: 0.2, fat: 0.5, fiber: 0, sugar: 0, sodium: 119 },
    units: {} },

  { id: "rice_cooked", name: "Rice, white, cooked", category: "Grains",
    per100g: { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0.1 },
    units: { cup: 158 } },

  { id: "rice_uncooked", name: "Rice, white, uncooked", category: "Grains",
    per100g: { calories: 365, protein: 7.1, carbs: 80, fat: 0.7, fiber: 1.3 },
    units: { cup: 185 } },

  { id: "pasta_dry", name: "Pasta, dry", category: "Grains",
    per100g: { calories: 371, protein: 13, carbs: 74.7, fat: 1.5, fiber: 3.2, sugar: 2.7 },
    units: { cup: 100, oz: 28.35 } },

  { id: "garlic", name: "Garlic clove", category: "Produce",
    per100g: { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1 },
    units: { clove: 3, tsp: 2.8 } },

  { id: "onion", name: "Onion", category: "Produce",
    per100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
    units: { each: 110, cup: 160 } },

  { id: "tomato", name: "Tomato", category: "Produce",
    per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
    units: { each: 123, cup: 180 } },

  { id: "bell_pepper", name: "Bell pepper", category: "Produce",
    per100g: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
    units: { each: 120, cup: 150 } },

  { id: "avocado", name: "Avocado", category: "Produce",
    per100g: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7 },
    units: { each: 150 } },

  { id: "lime", name: "Lime", category: "Produce",
    per100g: { calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, fiber: 2.8, sugar: 1.7 },
    units: { each: 67, tbsp: 15 } },

  { id: "lemon", name: "Lemon", category: "Produce",
    per100g: { calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sugar: 2.5 },
    units: { each: 58, tbsp: 15 } },

  { id: "cilantro", name: "Cilantro", category: "Produce",
    per100g: { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8, sugar: 0.9 },
    units: { cup: 16, tbsp: 1 } },

  { id: "spinach", name: "Spinach", category: "Produce",
    per100g: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
    units: { cup: 30 } },

  { id: "broccoli", name: "Broccoli", category: "Produce",
    per100g: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6, sugar: 1.7 },
    units: { cup: 91 } },

  { id: "cucumber", name: "Cucumber", category: "Produce",
    per100g: { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7 },
    units: { cup: 120, each: 300 } },

  { id: "banana", name: "Banana", category: "Produce",
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
    units: { each: 118 } },

  { id: "strawberries", name: "Strawberries", category: "Produce",
    per100g: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
    units: { cup: 150 } },

  { id: "blueberries", name: "Blueberries", category: "Produce",
    per100g: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10 },
    units: { cup: 148 } },

  { id: "ginger", name: "Ginger, fresh", category: "Produce",
    per100g: { calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2, sugar: 1.7 },
    units: { tsp: 2, tbsp: 6 } },

  { id: "soy_sauce", name: "Soy sauce", category: "Condiments",
    per100g: { calories: 53, protein: 8.1, carbs: 4.9, fat: 0.6, fiber: 0.8, sugar: 0.4, sodium: 5493 },
    units: { tbsp: 18, tsp: 6 } },

  { id: "peanut_butter", name: "Peanut butter", category: "Condiments",
    per100g: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 459 },
    units: { cup: 258, tbsp: 16, tsp: 5.3 } },

  { id: "cheddar_cheese", name: "Cheddar cheese, shredded", category: "Dairy",
    per100g: { calories: 403, protein: 23, carbs: 1.3, fat: 33.1, fiber: 0, sugar: 0.5, sodium: 621 },
    units: { cup: 113, tbsp: 7 } },

  { id: "parmesan", name: "Parmesan, grated", category: "Dairy",
    per100g: { calories: 431, protein: 38, carbs: 4.1, fat: 29, fiber: 0, sugar: 0.9, sodium: 1529 },
    units: { cup: 100, tbsp: 5 } },

  { id: "feta_cheese", name: "Feta cheese, crumbled", category: "Dairy",
    per100g: { calories: 264, protein: 14.2, carbs: 4.1, fat: 21.3, fiber: 0, sugar: 4.1, sodium: 1116 },
    units: { cup: 150, tbsp: 9.4 } },

  { id: "heavy_cream", name: "Heavy cream", category: "Dairy",
    per100g: { calories: 340, protein: 2.1, carbs: 2.8, fat: 36, fiber: 0, sugar: 2.9, sodium: 38 },
    units: { cup: 238, tbsp: 15 } },

  { id: "yogurt_plain", name: "Yogurt, plain whole milk", category: "Dairy",
    per100g: { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46 },
    units: { cup: 245, tbsp: 15.3 } },

  { id: "almond_milk", name: "Almond milk, unsweetened", category: "Dairy Alternatives",
    per100g: { calories: 15, protein: 0.6, carbs: 0.6, fat: 1.2, fiber: 0.3, sugar: 0.2, sodium: 63 },
    units: { cup: 240, tbsp: 15 } },

  { id: "coconut_milk", name: "Coconut milk, canned", category: "Dairy Alternatives",
    per100g: { calories: 230, protein: 2.3, carbs: 5.5, fat: 23.8, fiber: 2.2, sugar: 3.3 },
    units: { cup: 240, tbsp: 15 } },

  { id: "black_beans", name: "Black beans, canned, drained", category: "Legumes",
    per100g: { calories: 130, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7, sugar: 0.3, sodium: 240 },
    units: { cup: 170 } },

  { id: "walnuts", name: "Walnuts, chopped", category: "Nuts & Seeds",
    per100g: { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7, sugar: 2.6 },
    units: { cup: 100, tbsp: 6.25 } },

  { id: "cocoa_powder", name: "Cocoa powder, unsweetened", category: "Baking",
    per100g: { calories: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2, sugar: 1.8 },
    units: { cup: 90, tbsp: 5.4 } },

  { id: "cinnamon", name: "Cinnamon, ground", category: "Spices",
    per100g: { calories: 247, protein: 4, carbs: 80.6, fat: 1.2, fiber: 53.1, sugar: 2.2 },
    units: { tbsp: 7.8, tsp: 2.6 } },

  { id: "cumin", name: "Cumin, ground", category: "Spices",
    per100g: { calories: 375, protein: 17.8, carbs: 44.2, fat: 22.3, fiber: 10.5, sugar: 2.3 },
    units: { tbsp: 6.1, tsp: 2.1 } },

  { id: "chili_powder", name: "Chili powder", category: "Spices",
    per100g: { calories: 282, protein: 13.5, carbs: 49.7, fat: 14.3, fiber: 34.8, sugar: 7.2 },
    units: { tbsp: 7.9, tsp: 2.6 } },

  { id: "flour_tortilla", name: "Flour tortilla", category: "Grains",
    per100g: { calories: 333, protein: 8.2, carbs: 52, fat: 9.5, fiber: 3, sugar: 2 },
    units: { each: 45 } },

  { id: "water", name: "Water", category: "Other",
    per100g: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
    units: { cup: 240, tbsp: 15, tsp: 5 } }
];

const RECIPES = [
  {
    id: "choc_chip_cookies",
    name: "Classic Chocolate Chip Cookies",
    emoji: "🍪",
    description: "Soft, chewy cookies loaded with chocolate chips.",
    baseServings: 24,
    servingLabel: "cookies",
    ingredients: [
      { id: "flour", quantity: 2.25, unit: "cup" },
      { id: "baking_soda", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "butter", quantity: 1, unit: "cup" },
      { id: "brown_sugar", quantity: 0.75, unit: "cup" },
      { id: "granulated_sugar", quantity: 0.75, unit: "cup" },
      { id: "egg", quantity: 2, unit: "each" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "chocolate_chips", quantity: 2, unit: "cup" }
    ],
    instructions: [
      "Preheat oven to 375°F (190°C).",
      "Whisk together flour, baking soda, and salt.",
      "Cream butter with both sugars until fluffy; beat in eggs and vanilla.",
      "Mix in the dry ingredients, then fold in chocolate chips.",
      "Drop rounded tablespoons onto a baking sheet and bake 9-11 minutes."
    ]
  },
  {
    id: "fluffy_pancakes",
    name: "Fluffy Pancakes",
    emoji: "🥞",
    description: "Light and airy breakfast pancakes.",
    baseServings: 4,
    servingLabel: "servings (2 pancakes each)",
    ingredients: [
      { id: "flour", quantity: 1.5, unit: "cup" },
      { id: "baking_powder", quantity: 3.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "granulated_sugar", quantity: 1, unit: "tbsp" },
      { id: "milk", quantity: 1.25, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "butter", quantity: 3, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Whisk flour, baking powder, salt, and sugar in a bowl.",
      "In another bowl, whisk milk, egg, melted butter, and vanilla.",
      "Combine wet and dry ingredients until just mixed (small lumps are fine).",
      "Cook 1/4 cup portions on a greased griddle until bubbles form, then flip."
    ]
  },
  {
    id: "chicken_stir_fry",
    name: "Chicken Stir-Fry",
    emoji: "🍗",
    description: "Quick weeknight stir-fry with chicken and vegetables.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "chicken_breast", quantity: 500, unit: "g" },
      { id: "broccoli", quantity: 2, unit: "cup" },
      { id: "bell_pepper", quantity: 1, unit: "each" },
      { id: "onion", quantity: 0.5, unit: "each" },
      { id: "garlic", quantity: 3, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "soy_sauce", quantity: 3, unit: "tbsp" },
      { id: "vegetable_oil", quantity: 2, unit: "tbsp" },
      { id: "rice_cooked", quantity: 3, unit: "cup" }
    ],
    instructions: [
      "Slice chicken and vegetables into bite-sized pieces.",
      "Heat oil in a wok or large skillet over high heat; stir-fry chicken until cooked through.",
      "Add garlic, ginger, and vegetables; stir-fry 3-4 minutes until crisp-tender.",
      "Stir in soy sauce and cook 1 more minute. Serve over rice."
    ]
  },
  {
    id: "beef_bolognese",
    name: "Beef Bolognese Pasta",
    emoji: "🍝",
    description: "Rich, hearty meat sauce over pasta.",
    baseServings: 6,
    servingLabel: "servings",
    ingredients: [
      { id: "pasta_dry", quantity: 450, unit: "g" },
      { id: "ground_beef", quantity: 500, unit: "g" },
      { id: "onion", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 3, unit: "clove" },
      { id: "tomato", quantity: 4, unit: "each" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "parmesan", quantity: 0.5, unit: "cup" },
      { id: "salt", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Cook pasta in salted boiling water until al dente; drain.",
      "Heat olive oil and sauté onion and garlic until soft.",
      "Add ground beef, browning until fully cooked.",
      "Stir in chopped tomatoes and simmer 15-20 minutes, season with salt.",
      "Toss with pasta and top with grated parmesan."
    ]
  },
  {
    id: "guacamole",
    name: "Guacamole",
    emoji: "🥑",
    description: "Fresh, zesty avocado dip.",
    baseServings: 6,
    servingLabel: "servings (~1/4 cup each)",
    ingredients: [
      { id: "avocado", quantity: 3, unit: "each" },
      { id: "lime", quantity: 1, unit: "each" },
      { id: "onion", quantity: 0.25, unit: "each" },
      { id: "tomato", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "cilantro", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Mash avocados in a bowl to desired consistency.",
      "Finely dice onion, tomato, and garlic; mince cilantro.",
      "Fold everything into the avocado with lime juice and salt.",
      "Taste and adjust seasoning; serve immediately."
    ]
  },
  {
    id: "berry_smoothie",
    name: "Berry Banana Smoothie",
    emoji: "🥤",
    description: "Creamy fruit smoothie packed with protein.",
    baseServings: 2,
    servingLabel: "servings",
    ingredients: [
      { id: "banana", quantity: 1, unit: "each" },
      { id: "strawberries", quantity: 1, unit: "cup" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "almond_milk", quantity: 1, unit: "cup" },
      { id: "peanut_butter", quantity: 1, unit: "tbsp" },
      { id: "rolled_oats", quantity: 0.25, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Add all ingredients to a blender.",
      "Blend on high until smooth, about 45-60 seconds.",
      "Pour into glasses and serve immediately."
    ]
  }
];
