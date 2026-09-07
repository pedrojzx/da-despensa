// =====================================================================
// Da Despensa — lógica da aplicação
// Consome a API pública TheMealDB (chave de teste gratuita "1")
// =====================================================================

(() => {
  "use strict";

  const API_BASE = "https://www.themealdb.com/api/json/v1/1";

  // -------------------------------------------------------------------
  // TheMealDB só conhece nomes de ingredientes em inglês. Este dicionário
  // traduz os termos mais comuns em português para o valor esperado pela
  // API, e também é usado para mostrar sugestões em português ao usuário.
  // -------------------------------------------------------------------
  const PT_TO_EN_INGREDIENTS = {
    "frango": "chicken",
    "peito de frango": "chicken breast",
    "coxa de frango": "chicken thighs",
    "carne": "beef",
    "carne bovina": "beef",
    "carne moida": "ground beef",
    "carne de porco": "pork",
    "porco": "pork",
    "bacon": "bacon",
    "linguica": "sausage",
    "salsicha": "sausage",
    "presunto": "ham",
    "peru": "turkey",
    "cordeiro": "lamb",
    "pato": "duck",
    "peixe": "fish",
    "salmao": "salmon",
    "atum": "tuna",
    "camarao": "shrimp",
    "lagosta": "lobster",
    "caranguejo": "crab",
    "polvo": "octopus",
    "lula": "squid",
    "ovo": "egg",
    "ovos": "eggs",
    "leite": "milk",
    "leite de coco": "coconut milk",
    "manteiga": "butter",
    "queijo": "cheese",
    "queijo cremoso": "cream cheese",
    "requeijao": "cream cheese",
    "mussarela": "mozzarella",
    "parmesao": "parmesan",
    "creme de leite": "cream",
    "creme azedo": "sour cream",
    "iogurte": "yogurt",
    "arroz": "rice",
    "macarrao": "pasta",
    "massa": "pasta",
    "espaguete": "spaghetti",
    "farinha": "flour",
    "pao": "bread",
    "batata": "potato",
    "batatas": "potatoes",
    "tomate": "tomato",
    "tomates": "tomatoes",
    "cebola": "onion",
    "alho": "garlic",
    "cenoura": "carrot",
    "cenouras": "carrots",
    "pimentao": "bell pepper",
    "pimenta": "chili",
    "pimenta do reino": "black pepper",
    "pepino": "cucumber",
    "alface": "lettuce",
    "espinafre": "spinach",
    "brocolis": "broccoli",
    "couve flor": "cauliflower",
    "abobrinha": "zucchini",
    "berinjela": "eggplant",
    "cogumelo": "mushroom",
    "cogumelos": "mushrooms",
    "milho": "corn",
    "ervilha": "peas",
    "ervilhas": "peas",
    "feijao": "beans",
    "feijao preto": "black beans",
    "grao de bico": "chickpeas",
    "lentilha": "lentils",
    "limao": "lemon",
    "laranja": "orange",
    "maca": "apple",
    "banana": "banana",
    "morango": "strawberries",
    "morangos": "strawberries",
    "abacate": "avocado",
    "coco": "coconut",
    "acucar": "sugar",
    "sal": "salt",
    "azeite": "olive oil",
    "oleo": "vegetable oil",
    "mel": "honey",
    "vinagre": "vinegar",
    "molho de soja": "soy sauce",
    "manjericao": "basil",
    "oregano": "oregano",
    "salsa": "parsley",
    "coentro": "coriander",
    "canela": "cinnamon",
    "gengibre": "ginger",
    "cominho": "cumin",
    "paprica": "paprika",
    "chocolate": "chocolate",
    "baunilha": "vanilla",
    "vinho": "wine",
    "cerveja": "beer",
    "agua": "water",
    "fermento": "yeast",
    "mostarda": "mustard",
    "maionese": "mayonnaise",
    "noz moscada": "nutmeg",
    "alecrim": "rosemary",
    "tomilho": "thyme",
  };

  function stripAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function normalizeQuery(str) {
    return stripAccents(str.trim().toLowerCase());
  }

  // Traduz um termo digitado (em português ou inglês) para o valor que a
  // API entende. Faz correspondência exata primeiro, depois por prefixo.
  function translateToApiTerm(input) {
    const normalized = normalizeQuery(input);
    if (PT_TO_EN_INGREDIENTS[normalized]) {
      return PT_TO_EN_INGREDIENTS[normalized];
    }
    const partialMatch = Object.keys(PT_TO_EN_INGREDIENTS).find(
      (key) => normalized.startsWith(key) || key.startsWith(normalized)
    );
    if (partialMatch) {
      return PT_TO_EN_INGREDIENTS[partialMatch];
    }
    return input; // assume que já é um termo em inglês reconhecido pela API
  }

  const els = {
    form: document.getElementById("search-form"),
    input: document.getElementById("ingredient-input"),
    suggestions: document.getElementById("suggestions"),
    surpriseBtn: document.getElementById("surprise-btn"),
    status: document.getElementById("status"),
    emptyState: document.getElementById("empty-state"),
    results: document.getElementById("results"),
    favoritesView: document.getElementById("favorites-view"),
    favToggle: document.getElementById("fav-toggle"),
    favCount: document.getElementById("fav-count"),
    detail: document.getElementById("recipe-detail"),
    backBtn: document.getElementById("back-btn"),
    recipeImage: document.getElementById("recipe-image"),
    recipeFavBtn: document.getElementById("recipe-fav-btn"),
    recipeTitle: document.getElementById("recipe-title"),
    recipeTags: document.getElementById("recipe-tags"),
    recipeVideo: document.getElementById("recipe-video"),
    recipeIngredients: document.getElementById("recipe-ingredients"),
    recipeSteps: document.getElementById("recipe-steps"),
    themeToggle: document.getElementById("theme-toggle"),
    installBtn: document.getElementById("install-btn"),
    micBtn: document.getElementById("mic-btn"),
    micHint: document.getElementById("mic-hint"),
  };

  const state = {
    theme: localStorage.getItem("dd-theme") || "auto",
    ingredientList: [],
    favorites: loadFavorites(),
    currentMealId: null,
    showingFavorites: false,
  };

  // -------------------------------------------------------------------
  // Favorites persistence (localStorage)
  // -------------------------------------------------------------------
  function loadFavorites() {
    try {
      const raw = localStorage.getItem("dd-favorites");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveFavorites() {
    localStorage.setItem("dd-favorites", JSON.stringify(state.favorites));
    updateFavCount();
  }

  function updateFavCount() {
    const count = Object.keys(state.favorites).length;
    els.favCount.hidden = count === 0;
    els.favCount.textContent = count;
  }

  function isFavorite(id) {
    return Boolean(state.favorites[id]);
  }

  function toggleFavorite(meal) {
    if (state.favorites[meal.idMeal]) {
      delete state.favorites[meal.idMeal];
    } else {
      state.favorites[meal.idMeal] = {
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
      };
    }
    saveFavorites();
  }

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------
  function setStatus(message, isError = false) {
    els.status.textContent = message;
    els.status.dataset.error = isError ? "true" : "false";
  }

  function toApiIngredient(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "_");
  }

  function titleCase(str) {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha na requisição (${response.status})`);
    return response.json();
  }

  function hideAllSections() {
    els.emptyState.hidden = true;
    els.results.hidden = true;
    els.favoritesView.hidden = true;
    els.detail.hidden = true;
  }

  // -------------------------------------------------------------------
  // API calls
  // -------------------------------------------------------------------
  async function loadIngredientList() {
    try {
      const data = await fetchJson(`${API_BASE}/list.php?i=list`);
      state.ingredientList = (data.meals || []).map((m) => m.strIngredient).filter(Boolean);
    } catch {
      state.ingredientList = [];
    }
  }

  async function searchByIngredient(ingredient) {
    const data = await fetchJson(`${API_BASE}/filter.php?i=${encodeURIComponent(toApiIngredient(ingredient))}`);
    return data.meals || [];
  }

  async function lookupMeal(id) {
    const data = await fetchJson(`${API_BASE}/lookup.php?i=${encodeURIComponent(id)}`);
    return data.meals ? data.meals[0] : null;
  }

  async function fetchRandomMeal() {
    const data = await fetchJson(`${API_BASE}/random.php`);
    return data.meals ? data.meals[0] : null;
  }

  // -------------------------------------------------------------------
  // Rendering: suggestions
  // -------------------------------------------------------------------
  let suggestionTimer = null;

  function hideSuggestions() {
    els.suggestions.hidden = true;
    els.suggestions.innerHTML = "";
    els.input.setAttribute("aria-expanded", "false");
  }

  function handleInputChange() {
    const query = els.input.value.trim().toLowerCase();
    clearTimeout(suggestionTimer);
    if (query.length < 2) {
      hideSuggestions();
      return;
    }
    suggestionTimer = setTimeout(() => {
      const matches = state.ingredientList
        .filter((ing) => ing.toLowerCase().includes(query))
        .slice(0, 8);
      renderSuggestions(matches);
    }, 150);
  }

  function renderSuggestions(matches) {
    if (!matches.length) {
      hideSuggestions();
      return;
    }
    els.suggestions.innerHTML = "";
    matches.forEach((ingredient) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = ingredient.toLowerCase();
      btn.addEventListener("click", () => {
        els.input.value = titleCase(ingredient);
        hideSuggestions();
        runSearch(ingredient);
      });
      li.appendChild(btn);
      els.suggestions.appendChild(li);
    });
    els.suggestions.hidden = false;
    els.input.setAttribute("aria-expanded", "true");
  }

  // -------------------------------------------------------------------
  // Rendering: results grid
  // -------------------------------------------------------------------
  function renderResultsGrid(container, meals, emptyMessage) {
    container.innerHTML = "";
    if (!meals.length) {
      const p = document.createElement("p");
      p.className = "status";
      p.textContent = emptyMessage;
      container.appendChild(p);
      container.hidden = false;
      return;
    }
    meals.forEach((meal) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "recipe-card";
      card.innerHTML = `
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" width="200" height="200" loading="lazy" />
        <span class="recipe-card-body">
          <span class="recipe-card-title">${meal.strMeal}</span>
        </span>
      `;
      card.addEventListener("click", () => openRecipe(meal.idMeal));
      container.appendChild(card);
    });
    container.hidden = false;
  }

  // -------------------------------------------------------------------
  // Rendering: recipe detail
  // -------------------------------------------------------------------
  function extractIngredients(meal) {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (name && name.trim()) {
        list.push({ name: name.trim(), measure: measure ? measure.trim() : "" });
      }
    }
    return list;
  }

  function extractSteps(meal) {
    if (!meal.strInstructions) return [];
    const raw = meal.strInstructions.replace(/\r/g, "");
    let steps = raw
      .split(/\n+/)
      .map((s) => s.replace(/^\s*\d+[.)-]\s*/, "").trim())
      .filter(Boolean);
    if (steps.length <= 1) {
      steps = raw
        .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú])/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return steps;
  }

  function renderRecipeDetail(meal) {
    state.currentMealId = meal.idMeal;

    els.recipeImage.src = meal.strMealThumb;
    els.recipeImage.alt = meal.strMeal;
    els.recipeTitle.textContent = meal.strMeal;

    els.recipeTags.innerHTML = "";
    if (meal.strCategory) {
      els.recipeTags.innerHTML += `<span class="pantry-tag tag-category">${meal.strCategory}</span>`;
    }
    if (meal.strArea) {
      els.recipeTags.innerHTML += `<span class="pantry-tag">${meal.strArea}</span>`;
    }

    if (meal.strYoutube) {
      els.recipeVideo.href = meal.strYoutube;
      els.recipeVideo.hidden = false;
    } else {
      els.recipeVideo.hidden = true;
    }

    const isFav = isFavorite(meal.idMeal);
    els.recipeFavBtn.setAttribute("aria-pressed", isFav ? "true" : "false");

    els.recipeIngredients.innerHTML = "";
    extractIngredients(meal).forEach((ing, index) => {
      const li = document.createElement("li");
      li.className = "ingredient-row";
      const checkboxId = `ing-${index}`;
      li.innerHTML = `
        <input type="checkbox" id="${checkboxId}" />
        <label for="${checkboxId}">${ing.name}</label>
        <span class="measure">${ing.measure}</span>
      `;
      els.recipeIngredients.appendChild(li);
    });

    els.recipeSteps.innerHTML = "";
    extractSteps(meal).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      els.recipeSteps.appendChild(li);
    });

    hideAllSections();
    els.detail.hidden = false;
    els.detail.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function openRecipe(id) {
    setStatus("Carregando receita…");
    try {
      const meal = await lookupMeal(id);
      if (!meal) {
        setStatus("Não foi possível encontrar essa receita.", true);
        return;
      }
      renderRecipeDetail(meal);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao carregar a receita. Tente novamente.", true);
    }
  }

  // -------------------------------------------------------------------
  // Search / random flows
  // -------------------------------------------------------------------
  async function runSearch(ingredient) {
    hideSuggestions();
    setStatus(`Procurando receitas com ${ingredient.toLowerCase()}…`);
    hideAllSections();
    state.showingFavorites = false;
    try {
      const meals = await searchByIngredient(ingredient);
      renderResultsGrid(
        els.results,
        meals,
        `Nenhuma receita encontrada com "${ingredient}". Tente outro ingrediente.`
      );
      setStatus(meals.length ? `${meals.length} receita(s) encontrada(s).` : "");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao buscar receitas. Verifique sua conexão.", true);
      els.emptyState.hidden = false;
    }
  }

  async function runSurprise() {
    setStatus("Sorteando uma receita…");
    hideAllSections();
    try {
      const meal = await fetchRandomMeal();
      if (!meal) {
        setStatus("Não foi possível sortear uma receita agora.", true);
        els.emptyState.hidden = false;
        return;
      }
      renderRecipeDetail(meal);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao sortear receita. Tente novamente.", true);
      els.emptyState.hidden = false;
    }
  }

  function showFavoritesView() {
    hideAllSections();
    state.showingFavorites = true;
    const meals = Object.values(state.favorites);
    renderResultsGrid(
      els.favoritesView,
      meals,
      "Você ainda não salvou nenhuma receita. Toque no ícone de coração dentro de uma receita para guardá-la aqui."
    );
    setStatus(meals.length ? `${meals.length} receita(s) favorita(s).` : "");
  }

  // -------------------------------------------------------------------
  // Event wiring
  // -------------------------------------------------------------------
  function handleSearchSubmit(event) {
    event.preventDefault();
    const value = els.input.value.trim();
    if (!value) return;
    runSearch(value);
  }

  function handleBack() {
    hideAllSections();
    if (state.showingFavorites) {
      showFavoritesView();
    } else if (!els.results.hidden || els.results.children.length) {
      els.results.hidden = els.results.children.length === 0;
      if (els.results.hidden) els.emptyState.hidden = false;
    } else {
      els.emptyState.hidden = false;
    }
    setStatus("");
  }

  function handleRecipeFavToggle() {
    if (!state.currentMealId) return;
    const meal = {
      idMeal: state.currentMealId,
      strMeal: els.recipeTitle.textContent,
      strMealThumb: els.recipeImage.src,
    };
    toggleFavorite(meal);
    els.recipeFavBtn.setAttribute("aria-pressed", isFavorite(meal.idMeal) ? "true" : "false");
  }

  function applyTheme() {
    if (state.theme === "auto") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", state.theme);
    }
  }

  function handleThemeToggle() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentlyDark = state.theme === "dark" || (state.theme === "auto" && prefersDark);
    state.theme = currentlyDark ? "light" : "dark";
    localStorage.setItem("dd-theme", state.theme);
    applyTheme();
  }

  // -------------------------------------------------------------------
  // PWA: prompt de instalação personalizado
  // -------------------------------------------------------------------
  let deferredInstallPrompt = null;

  function setupInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      els.installBtn.hidden = false;
    });

    els.installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      els.installBtn.hidden = true;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
    });

    window.addEventListener("appinstalled", () => {
      els.installBtn.hidden = true;
      deferredInstallPrompt = null;
    });
  }

  // -------------------------------------------------------------------
  // Recurso de hardware: busca por voz usando o microfone (Web Speech API)
  // -------------------------------------------------------------------
  function setupVoiceSearch() {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      // Navegador sem suporte (ex.: Safari em iOS): mantém o botão oculto.
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let isListening = false;

    els.micBtn.hidden = false;

    recognition.addEventListener("start", () => {
      isListening = true;
      els.micBtn.setAttribute("aria-pressed", "true");
      els.micHint.hidden = false;
    });

    recognition.addEventListener("end", () => {
      isListening = false;
      els.micBtn.setAttribute("aria-pressed", "false");
      els.micHint.hidden = true;
    });

    recognition.addEventListener("error", (event) => {
      isListening = false;
      els.micBtn.setAttribute("aria-pressed", "false");
      els.micHint.hidden = true;
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setStatus("Permissão de microfone negada. Ative-a nas configurações do navegador.", true);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setStatus("Não foi possível ouvir agora. Tente novamente.", true);
      }
    });

    recognition.addEventListener("result", (event) => {
      const spoken = event.results[0][0].transcript.trim();
      if (spoken) {
        els.input.value = titleCase(spoken);
        runSearch(spoken);
      }
    });

    els.micBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      hideSuggestions();
      try {
        recognition.start();
      } catch {
        // já em execução; ignora
      }
    });
  }

  function init() {
    applyTheme();
    updateFavCount();
    loadIngredientList();
    setupInstallPrompt();
    setupVoiceSearch();

    els.form.addEventListener("submit", handleSearchSubmit);
    els.input.addEventListener("input", handleInputChange);
    els.input.addEventListener("blur", () => setTimeout(hideSuggestions, 150));
    els.surpriseBtn.addEventListener("click", runSurprise);
    els.backBtn.addEventListener("click", handleBack);
    els.recipeFavBtn.addEventListener("click", handleRecipeFavToggle);
    els.favToggle.addEventListener("click", () => {
      els.favToggle.setAttribute(
        "aria-pressed",
        els.favToggle.getAttribute("aria-pressed") === "true" ? "false" : "true"
      );
      showFavoritesView();
    });
    els.themeToggle.addEventListener("click", handleThemeToggle);

    document.addEventListener("click", (e) => {
      if (!els.suggestions.contains(e.target) && e.target !== els.input) {
        hideSuggestions();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
