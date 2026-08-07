/* =========================================================================
   Recipe Calculator — App Logic
   ========================================================================= */

const NUTRIENT_KEYS = ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"];
const NUTRIENT_LABELS = {
  calories: "Calories", protein: "Protein", carbs: "Carbohydrates",
  fat: "Fat", fiber: "Fiber", sugar: "Sugar", sodium: "Sodium"
};
const NUTRIENT_UNITS = {
  calories: "kcal", protein: "g", carbs: "g", fat: "g", fiber: "g", sugar: "g", sodium: "mg"
};

const STORAGE_KEYS = { recipes: "rc_custom_recipes", ingredients: "rc_custom_ingredients" };

// ---- State ---------------------------------------------------------------

let ingredientDB = [];   // merged default + custom
let recipeDB = [];       // merged default + custom
let currentRecipeId = null;
let currentServings = null;
let ingredientRowCount = 0;

// ---- Bootstrap -------------------------------------------------------------

function loadCustomRecipes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.recipes)) || []; }
  catch (e) { return []; }
}
function loadCustomIngredients() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ingredients)) || []; }
  catch (e) { return []; }
}
function saveCustomRecipes(list) { localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(list)); }
function saveCustomIngredients(list) { localStorage.setItem(STORAGE_KEYS.ingredients, JSON.stringify(list)); }

function rebuildDatabases() {
  const customIngredients = loadCustomIngredients().map(i => ({ ...i, custom: true }));
  const customRecipes = loadCustomRecipes().map(r => ({ ...r, custom: true }));
  ingredientDB = [...INGREDIENTS, ...customIngredients];
  recipeDB = [...RECIPES, ...customRecipes];
}

function getIngredient(id) { return ingredientDB.find(i => i.id === id); }
function getRecipe(id) { return recipeDB.find(r => r.id === id); }

// ---- Unit conversion & nutrition math --------------------------------------

function gramsPerUnit(ingredient, unit) {
  if (GLOBAL_UNITS_TO_GRAMS[unit] !== undefined) return GLOBAL_UNITS_TO_GRAMS[unit];
  if (ingredient.units && ingredient.units[unit] !== undefined) return ingredient.units[unit];
  return null;
}

function availableUnitsFor(ingredient) {
  const specific = ingredient.units ? Object.keys(ingredient.units) : [];
  return [...specific, ...Object.keys(GLOBAL_UNITS_TO_GRAMS)];
}

function computeIngredientNutrition(ingredient, quantity, unit) {
  const gpu = gramsPerUnit(ingredient, unit);
  const grams = gpu === null ? 0 : quantity * gpu;
  const factor = grams / 100;
  const result = {};
  NUTRIENT_KEYS.forEach(k => { result[k] = (ingredient.per100g[k] || 0) * factor; });
  result._grams = grams;
  return result;
}

function emptyNutrition() {
  const n = {};
  NUTRIENT_KEYS.forEach(k => n[k] = 0);
  return n;
}

function addNutrition(a, b) {
  const n = {};
  NUTRIENT_KEYS.forEach(k => n[k] = a[k] + b[k]);
  return n;
}

// Convert a decimal to a friendly mixed-number fraction string (eighths).
function formatQuantity(qty) {
  if (qty === 0) return "0";
  const whole = Math.floor(qty);
  let frac = qty - whole;
  const denominators = [2, 3, 4, 8];
  let best = null;
  for (const d of denominators) {
    const numerator = Math.round(frac * d);
    if (numerator === 0 || numerator === d) continue;
    const g = gcd(numerator, d);
    const err = Math.abs(frac - numerator / d);
    if (best === null || err < best.err) best = { num: numerator / g, den: d / g, err };
  }
  // Fall back to decimal if fraction approximation is poor or qty is large/precise
  if (best === null || best.err > 0.02) {
    const rounded = Math.round(qty * 100) / 100;
    return trimZero(rounded);
  }
  const fracStr = `${best.num}/${best.den}`;
  return whole > 0 ? `${whole} ${fracStr}` : fracStr;
}
function trimZero(n) { return n % 1 === 0 ? String(n) : String(n); }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function pluralizeUnit(unit, qty) {
  if (unit === "each") return "";
  const noPlural = new Set(["g", "kg", "oz", "lb", "ml", "l"]);
  if (noPlural.has(unit)) return unit;
  if (qty === 1) return unit;
  const irregular = { pinch: "pinches", dash: "dashes", leaf: "leaves", inch: "inches", loaf: "loaves" };
  if (irregular[unit]) return irregular[unit];
  return unit + "s";
}

