# Recipe Calculator

A browser-based calculator for cookbook recipes. Pick a recipe, set the
number of servings you want to make, and every ingredient amount plus the
full nutrition breakdown (calories, macros, and key nutrients) updates
instantly — per serving or for the whole batch.

## Running it

No build step or server required — just open `index.html` in a browser.
If you'd rather serve it (e.g. to avoid browser file:// restrictions):

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Features

- **Serving-size scaling** — enter any serving count (supports fractional
  servings) and every ingredient quantity scales proportionally, displayed
  as friendly fractions (e.g. "1 1/2 cups").
- **Live nutrition facts** — calories, protein, carbs, fat, fiber, sugar,
  and sodium, shown per serving or for the whole batch.
- **6 built-in recipes** spanning baking, breakfast, dinner, and snacks,
  each backed by real ingredient-level nutrition data.
- **~45-ingredient nutrition database** with per-100g nutrition and
  kitchen-measure conversions (cup/tbsp/tsp/each/clove/stick) so amounts
  in any common unit convert correctly.
- **Add your own recipes** — build a recipe from ingredients already in the
  database via the "+ Add Custom Recipe" form.
- **Add your own ingredients** — for anything not in the database, add it
  with its own per-100g nutrition and measure conversions via
  "+ Add Ingredient to Database".
- Custom recipes/ingredients persist in the browser (`localStorage`), so
  they're still there next time you load the page.

## Files

- `index.html` — page structure and modals
- `style.css` — styling (light/dark aware)
- `data.js` — ingredient nutrition database and built-in recipes
- `app.js` — scaling math, unit conversion, rendering, and custom
  recipe/ingredient forms

## How the math works

Each recipe stores ingredient amounts for its original ("base") serving
count. Scaling multiplies every ingredient quantity by
`desiredServings / baseServings`. Each ingredient carries nutrition per
100g plus gram weights for the units it's used in (e.g. 1 cup of flour =
120g), so scaled quantities convert to grams and then to
calories/macros/nutrients, summed across all ingredients.
