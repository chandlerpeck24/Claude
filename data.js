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
    units: { tbsp: 18, tsp: 6, pinch: 0.36 } },

  { id: "chocolate_chips", name: "Chocolate chips, semisweet", category: "Baking",
    per100g: { calories: 479, protein: 4.2, carbs: 63.1, fat: 26.9, fiber: 5.9, sugar: 51 },
    units: { cup: 170, tbsp: 10.6, tsp: 3.5, each: 0.5 } },

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
    units: { cup: 100, oz: 28.35, each: 20 } },

  { id: "garlic", name: "Garlic clove", category: "Produce",
    per100g: { calories: 149, protein: 6.4, carbs: 33.1, fat: 0.5, fiber: 2.1, sugar: 1 },
    units: { clove: 3, tsp: 2.8, each: 3 } },

  { id: "onion", name: "Onion", category: "Produce",
    per100g: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
    units: { each: 110, cup: 160, tbsp: 10 } },

  { id: "tomato", name: "Tomato", category: "Produce",
    per100g: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
    units: { each: 123, cup: 180, slice: 20 } },

  { id: "bell_pepper", name: "Bell pepper", category: "Produce",
    per100g: { calories: 31, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1, sugar: 4.2 },
    units: { each: 120, cup: 150, tbsp: 9 } },

  { id: "avocado", name: "Avocado", category: "Produce",
    per100g: { calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7 },
    units: { each: 150, cup: 150 } },

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
    units: { cup: 120, each: 300, tbsp: 15 } },

  { id: "banana", name: "Banana", category: "Produce",
    per100g: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2 },
    units: { each: 118 } },

  { id: "strawberries", name: "Strawberries", category: "Produce",
    per100g: { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sugar: 4.9 },
    units: { cup: 150, each: 18 } },

  { id: "blueberries", name: "Blueberries", category: "Produce",
    per100g: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4, sugar: 10 },
    units: { cup: 148 } },

  { id: "ginger", name: "Ginger, fresh", category: "Produce",
    per100g: { calories: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2, sugar: 1.7 },
    units: { tsp: 2, tbsp: 6, inch: 15, knob: 15 } },

  { id: "soy_sauce", name: "Soy sauce", category: "Condiments",
    per100g: { calories: 53, protein: 8.1, carbs: 4.9, fat: 0.6, fiber: 0.8, sugar: 0.4, sodium: 5493 },
    units: { tbsp: 18, tsp: 6 } },

  { id: "peanut_butter", name: "Peanut butter", category: "Condiments",
    per100g: { calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9, sodium: 459 },
    units: { cup: 258, tbsp: 16, tsp: 5.3 } },

  { id: "cheddar_cheese", name: "Cheddar cheese, shredded", category: "Dairy",
    per100g: { calories: 403, protein: 23, carbs: 1.3, fat: 33.1, fiber: 0, sugar: 0.5, sodium: 621 },
    units: { cup: 113, tbsp: 7, slice: 21 } },

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
    units: { cup: 240, tbsp: 15, tsp: 5 } },

  /* ---- Imported from user's cookbook (146 recipes) ---- */

  { id: "pork_loin", name: "Pork loin/chop, raw", category: "Meat & Poultry",
    per100g: { calories: 143, protein: 21, carbs: 0, fat: 6, fiber: 0, sugar: 0, sodium: 58 },
    units: {} },

  { id: "lamb", name: "Lamb, raw", category: "Meat & Poultry",
    per100g: { calories: 258, protein: 17, carbs: 0, fat: 21, fiber: 0, sugar: 0, sodium: 72 },
    units: {} },

  { id: "quail", name: "Quail, raw", category: "Meat & Poultry",
    per100g: { calories: 134, protein: 21, carbs: 0, fat: 5, fiber: 0, sugar: 0, sodium: 47 },
    units: { each: 110 } },

  { id: "lean_ground_beef", name: "Ground beef, 93% lean, raw", category: "Meat & Poultry",
    per100g: { calories: 152, protein: 20, carbs: 0, fat: 8, fiber: 0, sugar: 0, sodium: 66 },
    units: {} },

  { id: "lean_ground_pork", name: "Ground pork, lean, raw", category: "Meat & Poultry",
    per100g: { calories: 180, protein: 19, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 62 },
    units: {} },

  { id: "beef_ribeye", name: "Ribeye steak, raw", category: "Meat & Poultry",
    per100g: { calories: 291, protein: 24, carbs: 0, fat: 21, fiber: 0, sugar: 0, sodium: 58 },
    units: {} },

  { id: "beef_sirloin", name: "Sirloin steak, raw", category: "Meat & Poultry",
    per100g: { calories: 206, protein: 27, carbs: 0, fat: 10, fiber: 0, sugar: 0, sodium: 56 },
    units: {} },

  { id: "beef_tenderloin", name: "Beef tenderloin, raw", category: "Meat & Poultry",
    per100g: { calories: 209, protein: 26, carbs: 0, fat: 11, fiber: 0, sugar: 0, sodium: 56 },
    units: {} },

  { id: "bacon", name: "Bacon, cooked", category: "Meat & Poultry",
    per100g: { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sugar: 0, sodium: 1717 },
    units: { strip: 8, slice: 15 } },

  { id: "ham", name: "Ham", category: "Meat & Poultry",
    per100g: { calories: 145, protein: 21, carbs: 1.5, fat: 6, fiber: 0, sugar: 1.5, sodium: 1203 },
    units: {} },

  { id: "italian_sausage", name: "Italian sausage", category: "Meat & Poultry",
    per100g: { calories: 325, protein: 13, carbs: 3, fat: 28, fiber: 0, sugar: 1, sodium: 970 },
    units: {} },

  { id: "salami", name: "Salami", category: "Meat & Poultry",
    per100g: { calories: 336, protein: 22, carbs: 2, fat: 26, fiber: 0, sugar: 0, sodium: 1890 },
    units: { cup: 100 } },

  { id: "pepperoni", name: "Pepperoni", category: "Meat & Poultry",
    per100g: { calories: 504, protein: 19, carbs: 2, fat: 44, fiber: 0, sugar: 0, sodium: 1750 },
    units: { each: 2, slice: 2 } },

  { id: "turkey_breast_sliced", name: "Turkey breast, sliced/deli", category: "Meat & Poultry",
    per100g: { calories: 104, protein: 17, carbs: 2, fat: 1, fiber: 0, sugar: 1, sodium: 1000 },
    units: {} },

  { id: "turkey_meatballs", name: "Turkey meatballs, cooked", category: "Meat & Poultry",
    per100g: { calories: 180, protein: 17, carbs: 4, fat: 10, fiber: 0.5, sugar: 1, sodium: 420 },
    units: { each: 30 } },

  { id: "salmon_fillet", name: "Salmon fillet, raw", category: "Seafood",
    per100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59 },
    units: {} },

  { id: "tilapia_fillet", name: "Tilapia fillet, raw", category: "Seafood",
    per100g: { calories: 96, protein: 20.1, carbs: 0, fat: 1.7, fiber: 0, sugar: 0, sodium: 52 },
    units: {} },

  { id: "cod_fillet", name: "Cod fillet, raw", category: "Seafood",
    per100g: { calories: 82, protein: 18, carbs: 0, fat: 0.7, fiber: 0, sugar: 0, sodium: 54 },
    units: {} },

  { id: "sea_bass_fillet", name: "Sea bass fillet, raw", category: "Seafood",
    per100g: { calories: 97, protein: 18.4, carbs: 0, fat: 2, fiber: 0, sugar: 0, sodium: 68 },
    units: {} },

  { id: "white_fish", name: "White fish fillet, raw", category: "Seafood",
    per100g: { calories: 85, protein: 18.5, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 60 },
    units: { each: 220 } },

  { id: "tuna_canned", name: "Tuna, canned in water", category: "Seafood",
    per100g: { calories: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0, sugar: 0, sodium: 320 },
    units: {} },

  { id: "ahi_tuna_steak", name: "Ahi tuna steak, raw", category: "Seafood",
    per100g: { calories: 109, protein: 23.4, carbs: 0, fat: 0.5, fiber: 0, sugar: 0, sodium: 37 },
    units: {} },

  { id: "smoked_salmon", name: "Smoked salmon", category: "Seafood",
    per100g: { calories: 117, protein: 18.3, carbs: 0, fat: 4.3, fiber: 0, sugar: 0, sodium: 1700 },
    units: {} },

  { id: "egg_white", name: "Egg white, raw", category: "Dairy & Eggs",
    per100g: { calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0, sugar: 0.7, sodium: 166 },
    units: { each: 33 } },

  { id: "tofu_firm", name: "Tofu, firm", category: "Dairy Alternatives",
    per100g: { calories: 144, protein: 15.5, carbs: 2.8, fat: 8.7, fiber: 2.3, sugar: 0.6, sodium: 14 },
    units: { each: 396 } },

  { id: "greek_yogurt", name: "Greek yogurt, plain (2%)", category: "Dairy",
    per100g: { calories: 73, protein: 10, carbs: 3.9, fat: 2, fiber: 0, sugar: 3.9, sodium: 36 },
    units: { cup: 245, tbsp: 15.3 } },

  { id: "cottage_cheese", name: "Cottage cheese (2%)", category: "Dairy",
    per100g: { calories: 98, protein: 11, carbs: 3.4, fat: 2.9, fiber: 0, sugar: 3.4, sodium: 364 },
    units: { cup: 226 } },

  { id: "cream_cheese", name: "Cream cheese", category: "Dairy",
    per100g: { calories: 342, protein: 6, carbs: 4, fat: 34, fiber: 0, sugar: 3.2, sodium: 321 },
    units: { tbsp: 14.5, cup: 232 } },

  { id: "sour_cream", name: "Sour cream", category: "Dairy",
    per100g: { calories: 198, protein: 2.4, carbs: 4.6, fat: 19.7, fiber: 0, sugar: 3.4, sodium: 31 },
    units: { tbsp: 12, cup: 230 } },

  { id: "ricotta_cheese", name: "Ricotta cheese, whole milk", category: "Dairy",
    per100g: { calories: 174, protein: 11.3, carbs: 3, fat: 13, fiber: 0, sugar: 0.3, sodium: 84 },
    units: { cup: 250, tbsp: 15.6 } },

  { id: "mozzarella_cheese", name: "Mozzarella, part-skim shredded", category: "Dairy",
    per100g: { calories: 254, protein: 24.3, carbs: 2.8, fat: 15.9, fiber: 0, sugar: 1.2, sodium: 528 },
    units: { cup: 113, tbsp: 7 } },

  { id: "provolone_cheese", name: "Provolone cheese", category: "Dairy",
    per100g: { calories: 351, protein: 25.6, carbs: 2.1, fat: 26.6, fiber: 0, sugar: 0.6, sodium: 876 },
    units: { slice: 28, cup: 113 } },

  { id: "whipped_cream", name: "Whipped cream, sweetened", category: "Dairy",
    per100g: { calories: 257, protein: 2, carbs: 3.2, fat: 25.7, fiber: 0, sugar: 3, sodium: 42 },
    units: { tbsp: 7.5, cup: 120 } },

  { id: "tahini", name: "Tahini", category: "Condiments",
    per100g: { calories: 595, protein: 17, carbs: 21, fat: 53, fiber: 9.3, sugar: 0.5, sodium: 115 },
    units: { tbsp: 15, cup: 240 } },

  { id: "coconut_milk_light", name: "Coconut milk, light canned", category: "Dairy Alternatives",
    per100g: { calories: 78, protein: 0.5, carbs: 3.3, fat: 7.5, fiber: 0, sugar: 2, sodium: 10 },
    units: { cup: 240, tbsp: 15 } },

  { id: "quinoa_cooked", name: "Quinoa, cooked", category: "Grains",
    per100g: { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7 },
    units: { cup: 185 } },

  { id: "couscous_cooked", name: "Couscous, whole wheat, cooked", category: "Grains",
    per100g: { calories: 112, protein: 3.8, carbs: 23.2, fat: 0.2, fiber: 3.2, sugar: 0, sodium: 8 },
    units: { cup: 157 } },

  { id: "wheat_berries_cooked", name: "Wheat berries, cooked", category: "Grains",
    per100g: { calories: 135, protein: 4.5, carbs: 28.5, fat: 0.6, fiber: 4.4, sugar: 0.5, sodium: 3 },
    units: { cup: 150 } },

  { id: "barley_cooked", name: "Barley, cooked", category: "Grains",
    per100g: { calories: 123, protein: 2.3, carbs: 28.2, fat: 0.4, fiber: 3.8, sugar: 0.3, sodium: 3 },
    units: { cup: 157 } },

  { id: "pearl_barley_dry", name: "Pearl barley, dry", category: "Grains",
    per100g: { calories: 352, protein: 9.9, carbs: 77.7, fat: 1.2, fiber: 15.6, sugar: 0.8, sodium: 9 },
    units: { cup: 200 } },

  { id: "millet_flour", name: "Millet flour", category: "Baking",
    per100g: { calories: 378, protein: 11, carbs: 73, fat: 4.2, fiber: 8.5, sugar: 0, sodium: 5 },
    units: { cup: 120 } },

  { id: "spelt_flour", name: "Spelt flour", category: "Baking",
    per100g: { calories: 338, protein: 14.6, carbs: 70, fat: 2.4, fiber: 10.7, sugar: 0, sodium: 8 },
    units: { cup: 120 } },

  { id: "barley_flour", name: "Barley flour", category: "Baking",
    per100g: { calories: 345, protein: 9.9, carbs: 73.5, fat: 1.5, fiber: 11, sugar: 0, sodium: 3 },
    units: { cup: 148 } },

  { id: "whole_wheat_flour", name: "Whole wheat flour", category: "Baking",
    per100g: { calories: 340, protein: 13.2, carbs: 72, fat: 2.5, fiber: 10.7, sugar: 0.4, sodium: 2 },
    units: { cup: 120 } },

  { id: "active_dry_yeast", name: "Active dry yeast", category: "Baking",
    per100g: { calories: 325, protein: 40, carbs: 41, fat: 7.6, fiber: 26.9, sugar: 0, sodium: 51 },
    units: { tsp: 3, tbsp: 9 } },

  { id: "lentils_cooked", name: "Lentils, cooked", category: "Legumes",
    per100g: { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2 },
    units: { cup: 198 } },

  { id: "lentils_dry", name: "Red lentils, dry", category: "Legumes",
    per100g: { calories: 352, protein: 24.6, carbs: 63.4, fat: 1.1, fiber: 10.7, sugar: 1.8, sodium: 6 },
    units: { cup: 192 } },

  { id: "chickpeas", name: "Chickpeas, cooked/canned", category: "Legumes",
    per100g: { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 240 },
    units: { cup: 164 } },

  { id: "kidney_beans", name: "Kidney beans, canned", category: "Legumes",
    per100g: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, sugar: 0.3, sodium: 300 },
    units: { cup: 177 } },

  { id: "fava_beans", name: "Fava beans, cooked", category: "Legumes",
    per100g: { calories: 110, protein: 7.9, carbs: 19.7, fat: 0.4, fiber: 5.4, sugar: 1.8, sodium: 5 },
    units: { cup: 170 } },

  { id: "edamame", name: "Edamame, shelled, cooked", category: "Legumes",
    per100g: { calories: 121, protein: 11, carbs: 8.9, fat: 5.2, fiber: 5.2, sugar: 2.2, sodium: 6 },
    units: { cup: 155 } },

  { id: "corn", name: "Corn kernels, sweet", category: "Produce",
    per100g: { calories: 86, protein: 3.3, carbs: 19, fat: 1.2, fiber: 2, sugar: 6.3, sodium: 15 },
    units: { cup: 166 } },

  { id: "gnocchi", name: "Potato gnocchi, dry", category: "Grains",
    per100g: { calories: 150, protein: 3.3, carbs: 31, fat: 0.8, fiber: 1.5, sugar: 1, sodium: 330 },
    units: { cup: 140 } },

  { id: "brown_rice_cooked", name: "Brown rice, cooked", category: "Grains",
    per100g: { calories: 123, protein: 2.7, carbs: 25.6, fat: 1, fiber: 1.6, sugar: 0.4, sodium: 4 },
    units: { cup: 195 } },

  { id: "cauliflower_rice", name: "Cauliflower rice", category: "Produce",
    per100g: { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2, sugar: 2, sodium: 30 },
    units: { cup: 107 } },

  { id: "bread", name: "Bread, whole grain/sourdough", category: "Grains",
    per100g: { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7, sugar: 5, sodium: 491 },
    units: { slice: 32, each: 67 } },

  { id: "corn_tortilla", name: "Corn tortilla", category: "Grains",
    per100g: { calories: 218, protein: 5.7, carbs: 44.6, fat: 2.8, fiber: 6.3, sugar: 1, sodium: 298 },
    units: { each: 26 } },

  { id: "graham_crackers", name: "Graham crackers, crushed", category: "Baking",
    per100g: { calories: 421, protein: 7, carbs: 77, fat: 10.7, fiber: 2.8, sugar: 29, sodium: 448 },
    units: { tbsp: 6, cup: 90, each: 14 } },

  { id: "breadcrumbs", name: "Breadcrumbs", category: "Baking",
    per100g: { calories: 395, protein: 13, carbs: 72, fat: 5.3, fiber: 4.9, sugar: 6, sodium: 732 },
    units: { cup: 108, tbsp: 6.8 } },

  { id: "granola", name: "Granola", category: "Grains",
    per100g: { calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 7, sugar: 24, sodium: 209 },
    units: { cup: 122, tbsp: 7.6 } },

  { id: "tortilla_chips", name: "Tortilla chips", category: "Grains",
    per100g: { calories: 489, protein: 7, carbs: 63, fat: 25, fiber: 4.6, sugar: 0.7, sodium: 396 },
    units: { cup: 30, each: 2 } },

  { id: "sweet_potato", name: "Sweet potato, raw", category: "Produce",
    per100g: { calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55 },
    units: { cup: 133, each: 130 } },

  { id: "zucchini", name: "Zucchini", category: "Produce",
    per100g: { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sugar: 2.5, sodium: 8 },
    units: { cup: 124, each: 196 } },

  { id: "cauliflower_florets", name: "Cauliflower florets", category: "Produce",
    per100g: { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sugar: 1.9, sodium: 30 },
    units: { cup: 107 } },

  { id: "asparagus", name: "Asparagus", category: "Produce",
    per100g: { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, fiber: 2.1, sugar: 1.9, sodium: 2 },
    units: { cup: 134 } },

  { id: "green_beans", name: "Green beans", category: "Produce",
    per100g: { calories: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 3.4, sugar: 3.3, sodium: 6 },
    units: { cup: 100 } },

  { id: "snap_peas", name: "Snap peas", category: "Produce",
    per100g: { calories: 42, protein: 2.8, carbs: 7.6, fat: 0.2, fiber: 2.6, sugar: 4, sodium: 4 },
    units: { cup: 98 } },

  { id: "kale", name: "Kale", category: "Produce",
    per100g: { calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, fiber: 3.6, sugar: 2.3, sodium: 38 },
    units: { cup: 67 } },

  { id: "romaine_lettuce", name: "Romaine lettuce", category: "Produce",
    per100g: { calories: 17, protein: 1.2, carbs: 3.3, fat: 0.3, fiber: 2.1, sugar: 1.2, sodium: 8 },
    units: { cup: 47 } },

  { id: "lettuce", name: "Lettuce", category: "Produce",
    per100g: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28 },
    units: { cup: 36, leaf: 8, each: 8 } },

  { id: "cabbage", name: "Cabbage, shredded", category: "Produce",
    per100g: { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5, sugar: 3.2, sodium: 18 },
    units: { cup: 89 } },

  { id: "carrots", name: "Carrots", category: "Produce",
    per100g: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69 },
    units: { cup: 128 } },

  { id: "celery", name: "Celery", category: "Produce",
    per100g: { calories: 16, protein: 0.7, carbs: 3, fat: 0.2, fiber: 1.6, sugar: 1.3, sodium: 80 },
    units: { cup: 101 } },

  { id: "mushrooms", name: "Mushrooms, sliced", category: "Produce",
    per100g: { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1, sugar: 2, sodium: 5 },
    units: { cup: 70 } },

  { id: "potato", name: "Potato", category: "Produce",
    per100g: { calories: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6 },
    units: { cup: 150, each: 170 } },

  { id: "arugula", name: "Arugula", category: "Produce",
    per100g: { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sugar: 2.1, sodium: 27 },
    units: { cup: 20 } },

  { id: "mango", name: "Mango", category: "Produce",
    per100g: { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1 },
    units: { cup: 165, each: 200 } },

  { id: "grapes", name: "Grapes", category: "Produce",
    per100g: { calories: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9, sugar: 15.5, sodium: 2 },
    units: { cup: 151 } },

  { id: "pineapple", name: "Pineapple, crushed", category: "Produce",
    per100g: { calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4, sugar: 9.9, sodium: 1 },
    units: { cup: 250, tbsp: 15.6 } },

  { id: "pomegranate_seeds", name: "Pomegranate seeds (arils)", category: "Produce",
    per100g: { calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4, sugar: 13.7, sodium: 3 },
    units: { cup: 174, tbsp: 10.9 } },

  { id: "pomegranate_juice", name: "Pomegranate juice", category: "Produce",
    per100g: { calories: 54, protein: 0.2, carbs: 13.1, fat: 0.3, fiber: 0.1, sugar: 13, sodium: 9 },
    units: { cup: 240, tbsp: 15 } },

  { id: "dates", name: "Medjool dates", category: "Produce",
    per100g: { calories: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7, sugar: 66.5, sodium: 1 },
    units: { each: 24, cup: 178 } },

  { id: "figs_fresh", name: "Figs, fresh", category: "Produce",
    per100g: { calories: 74, protein: 0.8, carbs: 19.2, fat: 0.3, fiber: 2.9, sugar: 16.3, sodium: 1 },
    units: { each: 50 } },

  { id: "figs_dried", name: "Figs, dried", category: "Produce",
    per100g: { calories: 249, protein: 3.3, carbs: 63.9, fat: 0.9, fiber: 9.8, sugar: 47.9, sodium: 10 },
    units: { cup: 150, each: 8 } },

  { id: "cherries", name: "Cherries, fresh", category: "Produce",
    per100g: { calories: 63, protein: 1.1, carbs: 16, fat: 0.2, fiber: 2.1, sugar: 12.8, sodium: 0 },
    units: { cup: 154, each: 8 } },

  { id: "dried_cherries", name: "Cherries, dried", category: "Produce",
    per100g: { calories: 340, protein: 2.5, carbs: 83, fat: 1.5, fiber: 3, sugar: 65, sodium: 5 },
    units: { cup: 135, tbsp: 9 } },

  { id: "raspberries", name: "Raspberries", category: "Produce",
    per100g: { calories: 52, protein: 1.2, carbs: 11.9, fat: 0.7, fiber: 6.5, sugar: 4.4, sodium: 1 },
    units: { cup: 123, each: 2.3 } },

  { id: "apple", name: "Apple", category: "Produce",
    per100g: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1 },
    units: { each: 182, cup: 125 } },

  { id: "peach", name: "Peach", category: "Produce",
    per100g: { calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5, sugar: 8.4, sodium: 0 },
    units: { each: 150, cup: 154 } },

  { id: "roasted_red_peppers", name: "Roasted red peppers, jarred", category: "Produce",
    per100g: { calories: 33, protein: 1, carbs: 6, fat: 0.3, fiber: 2, sugar: 4.5, sodium: 270 },
    units: { cup: 150, tbsp: 9.4 } },

  { id: "dried_fruit_mix", name: "Dried fruit mix", category: "Produce",
    per100g: { calories: 290, protein: 2.5, carbs: 75, fat: 0.5, fiber: 5, sugar: 60, sodium: 10 },
    units: { cup: 140, tbsp: 8.75 } },

  { id: "mayonnaise", name: "Mayonnaise", category: "Condiments",
    per100g: { calories: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0, sugar: 0.3, sodium: 635 },
    units: { tbsp: 13.8, cup: 220 } },

  { id: "dijon_mustard", name: "Dijon mustard", category: "Condiments",
    per100g: { calories: 66, protein: 4, carbs: 5, fat: 3.3, fiber: 3.3, sugar: 1, sodium: 1123 },
    units: { tbsp: 15, tsp: 5 } },

  { id: "ketchup", name: "Ketchup", category: "Condiments",
    per100g: { calories: 101, protein: 1.2, carbs: 25.8, fat: 0.1, fiber: 0.3, sugar: 21.3, sodium: 907 },
    units: { tbsp: 17, tsp: 5.7, cup: 272 } },

  { id: "marinara_sauce", name: "Marinara sauce", category: "Condiments",
    per100g: { calories: 29, protein: 1.2, carbs: 6.5, fat: 0.4, fiber: 1.5, sugar: 4, sodium: 380 },
    units: { cup: 250, tbsp: 15.6 } },

  { id: "pizza_sauce", name: "Pizza sauce", category: "Condiments",
    per100g: { calories: 30, protein: 1.3, carbs: 6.5, fat: 0.5, fiber: 1.4, sugar: 4, sodium: 420 },
    units: { cup: 250, tbsp: 15.6 } },

  { id: "tomato_paste", name: "Tomato paste", category: "Condiments",
    per100g: { calories: 82, protein: 4.3, carbs: 18.9, fat: 0.5, fiber: 4.1, sugar: 12.2, sodium: 59 },
    units: { tbsp: 16.5, cup: 262 } },

  { id: "tomato_sauce", name: "Tomato sauce / crushed tomatoes, canned", category: "Condiments",
    per100g: { calories: 24, protein: 1.2, carbs: 5.3, fat: 0.2, fiber: 1.4, sugar: 3.2, sodium: 260 },
    units: { cup: 245, tbsp: 15.3 } },

  { id: "salsa", name: "Salsa", category: "Condiments",
    per100g: { calories: 29, protein: 1.2, carbs: 6, fat: 0.2, fiber: 1.5, sugar: 3.5, sodium: 430 },
    units: { cup: 240, tbsp: 15 } },

  { id: "hot_sauce", name: "Hot sauce", category: "Condiments",
    per100g: { calories: 12, protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.3, sugar: 0.8, sodium: 3277 },
    units: { tsp: 5, tbsp: 15 } },

  { id: "worcestershire_sauce", name: "Worcestershire sauce", category: "Condiments",
    per100g: { calories: 78, protein: 0, carbs: 19.5, fat: 0, fiber: 0, sugar: 11, sodium: 980 },
    units: { tsp: 6, tbsp: 17 } },

  { id: "caesar_dressing", name: "Caesar dressing", category: "Condiments",
    per100g: { calories: 467, protein: 2.2, carbs: 4.7, fat: 49, fiber: 0, sugar: 2.5, sodium: 1050 },
    units: { tbsp: 15, cup: 230 } },

  { id: "basil_pesto", name: "Basil pesto", category: "Condiments",
    per100g: { calories: 458, protein: 4.6, carbs: 4.1, fat: 47, fiber: 1.6, sugar: 1, sodium: 600 },
    units: { tbsp: 16, cup: 230 } },

  { id: "rice_vinegar", name: "Rice vinegar", category: "Condiments",
    per100g: { calories: 18, protein: 0, carbs: 0.4, fat: 0, fiber: 0, sugar: 0.2, sodium: 213 },
    units: { tbsp: 15, tsp: 5 } },

  { id: "red_wine_vinegar", name: "Red wine vinegar", category: "Condiments",
    per100g: { calories: 19, protein: 0.1, carbs: 0.3, fat: 0, fiber: 0, sugar: 0.3, sodium: 8 },
    units: { tbsp: 15, tsp: 5 } },

  { id: "sriracha", name: "Sriracha", category: "Condiments",
    per100g: { calories: 93, protein: 2, carbs: 19, fat: 0.9, fiber: 1, sugar: 13, sodium: 2124 },
    units: { tsp: 6, tbsp: 17 } },

  { id: "date_syrup", name: "Date syrup", category: "Sweeteners",
    per100g: { calories: 290, protein: 0.9, carbs: 75, fat: 0.4, fiber: 2, sugar: 65, sodium: 9 },
    units: { tbsp: 21, tsp: 7 } },

  { id: "maple_syrup", name: "Maple syrup", category: "Sweeteners",
    per100g: { calories: 260, protein: 0, carbs: 67, fat: 0.1, fiber: 0, sugar: 60, sodium: 10 },
    units: { tbsp: 20, tsp: 6.7, cup: 322 } },

  { id: "nutritional_yeast", name: "Nutritional yeast", category: "Condiments",
    per100g: { calories: 325, protein: 50, carbs: 36, fat: 4, fiber: 20, sugar: 0, sodium: 25 },
    units: { tbsp: 5, tsp: 1.7 } },

  { id: "protein_powder", name: "Protein powder", category: "Condiments",
    per100g: { calories: 375, protein: 80, carbs: 8, fat: 4, fiber: 2, sugar: 4, sodium: 250 },
    units: { scoop: 30, tbsp: 8, each: 28, cup: 120 } },

  { id: "almonds", name: "Almonds, chopped/sliced", category: "Nuts & Seeds",
    per100g: { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1 },
    units: { cup: 95, tbsp: 6 } },

  { id: "pistachios", name: "Pistachios", category: "Nuts & Seeds",
    per100g: { calories: 560, protein: 20.6, carbs: 27.2, fat: 45.3, fiber: 10.6, sugar: 7.7, sodium: 1 },
    units: { cup: 123, tbsp: 7.7 } },

  { id: "pecans", name: "Pecans, chopped", category: "Nuts & Seeds",
    per100g: { calories: 691, protein: 9.2, carbs: 13.9, fat: 72, fiber: 9.6, sugar: 4, sodium: 0 },
    units: { cup: 99, tbsp: 6.2 } },

  { id: "pine_nuts", name: "Pine nuts", category: "Nuts & Seeds",
    per100g: { calories: 673, protein: 13.7, carbs: 13.1, fat: 68.4, fiber: 3.7, sugar: 3.6, sodium: 2 },
    units: { cup: 135, tbsp: 8.4 } },

  { id: "mixed_nuts", name: "Mixed nuts", category: "Nuts & Seeds",
    per100g: { calories: 607, protein: 20, carbs: 21, fat: 54, fiber: 8.4, sugar: 4.5, sodium: 15 },
    units: { cup: 143, tbsp: 9 } },

  { id: "pumpkin_seeds", name: "Pumpkin seeds", category: "Nuts & Seeds",
    per100g: { calories: 559, protein: 30.2, carbs: 10.7, fat: 49, fiber: 6, sugar: 1.4, sodium: 7 },
    units: { cup: 129, tbsp: 8 } },

  { id: "sesame_seeds", name: "Sesame seeds", category: "Nuts & Seeds",
    per100g: { calories: 573, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8, sugar: 0.3, sodium: 11 },
    units: { tbsp: 9, tsp: 3 } },

  { id: "flaxseed", name: "Flaxseed, ground", category: "Nuts & Seeds",
    per100g: { calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3, sugar: 1.6, sodium: 30 },
    units: { tbsp: 7, tsp: 2.3 } },

  { id: "almond_flour", name: "Almond flour", category: "Baking",
    per100g: { calories: 571, protein: 21, carbs: 21, fat: 50, fiber: 10.6, sugar: 4.4, sodium: 1 },
    units: { cup: 96, tbsp: 6 } },

  { id: "almond_butter", name: "Almond butter", category: "Condiments",
    per100g: { calories: 614, protein: 21, carbs: 19, fat: 56, fiber: 10.3, sugar: 4.3, sodium: 7 },
    units: { cup: 250, tbsp: 16, tsp: 5.3 } },

  { id: "coconut_flakes", name: "Coconut flakes, unsweetened", category: "Nuts & Seeds",
    per100g: { calories: 660, protein: 6.9, carbs: 23.7, fat: 64.5, fiber: 16.3, sugar: 7.4, sodium: 37 },
    units: { cup: 80, tbsp: 5 } },

  { id: "sesame_oil", name: "Sesame oil", category: "Oils",
    per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
    units: { tbsp: 13.6, tsp: 4.5 } },

  { id: "avocado_oil", name: "Avocado oil", category: "Oils",
    per100g: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
    units: { tbsp: 13.6, tsp: 4.5 } },

  { id: "coconut_oil", name: "Coconut oil", category: "Oils",
    per100g: { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0 },
    units: { tbsp: 13.6, tsp: 4.5, cup: 218 } },

  { id: "paprika", name: "Paprika", category: "Spices",
    per100g: { calories: 282, protein: 14.1, carbs: 53.9, fat: 12.9, fiber: 34.9, sugar: 10.3, sodium: 68 },
    units: { tsp: 2.3, tbsp: 6.9 } },

  { id: "dried_basil", name: "Dried basil", category: "Spices",
    per100g: { calories: 233, protein: 23, carbs: 47.8, fat: 4.1, fiber: 37.7, sugar: 1.7, sodium: 76 },
    units: { tsp: 1.4, tbsp: 4.2 } },

  { id: "dried_oregano", name: "Dried oregano", category: "Spices",
    per100g: { calories: 265, protein: 9, carbs: 68.9, fat: 4.3, fiber: 42.5, sugar: 4.1, sodium: 25 },
    units: { tsp: 1.5, tbsp: 4.5 } },

  { id: "dried_thyme", name: "Dried thyme", category: "Spices",
    per100g: { calories: 276, protein: 9.1, carbs: 63.9, fat: 7.4, fiber: 37, sugar: 1.7, sodium: 55 },
    units: { tsp: 1.4, tbsp: 4.2, sprig: 1, each: 0.5 } },

  { id: "dried_rosemary", name: "Dried rosemary", category: "Spices",
    per100g: { calories: 331, protein: 4.9, carbs: 64.1, fat: 15.2, fiber: 42.6, sugar: 0, sodium: 50 },
    units: { tsp: 1.2, tbsp: 3.6, sprig: 1 } },

  { id: "dill", name: "Dill, fresh", category: "Produce",
    per100g: { calories: 43, protein: 3.5, carbs: 7, fat: 1.1, fiber: 2.1, sugar: 0, sodium: 61 },
    units: { tbsp: 1, tsp: 0.3 } },

  { id: "ground_coriander", name: "Coriander, ground", category: "Spices",
    per100g: { calories: 298, protein: 12.4, carbs: 54.9, fat: 17.8, fiber: 41.9, sugar: 0, sodium: 35 },
    units: { tsp: 1.8, tbsp: 5.4 } },

  { id: "curry_powder", name: "Curry powder", category: "Spices",
    per100g: { calories: 325, protein: 14.3, carbs: 55.8, fat: 14, fiber: 33.2, sugar: 2.8, sodium: 52 },
    units: { tsp: 2, tbsp: 6 } },

  { id: "basil_fresh", name: "Basil, fresh", category: "Produce",
    per100g: { calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6, fiber: 1.6, sugar: 0.3, sodium: 4 },
    units: { cup: 21, tbsp: 1.3 } },

  { id: "cardamom", name: "Cardamom, ground", category: "Spices",
    per100g: { calories: 311, protein: 10.8, carbs: 68.5, fat: 6.7, fiber: 28, sugar: 0, sodium: 18 },
    units: { tsp: 2, tbsp: 6 } },

  { id: "nutmeg", name: "Nutmeg, ground", category: "Spices",
    per100g: { calories: 525, protein: 5.8, carbs: 49.3, fat: 36, fiber: 20.8, sugar: 2.8, sodium: 16 },
    units: { tsp: 2.2, tbsp: 6.6 } },

  { id: "onion_powder", name: "Onion powder", category: "Spices",
    per100g: { calories: 341, protein: 10.4, carbs: 79.1, fat: 1, fiber: 15.2, sugar: 6.6, sodium: 73 },
    units: { tsp: 2.4, tbsp: 7.2 } },

  { id: "garlic_powder", name: "Garlic powder", category: "Spices",
    per100g: { calories: 331, protein: 16.6, carbs: 72.7, fat: 0.7, fiber: 9, sugar: 2.4, sodium: 60 },
    units: { tsp: 3.1, tbsp: 9.3 } },

  { id: "italian_seasoning", name: "Italian seasoning", category: "Spices",
    per100g: { calories: 265, protein: 9, carbs: 64, fat: 8, fiber: 35, sugar: 2, sodium: 30 },
    units: { tsp: 1.4, tbsp: 4.2 } },

  { id: "cajun_seasoning", name: "Cajun seasoning", category: "Spices",
    per100g: { calories: 280, protein: 8, carbs: 55, fat: 8, fiber: 20, sugar: 2, sodium: 5000 },
    units: { tsp: 2.6, tbsp: 7.8 } },

  { id: "curry_leaves_generic", name: "Mixed dried herbs", category: "Spices",
    per100g: { calories: 250, protein: 9, carbs: 60, fat: 5, fiber: 35, sugar: 2, sodium: 40 },
    units: { tsp: 1.5, tbsp: 4.5 } },

  { id: "olives_black", name: "Black olives", category: "Produce",
    per100g: { calories: 115, protein: 0.8, carbs: 6, fat: 10.7, fiber: 3.2, sugar: 0, sodium: 735 },
    units: { cup: 134, tbsp: 8.4 } },

  { id: "olives_green", name: "Green olives", category: "Produce",
    per100g: { calories: 145, protein: 1, carbs: 3.8, fat: 15.3, fiber: 3.3, sugar: 0.5, sodium: 1556 },
    units: { cup: 134, tbsp: 8.4 } },

  { id: "broth", name: "Broth (beef/chicken/vegetable)", category: "Other",
    per100g: { calories: 7, protein: 0.8, carbs: 0.9, fat: 0.2, fiber: 0, sugar: 0.4, sodium: 350 },
    units: { cup: 240, tbsp: 15 } },

  { id: "cayenne_pepper", name: "Cayenne pepper", category: "Spices",
    per100g: { calories: 318, protein: 12, carbs: 56.6, fat: 17.3, fiber: 27.2, sugar: 10.3, sodium: 30 },
    units: { tsp: 1.8, tbsp: 5.4, dash: 0.2 } },

  { id: "chicken_thigh", name: "Chicken thigh, boneless skinless, raw", category: "Meat & Poultry",
    per100g: { calories: 209, protein: 17.9, carbs: 0, fat: 14.7, fiber: 0, sugar: 0, sodium: 77 },
    units: {} },

  { id: "chicken_breast_cooked", name: "Chicken breast, cooked", category: "Meat & Poultry",
    per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 },
    units: {} },

  { id: "pasta_cooked", name: "Pasta, cooked", category: "Grains",
    per100g: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sugar: 0.6, sodium: 1 },
    units: { cup: 140 } },

  { id: "lemon_juice", name: "Lemon juice", category: "Produce",
    per100g: { calories: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fiber: 0.3, sugar: 2.5, sodium: 1 },
    units: { tbsp: 15, tsp: 5, cup: 240 } },

  { id: "lime_juice", name: "Lime juice", category: "Produce",
    per100g: { calories: 25, protein: 0.4, carbs: 8.4, fat: 0.2, fiber: 0.4, sugar: 1.7, sodium: 1 },
    units: { tbsp: 15, tsp: 5, cup: 240 } },

  { id: "marshmallows", name: "Marshmallows", category: "Baking",
    per100g: { calories: 318, protein: 1.8, carbs: 81.3, fat: 0.2, fiber: 0.1, sugar: 57.4, sodium: 80 },
    units: { cup: 50, tbsp: 7, each: 7 } },

  { id: "mint", name: "Mint, fresh", category: "Produce",
    per100g: { calories: 70, protein: 3.8, carbs: 14.9, fat: 0.9, fiber: 8, sugar: 0, sodium: 31 },
    units: { tbsp: 3, cup: 48 } },

  { id: "green_onion", name: "Green onion / scallion", category: "Produce",
    per100g: { calories: 32, protein: 1.8, carbs: 7.3, fat: 0.2, fiber: 2.6, sugar: 2.3, sodium: 16 },
    units: { tbsp: 6, cup: 100, each: 15 } },

  { id: "orange", name: "Orange", category: "Produce",
    per100g: { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0 },
    units: { each: 131, cup: 180 } },

  { id: "vodka", name: "Vodka", category: "Other",
    per100g: { calories: 231, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
    units: { tbsp: 14, cup: 225 } },

  { id: "turmeric", name: "Turmeric, ground", category: "Spices",
    per100g: { calories: 312, protein: 12.7, carbs: 67.1, fat: 3.3, fiber: 22.7, sugar: 3.2, sodium: 38 },
    units: { tsp: 2.2, tbsp: 6.8, inch: 15 } },

  { id: "apple_cider_vinegar", name: "Apple cider vinegar", category: "Condiments",
    per100g: { calories: 21, protein: 0, carbs: 0.9, fat: 0, fiber: 0, sugar: 0.4, sodium: 5 },
    units: { tbsp: 15, tsp: 5, cup: 240 } },

  { id: "black_pepper", name: "Black pepper, ground", category: "Spices",
    per100g: { calories: 251, protein: 10.4, carbs: 63.9, fat: 3.3, fiber: 26.5, sugar: 0.6, sodium: 20 },
    units: { tsp: 2.3, tbsp: 6.9, pinch: 0.14 } },

  { id: "chia_seeds", name: "Chia seeds", category: "Nuts & Seeds",
    per100g: { calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, sugar: 0, sodium: 16 },
    units: { tbsp: 12, cup: 168, tsp: 4 } },

  { id: "parsley", name: "Parsley, fresh", category: "Produce",
    per100g: { calories: 36, protein: 3, carbs: 6.3, fat: 0.8, fiber: 3.3, sugar: 0.9, sodium: 56 },
    units: { tbsp: 3.8, cup: 60 } },
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
  },

  /* ---- Imported from user's cookbook (146 recipes) ---- */

  {
    id: "classic_morning_wellness_shot_the_original",
    name: "Classic Morning Wellness Shot — The Original",
    emoji: "🧪",
    description: "The foundational recipe is designed for daily detoxification, providing a gentle morning start and overall wellness maintenance. It balances the acidity of apple cider vinegar with the warmth of ginger and the sweetness of raw honey.",
    baseServings: 5,
    servingLabel: "shots",
    ingredients: [
      { id: "water", quantity: 14, unit: "oz" },
      { id: "apple_cider_vinegar", quantity: 2, unit: "tbsp" },
      { id: "lemon_juice", quantity: 2, unit: "tbsp" },
      { id: "ginger", quantity: 0.5, unit: "tsp" },
      { id: "cinnamon", quantity: 0.25, unit: "tsp" },
      { id: "cayenne_pepper", quantity: 1, unit: "dash" },
      { id: "honey", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Warm the water (not boiling — warm enough to dissolve ingredients).",
      "Add all ingredients and stir well until honey dissolves.",
      "Drink first thing in the morning on an empty stomach.",
      "Take it as a shot or sip it slowly."
    ]
  },

  {
    id: "ginger_shot_viral_social_media_recipe",
    name: "Ginger Shot — Viral Social Media Recipe",
    emoji: "🧪",
    description: "This version is the most popular variation circulating on social media in 2026. It is highly concentrated, designed to be made in batches and stored for a quick, potent metabolic kickstart each morning.",
    baseServings: 5,
    servingLabel: "shots",
    ingredients: [
      { id: "ginger", quantity: 2, unit: "knob" },
      { id: "lemon", quantity: 1, unit: "each" },
      { id: "orange", quantity: 1, unit: "each" },
      { id: "apple_cider_vinegar", quantity: 0.25, unit: "cup" },
      { id: "cayenne_pepper", quantity: 0.5, unit: "tsp" },
      { id: "honey", quantity: 10, unit: "g" },
      { id: "water", quantity: 1.5, unit: "cup" }
    ],
    instructions: [
      "Roughly chop the ginger, lemon, and orange.",
      "Add all ingredients to a blender.",
      "Blend on high for 30–60 seconds until smooth.",
      "Strain through a fine mesh strainer or cheesecloth to remove pulp.",
      "Pour into a glass jar or bottle.",
      "Store in the refrigerator for up to 3–4 days.",
      "Shake well before each use. Take 1 shot (1–2 oz) first thing in the morning."
    ]
  },

  {
    id: "immunity_shot_cold_flu_defense",
    name: "Immunity Shot — Cold & Flu Defense",
    emoji: "🧪",
    description: "Specifically formulated to support the immune system, this shot utilizes the synergistic relationship between turmeric and black pepper to maximize anti-inflammatory benefits during seasonal changes.",
    baseServings: 5,
    servingLabel: "shots",
    ingredients: [
      { id: "ginger", quantity: 2, unit: "inch" },
      { id: "turmeric", quantity: 2, unit: "inch" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "lemon", quantity: 3, unit: "each" },
      { id: "orange", quantity: 1, unit: "each" },
      { id: "apple_cider_vinegar", quantity: 2, unit: "tbsp" },
      { id: "cayenne_pepper", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 1, unit: "pinch" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "water", quantity: 0.5, unit: "cup" }
    ],
    instructions: [
      "Peel and roughly chop the ginger and turmeric.",
      "Add all ingredients to a blender.",
      "Blend on high for 30–60 seconds until smooth.",
      "Strain through a fine mesh strainer or cheesecloth into a jar.",
      "Store in the refrigerator for up to 5 days.",
      "Shake well before each use. Take 1 shot (1–2 oz) first thing in the morning on an empty stomach."
    ]
  },

  {
    id: "weight_loss_shot_metabolism_boost",
    name: "Weight Loss Shot — Metabolism Boost",
    emoji: "🧪",
    description: "This variation focuses on ingredients known to support metabolic rate and blood sugar regulation. It is best consumed shortly before breakfast to prime the digestive system.",
    baseServings: 5,
    servingLabel: "shots",
    ingredients: [
      { id: "ginger", quantity: 2, unit: "inch" },
      { id: "lemon", quantity: 2, unit: "each" },
      { id: "apple_cider_vinegar", quantity: 3, unit: "tbsp" },
      { id: "cayenne_pepper", quantity: 0.25, unit: "tsp" },
      { id: "cinnamon", quantity: 0.5, unit: "tsp" },
      { id: "water", quantity: 1, unit: "cup" }
    ],
    instructions: [
      "Grate the ginger finely.",
      "Combine all ingredients in a jar or glass bottle.",
      "Stir or shake vigorously until well mixed.",
      "If using a blender, blend and strain for a smoother texture.",
      "Store in the refrigerator for up to 5 days.",
      "Take 1 shot (1–2 oz) 20–30 minutes before breakfast on an empty stomach."
    ]
  },

  {
    id: "energy_shot_natural_morning_wake_up",
    name: "Energy Shot — Natural Morning Wake-Up",
    emoji: "🧪",
    description: "Designed as a clean alternative to caffeine, this shot uses natural sugars and electrolytes to provide a steady energy release without the subsequent crash associated with coffee.",
    baseServings: 5,
    servingLabel: "shots",
    ingredients: [
      { id: "ginger", quantity: 2, unit: "inch" },
      { id: "lemon", quantity: 2, unit: "each" },
      { id: "apple", quantity: 1, unit: "each" },
      { id: "apple_cider_vinegar", quantity: 2, unit: "tbsp" },
      { id: "cayenne_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "honey", quantity: 1, unit: "tsp" },
      { id: "water", quantity: 0.5, unit: "cup" }
    ],
    instructions: [
      "Peel and chop the ginger. Core and chop the apple.",
      "Add all ingredients to a blender.",
      "Blend on high for 30–60 seconds.",
      "Strain through a fine mesh strainer or cheesecloth.",
      "Pour into a jar or bottle and refrigerate for up to 4 days.",
      "Take 1 shot (1–2 oz) first thing in the morning, or as a mid-afternoon pick-me-up."
    ]
  },

  {
    id: "eggs_avocado_breakfast_bowl",
    name: "Eggs & Avocado Breakfast Bowl",
    emoji: "🍳",
    description: "A nutrient-dense bowl focusing on healthy fats and iron absorption. Synergy: Eggs + Avocado (vitamin D + healthy fat), Spinach + Orange Juice Squeeze (iron + vitamin C), Avocado + Spinach (fat-soluble vitamin A)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg", quantity: 2, unit: "each" },
      { id: "avocado", quantity: 0.5, unit: "each" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "orange", quantity: 0.5, unit: "each" },
      { id: "quinoa_cooked", quantity: 0.25, unit: "cup" },
      { id: "pumpkin_seeds", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Hard-boil eggs: place in boiling water, cook for 9 min, transfer to ice water. Peel and halve.",
      "Place quinoa, spinach, and orange segments into a container.",
      "Top with avocado slices, halved eggs, and pumpkin seeds.",
      "Squeeze orange juice over spinach just before eating.",
      "Season with salt and pepper.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "greek_yogurt_berry_parfait",
    name: "Greek Yogurt & Berry Parfait",
    emoji: "🥣",
    description: "A probiotic-rich breakfast designed for gut health and sustained energy. Synergy: Yogurt + Honey (probiotic + prebiotic), Berries + Yogurt (antioxidants + probiotics), Flaxseeds + Yogurt (omega-3 + gut health)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "greek_yogurt", quantity: 1, unit: "cup" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "flaxseed", quantity: 1, unit: "tbsp" },
      { id: "rolled_oats", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "In a container, layer: ½ cup yogurt, berries, oats, another ½ cup yogurt.",
      "Top with remaining berries, drizzle with honey, and sprinkle flaxseeds.",
      "Seal tightly. Refrigerate for up to 4 days.",
      "Stir before eating. Add a splash of milk if too thick."
    ]
  },

  {
    id: "turmeric_scrambled_eggs",
    name: "Turmeric Scrambled Eggs",
    emoji: "🍳",
    description: "A powerful anti-inflammatory meal utilizing the piperine-curcumin connection. Synergy: Turmeric + Black Pepper (2000% curcumin absorption), Eggs + Kale (vitamin D + calcium), Black Pepper + Eggs (piperine + protein absorption)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg", quantity: 2, unit: "each" },
      { id: "kale", quantity: 2, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "turmeric", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "parmesan", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat oil/butter in a pan. Add garlic and kale. Sauté 3-4 min until wilted.",
      "Whisk eggs with turmeric, black pepper, and salt.",
      "Push kale to the side, pour eggs into the pan. Scramble gently.",
      "Mix kale into eggs.",
      "Top with Parmesan. (optional)",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "overnight_oats_with_cinnamon_berries_almond_butter",
    name: "Overnight Oats with Cinnamon, Berries & Almond Butter",
    emoji: "🥣",
    description: "A heart-healthy option that regulates blood sugar levels throughout the morning. Synergy: Cinnamon + Oats (blood sugar control, lower glycemic response), Berries + Oats (antioxidants + soluble fiber for heart health), Almond Butter + Oats (healthy fat + complex carbs for sustained energy)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "rolled_oats", quantity: 0.5, unit: "cup" },
      { id: "almond_milk", quantity: 0.75, unit: "cup" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "almond_butter", quantity: 1, unit: "tbsp" },
      { id: "cinnamon", quantity: 0.5, unit: "tsp" },
      { id: "chia_seeds", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "In a jar or container, combine oats, almond milk, cinnamon, and chia seeds.",
      "Stir well. Fold in berries.",
      "Top with a dollop of almond butter.",
      "Seal and refrigerate overnight (at least 6 hours).",
      "Keeps up to 5 days. Eat cold or warm for 30 seconds in the microwave."
    ]
  },

  {
    id: "smoked_salmon_cottage_cheese_plate",
    name: "Smoked Salmon & Cottage Cheese Plate",
    emoji: "🐟",
    description: "High-protein savory breakfast focusing on bone health and vitamin D. Synergy: Salmon + Lemon (vitamin D + vitamin C), Cottage Cheese + Black Pepper (calcium + piperine absorption), Dill + Salmon (antioxidant synergy)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "smoked_salmon", quantity: 3, unit: "oz" },
      { id: "cottage_cheese", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "dill", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "bread", quantity: 1, unit: "slice" }
    ],
    instructions: [
      "Toast bread/crispbread. Let cool.",
      "Arrange smoked salmon, cottage cheese, cucumber, and tomatoes on a plate or in a container.",
      "Drizzle lemon juice over salmon and vegetables.",
      "Sprinkle it with dill and black pepper.",
      "Keep toast/crispbread separate to stay crisp. Refrigerate for up to 3 days."
    ]
  },

  {
    id: "sweet_potato_black_bean_breakfast_hash",
    name: "Sweet Potato & Black Bean Breakfast Hash",
    emoji: "🍽️",
    description: "A fiber-rich plant-based hash that optimizes iron and beta-carotene uptake. Synergy: Sweet Potato + Avocado (beta-carotene + healthy fat), Black Beans + Lime (iron + vitamin C), Bell Pepper + Black Beans (vitamin C + iron), Avocado + Lime (fat-soluble nutrients)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "sweet_potato", quantity: 1, unit: "cup" },
      { id: "black_beans", quantity: 0.5, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 0.25, unit: "tsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "lime_juice", quantity: 1, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Roast sweet potato cubes with olive oil, cumin, chili powder, and salt at 400°F for 20-25 min.",
      "In a pan, warm black beans and bell pepper for 2-3 min.",
      "Fry or poach the egg to your preference.",
      "Assemble: sweet potato base, black bean mixture, egg on top, avocado slices.",
      "Finish with lime juice and cilantro.",
      "Egg is best when added fresh in the morning. Reheat the assembled bowl altogether.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "green_smoothie_prep_pack",
    name: "Green Smoothie Prep Pack",
    emoji: "🥤",
    description: "The ultimate convenience meal for rapid nutrient delivery. Synergy: Spinach + Banana (iron + vitamin C), Chia Seeds + Almond Milk (omega-3 + calcium), Banana + Chia (potassium + fiber for heart health)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "banana", quantity: 1, unit: "each" },
      { id: "chia_seeds", quantity: 1, unit: "tbsp" },
      { id: "almond_butter", quantity: 1, unit: "tbsp" },
      { id: "almond_milk", quantity: 0.5, unit: "cup" },
      { id: "water", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "In a freezer bag or container, combine: spinach, banana (sliced), chia seeds, and almond butter.",
      "Seal and freeze for up to 3 months.",
      "Morning of: empty bag into blender, add almond milk and ice. Blend 30-45 seconds until smooth.",
      "Pour into a jar or bottle and go."
    ]
  },

  {
    id: "mashed_avocado_egg_toast",
    name: "Mashed Avocado & Egg Toast",
    emoji: "🍳",
    description: "A classic pairing enhanced by lycopene-fat synergy. Synergy: Avocado + Tomato (healthy fat + lycopene absorption), Egg + Avocado (vitamin D + fat), Tomato + Olive Oil (lycopene absorption), Egg + Black Pepper (protein + piperine)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "bread", quantity: 1, unit: "slice" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "avocado", quantity: 0.5, unit: "each" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 0.5, unit: "tbsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Toast bread until golden",
      "Mash avocado with a pinch of salt and spread on toast.",
      "Cook the egg to preference (fried or poached).",
      "Place egg on avocado toast. Top with cherry tomatoes.",
      "Drizzle with olive oil, season with red pepper flakes and black pepper.",
      "For meal prep: keep bread separate, reheat the egg 20 seconds, assemble fresh. Best within 2 days."
    ]
  },

  {
    id: "blueberry_almond_oatmeal_bowl",
    name: "Blueberry Almond Oatmeal Bowl",
    emoji: "🍚",
    description: "A warm, hearty oatmeal bowl with antioxidant-rich blueberries and healthy fats from almonds. Ready in 10 minutes. Synergy: Oats + almonds (stable energy, lower cholesterol), Blueberries + cinnamon (blood sugar control, anti-inflammatory), Blueberries + almonds = antioxidant synergy (vitamins C and E)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "rolled_oats", quantity: 0.5, unit: "cup" },
      { id: "almond_milk", quantity: 1, unit: "cup" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "almonds", quantity: 2, unit: "tbsp" },
      { id: "almond_butter", quantity: 1, unit: "tbsp" },
      { id: "maple_syrup", quantity: 1, unit: "tsp" },
      { id: "cinnamon", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "In a small saucepan, combine oats, almond milk, and salt. Bring to a gentle simmer over medium heat.",
      "Reduce heat to low and cook for 5-7 minutes, stirring occasionally, until oats are thick and creamy.",
      "Remove from heat and stir in half the blueberries, cinnamon, and maple syrup.",
      "Transfer to a bowl. Top with remaining blueberries, sliced almonds, and a drizzle of almond butter.",
      "Serve warm. Can also be prepped overnight for a cold version."
    ]
  },

  {
    id: "tofu_bell_pepper_breakfast_scramble",
    name: "Tofu & Bell Pepper Breakfast Scramble",
    emoji: "🍽️",
    description: "A high-protein vegan scramble with maximum antioxidant bioavailability. Synergy: Tofu + Bell Pepper (iron + vitamin C), Turmeric + Black Pepper (2000% absorption), Spinach + Olive Oil (fat-soluble vitamin K + A), Tofu + Black Pepper (protein + piperine)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "tofu_firm", quantity: 0.5, unit: "each" },
      { id: "bell_pepper", quantity: 0.5, unit: "cup" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "turmeric", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "onion_powder", quantity: 0.25, unit: "tsp" },
      { id: "nutritional_yeast", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Heat olive oil in a skillet over medium heat.",
      "Add garlic and bell pepper. Cook for 3 min until softened.",
      "Crumble tofu into the pan. Add turmeric, black pepper, salt, onion powder, and nutritional yeast.",
      "Cook 5-7 min, stirring occasionally, until tofu is heated through and slightly golden.",
      "Add spinach and cook 1-2 min until wilted.",
      "Eat right away or refrigerate for up to 4 days."
    ]
  },

  {
    id: "banana_split_overnight_oats",
    name: "Banana Split Overnight Oats",
    emoji: "🥣",
    description: "Because who said you can't have a banana split for breakfast? This one tastes like dessert but fuels you like a champ. It combines the creaminess of oats with the classic flavors of a sundae, providing a high-fiber start to your day.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "rolled_oats", quantity: 0.5, unit: "cup" },
      { id: "almond_milk", quantity: 0.75, unit: "cup" },
      { id: "banana", quantity: 0.5, unit: "each" },
      { id: "chocolate_chips", quantity: 1, unit: "tbsp" },
      { id: "almond_butter", quantity: 1, unit: "tbsp" },
      { id: "honey", quantity: 0.5, unit: "tbsp" },
      { id: "walnuts", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "In a jar, combine oats, almond milk, honey, and salt. Stir well.",
      "Top with banana slices, chocolate chips, almond butter drizzle, and walnuts.",
      "Seal and refrigerate overnight (at least 6 hours).",
      "Keeps up to 5 days. Eat cold or microwave for 30 seconds."
    ]
  },

  {
    id: "peanut_butter_jelly_smoothie_bowl",
    name: "Peanut Butter & Jelly Smoothie Bowl",
    emoji: "🥤",
    description: "Your childhood favorite, now in breakfast form. Creamy, nostalgic, and loaded with protein. By prepping the dry and frozen ingredients ahead of time, you can have a fresh smoothie bowl in under a minute.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "banana", quantity: 1, unit: "each" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "peanut_butter", quantity: 1, unit: "tbsp" },
      { id: "almond_milk", quantity: 0.5, unit: "cup" },
      { id: "chia_seeds", quantity: 1, unit: "tbsp" },
      { id: "granola", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "In a freezer bag, combine: sliced banana, mixed berries, and chia seeds.",
      "Freeze for up to 3 months.",
      "Morning of: empty bag into blender, add peanut butter and almond milk. Blend 30-45 seconds.",
      "Pour into a bowl, top with granola. Eat immediately."
    ]
  },

  {
    id: "pizza_egg_muffins",
    name: "\"Pizza\" Egg Muffins",
    emoji: "🍳",
    description: "Egg muffins that taste like pizza? Yes, please. Meal prep heaven — make once, grab all week. These are perfect for those who prefer a savory start to their morning without the heavy carbs of a traditional crust.",
    baseServings: 1,
    servingLabel: "serving (2 muffins)",
    ingredients: [
      { id: "egg", quantity: 2, unit: "each" },
      { id: "mozzarella_cheese", quantity: 2, unit: "tbsp" },
      { id: "tomato_sauce", quantity: 1, unit: "tbsp" },
      { id: "pepperoni", quantity: 5, unit: "each" },
      { id: "italian_seasoning", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 350°F. Grease a muffin tin (8 holes for 4 servings).",
      "In a bowl, whisk eggs with Italian seasoning, salt, and pepper.",
      "Divide egg mixture evenly among muffin cups.",
      "Top each with a dollop of tomato sauce, cheese, and pepperonis.",
      "Bake for 12-15 min until set and golden.",
      "Let cool, store in the fridge. Reheat 20-30 seconds in the microwave.",
      "Keeps up to 5 days."
    ]
  },

  {
    id: "bacon_egg_cheese_croissant_sandwich_with_hash_brow",
    name: "Bacon Egg & Cheese Croissant Sandwich with Hash Browns",
    emoji: "🍳",
    description: "A fast-food style breakfast sandwich — buttery croissant, crispy bacon, melted cheese, and golden hash browns on the side. Over 1,000 calories of pure indulgence.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "bread", quantity: 1, unit: "each" },
      { id: "bacon", quantity: 4, unit: "slice" },
      { id: "egg", quantity: 2, unit: "each" },
      { id: "cheddar_cheese", quantity: 2, unit: "slice" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "potato", quantity: 1, unit: "cup" },
      { id: "vegetable_oil", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "mayonnaise", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook bacon in a skillet over medium heat until crispy, about 6-8 minutes. Transfer to paper towels.",
      "In the same skillet with 1 tbsp bacon fat or butter, cook the eggs sunny-side up or over-easy until whites are set but yolk is still runny. Season with salt and pepper.",
      "In a separate skillet, heat oil over medium-high heat. Spread hash browns in an even layer and cook 4-5 minutes per side until golden and crispy. Season with salt and pepper.",
      "Slice the croissant in half and toast lightly in the skillet or toaster.",
      "Assemble: place cheese on the bottom half, add bacon, then the egg. Spread mayo on the top half if using.",
      "Serve immediately with hash browns on the side."
    ]
  },

  {
    id: "breakfast_tacos",
    name: "Breakfast Tacos",
    emoji: "🌮",
    description: "Tacos for breakfast. Need I say more? These reheat beautifully and make mornings feel like a party. The combination of protein-rich eggs and fiber-filled black beans keeps you full until lunch.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "corn_tortilla", quantity: 2, unit: "each" },
      { id: "egg", quantity: 2, unit: "each" },
      { id: "black_beans", quantity: 0.25, unit: "cup" },
      { id: "cheddar_cheese", quantity: 2, unit: "tbsp" },
      { id: "salsa", quantity: 2, unit: "tbsp" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Scramble eggs with a pinch of salt and pepper.",
      "Warm black beans in a small pan.",
      "Assemble tacos: tortilla, eggs, beans, cheese, salsa, avocado, cilantro.",
      "For meal prep: keep tortillas separate. Store fillings in one container.",
      "Add avocado and salsa the day of.",
      "Reheat fillings 30-45 seconds, assemble in tortillas fresh.",
      "Keeps up to 4 days."
    ]
  },

  {
    id: "cookie_dough_protein_bites",
    name: "Cookie Dough Protein Bites",
    emoji: "🍪",
    description: "Tastes exactly like raw cookie dough — but healthy enough for breakfast. Zero baking required. These are the ultimate solution for the busiest mornings when you need to eat while heading out the door.",
    baseServings: 4,
    servingLabel: "servings (16 bites)",
    ingredients: [
      { id: "rolled_oats", quantity: 1, unit: "cup" },
      { id: "peanut_butter", quantity: 0.5, unit: "cup" },
      { id: "honey", quantity: 0.25, unit: "cup" },
      { id: "chocolate_chips", quantity: 0.25, unit: "cup" },
      { id: "protein_powder", quantity: 0.25, unit: "cup" },
      { id: "flaxseed", quantity: 2, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "milk", quantity: 2.5, unit: "tbsp" }
    ],
    instructions: [
      "Mix all dry ingredients in a bowl: oats, protein powder, flaxseed, chocolate chips, salt.",
      "Add peanut butter, honey, and vanilla. Mix until combined.",
      "If too dry, add milk 1 tbsp at a time until dough holds together.",
      "Roll into 16 bite-sized balls.",
      "Refrigerate in an airtight container. Keeps up to 2 weeks.",
      "Grab 4 for breakfast. No reheating needed."
    ]
  },

  {
    id: "cinnamon_roll_baked_oatmeal",
    name: "\"Cinnamon Roll\" Baked Oatmeal",
    emoji: "🥣",
    description: "Gooey, cinnamon-swirled, and topped with a light glaze. Tastes like a cinnamon roll — acts like oatmeal. This baked version provides a cake-like texture that is much more indulgent than standard stovetop oats.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "rolled_oats", quantity: 0.5, unit: "cup" },
      { id: "almond_milk", quantity: 0.5, unit: "cup" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "coconut_oil", quantity: 1, unit: "tbsp" },
      { id: "cinnamon", quantity: 1, unit: "tsp" },
      { id: "vanilla_extract", quantity: 0.5, unit: "tsp" },
      { id: "pecans", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "cinnamon", quantity: 0.25, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 375°F. Grease a small baking dish or muffin tin.",
      "Mix oats, almond milk, maple syrup, melted oil, cinnamon, and vanilla.",
      "Pour into a baking dish.",
      "Make swirl: mix melted butter, maple syrup, and cinnamon. Dollop over oat mixture and swirl with a knife.",
      "Top with pecans.",
      "Bake 20-25 min until set and golden."
    ]
  },

  {
    id: "drizzle_glaze_greek_yogurt_maple_syrup_on_top_if_u",
    name: "Drizzle glaze (Greek yogurt + maple syrup) on top if using.",
    emoji: "🥣",
    description: "6. Let cool and then serve. 7. Refrigerate for up to 5 days. Reheat for 30 seconds or until warm. 8. Savory French Toast with Bacon Sweet and savory in every bite. The salty bacon + sweet maple + custardy bread combo is unbeatable. This recipe elevates a weekend staple into a convenient weekday meal prep option.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "bread", quantity: 2, unit: "slice" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "milk", quantity: 2, unit: "tbsp" },
      { id: "cinnamon", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "bacon", quantity: 2, unit: "strip" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Whisk egg, milk, cinnamon, and salt.",
      "Dip bread slices in egg mixture, letting them soak 15 seconds per side.",
      "Cook in a buttered skillet 2-3 min per side until golden.",
      "Top with crumbled bacon and maple syrup.",
      "For meal prep: cook French toast and bacon. Store separately.",
      "Reheat French toast in a toaster or microwave for 20-30 seconds. Add bacon and syrup fresh.",
      "Keeps up to 4 days."
    ]
  },

  {
    id: "loaded_belgian_waffle",
    name: "Loaded Belgian Waffle",
    emoji: "🥞",
    description: "A classic indulgence — crispy, fluffy, and loaded with toppings. Best reserved for weekends or special occasions.",
    baseServings: 1,
    servingLabel: "serving (2 waffles)",
    ingredients: [
      { id: "flour", quantity: 1.5, unit: "cup" },
      { id: "granulated_sugar", quantity: 2, unit: "tbsp" },
      { id: "baking_powder", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "milk", quantity: 1.5, unit: "cup" },
      { id: "butter", quantity: 0.3333, unit: "cup" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "maple_syrup", quantity: 2, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "whipped_cream", quantity: 0.25, unit: "cup" },
      { id: "chocolate_chips", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Preheat waffle iron.",
      "In a large bowl, whisk flour, sugar, baking powder, and salt.",
      "In a separate bowl, whisk egg, milk, melted butter, and vanilla.",
      "Pour wet ingredients into dry and stir until just combined (lumps are fine).",
      "Pour batter into waffle iron and cook until golden and crisp.",
      "Top with butter pat, drizzle maple syrup, add whipped cream, and finish with chocolate chips."
    ]
  },

  {
    id: "loaded_nacho_breakfast_bowl",
    name: "Loaded Nacho Breakfast Bowl",
    emoji: "🍚",
    description: "All the flavors of nachos — for breakfast. It works. Trust me. This bowl is a powerhouse of nutrients, combining complex carbohydrates from sweet potatoes with healthy fats from avocado.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg", quantity: 1, unit: "each" },
      { id: "sweet_potato", quantity: 1, unit: "cup" },
      { id: "black_beans", quantity: 0.25, unit: "cup" },
      { id: "corn", quantity: 0.25, unit: "cup" },
      { id: "cheddar_cheese", quantity: 2, unit: "tbsp" },
      { id: "salsa", quantity: 2, unit: "tbsp" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "sour_cream", quantity: 1, unit: "tbsp" },
      { id: "tortilla_chips", quantity: 11, unit: "each" },
      { id: "cilantro", quantity: 1, unit: "tbsp" },
      { id: "hot_sauce", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Roast sweet potato cubes at 400°F for 20 min with olive oil, salt, cumin, and chili powder.",
      "Warm black beans and corn in a skillet.",
      "Fry or scramble egg to preference.",
      "Assemble bowl: sweet potatoes, black beans, corn, egg, cheese, salsa, avocado, sour cream, crushed chips.",
      "For meal prep: store all components in one container. Keep chips separate for crunch.",
      "Reheat 1 min, add chips and fresh toppings.",
      "Keeps up to 4 days."
    ]
  },

  {
    id: "beef_broccoli_stir_fry_with_brown_rice",
    name: "Beef & Broccoli Stir-Fry with Brown Rice",
    emoji: "🍚",
    description: "This meal utilizes the classic pairing of Beef and Broccoli to maximize iron absorption. The Vitamin C in the broccoli helps the body process the heme iron found in the beef. Additionally, the inclusion of Turmeric and Black Pepper provides a potent anti-inflammatory boost, while the combination of Rice and Edamame ensures a complete amino acid profile.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_beef", quantity: 5, unit: "oz" },
      { id: "broccoli", quantity: 2, unit: "cup" },
      { id: "brown_rice_cooked", quantity: 0.75, unit: "cup" },
      { id: "edamame", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "turmeric", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "soy_sauce", quantity: 2, unit: "tbsp" },
      { id: "sesame_seeds", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Marinate beef slices in soy sauce, ginger, garlic, turmeric, and black pepper for 15 min.",
      "Heat olive oil in a pan over high heat. Cook beef for 2-3 min until browned. Remove and set aside.",
      "In the same pan, add broccoli and 2 tbsp water. Cover and steam for 2 min.",
      "Add edamame and return beef to the pan. Stir for 1 min.",
      "Serve over brown rice. Top with sesame seeds.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "steak_sweet_potato_bowl_with_chimichurri",
    name: "Steak & Sweet Potato Bowl with Chimichurri",
    emoji: "🍚",
    description: "This bowl focuses on fat-soluble vitamin absorption. The healthy fats from the avocado and olive oil are essential for the body to absorb the beta-carotene found in the sweet potatoes. The chimichurri adds a layer of immune-boosting garlic and fresh herbs to the high-quality protein of the steak.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "beef_sirloin", quantity: 5, unit: "oz" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "arugula", quantity: 1, unit: "cup" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "black_beans", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 0.5, unit: "each" },
      { id: "olive_oil", quantity: 1.5, unit: "tbsp" },
      { id: "red_wine_vinegar", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Toss sweet potato cubes with 1 tsp olive oil, salt, and pepper. Roast for 20-25 min.",
      "Season steak with salt and pepper. Sear in a hot pan with 1 tbsp olive oil for 3-4 min per side. Let rest for 5 min, then slice.",
      "Mix all chimichurri ingredients in a small bowl.",
      "Assemble: arugula base, roasted sweet potato, black beans, sliced avocado, and steak.",
      "Drizzle chimichurri on top.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "mediterranean_lentil_bell_pepper_bowl",
    name: "Mediterranean Lentil & Bell Pepper Bowl",
    emoji: "🍚",
    description: "Lentils are an excellent source of plant-based iron, but they require Vitamin C to be fully absorbed. The red bell peppers in this recipe provide that necessary catalyst. The addition of Greek yogurt provides probiotics, which work in tandem with the prebiotic fiber in the lentils for optimal gut health.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lentils_cooked", quantity: 1, unit: "cup" },
      { id: "bell_pepper", quantity: 1, unit: "each" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "feta_cheese", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "greek_yogurt", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "Cook lentils according to package directions. Let cool.",
      "Whisk olive oil, lemon juice, garlic, salt, and pepper for the vinaigrette.",
      "Toss spinach, bell pepper, and tomatoes with the vinaigrette.",
      "Top with lentils and feta cheese.",
      "Mix Greek yogurt with honey for a side dressing.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "chickpea_spinach_power_salad",
    name: "Chickpea & Spinach Power Salad",
    emoji: "🥗",
    description: "This salad is a nutrient powerhouse that pairs Chickpeas and Lemon for iron bioavailability. The Tomato and Olive Oil combination ensures the lycopene is absorbed, while the carrots and black pepper work together to enhance beta-carotene uptake.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chickpeas", quantity: 1, unit: "cup" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "cup" },
      { id: "carrots", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1.5, unit: "tbsp" },
      { id: "pumpkin_seeds", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Whisk olive oil, lemon juice, garlic, cumin, salt, and pepper for the dressing.",
      "Combine spinach, chickpeas, tomatoes, cucumber, carrots, and red onion.",
      "Toss with the dressing until well coated.",
      "Top with pumpkin seeds and optional feta cheese.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "salmon_kale_caesar_with_sweet_potato",
    name: "Salmon & Kale Caesar with Sweet Potato",
    emoji: "🐟",
    description: "This meal focuses on bone health by pairing Vitamin D from the salmon with the calcium found in kale. The healthy fats in the salmon and the Caesar dressing further assist in the absorption of the Vitamin A (beta-carotene) provided by the roasted sweet potatoes.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "salmon_fillet", quantity: 5, unit: "oz" },
      { id: "kale", quantity: 2, unit: "cup" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "caesar_dressing", quantity: 2, unit: "tbsp" },
      { id: "pumpkin_seeds", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Roast sweet potato cubes at 400°F for 20 min with olive oil.",
      "Bake salmon at 400°F for 12-15 min seasoned with garlic powder and salt.",
      "Massage kale with olive oil and lemon juice to soften the fibers.",
      "Assemble: kale base, sweet potato, salmon, egg, and pumpkin seeds.",
      "Refrigerate for up to 3 days."
    ]
  },

  {
    id: "greek_chicken_salad",
    name: "Greek Chicken Salad",
    emoji: "🥗",
    description: "The Greek Chicken Salad utilizes the synergy between lean protein and citrus. The lemon juice in the dressing helps the body utilize the iron in the chicken breast. The healthy fats from the olives and olive oil ensure that the antioxidants in the tomatoes and cucumbers are fully utilized.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 5, unit: "oz" },
      { id: "romaine_lettuce", quantity: 2, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "olives_black", quantity: 0.25, unit: "cup" },
      { id: "feta_cheese", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1.5, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tsp" },
      { id: "garlic", quantity: 0.5, unit: "each" }
    ],
    instructions: [
      "Grill or pan-sear chicken breast until it reaches 165°F. Let rest, then dice.",
      "Whisk the dressing ingredients together.",
      "Combine romaine, tomatoes, cucumber, onion, and olives.",
      "Top with chicken and feta.",
      "Keep dressing separate until serving."
    ]
  },

  {
    id: "lemon_herb_chicken_with_roasted_veggies",
    name: "Lemon Herb Chicken with Roasted Veggies",
    emoji: "🍳",
    description: "This sheet-pan meal is designed for maximum efficiency. The Chicken and Broccoli pairing provides high-quality protein alongside sulforaphane, a powerful compound in broccoli that is activated by the heat and the presence of mustard or lemon.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 5, unit: "oz" },
      { id: "broccoli", quantity: 1, unit: "cup" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Whisk olive oil, lemon juice, and spices.",
      "Toss chicken and sweet potato in the mixture.",
      "Place on a sheet pan; add broccoli florets around the chicken.",
      "Roast for 25-30 min until chicken is cooked through.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "black_bean_salsa_burrito_bowl",
    name: "Black Bean & Salsa Burrito Bowl",
    emoji: "🌮",
    description: "This vegetarian-friendly option creates a complete protein by combining black beans and brown rice. The Vitamin C in the fresh salsa unlocks the iron in the beans, while the avocado provides the healthy fats needed for lycopene absorption from the tomatoes.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "black_beans", quantity: 1, unit: "cup" },
      { id: "brown_rice_cooked", quantity: 0.75, unit: "cup" },
      { id: "salsa", quantity: 0.5, unit: "cup" },
      { id: "avocado", quantity: 0.5, unit: "each" },
      { id: "romaine_lettuce", quantity: 1, unit: "cup" },
      { id: "greek_yogurt", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Toss black beans with cumin, chili powder, cinnamon, and salt.",
      "Layer rice, beans, salsa, greens, and avocado in a container.",
      "Add a dollop of Greek yogurt and a squeeze of lime.",
      "Garnish with cilantro.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "turmeric_chicken_thighs_with_roasted_veggies",
    name: "Turmeric Chicken Thighs with Roasted Veggies",
    emoji: "🍳",
    description: "This meal features the most powerful synergy in our guide: Turmeric and Black Pepper. The piperine in the pepper increases the absorption of turmeric's curcumin by up to 2000%. The addition of mustard to the broccoli further activates its anticancer properties.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_thigh", quantity: 5, unit: "oz" },
      { id: "broccoli", quantity: 1, unit: "cup" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "turmeric", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "honey", quantity: 1, unit: "tsp" },
      { id: "dijon_mustard", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Mix olive oil, turmeric, pepper, garlic powder, honey, and mustard.",
      "Toss chicken and sweet potato in the mixture.",
      "Roast on a sheet pan with broccoli for 25-30 min.",
      "Serve with a lemon wedge.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "lemon_herb_chicken_thighs_with_roasted_broccoli",
    name: "Lemon Herb Chicken Thighs with Roasted Broccoli",
    emoji: "🍗",
    description: "Synergy: Chicken + Broccoli (protein + sulforaphane), Lemon + Greens (vitamin C + iron)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_thigh", quantity: 5, unit: "oz" },
      { id: "broccoli", quantity: 2, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Mix olive oil, lemon juice, garlic, oregano, salt, and pepper.",
      "Toss chicken and broccoli in the mixture.",
      "Spread on a sheet pan lined with parchment.",
      "Roast for 22-25 min until chicken reaches 165°F.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "lean_ground_beef_zucchini_skillet_with_black_beans",
    name: "Lean Ground Beef & Zucchini Skillet with Black Beans",
    emoji: "🥩",
    description: "Synergy: Black Beans + Lime (iron + vitamin C), Beef + Black Pepper (iron + piperine)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_beef", quantity: 5, unit: "oz" },
      { id: "zucchini", quantity: 1, unit: "each" },
      { id: "black_beans", quantity: 0.5, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 1, unit: "tsp" },
      { id: "chili_powder", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "lime_juice", quantity: 1, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat olive oil in a skillet over medium heat.",
      "Cook beef with cumin, chili powder, salt, and pepper until browned (6-7 min).",
      "Add zucchini and cook 3 min until tender.",
      "Stir in black beans and diced tomatoes. Cook for 2 min.",
      "Finish with lime juice and cilantro.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "chicken_breast_cauliflower_rice_stir_fry",
    name: "Chicken Breast & Cauliflower Rice Stir-Fry",
    emoji: "🍚",
    description: "Synergy: Chicken + Lemon (iron + vitamin C), Garlic + Ginger (anti-inflammatory)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 5, unit: "oz" },
      { id: "cauliflower_rice", quantity: 1.5, unit: "cup" },
      { id: "bell_pepper", quantity: 0.5, unit: "cup" },
      { id: "snap_peas", quantity: 0.5, unit: "cup" },
      { id: "green_onion", quantity: 2, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "soy_sauce", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat ½ tbsp oil in a large pan over medium-high heat.",
      "Cook diced chicken with a pinch of salt for 4-5 min until cooked through. Remove and set aside.",
      "Add remaining oil, garlic, ginger, bell pepper, and snap peas. Cook for 3 min.",
      "Add cauliflower rice and soy sauce. Cook for 4-5 min until tender.",
      "Return chicken to the pan, add lemon juice and green onions. Toss to combine.",
      "Plate and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "greek_chicken_salad_low_cal_version",
    name: "Greek Chicken Salad (Low-Cal Version)",
    emoji: "🥗",
    description: "Synergy: Chicken + Lemon (iron + vitamin C), Tomato + Olive Oil (lycopene absorption), Feta + Black Pepper (calcium + piperine)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 5, unit: "oz" },
      { id: "romaine_lettuce", quantity: 2, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 2, unit: "tbsp" },
      { id: "olives_black", quantity: 2, unit: "tbsp" },
      { id: "feta_cheese", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1.5, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Season chicken with salt, pepper, and oregano. Grill or pan-sear 6-7 min per side until 165°F. Let rest, then dice.",
      "Whisk dressing ingredients together.",
      "Toss romaine, tomatoes, cucumber, onion, and olives with dressing.",
      "Top with diced chicken and feta.",
      "Add dressing just before eating. Refrigerate for up to 4 days."
    ]
  },

  {
    id: "egg_roll_in_a_bowl_cabbage_pork",
    name: "Egg Roll in a Bowl (Cabbage & Pork)",
    emoji: "🍳",
    description: "Synergy: Cabbage + Ginger (anti-inflammatory), Pork + Garlic (immune support)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_pork", quantity: 4, unit: "oz" },
      { id: "cabbage", quantity: 2, unit: "cup" },
      { id: "carrots", quantity: 0.5, unit: "cup" },
      { id: "green_onion", quantity: 2, unit: "each" },
      { id: "sesame_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "soy_sauce", quantity: 1, unit: "tbsp" },
      { id: "rice_vinegar", quantity: 1, unit: "tsp" },
      { id: "sesame_seeds", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Heat sesame oil in a large skillet over medium-high heat.",
      "Cook pork with garlic and ginger for 5-6 min until browned. Break into crumbles.",
      "Add cabbage and carrots. Cook for 5-6 min until wilted.",
      "Stir in soy sauce and rice vinegar.",
      "Transfer to a bowl.",
      "Top with green onions and sesame seeds.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "salmon_with_asparagus_lemon",
    name: "Salmon with Asparagus & Lemon",
    emoji: "🐟",
    description: "Synergy: Salmon + Asparagus (vitamin D + folate), Lemon + Greens (vitamin C + iron)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "salmon_fillet", quantity: 5, unit: "oz" },
      { id: "asparagus", quantity: 1.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Mix olive oil, garlic, lemon juice, salt, and pepper.",
      "Place salmon and asparagus on a sheet pan. Brush with the mixture.",
      "Bake for 12-15 min until salmon flakes easily and asparagus is tender.",
      "Serve with lemon wedges.",
      "Refrigerate for up to 3 days."
    ]
  },

  {
    id: "chickpea_tuna_bowl_with_lemon_vinaigrette",
    name: "Chickpea & Tuna Bowl with Lemon Vinaigrette",
    emoji: "🍚",
    description: "Synergy: Chickpeas + Lemon (iron + vitamin C), Tuna + Black Pepper (protein + piperine), Spinach + Olive Oil (fat-soluble vitamins)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "tuna_canned", quantity: 3, unit: "oz" },
      { id: "chickpeas", quantity: 0.5, unit: "cup" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "dijon_mustard", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Whisk olive oil, lemon juice, mustard, salt, and pepper for dressing.",
      "In a bowl, combine spinach, cucumber, tomatoes, and chickpeas.",
      "Flake tuna on top.",
      "Drizzle with dressing and toss gently.",
      "Add dressing just before eating.",
      "Refrigerate for up to 3 days."
    ]
  },

  {
    id: "cauliflower_lentil_curry",
    name: "Cauliflower & Lentil Curry",
    emoji: "🍲",
    description: "Synergy: Lentils + Tomato (iron + vitamin C), Turmeric + Black Pepper (2000% absorption boost), Coconut + Curry (fat-soluble vitamin absorption)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "cauliflower_florets", quantity: 1, unit: "cup" },
      { id: "lentils_cooked", quantity: 0.5, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "coconut_milk_light", quantity: 0.5, unit: "cup" },
      { id: "spinach", quantity: 0.5, unit: "cup" },
      { id: "coconut_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "curry_powder", quantity: 1, unit: "tsp" },
      { id: "turmeric", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Heat coconut oil in a pot over medium heat. Cook garlic and ginger for 1 min.",
      "Add curry powder, turmeric, and black pepper. Stir for 30 seconds.",
      "Add cauliflower, tomatoes, and coconut milk. Simmer for 10 min or until the cauliflower is tender.",
      "Stir in cooked lentils and spinach. Cook for 2 min until spinach wilts.",
      "Season with salt and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "chicken_bell_pepper_fajita_bowls",
    name: "Chicken & Bell Pepper Fajita Bowls",
    emoji: "🍚",
    description: "Synergy: Chicken + Bell Pepper (protein + vitamin C), Black Beans + Lime (iron + vitamin C), Avocado + Tomato (lycopene + healthy fat)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 5, unit: "oz" },
      { id: "bell_pepper", quantity: 1, unit: "cup" },
      { id: "onion", quantity: 0.5, unit: "cup" },
      { id: "cauliflower_rice", quantity: 0.5, unit: "cup" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "chili_powder", quantity: 1, unit: "tsp" },
      { id: "cumin", quantity: 0.5, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "lime_juice", quantity: 1, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Toss chicken with chili powder, cumin, garlic powder, salt, and pepper.",
      "Heat olive oil in a skillet over high heat. Cook chicken 4-5 min until done. Remove.",
      "In the same pan, cook bell peppers and onion for 4-5 min until slightly charred.",
      "If using cauliflower rice, add to the pan and cook for 2 min.",
      "Return chicken to the pan. Add lime juice and toss.",
      "Top with avocado and cilantro.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "lean_ground_beef_spinach_stuffed_peppers",
    name: "Lean Ground Beef & Spinach Stuffed Peppers",
    emoji: "🥩",
    description: "Synergy: Beef + Spinach (iron + vitamin C), Bell Pepper + Tomato (vitamin C + lycopene), Turmeric + Black Pepper (anti-inflammatory)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_beef", quantity: 5, unit: "oz" },
      { id: "bell_pepper", quantity: 1, unit: "each" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "quinoa_cooked", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "onion_powder", quantity: 0.5, unit: "tsp" },
      { id: "turmeric", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "mozzarella_cheese", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Heat olive oil in a skillet. Cook beef with garlic, onion powder, turmeric, salt, and pepper for 5-6 min.",
      "Add spinach and tomatoes. Cook for 2 min until spinach wilts.",
      "Stir in cooked quinoa or cauliflower rice.",
      "Stuff mixture into pepper halves. Top with cheese if using.",
      "Place in a baking dish with ¼ cup water at the bottom.",
      "Bake for 20-25 min until peppers are tender.",
      "Let cool and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "garlic_butter_salmon_with_sweet_potato_mash_brocco",
    name: "Garlic Butter Salmon with Sweet Potato Mash & Broccoli",
    emoji: "🐟",
    description: "This meal provides a high-quality source of Omega-3 fatty acids and complex carbohydrates, essential for hormone production and sustained energy during heavy lifting sessions. The sweet potato mash offers a dense calorie source without the bloat of processed grains.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "salmon_fillet", quantity: 7, unit: "oz" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "broccoli", quantity: 1.5, unit: "cup" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Peel and cube sweet potato. Boil for 15 min until tender. Drain and mash with ½ tbsp butter, salt, and pepper.",
      "Place salmon on a sheet pan. Mix remaining butter with garlic and lemon juice. Brush over salmon.",
      "Toss broccoli with olive oil, salt, and pepper. Arrange around salmon.",
      "Bake salmon and broccoli 12-15 min until salmon flakes and broccoli is tender.",
      "Refrigerate for up to 3 days."
    ]
  },

  {
    id: "steak_pepper_stir_fry_with_brown_rice",
    name: "Steak & Pepper Stir-Fry with Brown Rice",
    emoji: "🍚",
    description: "Red meat is a natural source of creatine and zinc, both vital for muscle growth and testosterone support. Combined with brown rice, this stir-fry delivers a balanced macronutrient profile for post-workout recovery.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "beef_sirloin", quantity: 6, unit: "oz" },
      { id: "brown_rice_cooked", quantity: 1, unit: "cup" },
      { id: "bell_pepper", quantity: 1, unit: "cup" },
      { id: "snap_peas", quantity: 0.5, unit: "cup" },
      { id: "avocado_oil", quantity: 1, unit: "tbsp" },
      { id: "soy_sauce", quantity: 2, unit: "tbsp" },
      { id: "sesame_oil", quantity: 1, unit: "tsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "sesame_seeds", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Cook brown rice according to package directions.",
      "Heat avocado oil in a wok or large skillet over high heat.",
      "Sear steak strips 2-3 min until browned. Remove from the pan.",
      "Add garlic, ginger, bell peppers, and snap peas. Stir-fry 3 min.",
      "Return steak to pan. Add soy sauce and sesame oil. Toss 1 min.",
      "Serve over brown rice. Top with sesame seeds.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "chicken_alfredo_with_whole_wheat_pasta_spinach",
    name: "Chicken Alfredo with Whole Wheat Pasta & Spinach",
    emoji: "🍝",
    description: "A classic bulking favorite modified for better nutrient density. Whole wheat pasta provides more fiber and minerals than white pasta, while the lean chicken breast ensures a massive hit of protein to support muscle protein synthesis.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "pasta_cooked", quantity: 1, unit: "cup" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "heavy_cream", quantity: 0.25, unit: "cup" },
      { id: "parmesan", quantity: 2, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Season chicken with salt and pepper. Cook in a skillet over medium heat 6-7 min per side until internal temp reaches 165°F. Let rest, then slice.",
      "Cook pasta according to package directions. Reserve ¼ cup pasta water.",
      "In the same skillet, melt butter. Cook garlic for 30 seconds.",
      "Add heavy cream, Parmesan, and nutmeg. Stir until thickened, 2 min.",
      "Toss in spinach and cooked pasta. Add pasta water if needed for consistency.",
      "Top with sliced chicken and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "turkey_quinoa_stuffed_bell_peppers",
    name: "Turkey & Quinoa Stuffed Bell Peppers",
    emoji: "🍗",
    description: "Quinoa is a complete protein source, containing all nine essential amino acids. This meal is perfect for those looking for a lighter feel without sacrificing the high protein count required for strength gains.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_turkey", quantity: 6, unit: "oz" },
      { id: "bell_pepper", quantity: 1, unit: "each" },
      { id: "quinoa_cooked", quantity: 0.5, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.25, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 0.5, unit: "tsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Cook quinoa according to package directions.",
      "Heat olive oil in a skillet. Cook ground turkey with cumin, paprika, salt, and pepper until browned, 6-8 min.",
      "Mix cooked turkey, quinoa, and diced tomatoes in a bowl.",
      "Cut bell peppers in half lengthwise, remove seeds. Stuff each half with the turkey-quinoa mixture.",
      "Top with shredded mozzarella.",
      "Bake 20-25 min until peppers are tender and cheese is golden.",
      "Let cool and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "honey_soy_chicken_thighs_with_jasmine_rice_green_b",
    name: "Honey Soy Chicken Thighs with Jasmine Rice & Green Beans",
    emoji: "🍚",
    description: "Chicken thighs offer a higher calorie count and more micronutrients (like iron and zinc) than breasts, making them superior for a muscle-building phase. Jasmine rice is easily digestible, making this an excellent pre-training meal.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_thigh", quantity: 6, unit: "oz" },
      { id: "rice_cooked", quantity: 1, unit: "cup" },
      { id: "green_beans", quantity: 1.5, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "soy_sauce", quantity: 2, unit: "tbsp" },
      { id: "rice_vinegar", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "sesame_oil", quantity: 1, unit: "tsp" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "avocado_oil", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Whisk honey, soy sauce, rice vinegar, garlic, ginger, and sesame oil for the marinade.",
      "Marinate chicken thighs in half the mixture for at least 30 min.",
      "Cook jasmine rice according to package directions.",
      "Heat avocado oil in a skillet over medium-high heat.",
      "Cook chicken thighs 5-6 min per side until internal temp reaches 165°F. Let rest for 5 min, then slice.",
      "Steam or blanch green beans 3-4 min until tender-crisp.",
      "Drizzle remaining marinade over chicken and rice and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "beef_bean_chili_with_avocado_sour_cream",
    name: "Beef & Bean Chili with Avocado & Sour Cream",
    emoji: "🍲",
    description: "This fiber-dense meal supports gut health, which is often overlooked during high-calorie diets. The combination of beef and beans provides a sustained release of amino acids into the bloodstream.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_beef", quantity: 6, unit: "oz" },
      { id: "kidney_beans", quantity: 0.5, unit: "cup" },
      { id: "black_beans", quantity: 0.5, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "chili_powder", quantity: 1, unit: "tsp" },
      { id: "cumin", quantity: 0.5, unit: "tsp" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "sour_cream", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat olive oil in a pot over medium heat. Cook onion and garlic for 3 min.",
      "Add ground beef. Cook until browned, 6-8 min. Drain excess fat.",
      "Add chili powder, cumin, smoked paprika, salt, and pepper.",
      "Add kidney beans, black beans, and diced tomatoes. Simmer for 15-20 min.",
      "Top with avocado and sour cream before serving.",
      "Refrigerate for up to 5 days."
    ]
  },

  {
    id: "lemon_herb_chicken_thighs_with_roasted_potatoes_as",
    name: "Lemon Herb Chicken Thighs with Roasted Potatoes & Asparagus",
    emoji: "🍗",
    description: "Potatoes are one of the most satiating carbohydrate sources available. This meal is high in potassium, which helps with muscle contractions and prevents cramping during intense lifting sessions.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_thigh", quantity: 6, unit: "oz" },
      { id: "potato", quantity: 1, unit: "cup" },
      { id: "asparagus", quantity: 1.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Toss baby potatoes with ½ tbsp olive oil, salt, and pepper. Roast 15 min.",
      "Season chicken thighs with oregano, garlic powder, salt, pepper, and lemon juice.",
      "Push potatoes to one side. Add chicken and asparagus. Drizzle asparagus with remaining oil.",
      "Roast 20-25 min until chicken reaches 165°F.",
      "Let the chicken rest and serve",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "shrimp_sausage_jambalaya_with_brown_rice",
    name: "Shrimp & Sausage Jambalaya with Brown Rice",
    emoji: "🍚",
    description: "Shrimp is an incredibly lean protein source, allowing for the addition of flavorful andouille sausage to hit calorie targets without excessive saturated fat. The spices used here can also help with metabolic health.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "shrimp", quantity: 4, unit: "oz" },
      { id: "italian_sausage", quantity: 2, unit: "oz" },
      { id: "brown_rice_cooked", quantity: 1, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "celery", quantity: 0.25, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cajun_seasoning", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Cook brown rice according to package directions.",
      "Heat olive oil in a large pot. Cook sausage slices 3 min until browned. Remove.",
      "Cook onion, bell pepper, celery, and garlic for 4 min.",
      "Add diced tomatoes and Cajun seasoning. Simmer for 5 min.",
      "Add shrimp and cooked sausage. Cook for 4-5 min until the shrimp is pink.",
      "Stir in cooked brown rice. Heat through 2 min.",
      "Top with green onion and serve.",
      "Refrigerate for up to 3 days."
    ]
  },

  {
    id: "peanut_chicken_buddha_bowl",
    name: "Peanut Chicken Buddha Bowl",
    emoji: "🍚",
    description: "Healthy fats from peanut butter and avocado are essential for maintaining hormonal health during a muscle-building phase. This bowl is nutrient-dense and provides a variety of textures to prevent meal prep fatigue.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "quinoa_cooked", quantity: 0.5, unit: "cup" },
      { id: "edamame", quantity: 0.5, unit: "cup" },
      { id: "carrots", quantity: 0.5, unit: "cup" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "peanut_butter", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Season chicken with salt and pepper. Grill or pan-sear 6-7 min per side. Let rest, then slice.",
      "Cook quinoa according to package directions.",
      "Whisk peanut butter, soy sauce, rice vinegar, honey, and sesame oil for the sauce.",
      "Assemble bowl: spinach, quinoa, chicken, edamame, carrots, and avocado.",
      "Drizzle peanut sauce over top and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "ground_beef_sweet_potato_shepherd_s_pie",
    name: "Ground Beef & Sweet Potato Shepherd's Pie",
    emoji: "🥩",
    description: "A comfort food staple reimagined for performance. The sweet potato topping provides a lower glycemic index alternative to white potatoes, ensuring steady energy levels throughout the day.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lean_ground_beef", quantity: 6, unit: "oz" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "carrots", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "broth", quantity: 1, unit: "cup" },
      { id: "tomato_paste", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Boil sweet potato for 15 min. Drain and mash with butter, salt, and pepper.",
      "Preheat the oven to 375°F.",
      "Cook onion and garlic in a skillet. Add ground beef and cook until browned.",
      "Stir in tomato paste, thyme, peas and carrots, and broth. Simmer for 5 min.",
      "Place beef mixture into an oven safe container. Top with mashed sweet potato.",
      "Bake for 20 min until the top is slightly golden.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "loaded_breakfast_burrito_bowl",
    name: "Loaded Breakfast Burrito Bowl",
    emoji: "🌮",
    description: "A hearty loaded burrito bowl packed with scrambled eggs, black beans, melted cheese, pico de gallo, and a drizzle of crema for a satisfying, flavor-packed meal at any time of the day.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg", quantity: 2, unit: "each" },
      { id: "rice_cooked", quantity: 0.5, unit: "cup" },
      { id: "black_beans", quantity: 0.25, unit: "cup" },
      { id: "cheddar_cheese", quantity: 0.25, unit: "cup" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "sour_cream", quantity: 2, unit: "tbsp" },
      { id: "salsa", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook rice according to package directions.",
      "Scramble eggs with cumin, salt, and pepper in olive oil.",
      "Warm black beans in a small pan.",
      "Assemble bowl: rice, eggs, black beans, cheese, avocado, sour cream, salsa.",
      "Garnish with cilantro.",
      "Refrigerate for up to 4 days. Add avocado fresh the day of or keep it fresh in the fridge by adding a squeeze of lime."
    ]
  },

  {
    id: "peanut_butter_banana_overnight_oats_with_protein",
    name: "Peanut Butter & Banana Overnight Oats with Protein",
    emoji: "🥣",
    description: "Creamy, protein-packed overnight oats swirled with rich peanut butter for a make-ahead breakfast that tastes like an indulgent dessert but fuels your body with lasting energy all morning. Also can be a great mid-day snack.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "rolled_oats", quantity: 0.5, unit: "cup" },
      { id: "milk", quantity: 0.75, unit: "cup" },
      { id: "protein_powder", quantity: 1, unit: "each" },
      { id: "peanut_butter", quantity: 1, unit: "tbsp" },
      { id: "banana", quantity: 0.5, unit: "each" },
      { id: "chia_seeds", quantity: 1, unit: "tbsp" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "walnuts", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "In a jar, combine oats, milk, protein powder, chia seeds, and honey. Stir well.",
      "Top with peanut butter, banana slices, and walnuts.",
      "Seal and refrigerate overnight (at least 6 hours).",
      "Keeps up to 5 days. Eat cold or microwave for 30 seconds."
    ]
  },

  {
    id: "chicken_rice_casserole",
    name: "Chicken & Rice Casserole",
    emoji: "🍚",
    description: "Tender pieces of chicken and fluffy rice are baked in a rich, creamy sauce until golden and bubbly, creating a hearty, comforting classic that is perfect for a cozy weeknight dinner.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_thigh", quantity: 7, unit: "oz" },
      { id: "rice_cooked", quantity: 1, unit: "cup" },
      { id: "heavy_cream", quantity: 0.25, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Season chicken thighs with paprika, salt, and pepper. Sear in butter 4-6 min per side until golden.",
      "Cook rice according to package directions.",
      "In a baking dish, combine cooked rice, heavy cream, onion, garlic, and half the mozzarella.",
      "Place chicken thighs on top. Sprinkle remaining mozzarella.",
      "Bake 20-25 min until chicken reaches 165°F and top is golden.",
      "Garnish with parsley and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "creamy_beef_potato_skillet",
    name: "Creamy Beef & Potato Skillet",
    emoji: "🥩",
    description: "Tender seasoned beef and hearty potatoes simmered in a rich, creamy sauce until thick and savory for a comforting one-skillet meal.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 6, unit: "oz" },
      { id: "potato", quantity: 1, unit: "cup" },
      { id: "heavy_cream", quantity: 0.25, unit: "cup" },
      { id: "cheddar_cheese", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "green_onion", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Boil baby potatoes for 10 min until fork-tender. Drain.",
      "Melt butter in a skillet. Cook onion and garlic for 2 min.",
      "Add ground beef. Cook until browned, 6-8 min.",
      "Add potatoes, heavy cream, smoked paprika, salt, and pepper. Simmer for 5 min until the sauce thickens.",
      "Top with cheddar cheese. Cover and let melt for 2 min.",
      "Garnish with chives and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "salmon_avocado_bowl_with_quinoa_tahini",
    name: "Salmon & Avocado Bowl with Quinoa & Tahini",
    emoji: "🍚",
    description: "Flakey salmon, creamy avocado, and fluffy quinoa come together in a fresh, vibrant bowl packed with protein and healthy fats for a nourishing meal that's as satisfying as it is wholesome.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "salmon_fillet", quantity: 7, unit: "oz" },
      { id: "quinoa_cooked", quantity: 0.5, unit: "cup" },
      { id: "avocado", quantity: 0.5, unit: "each" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "chickpeas", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "lemon", quantity: 0.5, unit: "each" },
      { id: "tahini", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "honey", quantity: 1, unit: "tsp" },
      { id: "water", quantity: 1.5, unit: "tbsp" }
    ],
    instructions: [
      "Season salmon with salt, pepper, and olive oil. Bake at 400°F for 12-15 min.",
      "Cook quinoa according to package directions.",
      "Whisk all tahini dressing ingredients together.",
      "Assemble bowl: spinach, quinoa, salmon, avocado, chickpeas.",
      "Drizzle with tahini dressing and squeeze lemon.",
      "Refrigerate for up to 3 days. Keep avocado fresh with extra lemon juice or add the day of."
    ]
  },

  {
    id: "pork_loin_with_garlic_butter_sweet_potato_mash_roa",
    name: "Pork Loin with Garlic Butter Sweet Potato Mash & Roasted Veggies",
    emoji: "🍳",
    description: "Juicy, tender pork loin served over creamy sweet potato mash alongside caramelized roasted vegetables for a hearty, well-balanced meal that's both comforting and elegant.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pork_loin", quantity: 6, unit: "oz" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "broccoli", quantity: 1, unit: "cup" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "dried_rosemary", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Peel and cube sweet potato. Boil for 15 min until tender. Drain and mash with butter, garlic, salt, and pepper.",
      "Season pork loin with rosemary, salt, and pepper. Sear in olive oil 4 min per side. Finish in the oven at 400°F for 10-12 min until internal temp reaches 145°F. Let rest for 5 min, then slice.",
      "Toss broccoli with olive oil, salt, and pepper. Roast at 400°F for 12-15 min.",
      "Assemble: sweet potato mash, sliced pork, roasted broccoli.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "chicken_alfredo_bake_with_garlic_bread",
    name: "Chicken Alfredo Bake with Garlic Bread",
    emoji: "🍗",
    description: "Tender chicken and pasta baked in a rich, creamy Alfredo sauce until golden and bubbly, served alongside warm, buttery garlic bread for an ultra-indulgent, high-calorie comfort food feast that satisfies every craving.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "pasta_cooked", quantity: 1, unit: "cup" },
      { id: "heavy_cream", quantity: 0.25, unit: "cup" },
      { id: "parmesan", quantity: 3, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "mozzarella_cheese", quantity: 0.25, unit: "cup" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "bread", quantity: 1, unit: "slice" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook penne according to package directions. Drain.",
      "Season chicken with salt and pepper. Pan-sear for 6-7 min per side until 165°F. Let rest, then dice.",
      "In a skillet, melt butter. Cook garlic for 30 seconds.",
      "Add heavy cream and Parmesan. Stir until thickened, 2-3 min.",
      "Toss pasta with sauce and diced chicken. Transfer to a baking dish.",
      "Top with mozzarella. Bake at 375°F for 12 min until bubbly.",
      "Toast garlic bread alongside.",
      "Let cool and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "lamb_lentil_stew_with_brown_rice",
    name: "Lamb & Lentil Stew with Brown Rice",
    emoji: "🍲",
    description: "Tender, slow-braised lamb and earthy lentils simmered together with aromatic herbs and vegetables in a rich, hearty broth for a deeply comforting and nourishing one-pot meal.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "lamb", quantity: 6, unit: "oz" },
      { id: "brown_rice_cooked", quantity: 0.5, unit: "cup" },
      { id: "lentils_cooked", quantity: 0.5, unit: "cup" },
      { id: "carrots", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "broth", quantity: 1, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 0.5, unit: "tsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "mint", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook brown rice and lentils according to package directions.",
      "Heat olive oil in a pot. Brown lamb on all sides, 5-6 min. Remove.",
      "Cook onion, garlic, and carrots 4 min until softened.",
      "Return lamb to pot. Add broth, cumin, paprika, salt, and pepper. Simmer for 20 min.",
      "Stir in cooked lentils. Simmer for 5 more min.",
      "Serve over brown rice. Garnish with mint or parsley.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "turkey_avocado_club_sandwich_with_sweet_potato_fri",
    name: "Turkey & Avocado Club Sandwich with Sweet Potato Fries",
    emoji: "🍗",
    description: "Crispy sweet potato fries piled alongside a hearty turkey and avocado club sandwich stacked with fresh lettuce, tomato, and crispy bacon between toasted bread for a satisfying, flavor-packed meal that hits every crave.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "turkey_breast_sliced", quantity: 4, unit: "oz" },
      { id: "bread", quantity: 2, unit: "slice" },
      { id: "avocado", quantity: 0.25, unit: "each" },
      { id: "provolone_cheese", quantity: 1, unit: "slice" },
      { id: "bacon", quantity: 2, unit: "slice" },
      { id: "mayonnaise", quantity: 1, unit: "tbsp" },
      { id: "arugula", quantity: 0.25, unit: "cup" },
      { id: "sweet_potato", quantity: 1, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "paprika", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 425°F.",
      "Cut sweet potato into fries. Toss with olive oil, paprika, and salt. Roast 25-30 min, flipping halfway.",
      "Toast bread slices. Spread mayonnaise on one side.",
      "Assemble sandwich: bread, turkey, cheese, bacon, avocado, arugula, second bread slice.",
      "For meal prep: store sandwich components separately. Assemble fresh.",
      "Reheat fries in the oven or air fryer 5 min.",
      "Sandwich keeps 3 days if assembled. Keep fries separate and reheat."
    ]
  },

  {
    id: "nut_dried_fruit_trail_mix_with_greek_yogurt_bowl",
    name: "Nut & Dried Fruit Trail Mix with Greek Yogurt Bowl",
    emoji: "🍚",
    description: "Creamy yogurt loaded with chewy dried fruit and crunchy trail mix for a satisfying, protein-packed, high calorie bowl that delivers a sweet and salty crunch in every spoonful.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "greek_yogurt", quantity: 1, unit: "cup" },
      { id: "mixed_nuts", quantity: 0.25, unit: "cup" },
      { id: "dried_fruit_mix", quantity: 2, unit: "tbsp" },
      { id: "granola", quantity: 0.25, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "chia_seeds", quantity: 1, unit: "tbsp" },
      { id: "banana", quantity: 0.5, unit: "each" },
      { id: "peanut_butter", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "In a container, layer: Greek yogurt, sliced banana, granola.",
      "Top with mixed nuts, dried fruits, chia seeds, and a drizzle of peanut butter and honey.",
      "Seal tightly. Refrigerate for up to 4 days.",
      "Stir before eating. Add a splash of milk if too thick."
    ]
  },

  {
    id: "classic_spaghetti_bolognese",
    name: "Classic Spaghetti Bolognese",
    emoji: "🍝",
    description: "No description needed for this one. The perfect meal for any night of the week.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "lean_ground_beef", quantity: 5, unit: "oz" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "dried_basil", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "parmesan", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook spaghetti according to package directions. Drain, reserving ¼ cup pasta water.",
      "Heat olive oil in a skillet over medium heat. Cook onion and garlic for 3 min until softened.",
      "Add ground beef. Cook until browned, 6-8 min. Drain excess fat.",
      "Stir in crushed tomatoes, oregano, basil, salt, and pepper. Simmer for 10 min.",
      "Toss cooked spaghetti with sauce. Add pasta water if needed for consistency.",
      "Top with Parmesan and fresh basil.",
      "Refrigerate for up to 4 days. Wine Pairing: Chianti (Sangiovese) or Barbera Why: The high acidity in these Italian reds cuts through the richness of the beef and matches the acidity of the crushed tomatoes perfectly."
    ]
  },

  {
    id: "creamy_garlic_chicken_pasta",
    name: "Creamy Garlic Chicken Pasta",
    emoji: "🍝",
    description: "Tender chicken and al dente pasta tossed in a rich, velvety garlic cream sauce for a comforting, flavor-packed dish that's pure indulgence in every single bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "heavy_cream", quantity: 0.25, unit: "cup" },
      { id: "parmesan", quantity: 2, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook pasta according to package directions. Drain, reserving ¼ cup pasta water.",
      "Season chicken with salt and pepper. Cook in a skillet over medium heat 6-7 min per side until 165°F. Let rest, then slice.",
      "In the same skillet, melt butter. Cook garlic for 30 seconds.",
      "Add heavy cream, Parmesan, and red pepper flakes. Stir until thickened, 2-3 min.",
      "Toss pasta with sauce. Add pasta water if needed.",
      "Top with sliced chicken and parsley.",
      "Refrigerate for up to 4 days. Wine Pairing: Oaked Chardonnay or Viognier Why: A buttery, full-bodied Chardonnay complements the heavy cream and butter sauce, while its weight stands up to the chicken breast."
    ]
  },

  {
    id: "pesto_pasta_with_grilled_chicken_cherry_tomatoes",
    name: "Pesto Pasta with Grilled Chicken & Cherry Tomatoes",
    emoji: "🍝",
    description: "Pasta tossed in a fragrant basil pesto with tender grilled chicken for a fresh, vibrant meal that's as quick to make as it is satisfying.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "basil_pesto", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "pine_nuts", quantity: 1, unit: "tbsp" },
      { id: "basil_fresh", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook pasta according to package directions. Drain and let cool slightly.",
      "Season chicken with salt and pepper. Grill or pan-sear for 6-7 min per side until 165°F. Let rest, then dice.",
      "Toss warm pasta with pesto until evenly coated.",
      "Add diced chicken, cherry tomatoes, and pine nuts. Toss gently.",
      "Garnish with fresh basil and serve.",
      "Refrigerate for up to 4 days. Wine Pairing: Sauvignon Blanc or Vermentino Why: The herbal notes of the basil pesto are mirrored by the \"green\" characteristics of these crisp white wines."
    ]
  },

  {
    id: "shrimp_scampi_linguine",
    name: "Shrimp Scampi Linguine",
    emoji: "🍝",
    description: "Succulent shrimp sautéed in a luscious garlic butter and white wine sauce, finished with fresh lemon and parsley over a bed of tender linguine for a bright, flavorful seafood pasta that comes together in minutes.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "shrimp", quantity: 5, unit: "oz" },
      { id: "butter", quantity: 2, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "parsley", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Cook linguine according to package directions. Drain, reserving ¼ cup pasta water.",
      "Season shrimp with salt and pepper.",
      "Melt butter in a skillet over medium heat. Cook garlic for 30 seconds.",
      "Add shrimp. Cook 2-3 min per side until pink and opaque.",
      "Add lemon juice, red pepper flakes, and cooked pasta. Toss well. Add pasta water if needed.",
      "Garnish with parsley and serve with lemon wedges.",
      "Refrigerate for up to 3 days. Wine Pairing: Pinot Grigio or Assyrtiko Why: These are bone-dry, citrusy whites that enhance the lemon juice and garlic without overpowering the delicate shrimp."
    ]
  },

  {
    id: "penne_with_turkey_meatballs_tomato_basil_sauce",
    name: "Penne with Turkey Meatballs & Tomato Basil Sauce",
    emoji: "🍝",
    description: "Tender turkey meatballs and al dente pasta simmered in a rich tomato basil sauce for a wholesome, flavor-packed twist on a classic comfort dish that's every bit as satisfying as the original.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "turkey_meatballs", quantity: 3, unit: "each" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "dried_basil", quantity: 0.5, unit: "tsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "parmesan", quantity: 1, unit: "tbsp" },
      { id: "ground_turkey", quantity: 1, unit: "lb" },
      { id: "breadcrumbs", quantity: 0.25, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "parmesan", quantity: 2, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Make meatballs: mix all meatball ingredients. Form into 12 balls. Bake at 400°F for 15-18 min or until internal temp reaches 165°F.",
      "Cook penne according to package directions. Drain.",
      "Heat olive oil in a skillet. Cook garlic for 30 seconds.",
      "Add crushed tomatoes, basil, oregano, salt, and pepper. Simmer for 5 min.",
      "Add meatballs to the sauce. Simmer for 5 more min.",
      "Toss pasta with sauce and meatballs.",
      "Top with Parmesan and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "sage_butter_gnocchi_with_chicken",
    name: "Sage Butter Gnocchi with Chicken",
    emoji: "🍝",
    description: "Gnocchi and sliced chicken are tossed in a rich, nutty, sage butter sauce, for an aromatic dish that feels elegant yet comes together in minutes.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "gnocchi", quantity: 1, unit: "cup" },
      { id: "chicken_breast", quantity: 6, unit: "oz" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "dried_thyme", quantity: 4.5, unit: "each" },
      { id: "parmesan", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Cook gnocchi according to package directions (usually 2-3 min until they float). Drain",
      "Season chicken with salt and pepper. Pan-sear for 6-7 min per side until 165°F. Let rest, then slice.",
      "In the same skillet, melt butter over medium heat. Add sage leaves and cook 1-2 min until fragrant.",
      "Add cooked gnocchi to the skillet. Toss to coat in sage butter, 2 min.",
      "Serve gnocchi topped with sliced chicken and Parmesan.",
      "Refrigerate for up to 4 days. Wine Pairing: Soave or Chenin Blanc Why: The floral and honeyed notes of these whites pair beautifully with the earthiness of fried sage and the richness of melted butter."
    ]
  },

  {
    id: "gnocchi_with_pesto_cherry_tomatoes",
    name: "Gnocchi with Pesto & Cherry Tomatoes",
    emoji: "🍝",
    description: "Tender pillowy gnocchi tossed in vibrant basil pesto, for a simple yet indulgent dish that's bursting with fresh herb flavor in every bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "gnocchi", quantity: 1, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "basil_pesto", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "pine_nuts", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "basil_fresh", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook gnocchi according to package directions. Drain.",
      "Heat olive oil in a skillet. Add cherry tomatoes and cook 2-3 min until slightly blistered.",
      "Add cooked gnocchi and pesto. Toss until evenly coated.",
      "Top with pine nuts and fresh basil.",
      "Refrigerate for up to 4 days. Wine Pairing: Gavi (Cortese) or Dry Rosé Why: A crisp Gavi provides a clean finish to the oily pesto, while a Rosé adds a fruity contrast to the blistered cherry tomatoes."
    ]
  },

  {
    id: "gnocchi_alla_vodka",
    name: "Gnocchi alla Vodka",
    emoji: "🍝",
    description: "Gnocchi tossed in a rich, creamy tomato vodka sauce for a luxuriously smooth and flavorful dish that's pure comfort and a little fancy.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "gnocchi", quantity: 1, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.25, unit: "cup" },
      { id: "heavy_cream", quantity: 2, unit: "tbsp" },
      { id: "vodka", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "parmesan", quantity: 2, unit: "tbsp" },
      { id: "basil_fresh", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook gnocchi according to package directions. Drain.",
      "Melt butter in a skillet. Cook garlic and red pepper flakes for 30 seconds.",
      "Add vodka. Let simmer for 1 min until reduced.",
      "Add crushed tomatoes. Simmer for 5 min.",
      "Stir in heavy cream and Parmesan. Simmer for 2 min until the sauce thickens.",
      "Toss gnocchi in the sauce.",
      "Top with fresh basil and serve.",
      "Refrigerate for up to 4 days. Wine Pairing: Sangiovese-based Rosé or Etna Rosso Why: The creamy tomato sauce needs a wine with bright fruit and enough acidity to refresh the palate between bites."
    ]
  },

  {
    id: "gnocchi_with_sausage_spinach",
    name: "Gnocchi with Sausage & Spinach",
    emoji: "🍝",
    description: "Tender gnocchi tossed with crumbled Italian sausage and fresh spinach in a light garlic and Parmesan sauce for a rustic, hearty dish that's crispy, savory, and wonderfully satisfying.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "gnocchi", quantity: 1, unit: "cup" },
      { id: "italian_sausage", quantity: 3, unit: "oz" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "parmesan", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook gnocchi according to package directions. Drain.",
      "Heat olive oil in a skillet. Add sausage and cook, breaking it up, 5-6 min until browned.",
      "Add garlic and red pepper flakes. Cook for 30 seconds.",
      "Add spinach and cook 1-2 min until wilted.",
      "Toss in cooked gnocchi. Season with salt.",
      "Top with Parmesan and serve.",
      "Refrigerate for up to 4 days. Wine Pairing: Primitivo (Zinfandel) or Syrah Why: The spice and fat of the Italian sausage call for a more robust red with dark fruit flavors and a hint of spice."
    ]
  },

  {
    id: "baked_gnocchi_with_marinara_mozzarella",
    name: "Baked Gnocchi with Marinara & Mozzarella",
    emoji: "🍝",
    description: "Gnocchi baked in a rich marinara sauce until golden and bubbly, topped with melted mozzarella for a simple, comforting Italian-inspired dish that's pure cheesy perfection.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "gnocchi", quantity: 1, unit: "cup" },
      { id: "marinara_sauce", quantity: 0.5, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "basil_fresh", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook gnocchi 1 min less than package directions (they will finish in the oven).",
      "Heat olive oil in a skillet. Cook garlic for 30 seconds.",
      "Add marinara sauce, oregano, and salt. Simmer for 3 min.",
      "Toss gnocchi with sauce. Transfer to a baking dish.",
      "Top with shredded mozzarella.",
      "Bake at 375°F for 12-15 min until bubbly and golden.",
      "Top with fresh basil and serve.",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "italian_pasta_salad",
    name: "Italian Pasta Salad",
    emoji: "🥗",
    description: "A vibrant Italian pasta salad tossed with tender rotini, salami, mozzarella, and cherry tomatoes, in a zesty Italian vinaigrette for a colorful, crowd-pleasing dish that's perfect for picnics and potlucks.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "salami", quantity: 0.25, unit: "cup" },
      { id: "provolone_cheese", quantity: 0.25, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "cucumber", quantity: 0.25, unit: "cup" },
      { id: "olives_black", quantity: 2, unit: "tbsp" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1.5, unit: "tbsp" },
      { id: "red_wine_vinegar", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Cook pasta until al dente. Rinse under cold water to stop cooking. Drain well.",
      "In a large bowl, combine cooled pasta, salami, cheese, tomatoes, cucumber, olives, bell pepper, and red onion.",
      "Whisk dressing ingredients together. Pour over pasta salad and toss well.",
      "Refrigerate for up to 5 days."
    ]
  },

  {
    id: "greek_pasta_salad",
    name: "Greek Pasta Salad",
    emoji: "🥗",
    description: "A zesty and vibrant Greek pasta salad that's bursting with Mediterranean flavor in every single bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "feta_cheese", quantity: 0.25, unit: "cup" },
      { id: "cucumber", quantity: 0.25, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "olives_black", quantity: 2, unit: "tbsp" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 1.5, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Cook pasta until al dente. Rinse under cold water. Drain well.",
      "Combine cooled pasta, feta, cucumber, tomatoes, olives, red onion, and bell pepper.",
      "Whisk dressing ingredients. Pour over salad and toss.",
      "Refrigerate for up to 5 days."
    ]
  },

  {
    id: "chicken_caesar_pasta_salad",
    name: "Chicken Caesar Pasta Salad",
    emoji: "🥗",
    description: "A satisfying twist on a classic salad that's hearty enough to be a meal on its own.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "chicken_breast_cooked", quantity: 5, unit: "oz" },
      { id: "romaine_lettuce", quantity: 1, unit: "cup" },
      { id: "parmesan", quantity: 2, unit: "tbsp" },
      { id: "caesar_dressing", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 0.5, unit: "tbsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Cook pasta until al dente. Rinse under cold water. Drain well.",
      "In a bowl, combine cooled pasta, chicken, romaine, and Parmesan.",
      "Toss with Caesar dressing and lemon juice. Season with pepper.",
      "Add croutons just before eating. (Optional)",
      "Refrigerate for up to 4 days."
    ]
  },

  {
    id: "turkey_zucchini_lasagna",
    name: "Turkey & Zucchini Lasagna",
    emoji: "🍝",
    description: "Tender layers of seasoned ground turkey and thinly sliced zucchini baked between rich marinara, creamy béchamel, and melted mozzarella for a lighter yet equally satisfying twist on classic lasagna that's packed with flavor in every single bite.",
    baseServings: 6,
    servingLabel: "servings",
    ingredients: [
      { id: "ground_turkey", quantity: 1, unit: "lb" },
      { id: "zucchini", quantity: 3, unit: "each" },
      { id: "ricotta_cheese", quantity: 2, unit: "cup" },
      { id: "spinach", quantity: 2, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 1.5, unit: "cup" },
      { id: "parmesan", quantity: 0.5, unit: "cup" },
      { id: "marinara_sauce", quantity: 2, unit: "cup" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "dried_basil", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Slice zucchini into thin strips lengthwise. Lay on paper towels, sprinkle with salt, let sit for 15 min to draw out moisture. Pat dry.",
      "Heat olive oil spray in a skillet. Cook turkey with garlic, oregano, basil, salt, and pepper until browned, 8 min.",
      "Stir in marinara sauce. Simmer 5 min.",
      "In a bowl, mix ricotta, egg, Parmesan, and half the mozzarella.",
      "Preheat the oven to 375°F.",
      "Layer in a 9x13 dish: thin layer of sauce, zucchini strips, ricotta mixture, spinach, meat sauce. Repeat layers. Top with remaining mozzarella.",
      "Cover with foil. Bake for 35 min. Remove foil. Bake for 10 more min until bubbly and golden.",
      "Let rest 10 min before cutting into 6 portions.",
      "Refrigerate for up to 5 days."
    ]
  },

  {
    id: "classic_beef_lasagna",
    name: "Classic Beef Lasagna",
    emoji: "🍝",
    description: "Layers of tender pasta, seasoned ground beef, rich marinara, creamy béchamel, and melted mozzarella baked to golden bubbly perfection for the ultimate comfort food that's hearty, satisfying, and packed with flavor in every single bite.",
    baseServings: 6,
    servingLabel: "servings",
    ingredients: [
      { id: "lean_ground_beef", quantity: 1, unit: "lb" },
      { id: "pasta_dry", quantity: 9, unit: "each" },
      { id: "ricotta_cheese", quantity: 2, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 2, unit: "cup" },
      { id: "parmesan", quantity: 0.5, unit: "cup" },
      { id: "marinara_sauce", quantity: 3, unit: "cup" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "dried_basil", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "basil_fresh", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "If using regular lasagna noodles, cook according to package directions until al dente. Drain and lay flat on paper towels.",
      "Heat olive oil in a skillet. Cook garlic for 30 seconds. Add ground beef and cook until browned, 8 min. Drain excess fat.",
      "Stir in marinara sauce, oregano, basil, salt, and pepper. Simmer for 10 min.",
      "In a bowl, mix ricotta, egg, Parmesan, half the salt, and half the pepper.",
      "Preheat the oven to 375°F.",
      "Layer in a 9x13 dish: thin layer of meat sauce, noodles, ricotta mixture, mozzarella, meat sauce. Repeat 3 times. Top with remaining mozzarella and Parmesan.",
      "Cover with foil. Bake for 30 min. Remove foil. Bake 10-15 min until golden and bubbly.",
      "Let rest 10-15 min before cutting into 6 portions. Garnish with fresh basil.",
      "Refrigerate for up to 5 days."
    ]
  },

  {
    id: "lemon_butter_cod_with_green_beans_cherry_tomatoes",
    name: "Lemon Butter Cod with Green Beans & Cherry Tomatoes",
    emoji: "🐟",
    description: "Synergy: Fish + Lemon (vitamin D + vitamin C), Tomato + Olive Oil (lycopene absorption)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "cod_fillet", quantity: 6, unit: "oz" },
      { id: "green_beans", quantity: 1.5, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Place cod fillets on a sheet pan lined with parchment. Arrange green beans and tomatoes around them.",
      "Melt butter and mix with lemon juice, garlic, salt, and pepper. Drizzle over fish and vegetables.",
      "Bake for 12-15 min until fish flakes easily and beans are tender-crisp.",
      "Serve with lemon wedges.",
      "Refrigerate for up to 3 days. Wine Pairing: Muscadet or Vermentino Why: Saline and citrus notes complement the lemon butter and delicate cod."
    ]
  },

  {
    id: "mediterranean_baked_tilapia_with_couscous_tzatziki",
    name: "Mediterranean Baked Tilapia with Couscous & Tzatziki",
    emoji: "🐟",
    description: "Synergy: Fish + Lemon (vitamin D + vitamin C), Tomato + Olive Oil (lycopene absorption), Yogurt + Cucumber (probiotic)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "tilapia_fillet", quantity: 6, unit: "oz" },
      { id: "couscous_cooked", quantity: 0.5, unit: "cup" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.25, unit: "cup" },
      { id: "olives_black", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "greek_yogurt", quantity: 2, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tsp" },
      { id: "cucumber", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Place tilapia on a sheet pan. Drizzle with olive oil and season with oregano, salt, and pepper.",
      "Add cherry tomatoes and olives to the pan. Bake for 10-12 min until fish flakes easily.",
      "Meanwhile, cook couscous according to package directions.",
      "Mix tzatziki ingredients in a small bowl.",
      "Assemble: couscous base, flaked fish, tomatoes and olives, tzatziki on top.",
      "Serve immediately.",
      "Refrigerate for up to 3 days. Add tzatziki just before eating. Wine Pairing: Assyrtiko or Dry Furmint Why: High acidity and mineral backbone stand up to tzatziki and olives."
    ]
  },

  {
    id: "blackened_sea_bass_with_roasted_zucchini_bell_pepp",
    name: "Blackened Sea Bass with Roasted Zucchini & Bell Peppers",
    emoji: "🐟",
    description: "Synergy: Fish + Black Pepper (piperine activation), Bell Pepper + Olive Oil (vitamin C + fat-soluble vitamins)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "sea_bass_fillet", quantity: 6, unit: "oz" },
      { id: "zucchini", quantity: 1, unit: "each" },
      { id: "bell_pepper", quantity: 1, unit: "cup" },
      { id: "onion", quantity: 0.5, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "paprika", quantity: 1, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.5, unit: "tsp" },
      { id: "onion_powder", quantity: 0.5, unit: "tsp" },
      { id: "cayenne_pepper", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "paprika", quantity: 1, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.5, unit: "tsp" },
      { id: "onion_powder", quantity: 0.5, unit: "tsp" },
      { id: "cayenne_pepper", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 425°F.",
      "Mix all blackening spices together in a small bowl.",
      "Rub the spice mix generously over each fish fillet.",
      "Toss zucchini, bell peppers, and onion with olive oil and a pinch of salt.",
      "Spread vegetables on a sheet pan. Place seasoned fish fillets on top.",
      "Roast for 12-15 min until the fish is opaque and flakes easily.",
      "Serve with lemon wedges.",
      "Refrigerate for up to 3 days. Wine Pairing: Dry Riesling or Torrontés Why: Aromatic whites with a hint of fruitiness balance the heat and spices of the blackening rub."
    ]
  },

  {
    id: "coconut_lime_fish_curry_with_cauliflower_rice",
    name: "Coconut Lime Fish Curry with Cauliflower Rice",
    emoji: "🍲",
    description: "Synergy: Fish + Lime (vitamin D + vitamin C), Turmeric + Black Pepper (2000% absorption boost), Coconut + Ginger (anti-inflammatory)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "white_fish", quantity: 6, unit: "oz" },
      { id: "cauliflower_rice", quantity: 1.5, unit: "cup" },
      { id: "coconut_milk_light", quantity: 0.5, unit: "cup" },
      { id: "broth", quantity: 0.5, unit: "cup" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "coconut_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 1, unit: "tsp" },
      { id: "curry_powder", quantity: 1, unit: "tsp" },
      { id: "turmeric", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "lime_juice", quantity: 1, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat coconut oil in a pan over medium heat. Cook garlic and ginger for 1 min.",
      "Add curry powder, turmeric, and black pepper. Stir for 30 seconds.",
      "Pour in coconut milk and broth. Simmer for 3 min.",
      "Add fish chunks and cook 4-5 min until opaque and cooked through.",
      "Stir in spinach and cook for 1 min until wilted.",
      "Meanwhile, sauté cauliflower rice in a separate pan with a pinch of salt for 4-5 min.",
      "Assemble: cauliflower rice base, curry on top.",
      "Garnish with lime juice and cilantro.",
      "Refrigerate for up to 3 days. Wine Pairing: Gewürztraminer or Off-dry Riesling Why: Slight sweetness and spice notes harmonize with coconut milk, ginger, and curry spices."
    ]
  },

  {
    id: "pesto_white_fish_with_roasted_asparagus_chickpeas",
    name: "Pesto White Fish with Roasted Asparagus & Chickpeas",
    emoji: "🐟",
    description: "Synergy: Fish + Pesto (vitamin D + healthy fat + basil antioxidants), Chickpeas + Lemon (iron + vitamin C), Asparagus + Olive Oil (fat-soluble vitamins)",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "white_fish", quantity: 6, unit: "oz" },
      { id: "asparagus", quantity: 1.5, unit: "cup" },
      { id: "chickpeas", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "basil_fresh", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "pine_nuts", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "parmesan", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "If making pesto: blend basil, olive oil, nuts, garlic, Parmesan, and salt in a food processor until smooth.",
      "Place fish fillets on a sheet pan. Spread 1 tbsp pesto over each fillet.",
      "Arrange asparagus and chickpeas around the fish. Drizzle with olive oil and season with salt and pepper.",
      "Roast for 12-15 min until fish flakes easily and asparagus is tender.",
      "Serve with lemon wedges.",
      "Refrigerate for up to 3 days. Wine Pairing: Falanghina or Grüner Veltliner Why: Peppery and herbal characteristics match the pesto and asparagus."
    ]
  },

  {
    id: "pan_seared_ribeye_steak",
    name: "Pan-Seared Ribeye Steak",
    emoji: "🥩",
    description: "A perfectly seared ribeye steak with a rich, golden-brown crust and tender, juicy center, finished with butter and fresh herbs for a boldly flavorful, restaurant-quality meal that's pure carnivorous bliss.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "beef_ribeye", quantity: 8, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "each" },
      { id: "dried_rosemary", quantity: 1, unit: "sprig" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Remove steak from the refrigerator and let it rest at room temperature for 30 minutes.",
      "Pat steak dry with paper towels. Season generously with salt and pepper on all sides.",
      "Heat a cast iron skillet over high heat until smoking. Add olive oil.",
      "Place steak in the skillet and sear for 4 minutes without moving. Flip and sear another 4 minutes for medium-rare.",
      "Reduce heat to medium. Add butter, garlic, and rosemary. Tilt pan and baste the steak with melted butter for 1 minute.",
      "Remove steak from pan and let rest on a cutting board for 5 minutes before slicing.",
      "Slice against the grain and serve."
    ]
  },

  {
    id: "ground_beef_rice_skillet",
    name: "Ground Beef & Rice Skillet",
    emoji: "🍚",
    description: "A hearty ground beef and rice skillet cooked with savory seasonings, tender vegetables, and a touch of broth for a comforting one-pan meal that's quick, satisfying, and perfect for busy weeknights.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 8, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "rice_uncooked", quantity: 0.5, unit: "cup" },
      { id: "broth", quantity: 1, unit: "cup" },
      { id: "tomato_sauce", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.5, unit: "each" },
      { id: "garlic", quantity: 2, unit: "each" },
      { id: "paprika", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Heat olive oil in a skillet over medium-high heat. Add onion and cook until softened, about 3 minutes.",
      "Add ground beef and cook, breaking apart with a spoon, until browned (about 5 minutes). Drain excess fat if desired.",
      "Add garlic and paprika; cook for 1 minute until fragrant.",
      "Stir in rice, beef broth, and diced tomatoes. Bring to a boil.",
      "Reduce heat to low, cover, and simmer for 15–18 minutes until rice is tender and liquid is absorbed.",
      "Season with salt and pepper, fluff with a fork, and serve."
    ]
  },

  {
    id: "beef_stroganoff",
    name: "Beef Stroganoff",
    emoji: "🥩",
    description: "Tender strips of beef simmered in a rich, creamy mushroom and sour cream sauce, served over a bed of egg noodles or rice for a classic, comforting dish that's hearty, indulgent, and packed with savory flavor in every single bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "beef_sirloin", quantity: 6, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "mushrooms", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "each" },
      { id: "flour", quantity: 1, unit: "tbsp" },
      { id: "broth", quantity: 0.5, unit: "cup" },
      { id: "sour_cream", quantity: 0.25, unit: "cup" },
      { id: "dijon_mustard", quantity: 1, unit: "tsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Season steak strips with salt and pepper. Heat ½ tbsp olive oil in a large skillet over high heat.",
      "Sear beef strips for 1–2 minutes per side until browned but not fully cooked. Transfer to a plate and set aside.",
      "Reduce heat to medium. Add remaining oil and butter. Sauté mushrooms and onion until golden, about 4 minutes.",
      "Add garlic and cook for 30 seconds. Sprinkle flour over vegetables and stir for 1 minute.",
      "Pour in beef broth, stirring constantly, and simmer until thickened (about 2 minutes).",
      "Reduce heat to low. Stir in sour cream and Dijon mustard until smooth.",
      "Return beef strips to the skillet. Cook 1–2 minutes until heated through. Do not boil.",
      "Garnish with parsley. Serve over egg noodles or rice if desired."
    ]
  },

  {
    id: "classic_beef_burger",
    name: "Classic Beef Burger",
    emoji: "🥩",
    description: "A juicy beef patty seared to perfection, topped with melted cheddar cheese, crisp lettuce, ripe tomato, and onions for the ultimate classic burger experience.",
    baseServings: 1,
    servingLabel: "burger",
    ingredients: [
      { id: "ground_beef", quantity: 6, unit: "oz" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "bread", quantity: 1, unit: "each" },
      { id: "cheddar_cheese", quantity: 1, unit: "slice" },
      { id: "lettuce", quantity: 2, unit: "leaf" },
      { id: "tomato", quantity: 2, unit: "slice" },
      { id: "onion", quantity: 2, unit: "each" }
    ],
    instructions: [
      "Shape ground beef into a patty about ¾-inch thick. Press a small indent in the center to prevent doming.",
      "Season both sides with salt, pepper, and garlic powder.",
      "Heat a grill pan or skillet over high heat. Cook patty for 4 minutes on the first side.",
      "Flip, top with cheese, and cook for another 4 minutes for medium. (Adjust time for desired doneness.)",
      "While patty rests, toast the brioche bun in the pan until lightly golden.",
      "Assemble burger: bottom bun, lettuce, tomato, patty with cheese, onion, top bun.",
      "Serve immediately."
    ]
  },

  {
    id: "beef_tacos",
    name: "Beef Tacos",
    emoji: "🌮",
    description: "Juicy seasoned ground beef piled into warm corn or flour tortillas, topped with crisp lettuce, diced tomatoes, shredded cheddar cheese, and a dollop of sour cream for a classic, flavor-packed taco night favorite in every single bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 6, unit: "oz" },
      { id: "chili_powder", quantity: 1, unit: "tsp" },
      { id: "cumin", quantity: 0.5, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "corn_tortilla", quantity: 2, unit: "each" },
      { id: "lettuce", quantity: 0.5, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "cheddar_cheese", quantity: 2, unit: "tbsp" },
      { id: "sour_cream", quantity: 1, unit: "tbsp" },
      { id: "salsa", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Heat a skillet over medium-high heat. Add ground beef and cook, breaking apart, until browned (about 5 minutes).",
      "Drain excess fat. Add chili powder, cumin, garlic powder, and salt. Stir and cook for 1 minute. Add 2 tablespoons of water and let simmer until evaporated.",
      "Warm tortillas in a dry skillet or microwave for 15 seconds.",
      "Assemble tacos: fill each tortilla with beef, lettuce, tomato, cheese, sour cream, and salsa.",
      "Serve immediately."
    ]
  },

  {
    id: "sirloin_steak_with_garlic_butter_green_beans",
    name: "Sirloin Steak with Garlic Butter & Green Beans",
    emoji: "🥩",
    description: "A perfectly pan-seared sirloin steak topped with melting garlic herb butter, served alongside crisp, vibrant green beans for a mouthwatering and balanced meal.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "beef_sirloin", quantity: 6, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "each" },
      { id: "green_beans", quantity: 1, unit: "cup" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Pat steak dry and season with salt and pepper. Heat olive oil in a skillet over high heat.",
      "Sear steak for 4 minutes per side for medium-rare. Transfer to a plate and tent with foil; let rest for 5 minutes.",
      "Reduce heat to medium. Add butter and garlic to the same pan; cook for 30 seconds.",
      "Add green beans and cook, stirring often, for 4–5 minutes until tender-crisp and lightly charred. Season with salt and pepper.",
      "Slice steak against the grain.",
      "Serve with green beans."
    ]
  },

  {
    id: "mother_s_meatloaf",
    name: "Mother’s Meatloaf",
    emoji: "🥩",
    description: "A classic meatloaf, baked to perfection and glazed with a tangy tomato-based topping for a comforting, hearty centerpiece that's moist and flavorful. The perfect meal to remind you of home.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "ground_beef", quantity: 1.5, unit: "lb" },
      { id: "breadcrumbs", quantity: 0.5, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "milk", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 2, unit: "each" },
      { id: "worcestershire_sauce", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "ketchup", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "Preheat the oven to 350°F. Line a 9x5-inch loaf pan with parchment paper or grease lightly.",
      "In a large bowl, combine ground beef, breadcrumbs, egg, milk, onion, garlic, Worcestershire, salt, and pepper. Mix gently with your hands until just combined — do not overmix.",
      "Transfer mixture to the loaf pan and press into an even shape.",
      "Spread ketchup evenly over the top.",
      "Bake for 50–55 minutes until the internal temperature reaches 160°F (71°C) and the loaf is cooked through.",
      "Let rest in the pan for 10 minutes before slicing and serving."
    ]
  },

  {
    id: "beef_and_potato_hash",
    name: "Beef and Potato Hash",
    emoji: "🥩",
    description: "A hearty beef and potato hash, all cooked together in one skillet until perfectly browned and flavorful, finished with a sprinkle of fresh parsley for a satisfying, rustic meal any time of day.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 6, unit: "oz" },
      { id: "potato", quantity: 1, unit: "each" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "egg", quantity: 1, unit: "each" }
    ],
    instructions: [
      "Place potato cubes in a microwave-safe bowl with 2 tablespoons of water. Cover and microwave on high for 3 minutes until slightly tender. Drain well.",
      "Heat olive oil in a large nonstick skillet over medium-high heat. Add potato cubes and cook, undisturbed, for 4 minutes to get a golden crust. Flip and cook for another 3 minutes.",
      "Add ground beef (or diced steak) and onion. Cook, breaking up beef, until beef is browned and onions are soft (about 4 minutes).",
      "Add butter, paprika, salt, and pepper. Stir everything together and cook for 1 more minute.",
      "Top with a fried egg if desired and serve hot."
    ]
  },

  {
    id: "classic_beef_chili",
    name: "Classic Beef Chili",
    emoji: "🍲",
    description: "A hearty classic beef chili, simmered low and slow until thick, rich, and deeply flavorful — perfect meal for the ultimate comfort bowl.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "ground_beef", quantity: 1, unit: "lb" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "onion", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 2, unit: "each" },
      { id: "kidney_beans", quantity: 425, unit: "g" },
      { id: "tomato", quantity: 411, unit: "g" },
      { id: "tomato_sauce", quantity: 227, unit: "g" },
      { id: "chili_powder", quantity: 2, unit: "tbsp" },
      { id: "cumin", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Heat olive oil in a large pot over medium-high heat. Add onion and cook for 3 minutes until softened.",
      "Add ground beef and cook, breaking apart, until browned (about 6 minutes). Drain excess fat.",
      "Add garlic, chili powder, cumin, salt, and pepper. Stir and cook for 1 minute.",
      "Pour in kidney beans, diced tomatoes (with juice), and tomato sauce. Stir to combine.",
      "Bring to a boil, then reduce heat to low. Simmer uncovered for 25–30 minutes, stirring occasionally, until thickened.",
      "Taste and adjust seasoning. Serve hot."
    ]
  },

  {
    id: "roasted_beef_tenderloin",
    name: "Roasted Beef Tenderloin",
    emoji: "🥩",
    description: "This roasted beef tenderloin, seasoned with garlic, rosemary, and cracked black pepper, creates a perfect melt-in-your-mouth centerpiece meal.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "beef_tenderloin", quantity: 2, unit: "lb" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "butter", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "garlic_powder", quantity: 0.5, unit: "tsp" },
      { id: "dried_thyme", quantity: 4, unit: "sprig" }
    ],
    instructions: [
      "Preheat the oven to 425°F. Let the tenderloin sit at room temperature for 30 minutes.",
      "Pat dry with paper towels. Rub all over with olive oil, then season with salt, pepper, and garlic powder.",
      "Heat an oven-safe skillet over high heat. Sear tenderloin for 2 minutes per side (about 8 minutes total) until deeply browned on all sides.",
      "Add butter and thyme sprigs to the skillet. Using a spoon, baste the butter over the meat.",
      "Transfer the skillet to the oven. Roast for 20–25 minutes for medium-rare (internal temp 125°F. Adjust time for desired doneness.",
      "Remove from the oven, tent with foil, and rest for 15 minutes. Internal temperature will rise to about 130°F.",
      "Slice into 1-inch thick medallions.",
      "Drizzle any pan juices over the top before serving."
    ]
  },

  {
    id: "chocolate_avocado_mousse",
    name: "Chocolate Avocado Mousse",
    emoji: "🍫",
    description: "A rich, creamy mousse that utilizes the healthy monounsaturated fats of avocado to create a decadent texture without the need for heavy cream or excessive sugar.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "avocado", quantity: 2, unit: "each" },
      { id: "cocoa_powder", quantity: 4, unit: "tbsp" },
      { id: "honey", quantity: 4, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "almond_milk", quantity: 8, unit: "tbsp" }
    ],
    instructions: [
      "Combine all ingredients in a high-speed blender or food processor.",
      "Process until the mixture is completely smooth and glossy.",
      "Portion into 4 individual jars or ramekins.",
      "Refrigerate for at least 1 hour to set.",
      "Storage: Keeps for up to 4 days in the refrigerator."
    ]
  },

  {
    id: "greek_yogurt_berry_ice_cream",
    name: "Greek Yogurt & Berry Ice Cream",
    emoji: "🥣",
    description: "This high-protein alternative to traditional ice cream uses frozen fruit to achieve a soft-serve consistency instantly.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "greek_yogurt", quantity: 2, unit: "cup" },
      { id: "blueberries", quantity: 2, unit: "cup" },
      { id: "honey", quantity: 4, unit: "tsp" }
    ],
    instructions: [
      "Place the frozen berries and yogurt into a blender.",
      "Pulse until the berries are broken down, then blend on high until smooth.",
      "Serve immediately for a soft-serve texture.",
      "For scoopable ice cream, freeze in a shallow container for 2 hours.",
      "Storage: Freezer-safe for up to 1 month."
    ]
  },

  {
    id: "2_ingredient_banana_cocoa_nice_cream",
    name: "2-Ingredient Banana & Cocoa Nice Cream",
    emoji: "🍫",
    description: "A dairy-free, vegan-friendly dessert that relies on the natural creaminess of frozen bananas.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "banana", quantity: 4, unit: "each" },
      { id: "cocoa_powder", quantity: 4, unit: "tbsp" }
    ],
    instructions: [
      "Ensure bananas are fully frozen (at least 4 hours).",
      "Blend frozen slices in a food processor until they reach a \"crumb\" stage, then continue until creamy.",
      "Add cocoa powder and blend for another 30 seconds.",
      "Serve immediately.",
      "Storage: Best consumed fresh, but can be refrozen for up to 2 weeks."
    ]
  },

  {
    id: "banana_almond_butter_frozen_bites",
    name: "Banana & Almond Butter Frozen Bites",
    emoji: "🍽️",
    description: "Bite-sized frozen treats that taste like cookies but are packed with protein and healthy fats.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "banana", quantity: 2, unit: "each" },
      { id: "almond_butter", quantity: 3, unit: "tbsp" },
      { id: "cocoa_powder", quantity: 1, unit: "tbsp" },
      { id: "chocolate_chips", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Mash bananas in a bowl until smooth.",
      "Stir in almond butter and cocoa powder (if using) until well combined.",
      "Fold in dark chocolate chips.",
      "Spoon into silicone molds or drop small rounds onto a parchment-lined baking sheet.",
      "Freeze for at least 2 hours until firm.",
      "Pop out of molds and store in a freezer bag.",
      "Keeps for up to 3 months in the freezer."
    ]
  },

  {
    id: "apple_pie_yogurt_bowl",
    name: "Apple Pie Yogurt Bowl",
    emoji: "🍚",
    description: "Warm and tender baked apples with cinnamon — tastes like apple pie filling without the crust.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "apple", quantity: 4, unit: "each" },
      { id: "cinnamon", quantity: 2, unit: "tsp" },
      { id: "maple_syrup", quantity: 2, unit: "tbsp" },
      { id: "coconut_oil", quantity: 1, unit: "tbsp" },
      { id: "greek_yogurt", quantity: 0.5, unit: "cup" },
      { id: "walnuts", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Core apples and slice into wedges or cubes.",
      "In a bowl, toss apples with cinnamon, maple syrup, and melted coconut oil.",
      "Spread on a baking sheet lined with parchment paper.",
      "Bake for 20-25 minutes until tender, stirring halfway through.",
      "Serve warm topped with Greek yogurt and walnuts.",
      "Keeps for up to 4 days in the refrigerator. Reheat gently before serving."
    ]
  },

  {
    id: "no_bake_peanut_butter_protein_balls",
    name: "No-Bake Peanut Butter Protein Balls",
    emoji: "🍽️",
    description: "A dense, protein-packed snack that satisfies cravings for cookie dough while providing sustained energy.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "rolled_oats", quantity: 1, unit: "cup" },
      { id: "peanut_butter", quantity: 0.5, unit: "cup" },
      { id: "honey", quantity: 0.25, unit: "cup" },
      { id: "protein_powder", quantity: 0.25, unit: "cup" },
      { id: "chocolate_chips", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Mix all ingredients in a large bowl until a thick dough forms.",
      "Roll into 16 equal-sized balls (2 per serving).",
      "Place on a tray and refrigerate for 30 minutes to firm up.",
      "Storage: Keeps in the fridge for 2 weeks or in the freezer for 3 months."
    ]
  },

  {
    id: "cottage_cheese_peach_bowl",
    name: "Cottage Cheese & Peach Bowl",
    emoji: "🍚",
    description: "A high-protein, low-calorie dessert bowl that comes together in 2 minutes.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "cottage_cheese", quantity: 2, unit: "cup" },
      { id: "peach", quantity: 1, unit: "each" },
      { id: "honey", quantity: 2, unit: "tsp" },
      { id: "pistachios", quantity: 2, unit: "tbsp" },
      { id: "cinnamon", quantity: 0.25, unit: "tsp" }
    ],
    instructions: [
      "Add cottage cheese to a bowl.",
      "Top with sliced peach, drizzle with honey, and sprinkle with nuts and cinnamon.",
      "Serve immediately",
      "Best assembled fresh. Pre-portion cottage cheese and slice fruit separately for up to 3 days."
    ]
  },

  {
    id: "frozen_yogurt_bark",
    name: "Frozen Yogurt Bark",
    emoji: "🥣",
    description: "A refreshing, crunchy frozen treat that is highly customizable with seasonal fruits.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "greek_yogurt", quantity: 2, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "blueberries", quantity: 0.5, unit: "cup" },
      { id: "almonds", quantity: 1, unit: "tbsp" },
      { id: "chocolate_chips", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Line a baking sheet with parchment paper.",
      "Mix yogurt and honey, then spread in a thin, even layer on the sheet.",
      "Sprinkle berries, nuts, and chocolate chips over the top.",
      "Freeze for 3 hours until completely solid.",
      "Break into shards and store in a freezer bag.",
      "Storage: Keep frozen for up to 1 month."
    ]
  },

  {
    id: "dark_chocolate_raspberry_cups",
    name: "Dark Chocolate & Raspberry Cups",
    emoji: "🍫",
    description: "A sophisticated bite-sized dessert combining the bitterness of dark chocolate with the tartness of fresh raspberries.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "chocolate_chips", quantity: 1, unit: "cup" },
      { id: "coconut_oil", quantity: 2, unit: "tsp" },
      { id: "raspberries", quantity: 16, unit: "each" }
    ],
    instructions: [
      "Melt chocolate and coconut oil in the microwave in 30-second intervals.",
      "Place 8 mini muffin liners in a tin.",
      "Pour a small amount of chocolate into each, add 2 raspberries, and cover with more chocolate.",
      "Refrigerate for 30 minutes.",
      "Storage: Keeps in the fridge for 1 week."
    ]
  },

  {
    id: "apple_slices_with_almond_butter_cinnamon",
    name: "Apple Slices with Almond Butter & Cinnamon",
    emoji: "🍽️",
    description: "A classic combination that provides a perfect balance of fiber, healthy fats, and natural sweetness.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "apple", quantity: 4, unit: "each" },
      { id: "almond_butter", quantity: 4, unit: "tbsp" },
      { id: "cinnamon", quantity: 1, unit: "tsp" },
      { id: "chocolate_chips", quantity: 4, unit: "tsp" }
    ],
    instructions: [
      "Slice apples and arrange in 4 containers.",
      "Drizzle 1 tbsp of almond butter over each portion.",
      "Sprinkle it with cinnamon and chocolate chips.",
      "Storage: Best prepared fresh, but can be stored for 2 days if apples are tossed in lemon juice."
    ]
  },

  {
    id: "peanut_butter_dark_chocolate_banana_wraps",
    name: "Peanut Butter & Dark Chocolate Banana Wraps",
    emoji: "🍫",
    description: "Creamy peanut butter, ripe banana slices, and rich chocolate drizzle wrapped in a soft tortilla for a sweet, satisfying handheld treat that tastes like a decadent dessert but comes together in minutes.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "flour_tortilla", quantity: 4, unit: "each" },
      { id: "peanut_butter", quantity: 4, unit: "tbsp" },
      { id: "banana", quantity: 2, unit: "each" },
      { id: "chocolate_chips", quantity: 4, unit: "tsp" }
    ],
    instructions: [
      "Spread peanut butter on tortillas.",
      "Add banana slices and chocolate chips",
      "Roll them tight.",
      "Lightly toast in a pan on low heat.",
      "Cut in half and serve."
    ]
  },

  {
    id: "s_mores_stuffed_dates",
    name: "S'mores Stuffed Dates",
    emoji: "🍽️",
    description: "Gooey marshmallow, rich melted chocolate, and crisp graham cracker crumbs stuffed into sweet Medjool dates for a warm, indulgent bite-sized dessert that tastes just like campfire s'mores — but healthier.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "dates", quantity: 12, unit: "each" },
      { id: "chocolate_chips", quantity: 12, unit: "each" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Pit the dates.",
      "Stuff with chocolate and one marshmallow.",
      "Microwave for 10 seconds.",
      "Sprinkle them with salt and serve."
    ]
  },

  {
    id: "chocolate_peanut_butter_smoothie_bowl",
    name: "Chocolate Peanut Butter Smoothie Bowl",
    emoji: "🥤",
    description: "A rich and creamy chocolate peanut butter smoothie bowl loaded with fresh banana slices and silky peanut butter for the ultimate indulgent yet nourishing dessert.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "banana", quantity: 4, unit: "each" },
      { id: "peanut_butter", quantity: 4, unit: "tbsp" },
      { id: "cocoa_powder", quantity: 4, unit: "tbsp" },
      { id: "almond_milk", quantity: 2, unit: "cup" },
      { id: "chia_seeds", quantity: 4, unit: "tbsp" }
    ],
    instructions: [
      "Blend all ingredients until thick.",
      "Top with granola or extra seeds if desired.",
      "Portion and serve."
    ]
  },

  {
    id: "cinnamon_sugar_roasted_chickpeas",
    name: "Cinnamon Sugar Roasted Chickpeas",
    emoji: "🍽️",
    description: "Crispy, oven-roasted chickpeas coated in warm cinnamon and sweet sugar for a crunchy, guilt-free snack that satisfies your dessert cravings with a boost of protein and fiber.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "chickpeas", quantity: 850, unit: "g" },
      { id: "coconut_oil", quantity: 2, unit: "tbsp" },
      { id: "honey", quantity: 2, unit: "tbsp" },
      { id: "cinnamon", quantity: 2, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Dry chickpeas thoroughly",
      "Toss with oil and spices",
      "Roast at 400°F for 30 minutes until crunchy.",
      "Wait until cool and serve."
    ]
  },

  {
    id: "dark_chocolate_dipped_frozen_strawberries",
    name: "Dark Chocolate-Dipped Frozen Strawberries",
    emoji: "🍫",
    description: "Rich, velvety dark chocolate envelops juicy frozen strawberries for a refreshingly crisp, indulgent treat that tastes decadent yet stays naturally sweet and satisfying.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "strawberries", quantity: 16, unit: "each" },
      { id: "chocolate_chips", quantity: 0.5, unit: "cup" },
      { id: "coconut_oil", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Melt chocolate and coconut oil in the microwave in 30-second intervals.",
      "Dip strawberries in melted chocolate.",
      "Place on parchment paper.",
      "Freeze for 20 minutes or until firm."
    ]
  },

  {
    id: "s_mores_chia_pudding",
    name: "S'mores Chia Pudding",
    emoji: "🍨",
    description: "Campfire vibes without leaving your kitchen. Rich, chocolatey, and packed with fiber, this pudding uses cocoa powder and a touch of maple syrup to create a deep, dessert-like flavor. The chia seeds develop a thick, satisfying texture that mimics the gooeyness of melted marshmallow. Topped with crushed graham crackers and mini marshmallows for that classic campfire crunch.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chia_seeds", quantity: 3, unit: "tbsp" },
      { id: "almond_milk", quantity: 0.75, unit: "cup" },
      { id: "cocoa_powder", quantity: 1, unit: "tbsp" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "graham_crackers", quantity: 2, unit: "tbsp" },
      { id: "marshmallows", quantity: 1, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Whisk chia seeds, almond milk, cocoa powder, maple syrup, and vanilla together.",
      "Pour into a jar or container. Stir again after 5 min to break up clumps.",
      "Refrigerate at least 4 hours or overnight.",
      "Before serving, top with crushed graham crackers and marshmallows.",
      "Keeps up to 5 days. Add toppings fresh for crunch."
    ]
  },

  {
    id: "mango_lassi_chia_pudding",
    name: "Mango Lassi Chia Pudding",
    emoji: "🍨",
    description: "Inspired by the traditional Indian yogurt drink, this version is creamy, tropical, and packed with gut-healthy probiotics from Greek yogurt. The addition of cardamom provides an authentic aromatic profile that pairs perfectly with sweet mango. Topped with coconut flakes and crushed pistachios for added texture, healthy fats, and protein.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "chia_seeds", quantity: 3, unit: "tbsp" },
      { id: "greek_yogurt", quantity: 0.5, unit: "cup" },
      { id: "coconut_milk_light", quantity: 0.25, unit: "cup" },
      { id: "mango", quantity: 0.5, unit: "cup" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "cardamom", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "coconut_flakes", quantity: 1, unit: "tbsp" },
      { id: "pistachios", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "In a blender, purée mango, yogurt, coconut milk, honey, cardamom, and salt until smooth.",
      "Stir in chia seeds.",
      "Pour into a jar. Stir again after 5 min.",
      "Refrigerate at least 4 hours or overnight.",
      "Top with coconut flakes and pistachios before serving.",
      "Keeps up to 5 days."
    ]
  },

  {
    id: "chia_seed_pudding_vanilla_berry",
    name: "Chia Seed Pudding (Vanilla Berry)",
    emoji: "🍨",
    description: "A classic and versatile option — high in omega-3 fatty acids and fiber, making it an excellent grab-and-go breakfast or light dessert. Made with unsweetened almond milk and sweetened lightly with honey, it's the lowest-calorie option in the lineup at just 194 calories per serving. Topped with fresh berries for a burst of antioxidants and natural sweetness.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "chia_seeds", quantity: 8, unit: "tbsp" },
      { id: "almond_milk", quantity: 2, unit: "cup" },
      { id: "vanilla_extract", quantity: 2, unit: "tsp" },
      { id: "honey", quantity: 4, unit: "tsp" },
      { id: "blueberries", quantity: 1, unit: "cup" }
    ],
    instructions: [
      "In a large bowl, whisk chia seeds, milk, vanilla, and honey.",
      "Let sit for 5 minutes, then whisk again to prevent clumping.",
      "Pour into 4 individual jars.",
      "Refrigerate overnight.",
      "Top with fresh berries before serving.",
      "Storage: Keeps for up to 5 days."
    ]
  },

  {
    id: "scrambled_eggs_with_smoked_salmon_chives",
    name: "Scrambled Eggs with Smoked Salmon & Chives",
    emoji: "🍳",
    description: "A protein-rich, savory breakfast packed with omega-3s and ready in under 10 minutes.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg", quantity: 3, unit: "each" },
      { id: "smoked_salmon", quantity: 2, unit: "oz" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "cream_cheese", quantity: 1, unit: "tbsp" },
      { id: "green_onion", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Crack eggs into a bowl, add a pinch of salt, and whisk until smooth.",
      "Melt butter in a non-stick skillet over low-medium heat.",
      "Pour in the eggs and let them sit for 10 seconds, then gently stir with a spatula.",
      "Keep stirring slowly — low heat is key for creamy, soft curds.",
      "When eggs are nearly set but still slightly wet, fold in smoked salmon and cream cheese.",
      "Remove from heat — residual heat will finish cooking.",
      "Top with fresh chives and black pepper.",
      "Serve immediately."
    ]
  },

  {
    id: "spinach_mushroom_egg_white_omelette",
    name: "Spinach & Mushroom Egg White Omelette",
    emoji: "🍳",
    description: "A light, high-protein omelette packed with veggies.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "egg_white", quantity: 4, unit: "each" },
      { id: "spinach", quantity: 1, unit: "cup" },
      { id: "mushrooms", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cheddar_cheese", quantity: 0.25, unit: "cup" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Heat olive oil in a non-stick pan over medium heat.",
      "Sauté mushrooms for 3 minutes, then add spinach until wilted.",
      "Pour beaten egg whites over veggies.",
      "Cook for 2-3 minutes, add cheese, fold, and serve."
    ]
  },

  {
    id: "green_goddess_power_bowl",
    name: "Green Goddess Power Bowl",
    emoji: "🍚",
    description: "A vibrant, nutrient-dense bowl packed with protein, greens, and healthy fats. This is the healthiest option on the menu — 30g of protein, under 350 calories, and loaded with vitamins.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "quinoa_cooked", quantity: 0.5, unit: "cup" },
      { id: "avocado", quantity: 0.5, unit: "each" },
      { id: "edamame", quantity: 0.25, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "pumpkin_seeds", quantity: 1, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tsp" },
      { id: "lemon_juice", quantity: 1.5, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Arrange quinoa as the base in a bowl.",
      "Add mashed avocado on one side, edamame, cherry tomatoes, and microgreens.",
      "Poach the egg in simmering water for 3 minutes and place on top.",
      "Sprinkle pumpkin seeds.",
      "Drizzle with olive oil and lemon juice.",
      "Season with salt and pepper and serve."
    ]
  },

  {
    id: "s_mores_pancake_stack",
    name: "S'mores Pancake Stack",
    emoji: "🥞",
    description: "A campfire-inspired breakfast that tastes like dessert. Chocolate, marshmallow, and graham cracker in fluffy pancake form.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "flour", quantity: 1, unit: "cup" },
      { id: "granulated_sugar", quantity: 1, unit: "tbsp" },
      { id: "baking_powder", quantity: 1, unit: "tsp" },
      { id: "milk", quantity: 0.5, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "chocolate_chips", quantity: 0.25, unit: "cup" },
      { id: "marshmallows", quantity: 0.25, unit: "cup" },
      { id: "graham_crackers", quantity: 2, unit: "each" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Mix flour, sugar, and baking powder.",
      "Whisk in milk, egg, and melted butter.",
      "Fold in chocolate chips.",
      "Pour batter onto a hot griddle, cook until bubbles form, flip.",
      "Stack pancakes, layer with marshmallows and graham cracker crumbs between each.",
      "Drizzle with maple syrup on top and serve."
    ]
  },

  {
    id: "pizza_breakfast_quesadilla",
    name: "Pizza Breakfast Quesadilla",
    emoji: "🌮",
    description: "A savory mashup that says \"breakfast doesn't have to be boring.\" Pepperoni, cheese, and eggs folded into a crispy tortilla.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "flour_tortilla", quantity: 1, unit: "each" },
      { id: "egg", quantity: 2, unit: "each" },
      { id: "mozzarella_cheese", quantity: 0.25, unit: "cup" },
      { id: "pepperoni", quantity: 6, unit: "slice" },
      { id: "pizza_sauce", quantity: 2, unit: "tbsp" },
      { id: "butter", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Scramble eggs in a pan and set aside.",
      "Butter one side of the tortilla and place butter-side down in a skillet.",
      "Spread pizza sauce on half of the tortilla, add scrambled eggs, mozzarella, and pepperoni.",
      "Fold tortilla over.",
      "Cook for 2 minutes per side until golden and cheese melts.",
      "Sprinkle oregano over the top and serve."
    ]
  },

  {
    id: "churro_french_toast_bites",
    name: "Churro French Toast Bites",
    emoji: "🍞",
    description: "Crispy, cinnamon-sugar coated french toast cubes served with warm chocolate dipping sauce. Tastes like a carnival.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "bread", quantity: 3, unit: "slice" },
      { id: "egg", quantity: 2, unit: "each" },
      { id: "milk", quantity: 0.25, unit: "cup" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "granulated_sugar", quantity: 2, unit: "tbsp" },
      { id: "cinnamon", quantity: 1, unit: "tsp" },
      { id: "butter", quantity: 2, unit: "tbsp" },
      { id: "chocolate_chips", quantity: 0.25, unit: "cup" },
      { id: "heavy_cream", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Cut bread into bite-sized cubes.",
      "Whisk eggs, milk, and vanilla.",
      "Dip cubes in mixture.",
      "Pan-fry in butter until golden on all sides.",
      "Toss hot cubes in cinnamon-sugar mix.",
      "For the dip: melt chocolate chips with heavy cream in the microwave (30 sec intervals).",
      "Serve bites with warm chocolate sauce."
    ]
  },

  {
    id: "spicy_tuna_lettuce_wraps_with_mango_salsa",
    name: "Spicy Tuna Lettuce Wraps with Mango Salsa",
    emoji: "🐟",
    description: "Spicy tuna lettuce wraps — seasoned diced tuna mixed with sriracha, served in crisp lettuce cups, and topped with fresh mango salsa for a sweet, tangy finish.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "tuna_canned", quantity: 6, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "sriracha", quantity: 1, unit: "tsp" },
      { id: "lime_juice", quantity: 1, unit: "tsp" },
      { id: "lettuce", quantity: 4, unit: "each" },
      { id: "mango", quantity: 0.5, unit: "cup" },
      { id: "cucumber", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 2, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "In a small bowl, mix mango, cucumber, red onion, cilantro, and a pinch of salt to make the salsa. Set aside.",
      "In a separate bowl, combine drained tuna, olive oil, sriracha, lime juice, and salt. Mix well with a fork.",
      "Lay out the butter lettuce leaves on a plate. Divide the spicy tuna mixture evenly among them.",
      "Top each wrap with mango salsa.",
      "Serve immediately — the lettuce stays crispest when fresh."
    ]
  },

  {
    id: "turkey_vegetable_skillet",
    name: "Turkey & Vegetable Skillet",
    emoji: "🍗",
    description: "Ground turkey and veggie skillet — all cooked in one pan for a quick, healthy, and colorful meal.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_turkey", quantity: 6, unit: "oz" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "broccoli", quantity: 1, unit: "cup" },
      { id: "bell_pepper", quantity: 0.5, unit: "each" },
      { id: "zucchini", quantity: 0.5, unit: "each" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Heat olive oil in a large skillet over medium-high heat.Add ground turkey and cook,",
      "breaking apart with a spoon, until browned (about 6 minutes). Drain any excess liquid.",
      "Add garlic, paprika, red pepper flakes, salt, and pepper. Stir for 30 seconds.",
      "Add broccoli, bell pepper, and zucchini. Cook for 5–6 minutes, stirring occasionally, until vegetables are tender-crisp.",
      "Taste and adjust seasoning.",
      "Serve hot."
    ]
  },

  {
    id: "honey_soy_glazed_pork_chops_with_coconut_rice_roas",
    name: "Honey Soy Glazed Pork Chops with Coconut Rice & Roasted Broccoli",
    emoji: "🍚",
    description: "Honey soy glazed pork chops — pan-seared, sticky-sweet glaze, and juicy inside.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pork_loin", quantity: 6, unit: "oz" },
      { id: "rice_uncooked", quantity: 0.5, unit: "cup" },
      { id: "coconut_milk_light", quantity: 0.5, unit: "cup" },
      { id: "water", quantity: 0.5, unit: "cup" },
      { id: "broccoli", quantity: 1, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "soy_sauce", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "ginger", quantity: 0.5, unit: "tsp" },
      { id: "chili_powder", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "sesame_seeds", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "In a small pot, combine rice, coconut milk, and water. Bring to a boil, reduce heat to low, cover, and simmer for 15 minutes until tender. Fluff with a fork.",
      "Preheat the oven to 425°F. Toss broccoli florets with half the olive oil, salt, and pepper. Roast on a baking sheet for 15–18 minutes until the edges are crispy and browned.",
      "While rice and broccoli cook, pat pork chop dry and season both sides with salt and pepper.",
      "In a small bowl, whisk together honey, soy sauce, garlic, ginger, and red pepper flakes.",
      "Heat remaining olive oil in an oven-safe skillet over medium-high heat. Sear pork chop for 3–4 minutes per side until golden brown.",
      "Pour the honey soy glaze over the pork chop. Transfer the skillet to the oven (alongside the broccoli) and roast for 6–8 minutes until the internal temperature reaches 145°F.",
      "Remove from the oven. Let pork rest for 5 minutes. Spoon pan glaze over the chop.",
      "Serve sliced pork over coconut rice with roasted broccoli on the side.",
      "Garnish with sesame seeds."
    ]
  },

  {
    id: "sesame_crusted_ahi_tuna_with_soba_noodles_edamame",
    name: "Sesame Crusted Ahi Tuna with Soba Noodles & Edamame",
    emoji: "🐟",
    description: "Sesame-crusted ahi tuna, seared rare, over soba noodles with soy-sesame dressing, and scallions.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ahi_tuna_steak", quantity: 6, unit: "oz" },
      { id: "pasta_dry", quantity: 3, unit: "oz" },
      { id: "edamame", quantity: 0.5, unit: "cup" },
      { id: "sesame_seeds", quantity: 1, unit: "tbsp" },
      { id: "sesame_oil", quantity: 1, unit: "tbsp" },
      { id: "soy_sauce", quantity: 1, unit: "tbsp" },
      { id: "rice_vinegar", quantity: 1, unit: "tsp" },
      { id: "ginger", quantity: 0.5, unit: "tsp" },
      { id: "green_onion", quantity: 1, unit: "each" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Cook soba noodles according to package directions. Drain and rinse under cold water to stop cooking. Toss with a drizzle of sesame oil to prevent sticking.",
      "Pat tuna steak dry. Season with salt and pepper. Press sesame seeds onto both sides to form a crust.",
      "Heat remaining sesame oil in a nonstick skillet over high heat. Sear tuna for 90 seconds per side for rare (adjust to 2 minutes per side for medium). The center should remain deep red.",
      "Remove tuna from the pan and let it rest for 2 minutes. Slice thinly against the grain.",
      "In a small bowl, whisk soy sauce, rice vinegar, and grated ginger. Toss with the soba noodles and edamame.",
      "Serve sliced tuna over the noodle-edamame mixture.",
      "Garnish with green onion."
    ]
  },

  {
    id: "bacon_cheeseburger_mac_cheese_skillet",
    name: "Bacon Cheeseburger Mac & Cheese Skillet",
    emoji: "🥩",
    description: "A loaded bacon cheeseburger mac and cheese skillet — a classic cheeseburger experience in every bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 6, unit: "oz" },
      { id: "bacon", quantity: 2, unit: "strip" },
      { id: "pasta_dry", quantity: 1, unit: "cup" },
      { id: "butter", quantity: 1, unit: "tbsp" },
      { id: "flour", quantity: 1, unit: "tbsp" },
      { id: "milk", quantity: 0.75, unit: "cup" },
      { id: "cheddar_cheese", quantity: 0.5, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "dijon_mustard", quantity: 1, unit: "tsp" },
      { id: "paprika", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook macaroni according to package directions until al dente. Drain and set aside.",
      "In a large skillet over medium heat, cook diced bacon until crispy (about 5 minutes). Remove with a slotted spoon and set aside, leaving the rendered fat in the pan.",
      "Add ground beef to the same skillet and cook, breaking apart, until browned (about 6 minutes). Drain excess fat if desired. Remove beef from skillet and set aside with bacon.",
      "Reduce heat to medium-low. Add butter to the skillet. Once melted, add onion and cook for 2 minutes until softened. Add garlic and cook for 30 seconds.",
      "Sprinkle flour over the onion mixture and stir constantly for 1 minute.",
      "Slowly pour in milk while whisking continuously. Cook for 2–3 minutes until thickened.",
      "Reduce heat to low. Stir in cheddar cheese, Dijon mustard, smoked paprika, salt, and pepper until smooth and creamy.",
      "Return cooked macaroni, beef, and bacon to the skillet. Stir until everything is coated in cheese sauce.",
      "Garnish with parsley and serve hot."
    ]
  },

  {
    id: "loaded_ground_beef_pasta_bake",
    name: "Loaded Ground Beef & Pasta Bake",
    emoji: "🍝",
    description: "A hearty ground beef and pasta bake made with seasoned ground beef, tender pasta, rich marinara sauce, and a generous layer of melted mozzarella and Parmesan cheese, baked until bubbly and golden — a comforting, crowd-pleasing casserole that's pure comfort food in every bite.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "ground_beef", quantity: 8, unit: "oz" },
      { id: "pasta_dry", quantity: 1.5, unit: "cup" },
      { id: "ricotta_cheese", quantity: 0.5, unit: "cup" },
      { id: "mozzarella_cheese", quantity: 0.5, unit: "cup" },
      { id: "parmesan", quantity: 0.25, unit: "cup" },
      { id: "marinara_sauce", quantity: 0.5, unit: "cup" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "italian_seasoning", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Cook pasta according to package directions until al dente. Drain and set aside.",
      "While pasta cooks, heat olive oil in a skillet over medium-high heat. Add ground beef and cook, breaking apart, until browned (about 6 minutes). Drain excess fat if needed.",
      "Add garlic, Italian seasoning, salt, and pepper. Cook for 1 minute.",
      "Stir in marinara sauce and cooked pasta. Mix well.",
      "Transfer half the pasta-beef mixture to a small baking dish. Dollop half the ricotta over the top. Add remaining pasta mixture, then remaining ricotta.",
      "Top with shredded mozzarella and Parmesan.",
      "Bake for 18–20 minutes until bubbly and golden on top.",
      "Let rest for 5 minutes before serving."
    ]
  },

  {
    id: "spicy_sausage_pepper_lasagna",
    name: "Spicy Sausage & Pepper Lasagna",
    emoji: "🍝",
    description: "A bold, hearty lasagna with spicy Italian sausage, roasted bell peppers, and a kick of heat in every bite.",
    baseServings: 8,
    servingLabel: "servings",
    ingredients: [
      { id: "italian_sausage", quantity: 1.5, unit: "lb" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "onion", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 3, unit: "each" },
      { id: "bell_pepper", quantity: 2, unit: "each" },
      { id: "tomato_sauce", quantity: 800, unit: "g" },
      { id: "tomato_paste", quantity: 170, unit: "g" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "dried_basil", quantity: 1, unit: "tsp" },
      { id: "chili_powder", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "basil_fresh", quantity: 0.25, unit: "cup" },
      { id: "ricotta_cheese", quantity: 2, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "parmesan", quantity: 0.5, unit: "cup" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "pasta_dry", quantity: 12, unit: "each" },
      { id: "mozzarella_cheese", quantity: 3, unit: "cup" },
      { id: "parmesan", quantity: 0.5, unit: "cup" }
    ],
    instructions: [
      "Cook the sausage: Heat olive oil in a large pot over medium-high heat. Add sausage and cook, breaking it apart, until browned (about 6-8 minutes). Remove with a slotted spoon and set aside.",
      "Cook the vegetables: In the same pot, add onion and cook for 4 minutes until soft. Add garlic and bell peppers, cook for another 3-4 minutes.",
      "Make the sauce: Return sausage to the pot. Add crushed tomatoes, tomato paste, oregano, basil, red pepper flakes, salt, and pepper. Stir well. Reduce heat to low and simmer for 20-25 minutes, stirring occasionally.",
      "Make the cheese filling: In a bowl, combine ricotta, egg, Parmesan, salt, and pepper. Mix until smooth.",
      "Preheat the oven to 375°F.",
      "Assemble the lasagna: Spread 1 cup of sauce on the bottom of a 9x13-inch baking dish. Layer 4 noodles. Spread half the ricotta mixture. Sprinkle 1 cup mozzarella. Add 1 cup sauce. Repeat: 4 noodles, remaining ricotta, 1 cup mozzarella, 1 cup sauce. Final layer: 4 noodles, remaining sauce, remaining mozzarella, and Parmesan topping.",
      "Bake: Cover with foil, bake for 25 minutes. Remove foil, bake for another 15 minutes until golden and bubbly.",
      "Rest: Let rest for 10-15 minutes. Top with fresh basil before serving.",
      "Storage: Refrigerate up to 5 days. Freeze for up to 3 months."
    ]
  },

  {
    id: "creamy_chicken_spinach_lasagna",
    name: "Creamy Chicken & Spinach Lasagna",
    emoji: "🍝",
    description: "A lighter, creamy twist on lasagna with tender chicken, spinach, and a rich béchamel-style sauce.",
    baseServings: 8,
    servingLabel: "servings",
    ingredients: [
      { id: "chicken_breast", quantity: 1.5, unit: "lb" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "garlic_powder", quantity: 1, unit: "tsp" },
      { id: "spinach", quantity: 10, unit: "oz" },
      { id: "onion", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 3, unit: "each" },
      { id: "butter", quantity: 4, unit: "tbsp" },
      { id: "flour", quantity: 0.25, unit: "cup" },
      { id: "milk", quantity: 3, unit: "cup" },
      { id: "broth", quantity: 1, unit: "cup" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "black_pepper", quantity: 0.25, unit: "tsp" },
      { id: "nutmeg", quantity: 0.25, unit: "tsp" },
      { id: "ricotta_cheese", quantity: 2, unit: "cup" },
      { id: "parmesan", quantity: 1, unit: "cup" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "pasta_dry", quantity: 12, unit: "each" },
      { id: "mozzarella_cheese", quantity: 2, unit: "cup" },
      { id: "parmesan", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "Cook the chicken: Season chicken with salt, pepper, and garlic powder. Heat olive oil in a skillet over medium-high heat. Cook chicken 6-7 minutes per side until golden and cooked through (165°F internal). Let rest for 5 minutes, then dice.",
      "Make the cream sauce: In a saucepan, melt butter over medium heat. Whisk in flour and cook 1-2 minutes. Slowly whisk in milk and chicken broth. Add salt, pepper, and nutmeg. Whisk until thickened (5-7 minutes). Remove from heat.",
      "Prepare the filling: In the same skillet, cook the onion for 4 minutes. Add garlic, cook for 1 minute. Add spinach, cook for 2 minutes. In a bowl, combine diced chicken, spinach mixture, ricotta, Parmesan, and egg.",
      "Preheat the oven to 375°F.",
      "Assemble: Spread ½ cup cream sauce on bottom of a 9x13-inch dish. Layer 4 noodles. Spread ⅓ of chicken mixture. Pour ¾ cup cream sauce. Sprinkle ½ cup mozzarella. Repeat twice. Final layer: 4 noodles, remaining sauce, mozzarella, Parmesan topping.",
      "Bake: Cover with foil, bake for 30 minutes. Uncover, bake for 10-12 minutes until golden.",
      "Rest: 10-15 minutes before cutting.",
      "Storage: Refrigerate for up to 4 days. Freeze for up to 2 months."
    ]
  },

  {
    id: "brazilian_pasta_salad",
    name: "Brazilian Pasta Salad",
    emoji: "🥗",
    description: "A beloved side dish in Brazilian homes and steakhouses — creamy, colorful, and incredibly satisfying.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "pasta_dry", quantity: 8, unit: "oz" },
      { id: "ham", quantity: 150, unit: "g" },
      { id: "carrots", quantity: 0.5, unit: "cup" },
      { id: "corn", quantity: 0.5, unit: "cup" },
      { id: "olives_green", quantity: 0.25, unit: "cup" },
      { id: "apple", quantity: 0.5, unit: "each" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "green_onion", quantity: 2, unit: "tbsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" },
      { id: "mayonnaise", quantity: 0.25, unit: "cup" },
      { id: "greek_yogurt", quantity: 2, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "dijon_mustard", quantity: 0.5, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "olive_oil", quantity: 0.5, unit: "tbsp" }
    ],
    instructions: [
      "Cook pasta according to package directions until al dente. Drain and rinse under cold water.",
      "Whisk together mayonnaise, Greek yogurt, lemon juice, Dijon mustard, salt, and pepper.",
      "In a large bowl, combine cooled pasta, ham, peas and carrots, corn, olives, apple, bell peppers, green onion, and parsley.",
      "Pour dressing over the salad and fold gently until well coated.",
      "Cover and refrigerate at least 2 hours before serving.",
      "Adjust salt and pepper if needed.",
      "Stir well before serving."
    ]
  },

  {
    id: "loaded_italian_pasta_salad",
    name: "Loaded Italian Pasta Salad",
    emoji: "🥗",
    description: "A hearty, flavor-packed pasta salad loaded with classic Italian deli meats, cheese, and a tangy vinaigrette.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "pasta_dry", quantity: 8, unit: "oz" },
      { id: "salami", quantity: 3, unit: "oz" },
      { id: "pepperoni", quantity: 3, unit: "oz" },
      { id: "provolone_cheese", quantity: 3, unit: "oz" },
      { id: "tomato", quantity: 0.5, unit: "cup" },
      { id: "roasted_red_peppers", quantity: 0.5, unit: "cup" },
      { id: "olives_black", quantity: 0.25, unit: "cup" },
      { id: "onion", quantity: 0.25, unit: "cup" },
      { id: "bell_pepper", quantity: 0.25, unit: "cup" },
      { id: "basil_fresh", quantity: 2, unit: "tbsp" },
      { id: "parsley", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 3, unit: "tbsp" },
      { id: "red_wine_vinegar", quantity: 1.5, unit: "tbsp" },
      { id: "lemon_juice", quantity: 0.5, unit: "tbsp" },
      { id: "italian_seasoning", quantity: 1, unit: "tsp" },
      { id: "dijon_mustard", quantity: 0.5, unit: "tsp" },
      { id: "garlic", quantity: 1, unit: "clove" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Cook pasta according to package directions until al dente. Drain and rinse under cold water.",
      "While pasta cooks, whisk together olive oil, red wine vinegar, lemon juice, Italian seasoning, Dijon mustard, garlic, salt, and pepper.",
      "In a large bowl, combine cooled pasta, salami, pepperoni, provolone, tomatoes, roasted peppers, olives, red onion, banana peppers, basil, and parsley.",
      "Pour vinaigrette over the salad and toss until evenly coated.",
      "Cover and refrigerate at least 1 hour before serving.",
      "Adjust seasoning before serving.",
      "Garnish with extra basil if desired."
    ]
  },

  {
    id: "avocado_corn_pasta_salad",
    name: "Avocado Corn Pasta Salad",
    emoji: "🥗",
    description: "A vibrant avocado corn pasta salad, that is refreshing, creamy, and tangy. Perfect for summer gatherings and meal prep.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "pasta_dry", quantity: 2, unit: "oz" },
      { id: "corn", quantity: 0.5, unit: "cup" },
      { id: "avocado", quantity: 0.25, unit: "cup" },
      { id: "tomato", quantity: 0.25, unit: "cup" },
      { id: "bell_pepper", quantity: 2, unit: "tbsp" },
      { id: "cilantro", quantity: 1, unit: "tbsp" },
      { id: "lime_juice", quantity: 1.5, unit: "tbsp" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
      { id: "cumin", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Cook pasta according to package directions. Drain and rinse under cold water.",
      "In a large bowl, combine pasta, corn, avocado, tomatoes, bell pepper, and cilantro.",
      "In a small bowl, whisk together dressing ingredients.",
      "Pour dressing over salad and toss gently to coat.",
      "Refrigerate for at least 15 minutes before serving.",
      "Avocado is best added fresh the day of eating."
    ]
  },

  {
    id: "mini_cheesecake_bites_with_berry_compote",
    name: "Mini Cheesecake Bites with Berry Compote",
    emoji: "🍨",
    description: "Creamy, bite-sized cheesecake topped with a vibrant, tangy-sweet berry compote for the perfect balance of rich indulgence and fresh fruit flavor in every single bite.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "almond_flour", quantity: 0.5, unit: "cup" },
      { id: "coconut_oil", quantity: 2, unit: "tbsp" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "cream_cheese", quantity: 8, unit: "oz" },
      { id: "greek_yogurt", quantity: 0.25, unit: "cup" },
      { id: "honey", quantity: 3, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "egg", quantity: 1, unit: "each" },
      { id: "blueberries", quantity: 1, unit: "cup" },
      { id: "maple_syrup", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Preheat the oven to 325°F.",
      "Mix crust ingredients and press into a mini muffin tin. Bake for 8 minutes.",
      "Beat filling ingredients until smooth and pour over crusts. Bake for 15-18 minutes until set.",
      "Cool completely.",
      "Simmer compote ingredients for 5-8 minutes until thickened. Top each bite with compote."
    ]
  },

  {
    id: "frozen_dark_chocolate_raspberry_bark",
    name: "Frozen Dark Chocolate & Raspberry Bark",
    emoji: "🍫",
    description: "A shareable frozen bark that satisfies chocolate cravings with antioxidant-rich raspberries.",
    baseServings: 3,
    servingLabel: "servings",
    ingredients: [
      { id: "chocolate_chips", quantity: 0.5, unit: "cup" },
      { id: "coconut_oil", quantity: 1, unit: "tbsp" },
      { id: "raspberries", quantity: 0.5, unit: "cup" },
      { id: "almonds", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "Line a small baking sheet with parchment paper.",
      "Melt dark chocolate and coconut oil together (microwave in 30-second bursts or double boiler).",
      "Pour melted chocolate onto parchment and spread into a thin rectangle.",
      "Press raspberries and chopped almonds into the chocolate.",
      "Sprinkle it with flaky sea salt.",
      "Freeze for 20-30 minutes until firm. Break into pieces",
      "Keeps for up to 2 weeks in the freezer in an airtight container."
    ]
  },

  {
    id: "chocolate_peanut_butter_protein_brownies",
    name: "Chocolate Peanut Butter Protein Brownies",
    emoji: "🍫",
    description: "Fudgy, rich chocolate brownies swirled with creamy peanut butter and packed with protein for a decadent yet wholesome treat that satisfies your sweet tooth and keeps you fueled.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "almond_flour", quantity: 1, unit: "cup" },
      { id: "cocoa_powder", quantity: 0.5, unit: "cup" },
      { id: "protein_powder", quantity: 1, unit: "each" },
      { id: "peanut_butter", quantity: 0.5, unit: "cup" },
      { id: "egg", quantity: 3, unit: "each" },
      { id: "maple_syrup", quantity: 0.25, unit: "cup" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "baking_soda", quantity: 0.5, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "chocolate_chips", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "Preheat the oven to 350°F.",
      "Mix all dry ingredients.",
      "Melt peanut butter.",
      "Add melted peanut butter, eggs, maple syrup, and vanilla to the dry mixture. Stir until smooth.",
      "Fold in chocolate chips.",
      "Pour into a greased 8×8 pan and bake for 18-22 minutes."
    ]
  },

  {
    id: "banana_split_yogurt_bowl",
    name: "Banana Split Yogurt Bowl",
    emoji: "🍚",
    description: "A creamy, indulgent banana split reimagined as a healthy yogurt bowl topped with fresh banana, berries, nuts, and a drizzle of chocolate for a guilt-free twist on a classic dessert.",
    baseServings: 1,
    servingLabel: "serving",
    ingredients: [
      { id: "banana", quantity: 1, unit: "each" },
      { id: "greek_yogurt", quantity: 1, unit: "cup" },
      { id: "pineapple", quantity: 2, unit: "tbsp" },
      { id: "chocolate_chips", quantity: 1, unit: "tbsp" },
      { id: "walnuts", quantity: 1, unit: "tbsp" },
      { id: "cherries", quantity: 2, unit: "each" },
      { id: "honey", quantity: 1, unit: "tsp" }
    ],
    instructions: [
      "Place the split banana in a bowl.",
      "Top with Greek yogurt.",
      "Add crushed pineapple, chocolate shavings, and walnuts.",
      "Drizzle with honey and top with cherries.",
      "Serve immediately."
    ]
  },

  {
    id: "peanut_butter_banana_yogurt_popsicles",
    name: "Peanut Butter & Banana Yogurt Popsicles",
    emoji: "🥣",
    description: "Creamy, high-protein frozen pops that taste like a peanut butter banana smoothie.",
    baseServings: 3,
    servingLabel: "servings",
    ingredients: [
      { id: "banana", quantity: 2, unit: "each" },
      { id: "greek_yogurt", quantity: 0.5, unit: "cup" },
      { id: "peanut_butter", quantity: 2, unit: "tbsp" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "almond_milk", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "Blend all ingredients in a blender until completely smooth.",
      "Pour into popsicle molds.",
      "Insert sticks and freeze for at least 4 hours or overnight.",
      "Run molds under warm water for 10 seconds to release.",
      "Keep them for up to 3 months in the freezer."
    ]
  },

  {
    id: "baked_cinnamon_apple_slices",
    name: "Baked Cinnamon Apple Slices",
    emoji: "🍽️",
    description: "A warm and comforting dessert that mimics the flavor of apple pie without the caloric density of a crust.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "apple", quantity: 4, unit: "each" },
      { id: "cinnamon", quantity: 2, unit: "tsp" },
      { id: "honey", quantity: 2, unit: "tsp" },
      { id: "lemon_juice", quantity: 4, unit: "tsp" },
      { id: "water", quantity: 4, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 350°F.",
      "Toss apple slices with cinnamon, honey, lemon juice, and water.",
      "Spread on a parchment-lined baking sheet.",
      "Bake for 15-20 minutes until tender.",
      "Storage: Refrigerate for up to 5 days; reheat before serving."
    ]
  },

  {
    id: "chocolate_cherry_bliss_balls",
    name: "Chocolate Cherry Bliss Balls",
    emoji: "🍫",
    description: "Rich, fudgy chocolate and tart cherry come together in these no-bake bliss ball bites for a perfectly sweet, energy-packed dessert that tastes indulgent but is made with wholesome ingredients.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "dates", quantity: 1, unit: "cup" },
      { id: "dried_cherries", quantity: 0.5, unit: "cup" },
      { id: "cocoa_powder", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "Process 1 cup dates, 1/2 cup dried cherries, 2 tbsp cocoa powder.",
      "Roll into 12 balls.",
      "Refrigerate or freeze."
    ]
  },

  {
    id: "coconut_dark_chocolate_energy_balls",
    name: "Coconut & Dark Chocolate Energy Balls",
    emoji: "🍫",
    description: "No-bake energy balls with a dessert-like satisfaction — perfect for meal prep and snacking.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "coconut_flakes", quantity: 1, unit: "cup" },
      { id: "almond_flour", quantity: 0.5, unit: "cup" },
      { id: "cocoa_powder", quantity: 3, unit: "tbsp" },
      { id: "maple_syrup", quantity: 3, unit: "tbsp" },
      { id: "coconut_oil", quantity: 2, unit: "tbsp" },
      { id: "vanilla_extract", quantity: 1, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" }
    ],
    instructions: [
      "In a bowl, combine shredded coconut, almond flour, cocoa powder, and sea salt.",
      "Add maple syrup, melted coconut oil, and vanilla extract. Mix until dough forms.",
      "Roll into 12-14 small balls (about 1 inch each).",
      "Refrigerate for at least 30 minutes to set.",
      "Keeps for up to 2 weeks in the refrigerator or 2 months in the freezer."
    ]
  },

  {
    id: "jacob_s_red_lentil_stew_genesis_25_30",
    name: "Jacob's Red Lentil Stew — Genesis 25:30",
    emoji: "🍲",
    description: "A dense red lentil stew, slow-cooked with onions, garlic, and olive oil, known for its vibrant color and earthy flavor.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "lentils_dry", quantity: 1, unit: "cup" },
      { id: "onion", quantity: 1, unit: "each" },
      { id: "garlic", quantity: 3, unit: "clove" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "water", quantity: 4, unit: "cup" },
      { id: "salt", quantity: 2, unit: "tsp" },
      { id: "cumin", quantity: 1, unit: "tsp" },
      { id: "ground_coriander", quantity: 0.5, unit: "tsp" },
      { id: "parsley", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Heat olive oil in a large pot over medium heat. Add chopped onion and sauté until translucent, about 5 minutes.",
      "Add minced garlic and cook for 1 minute until fragrant.",
      "Add rinsed red lentils, water (or broth), salt, cumin, and coriander. Stir to combine.",
      "Bring to a boil, then reduce heat to low and simmer uncovered for 20–25 minutes, stirring occasionally, until lentils are soft and the stew thickens.",
      "Adjust salt to taste. Serve warm, garnished with fresh parsley and a drizzle of olive oil."
    ]
  },

  {
    id: "ezekiel_bread_ezekiel_4_9",
    name: "Ezekiel Bread — Ezekiel 4:9",
    emoji: "🍞",
    description: "A highly nutritious bread made from a blend of wheat, barley, beans, lentils, millet, and spelt, forming a complete protein.",
    baseServings: 12,
    servingLabel: "slices",
    ingredients: [
      { id: "whole_wheat_flour", quantity: 1.5, unit: "cup" },
      { id: "barley_flour", quantity: 0.5, unit: "cup" },
      { id: "millet_flour", quantity: 0.5, unit: "cup" },
      { id: "spelt_flour", quantity: 0.5, unit: "cup" },
      { id: "lentils_cooked", quantity: 0.25, unit: "cup" },
      { id: "fava_beans", quantity: 0.25, unit: "cup" },
      { id: "water", quantity: 1.5, unit: "cup" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1.5, unit: "tsp" },
      { id: "honey", quantity: 1, unit: "tbsp" },
      { id: "active_dry_yeast", quantity: 2.25, unit: "tsp" }
    ],
    instructions: [
      "In a small bowl, dissolve the yeast (if using) and honey in 1/2 cup warm water. Let sit for 5–10 minutes until foamy",
      "In a large bowl, combine all flours and salt. Add the mashed lentils, mashed fava beans, olive oil, yeast mixture, and remaining warm water.",
      "Knead the dough for 8–10 minutes until smooth and elastic, adding more flour or water as needed.",
      "Place the dough in an oiled bowl, cover with a cloth, and let rise in a warm place for 1–1.5 hours until doubled in size.",
      "Punch down the dough, shape into a round loaf, and place on a parchment-lined baking sheet.",
      "Cover and let rise again for 30–45 minutes.",
      "Preheat the oven to 375°F. Bake for 30–35 minutes until golden brown and hollow when tapped on the bottom.",
      "Cool completely on a wire rack before slicing."
    ]
  },

  {
    id: "ancient_hummus_style_dip",
    name: "Ancient Hummus-Style Dip",
    emoji: "🫘",
    description: "A rustic chickpea dip made with olive oil, garlic, and local herbs, served with unleavened bread.",
    baseServings: 8,
    servingLabel: "servings (1/4 cup each)",
    ingredients: [
      { id: "chickpeas", quantity: 1.5, unit: "cup" },
      { id: "tahini", quantity: 3, unit: "tbsp" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "lemon_juice", quantity: 3, unit: "tbsp" },
      { id: "cumin", quantity: 0.25, unit: "tsp" },
      { id: "salt", quantity: 1, unit: "pinch" },
      { id: "water", quantity: 0.25, unit: "cup" },
      { id: "mint", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "In a food processor or mortar, combine chickpeas, tahini, olive oil, crushed garlic, lemon juice, cumin, and salt.",
      "Process or pound until smooth, gradually adding warm water until the dip reaches a creamy, spreadable consistency.",
      "Taste and adjust salt and lemon as needed.",
      "Transfer to a serving bowl. Drizzle with olive oil and garnish with fresh mint or parsley.",
      "Serve with warm flatbread or fresh vegetables."
    ]
  },

  {
    id: "broiled_fish_with_honeycomb_luke_24_42",
    name: "Broiled Fish with Honeycomb — Luke 24:42",
    emoji: "🐟",
    description: "Fresh fish broiled over hot coals, served with a piece of honeycomb — representing a post-resurrection meal as described in Luke.",
    baseServings: 2,
    servingLabel: "servings",
    ingredients: [
      { id: "white_fish", quantity: 2, unit: "each" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "dried_thyme", quantity: 1, unit: "tsp" },
      { id: "lemon", quantity: 1, unit: "each" },
      { id: "honey", quantity: 2, unit: "oz" }
    ],
    instructions: [
      "Preheat a grill, broiler, or prepare a charcoal fire to medium-high heat.",
      "Pat the fish dry with a cloth. Score the skin lightly on both sides in 2–3 places.",
      "Rub the fish inside and out with olive oil, salt, pepper, and thyme.",
      "Place the fish directly on the grill or under the broiler. Cook 5–7 minutes per side, depending on thickness, until the skin is crisp and the flesh flakes easily with a fork.",
      "Squeeze lemon over the cooked fish.",
      "Serve immediately with a small piece of honeycomb or a drizzle of honey on the side."
    ]
  },

  {
    id: "roasted_chickpea_grain_bowl",
    name: "Roasted Chickpea & Grain Bowl",
    emoji: "🍚",
    description: "A hearty bowl combining toasted grains (wheat or barley) with roasted chickpeas, seasonal vegetables, and olive oil.",
    baseServings: 4,
    servingLabel: "bowls",
    ingredients: [
      { id: "chickpeas", quantity: 1, unit: "cup" },
      { id: "barley_cooked", quantity: 1, unit: "cup" },
      { id: "tomato", quantity: 1, unit: "cup" },
      { id: "cucumber", quantity: 0.5, unit: "each" },
      { id: "onion", quantity: 0.25, unit: "each" },
      { id: "olive_oil", quantity: 3, unit: "tbsp" },
      { id: "salt", quantity: 2, unit: "tsp" },
      { id: "black_pepper", quantity: 1, unit: "tsp" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "mint", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Preheat the oven to 400°F. Pat chickpeas dry and toss with 1 tbsp olive oil, 2 tsp salt, and dried oregano. Spread on a baking sheet.",
      "Roast chickpeas for 20–25 minutes, shaking the pan halfway, until golden and crispy.",
      "In a large bowl, combine cooked barley, cherry tomatoes, cucumber, red onion, and remaining olive oil and salt.",
      "Top with roasted chickpeas and fresh mint.",
      "Serve with lemon wedges on the side."
    ]
  },

  {
    id: "herb_crusted_roast_lamb",
    name: "Herb-Crusted Roast Lamb",
    emoji: "🥩",
    description: "Slow-roasted lamb with a crust of salt, cumin, and bitter herbs, traditionally prepared for festive celebrations.",
    baseServings: 5,
    servingLabel: "servings",
    ingredients: [
      { id: "lamb", quantity: 2, unit: "lb" },
      { id: "garlic", quantity: 4, unit: "clove" },
      { id: "olive_oil", quantity: 3, unit: "tbsp" },
      { id: "salt", quantity: 1.5, unit: "tsp" },
      { id: "cumin", quantity: 1, unit: "tsp" },
      { id: "dried_thyme", quantity: 1, unit: "tsp" },
      { id: "dried_oregano", quantity: 1, unit: "tsp" },
      { id: "black_pepper", quantity: 0.5, unit: "tsp" },
      { id: "parsley", quantity: 2, unit: "tbsp" },
      { id: "water", quantity: 1, unit: "cup" }
    ],
    instructions: [
      "Preheat the oven to 375°F.",
      "Make small slits all over the lamb and insert garlic slivers into each slit.",
      "In a small bowl, combine olive oil, salt, cumin, thyme, oregano, black pepper, and parsley to form a paste.",
      "Rub the herb paste generously over the entire surface of the lamb.",
      "Place the lamb in a roasting pan with 1 cup of water or broth.",
      "Roast for 20 minutes, then reduce heat to 325°F and continue roasting for 1–1.5 hours (until internal temperature reaches 135° F for medium-rare, or 145°F for medium).",
      "Remove from the oven, tent with foil, and let rest for 15 minutes before slicing.",
      "Serve with roasted vegetables and pan juices drizzled over the top."
    ]
  },

  {
    id: "barley_fig_porridge",
    name: "Barley & Fig Porridge",
    emoji: "🥣",
    description: "A comforting porridge of barley cooked in milk or water, sweetened with dried figs and a drizzle of honey.",
    baseServings: 4,
    servingLabel: "bowls",
    ingredients: [
      { id: "pearl_barley_dry", quantity: 1, unit: "cup" },
      { id: "milk", quantity: 3, unit: "cup" },
      { id: "figs_dried", quantity: 0.5, unit: "cup" },
      { id: "honey", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 0.5, unit: "tsp" },
      { id: "cinnamon", quantity: 0.5, unit: "tsp" },
      { id: "walnuts", quantity: 0.25, unit: "cup" }
    ],
    instructions: [
      "In a medium saucepan, combine barley, milk (or water), and salt. Bring to a boil over medium-high heat.",
      "Reduce heat to low, cover, and simmer for 35–40 minutes, stirring occasionally, until barley is tender and the mixture has thickened.",
      "Stir in chopped dried figs, honey (or date syrup), and cinnamon. Cook for 5 more minutes.",
      "Remove from heat. If the porridge is too thick, stir in additional milk to reach desired consistency.",
      "Serve warm, topped with nuts and an extra drizzle of honey if desired."
    ]
  },

  {
    id: "pomegranate_glazed_quail",
    name: "Pomegranate-Glazed Quail",
    emoji: "🐦",
    description: "Roasted quail brushed with a pomegranate juice reduction, balancing sweet and tart flavors.",
    baseServings: 4,
    servingLabel: "servings (1 quail each)",
    ingredients: [
      { id: "quail", quantity: 4, unit: "each" },
      { id: "pomegranate_juice", quantity: 1, unit: "cup" },
      { id: "honey", quantity: 2, unit: "tbsp" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "salt", quantity: 2, unit: "tsp" },
      { id: "black_pepper", quantity: 1, unit: "tsp" },
      { id: "dried_thyme", quantity: 1, unit: "tsp" },
      { id: "garlic", quantity: 2, unit: "clove" },
      { id: "pomegranate_seeds", quantity: 2, unit: "tbsp" },
      { id: "dried_rosemary", quantity: 1, unit: "sprig" }
    ],
    instructions: [
      "In a small saucepan, combine pomegranate juice and honey. Bring to a boil, then reduce heat to medium-low and simmer for 15–20 minutes until reduced by half and syrupy. Set aside.",
      "Preheat the oven to 400° F.",
      "In a small bowl, mix olive oil, salt, pepper, thyme, and minced garlic.",
      "Rub the mixture all over the quails, inside and out.",
      "Place the quails on a baking sheet or roasting pan. Roast for 15–18 minutes, brushing with the pomegranate glaze twice during cooking.",
      "Remove from the oven. Brush one final coat of glaze over the quails.",
      "Garnish with fresh pomegranate seeds and rosemary sprigs before serving."
    ]
  },

  {
    id: "seven_species_salad",
    name: "\"Seven Species\" Salad",
    emoji: "🥗",
    description: "A festive salad combining cooked wheat berries, fresh grapes, figs, pomegranate seeds, and olives, dressed with olive oil and date syrup.",
    baseServings: 4,
    servingLabel: "servings",
    ingredients: [
      { id: "wheat_berries_cooked", quantity: 1, unit: "cup" },
      { id: "grapes", quantity: 0.5, unit: "cup" },
      { id: "figs_fresh", quantity: 4, unit: "each" },
      { id: "pomegranate_seeds", quantity: 0.25, unit: "cup" },
      { id: "olives_black", quantity: 0.25, unit: "cup" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "date_syrup", quantity: 1, unit: "tbsp" },
      { id: "lemon_juice", quantity: 1, unit: "tbsp" },
      { id: "salt", quantity: 0.25, unit: "tsp" },
      { id: "mint", quantity: 2, unit: "tbsp" },
      { id: "walnuts", quantity: 2, unit: "tbsp" }
    ],
    instructions: [
      "In a large bowl, combine cooked wheat berries, halved grapes, quartered figs, pomegranate seeds, and olives.",
      "In a small bowl, whisk together olive oil, date syrup, lemon juice, and salt to make the dressing.",
      "Pour the dressing over the salad and toss gently to combine.",
      "Fold in fresh mint and toasted nuts if using.",
      "Let the salad rest for 10 minutes at room temperature to allow flavors to meld.",
      "Serve at room temperature or slightly chilled."
    ]
  },
];