// ---- Rendering: Recipe grid -----------------------------------------------

function renderRecipeGrid() {
  const grid = document.getElementById("recipe-grid");
  grid.innerHTML = "";
  recipeDB.forEach(recipe => {
    const card = document.createElement("button");
    card.className = "recipe-card";
    card.setAttribute("data-id", recipe.id);
    const baseCals = computeRecipeTotals(recipe, recipe.baseServings).calories / recipe.baseServings;
    card.innerHTML = `
      <span class="recipe-emoji">${recipe.emoji || "🍽️"}</span>
      <span class="recipe-name">${escapeHtml(recipe.name)}${recipe.custom ? ' <span class="badge">custom</span>' : ""}</span>
      <span class="recipe-desc">${escapeHtml(truncate(recipe.description || "", 110))}</span>
      <span class="recipe-meta">${recipe.baseServings} ${escapeHtml(recipe.servingLabel || "servings")} · ~${Math.round(baseCals)} kcal/serving</span>
    `;
    card.addEventListener("click", () => selectRecipe(recipe.id));
    grid.appendChild(card);
  });
}

function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  const cut = str.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- Recipe detail & calculator -------------------------------------------

function selectRecipe(id) {
  currentRecipeId = id;
  const recipe = getRecipe(id);
  currentServings = recipe.baseServings;
  document.querySelectorAll(".recipe-card").forEach(c => {
    c.classList.toggle("active", c.getAttribute("data-id") === id);
  });
  renderRecipeDetail();
  document.getElementById("recipe-detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function computeRecipeTotals(recipe, servings) {
  const factor = servings / recipe.baseServings;
  let total = emptyNutrition();
  recipe.ingredients.forEach(item => {
    const ingredient = getIngredient(item.id);
    if (!ingredient) return;
    const scaledQty = item.quantity * factor;
    const n = computeIngredientNutrition(ingredient, scaledQty, item.unit);
    total = addNutrition(total, n);
  });
  return total;
}

function renderRecipeDetail() {
  const recipe = getRecipe(currentRecipeId);
  const container = document.getElementById("recipe-detail");
  if (!recipe) { container.classList.add("hidden"); return; }
  container.classList.remove("hidden");

  const factor = currentServings / recipe.baseServings;

  document.getElementById("detail-title").textContent = `${recipe.emoji || ""} ${recipe.name}`;
  document.getElementById("detail-desc").textContent = recipe.description || "";
  document.getElementById("servings-input").value = currentServings;
  document.getElementById("base-servings-note").textContent =
    `Original recipe makes ${recipe.baseServings} ${recipe.servingLabel || "servings"}`;

  // Ingredients
  const list = document.getElementById("ingredient-list");
  list.innerHTML = "";
  recipe.ingredients.forEach(item => {
    const ingredient = getIngredient(item.id);
    const li = document.createElement("li");
    if (!ingredient) {
      li.textContent = `${item.quantity} ${item.unit} (unknown ingredient: ${item.id})`;
      list.appendChild(li);
      return;
    }
    const scaledQty = item.quantity * factor;
    const unitLabel = pluralizeUnit(item.unit, scaledQty);
    li.innerHTML = `<span class="qty">${formatQuantity(scaledQty)}${unitLabel ? " " + unitLabel : ""}</span>
                     <span class="ing-name">${escapeHtml(ingredient.name)}</span>`;
    list.appendChild(li);
  });

  // Instructions
  const steps = document.getElementById("instruction-list");
  steps.innerHTML = "";
  (recipe.instructions || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    steps.appendChild(li);
  });

  // Nutrition
  renderNutrition(recipe);

  // Delete button only for custom recipes
  const delBtn = document.getElementById("delete-recipe-btn");
  delBtn.classList.toggle("hidden", !recipe.custom);
}

function renderNutrition(recipe) {
  const total = computeRecipeTotals(recipe, currentServings);
  const perServing = {};
  NUTRIENT_KEYS.forEach(k => perServing[k] = total[k] / currentServings);

  const mode = document.querySelector('input[name="nutrition-mode"]:checked').value;
  const data = mode === "total" ? total : perServing;

  const box = document.getElementById("nutrition-facts");
  box.innerHTML = `
    <h3>Nutrition Facts</h3>
    <div class="nutrition-sub">${mode === "total"
      ? `Whole batch — ${currentServings} ${recipe.servingLabel || "servings"}`
      : `Per serving`}</div>
    <div class="nutrition-calories">
      <span>Calories</span>
      <span>${Math.round(data.calories)}</span>
    </div>
    <div class="nutrition-divider"></div>
    ${NUTRIENT_KEYS.filter(k => k !== "calories").map(k => `
      <div class="nutrition-row">
        <span>${NUTRIENT_LABELS[k]}</span>
        <span>${formatNutrientValue(data[k])} ${NUTRIENT_UNITS[k]}</span>
      </div>
    `).join("")}
  `;
}

function formatNutrientValue(v) {
  if (v >= 100) return Math.round(v);
  return Math.round(v * 10) / 10;
}

// ---- Servings controls ------------------------------------------------

function setServings(val) {
  const n = Math.max(0.25, Number(val) || 1);
  currentServings = Math.round(n * 4) / 4; // quarter-serving precision
  renderRecipeDetail();
}

// ---- Custom recipe builder -------------------------------------------

function openRecipeModal() {
  document.getElementById("recipe-modal").classList.remove("hidden");
  document.getElementById("ingredient-rows").innerHTML = "";
  document.getElementById("recipe-form").reset();
  ingredientRowCount = 0;
  addIngredientRow();
  refreshIngredientDatalist();
}
function closeRecipeModal() {
  document.getElementById("recipe-modal").classList.add("hidden");
}

function refreshIngredientDatalist() {
  const dl = document.getElementById("ingredient-options");
  dl.innerHTML = ingredientDB.map(i => `<option value="${escapeHtml(i.name)}">`).join("");
}

function addIngredientRow(prefill) {
  ingredientRowCount++;
  const rowId = `ing-row-${ingredientRowCount}`;
  const wrapper = document.createElement("div");
  wrapper.className = "ingredient-row";
  wrapper.id = rowId;
  wrapper.innerHTML = `
    <input type="text" class="ing-name-input" list="ingredient-options" placeholder="Ingredient name" required value="${prefill ? escapeHtml(prefill.name) : ""}">
    <input type="number" class="ing-qty-input" step="any" min="0" placeholder="Qty" required value="${prefill ? prefill.quantity : ""}">
    <select class="ing-unit-input"></select>
    <button type="button" class="remove-row-btn" title="Remove ingredient">✕</button>
  `;
  document.getElementById("ingredient-rows").appendChild(wrapper);
  populateUnitSelect(wrapper.querySelector(".ing-unit-input"), prefill ? prefill.unit : null);
  wrapper.querySelector(".remove-row-btn").addEventListener("click", () => wrapper.remove());
}

function populateUnitSelect(select, selected) {
  const units = ["g", "kg", "oz", "lb", "ml", "l", "cup", "tbsp", "tsp", "each", "clove", "stick"];
  select.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
  if (selected) select.value = selected;
}

function handleSaveRecipe(e) {
  e.preventDefault();
  const name = document.getElementById("recipe-name-input").value.trim();
  const baseServings = Number(document.getElementById("recipe-servings-input").value);
  const servingLabel = document.getElementById("recipe-serving-label-input").value.trim() || "servings";
  const instructionsRaw = document.getElementById("recipe-instructions-input").value.trim();
  const instructions = instructionsRaw ? instructionsRaw.split("\n").map(s => s.trim()).filter(Boolean) : [];

  if (!name || !baseServings || baseServings <= 0) {
    alert("Please provide a recipe name and a valid serving size.");
    return;
  }

  const rows = document.querySelectorAll("#ingredient-rows .ingredient-row");
  const ingredients = [];
  let hasUnknown = false;
  rows.forEach(row => {
    const ingName = row.querySelector(".ing-name-input").value.trim();
    const qty = Number(row.querySelector(".ing-qty-input").value);
    const unit = row.querySelector(".ing-unit-input").value;
    if (!ingName || !qty) return;
    const match = ingredientDB.find(i => i.name.toLowerCase() === ingName.toLowerCase());
    if (match) {
      ingredients.push({ id: match.id, quantity: qty, unit });
    } else {
      hasUnknown = true;
    }
  });

  if (ingredients.length === 0) {
    alert(hasUnknown
      ? "None of the ingredients matched the database. Add unknown ingredients first via 'Add Ingredient to Database'."
      : "Please add at least one ingredient.");
    return;
  }
  if (hasUnknown) {
    const proceed = confirm("Some ingredients weren't found in the database and will be skipped. Continue anyway?");
    if (!proceed) return;
  }

  const id = "custom_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") + "_" + Date.now();
  const recipe = { id, name, baseServings, servingLabel, ingredients, instructions, emoji: "📝",
    description: "Your custom recipe" };

  const custom = loadCustomRecipes();
  custom.push(recipe);
  saveCustomRecipes(custom);
  rebuildDatabases();
  renderRecipeGrid();
  closeRecipeModal();
  selectRecipe(id);
}

function handleDeleteRecipe() {
  const recipe = getRecipe(currentRecipeId);
  if (!recipe || !recipe.custom) return;
  if (!confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
  const custom = loadCustomRecipes().filter(r => r.id !== recipe.id);
  saveCustomRecipes(custom);
  rebuildDatabases();
  currentRecipeId = null;
  document.getElementById("recipe-detail").classList.add("hidden");
  renderRecipeGrid();
}

// ---- Custom ingredient builder -----------------------------------------

function openIngredientModal() {
  document.getElementById("ingredient-modal").classList.remove("hidden");
  document.getElementById("ingredient-form").reset();
}
function closeIngredientModal() {
  document.getElementById("ingredient-modal").classList.add("hidden");
}

function handleSaveIngredient(e) {
  e.preventDefault();
  const name = document.getElementById("new-ing-name").value.trim();
  if (!name) return;
  const id = "custom_" + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") + "_" + Date.now();

  const per100g = {};
  NUTRIENT_KEYS.forEach(k => {
    const el = document.getElementById(`new-ing-${k}`);
    per100g[k] = Number(el.value) || 0;
  });

  const units = {};
  ["cup", "tbsp", "tsp", "each"].forEach(u => {
    const el = document.getElementById(`new-ing-unit-${u}`);
    const val = Number(el.value);
    if (val > 0) units[u] = val;
  });

  const ingredient = { id, name, category: "Custom", per100g, units };
  const custom = loadCustomIngredients();
  custom.push(ingredient);
  saveCustomIngredients(custom);
  rebuildDatabases();
  refreshIngredientDatalist();
  closeIngredientModal();
  alert(`"${name}" added to your ingredient database. You can now use it in a recipe.`);
}

// ---- Wiring ---------------------------------------------------------------

function init() {
  rebuildDatabases();
  renderRecipeGrid();

  document.getElementById("servings-input").addEventListener("input", e => setServings(e.target.value));
  document.getElementById("servings-minus").addEventListener("click", () => {
    setServings(currentServings - 1);
  });
  document.getElementById("servings-plus").addEventListener("click", () => {
    setServings(currentServings + 1);
  });
  document.querySelectorAll('input[name="nutrition-mode"]').forEach(r =>
    r.addEventListener("change", () => renderRecipeDetail())
  );

  document.getElementById("add-recipe-btn").addEventListener("click", openRecipeModal);
  document.getElementById("close-recipe-modal").addEventListener("click", closeRecipeModal);
  document.getElementById("cancel-recipe-btn").addEventListener("click", closeRecipeModal);
  document.getElementById("recipe-form").addEventListener("submit", handleSaveRecipe);
  document.getElementById("add-ingredient-row-btn").addEventListener("click", () => addIngredientRow());
  document.getElementById("delete-recipe-btn").addEventListener("click", handleDeleteRecipe);

  document.getElementById("add-ingredient-btn").addEventListener("click", openIngredientModal);
  document.getElementById("close-ingredient-modal").addEventListener("click", closeIngredientModal);
  document.getElementById("cancel-ingredient-btn").addEventListener("click", closeIngredientModal);
  document.getElementById("ingredient-form").addEventListener("submit", handleSaveIngredient);

  document.getElementById("search-input").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".recipe-card").forEach(card => {
      const name = card.querySelector(".recipe-name").textContent.toLowerCase();
      card.style.display = name.includes(q) ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
