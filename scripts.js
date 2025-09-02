const isCharacterDetailPage =
  document.querySelector(".character-detail") !== null;

// Config
const CONFIG = {
  defaultImage: "../images/default.jpg",
  defaultProfile: "characters.html",
  itemsPerPage: 12,
};

const effectTypes = {
  // Buffs
  "Crit.Damage_Up": "buff",
  Blitz: "buff",
  Speed_Up: "buff",
  Divine_Luck: "buff",
  Remove_Debuff: "buff",
  Damage_Against_Fire_Up: "buff",
  Spirit_Gain: "buff",
  "Crit.Rate_Up": "buff",
  Attack_Up: "buff",
  Conditional_Damage_Up: "buff",
  Regeneration: "buff",
  Action_Gauge_Up: "buff",
  Cleanse: "buff",
  Action_Ready: "buff",
  Proportional_DMG_Up: "buff",
  "Conditional_Crit.Damage_Up": "buff",
  Revenge: "buff",
  Attack_Strength_Up: "buff",
  Resolve: "buff",
  Damage_Against_Light_Up: "buff",
  Solar_Resolve: "buff",
  Invincibility: "buff",
  Increased_Damage_to_Water: "buff",
  Reduced_Damage_Taken_from_Water: "buff",
  Health_Up: "buff",
  Defense_Up: "buff",
  Increased_Damage_Dealt: "buff",
  Increased_Damage_to_Light: "buff",
  Healing: "buff",
  Exposed_Weakness: "buff",
  "Hunter's_Mark": "buff",
  Flurry: "debuff",

  // Debuffs
  Defense_Down: "debuff",
  Elemental_Weakness: "debuff",
  Action_Gauge_Down: "debuff",
};

function classifyEffect(effectName) {
  return effectTypes[effectName] || "buff";
}

// State
let state = {
  characters: [],
  filteredCharacters: [],
  filters: {
    search: "",
    element: null,
    class: null,
    effect: null,
  },
  sort: "name-asc",
  currentPage: 1,
  _renderScheduled: false,
  _searchIndex: [],
};

// DOM Elements
const dom = {
  container: document.getElementById("characterGrid"),
  searchInput: !isCharacterDetailPage
    ? document.getElementById("searchInput")
    : null,
  sortSelect: document.getElementById("sort-select"),
  filterButtons: document.querySelectorAll(".filter-buttons button"),
  scrollBtn: document.getElementById("scrollTopBtn"),
  resetBtn: document.getElementById("resetFilters"),
  paginationContainer: !isCharacterDetailPage
    ? document.getElementById("pagination")
    : null,
  loadingIndicator: document.getElementById("loading-indicator"),
};

// Singleton IntersectionObserver for lazy loading
let lazyLoadObserver = null;

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function normalize(str) {
  if (str === null || str === undefined) return "";
  return str.toString().toLowerCase().trim();
}

function normalizeEffectName(effect) {
  if (!effect) return "";
  return effect.toLowerCase().replace(/\s+/g, "_");
}

function buildSearchIndex(characters) {
  return characters.map((char) => ({
    id: char.id,
    searchable: [
      char.name.toLowerCase(),
      char.element.toLowerCase(),
      char.class.toLowerCase(),
      ...char.effects.map((e) => e.toLowerCase()),
    ].join(" "),
  }));
}

function scheduleRender() {
  if (state._renderScheduled) return;

  state._renderScheduled = true;
  requestAnimationFrame(() => {
    state._renderScheduled = false;
    renderCharacterGrid();
  });
}

// Main Initialization
async function init() {
  showLoading(true);

  state.sort = "name-asc";
  if (dom.sortSelect) dom.sortSelect.value = "name-asc";
  await loadCharacters();

  if (isCharacterDetailPage) {
    renderCharacterDetailPage();
  } else {
    if (!dom.container) {
      console.error("Character grid container not found");
      return;
    }
    initializeFilters();
    scheduleRender();
    initializeEffectsFilter();
    setupEventListeners();
    renderPagination();
    initMobileMenu();
    enhanceTouchInteractions();
  }
  showLoading(false);
}

// Data Loading
async function loadCharacters() {
  try {
    const response = await fetch("details/characters.json");
    const data = await response.json();
    state.characters = data.characters.map((char) => ({
      ...char,
      image: char.image || CONFIG.defaultImage,
      profile: char.profile || CONFIG.defaultProfile,
      effects: char.effects || [],
      skills: char.skills || [],
      stats: char.stats || { atk: 0, def: 0, spd: 0, hp: 0 },
      // Precompute sort keys
      _sortName: char.name.toLowerCase(),
      _sortElement: char.element.toLowerCase(),
      _sortClass: char.class.toLowerCase(),
    }));

    state.filteredCharacters = [...state.characters];
    state._searchIndex = buildSearchIndex(state.characters);
    state.sort = "name-asc";
    sortCards();
  } catch (error) {
    console.error("Failed to load characters:", error);
    state.characters = [];
    state.filteredCharacters = [];
    state._searchIndex = [];

    if (dom.container) {
      dom.container.innerHTML = `
        <div class="error">
          Failed to load characters. Please try again later.
        </div>
      `;
    }
  }
}

// Rendering
function renderCharacterGrid() {
  if (!dom.container) return;

  const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
  const end = start + CONFIG.itemsPerPage;
  const paginatedChars = state.filteredCharacters.slice(start, end);

  if (paginatedChars.length === 0) {
    dom.container.innerHTML = `
      <div class="no-results">
        No characters found matching your filters.
        <button id="reset-filters-btn">Reset Filters</button>
      </div>
    `;
    document
      .getElementById("reset-filters-btn")
      ?.addEventListener("click", resetFilters);
    return;
  }

  // Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();

  paginatedChars.forEach((char) => {
    const card = createCharacterCard(char);
    fragment.appendChild(card);
  });

  // Clear and append in one operation
  dom.container.innerHTML = "";
  dom.container.appendChild(fragment);

  initLazyLoad();
  renderPagination();
  updateResultsCounter();
  updateActiveFiltersCount();
}

function createCharacterCard(char) {
  const card = document.createElement("article");
  card.className = "card";
  card.dataset.name = char.name.toLowerCase();
  card.dataset.element = char.element.toLowerCase();
  card.dataset.class = char.class.toLowerCase();
  card.dataset.effects = char.effects.join(" ").toLowerCase();

  card.innerHTML = `
    <img data-src="${char.image}" alt="${char.name}" class="lazyload">
    <div class="card-content">
      <h2>${char.name}</h2>
      <p class="element ${char.element.toLowerCase()}">${char.element}</p>
      <p class="class">${char.class}</p>
      <div class="effects">
        <span class="effect-tag">${
          char.effects[0]?.replace(/_/g, " ") || ""
        }</span>
        ${
          char.effects.length > 1
            ? `
          <details class="effect-dropdown">
          <summary>+${char.effects.length - 1} more</summary>
          ${char.effects
            .slice(1)
            .map(
              (e) => `<span class="effect-tag">${e.replace(/_/g, " ")}</span>`
            )
            .join("")}
          </details>
          `
            : ""
        }
          </div>
      <a href="character-detail.html?character=${
        char.id
      }" class="profile-btn">View Profile</a>
    </div>
  `;

  return card;
}

function renderCharacterDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get("character");
  const character = state.characters.find((c) => c.id === characterId);

  const container = document.getElementById("character-root");
  if (!container) return;

  if (!character) {
    container.innerHTML = `
      <div class="error">
        Character not found. <a href="characters.html">Return to list</a>
      </div>
    `;
    return;
  }

  renderCharacterDetail(character);
}

function renderCharacterDetail(character) {
  const container = document.getElementById("character-root");
  const baseId = character.base_id || null;
  if (!container) return;

  container.innerHTML = `
    <section class="character-header">
      <img src="${character.image}" alt="${
    character.name
  }" class="character-art">
      
      <div class="character-meta">
        <h1>${character.name}</h1>
        <div class="meta-tags">
          <span class="element ${character.element.toLowerCase()}">${
    character.element
  }</span>
          <span class="class">${character.class}</span>
        </div>

        <div class="linked-elements">
          <p class="see-other">See other ${character.element}:</p>
          <div class="element-icons">
            ${getLinkedElements(character.element, character.id, baseId)}
          </div>
        </div>
      </div>
    </section>
    
    <!-- Character Bio Section -->
    <section class="character-bio">
      <h2>Description</h2>
      <p>${character.description || "No description available."}</p>
    </section>

    <!-- Recommended Builds -->
    <section class="recommended-builds">
      <h2>Recommended Builds</h2>
      ${
        character.recommended_builds
          ? renderBuilds(character.recommended_builds)
          : "<p>No recommended builds yet.</p>"
      }
    </section>

    <section class="character-stats">
      <h2>Stats</h2>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat-label">ATK</span>
          <span class="stat-value">${character.stats.atk}</span>
        </div>
        <div class="stat">
          <span class="stat-label">DEF</span>
          <span class="stat-value">${character.stats.def}</span>
        </div>
        <div class="stat">
          <span class="stat-label">SPD</span>
          <span class="stat-value">${character.stats.spd}</span>
        </div>
        <div class="stat">
          <span class="stat-label">HP</span>
          <span class="stat-value">${character.stats.hp}</span>
        </div>
      </div>
    </section>
      
    <section class="character-skills">
      <h2>Skills</h2>
      ${character.skills
        .map(
          (skill) => `
        <div class="skill">
          <h3>${skill.name}</h3>
          <p>${skill.description}</p>
        </div>
      `
        )
        .join("")}
    </section>

    <section class="character-effects">
      <div class="effect-tabs">
        <button class="effect-tab active" data-tab="buffs">Buffs (${countSkillsByType(
          character.skills,
          "buff"
        )})</button>
        <button class="effect-tab" data-tab="debuffs">Debuffs (${countSkillsByType(
          character.skills,
          "debuff"
        )})</button>
      </div>

      <div class="effect-content">
        <div class="effect-pane active" id="buffs-pane">
          ${renderSkillsByType(character.skills, "buff")}
        </div>
        <div class="effect-pane" id="debuffs-pane">
          ${renderSkillsByType(character.skills, "debuff")}
        </div>
      </div>
    </section>
    
    <a href="characters.html" class="back-button">
      ← Back to Characters
    </a>
  `;

  setupTabs();
}

// Mobile menu functionality for character detail pages

function initMobileMenu() {
  //Only run on mobile screens
  if (window.innerWidth < 769) {
    //Create mobile menu toggle button
    const menuToggle = document.createElement("button");
    menuToggle.innerHTML = "☰ Menu";
    menuToggle.className = "mobile-menu-toggle";
    menuToggle.style.cssText = `
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 1000;
      padding: 0.5rem 1rem;
      background: #2c3e50;
      color: white;
      border: none;
      border-radius: 4px;
      font-family: 'Nunito', sans-serif;
      display: block;
    `;

    document.body.appendChild(menuToggle);

    // Handle sidebar if it exists
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.style.display = "none";
      sidebar.style.position = "fixed";
      sidebar.style.top = "0";
      sidebar.style.left = "0";
      sidebar.style.height = "100vh";
      sidebar.style.width = "70%";
      sidebar.style.maxWidth = "300px";
      sidebar.style.zIndex = "999";
      sidebar.style.overflowY = "auto";
      sidebar.style.paddingTop = "50px";
      sidebar.style.transform = "translateX(-100%)";
      sidebar.style.transition = "transform 0.3s ease";

      menuToggle.addEventListener("click", () => {
        const isVisible = sidebar.style.transform === "translateX(0%)";
        sidebar.style.transform = isVisible
          ? "translateX(-100%)"
          : "translateX(0%)";
      });
    }

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        sidebar &&
        !sidebar.contains(e.target) &&
        e.target !== menuToggle &&
        sidebar.style.transform === "translateX(0%)"
      ) {
        sidebar.style.transform = "translateX(-100%)";
      }
    });
  }
}

// Touch-friendly card interactions
function enhanceTouchInteractions() {
  // Enable passive event listeners for better scrolling performance
  document.addEventListener("touchstart", function () {}, { passive: true });

  // Prevent zoom on double-tap
  let lastTap = 0;
  document.addEventListener(
    "touchend",
    function (event) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        event.preventDefault();
      }
      lastTap = currentTime;
    },
    false
  );
}

// Filtering, Sorting and Pagination
function initializeEffectsFilter() {
  const effectsContainer = document.querySelector(".effects-filter-buttons");
  if (!effectsContainer) return;

  // Clear existing content
  effectsContainer.innerHTML = "";

  // Get all unique effects from characters
  const allEffects = getAllEffectsFromCharacters();

  // Add "All" button
  const allButton = createEffectButton("all", "All", true);
  effectsContainer.appendChild(allButton);

  // Add "No Effects" button
  const noneButton = createEffectButton("none", "No Effects", false);
  effectsContainer.appendChild(noneButton);

  // Sort effects alphabetically and add buttons
  const sortedEffects = Object.keys(allEffects).sort((a, b) => {
    return allEffects[a].localeCompare(allEffects[b]);
  });

  sortedEffects.forEach((effectKey) => {
    const button = createEffectButton(effectKey, allEffects[effectKey], false);
    effectsContainer.appendChild(button);
  });

  // Add event listeners to effect buttons
  addEffectButtonListeners();
}

// Extract all unique effects from characters
function getAllEffectsFromCharacters() {
  const effects = {};

  state.characters.forEach((character) => {
    if (character.effects && Array.isArray(character.effects)) {
      character.effects.forEach((effect) => {
        if (!effects[effect]) {
          effects[effect] = effect.replace(/_/g, " ");
        }
      });
    }
  });

  return effects;
}

// Create effect button element
function createEffectButton(filterValue, displayText, isActive) {
  const button = document.createElement("button");
  button.setAttribute("data-filter", filterValue);
  button.textContent = displayText;

  if (isActive) {
    button.classList.add("active");
  }

  return button;
}

// Add event listeners to effect buttons
function addEffectButtonListeners() {
  const effectButtons = document.querySelectorAll(
    ".effects-filter-buttons button"
  );

  effectButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons in this group
      const buttonsContainer = this.closest(".effects-filter-buttons");
      buttonsContainer.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Update the effect filter
      state.filters.effect =
        this.dataset.filter === "all" ? null : this.dataset.filter;
      filterCards();
    });
  });
}
function filterCards() {
  const { search, element, class: charClass, effect } = state.filters;
  const normalizedSearch = normalize(search);

  state.filteredCharacters = state.characters.filter((char, index) => {
    const matchesSearch =
      !normalizedSearch ||
      state._searchIndex[index].searchable.includes(normalizedSearch);
    const matchesElement = !element || char.element.toLowerCase() === element;
    const matchesClass = !charClass || char.class.toLowerCase() === charClass;
    const matchesEffect =
      !effect ||
      (effect === "none"
        ? char.effects.length === 0
        : char.effects.some(
            (e) => normalizeEffectName(e) === effect.toLowerCase()
          ));

    return matchesSearch && matchesElement && matchesClass && matchesEffect;
  });

  state.currentPage = 1; // Reset to first page when filters change
  sortCards();
}

function sortCards() {
  const [sortKey, direction] = state.sort.split("-");
  const sortField = `_sort${
    sortKey.charAt(0).toUpperCase() + sortKey.slice(1)
  }`;

  state.filteredCharacters.sort((a, b) => {
    const aValue = a[sortField] || "";
    const bValue = b[sortField] || "";

    return direction === "desc"
      ? bValue.localeCompare(aValue)
      : aValue.localeCompare(bValue);
  });

  scheduleRender();
}

function renderPagination() {
  if (!dom.paginationContainer) return;

  const totalPages = Math.ceil(
    state.filteredCharacters.length / CONFIG.itemsPerPage
  );
  if (totalPages <= 1) {
    dom.paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = `<div class="pagination">`;

  // Previous button
  paginationHTML += `
    <button class="page-btn ${state.currentPage === 1 ? "disabled" : ""}" 
            data-page="${state.currentPage - 1}">
      &laquo; Prev
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `
      <button class="page-btn ${i === state.currentPage ? "active" : ""}" 
              data-page="${i}">
        ${i}
      </button>
    `;
  }

  // Next button
  paginationHTML += `
    <button class="page-btn ${
      state.currentPage === totalPages ? "disabled" : ""
    }" 
            data-page="${state.currentPage + 1}">
      Next &raquo;
    </button>
  `;

  paginationHTML += `</div>`;
  dom.paginationContainer.innerHTML = paginationHTML;
}

// Event Handlers
function setupEventListeners() {
  // Use event delegation for most click events
  document.addEventListener("click", (e) => {
    // Handle filter buttons
    const filterBtn = e.target.closest(".filter-buttons button");
    if (filterBtn) {
      handleFilterButtonClick(filterBtn);
      return;
    }

    // Handle pagination buttons
    const pageBtn = e.target.closest(".page-btn");
    if (pageBtn && !pageBtn.classList.contains("disabled")) {
      state.currentPage = parseInt(pageBtn.dataset.page);
      scheduleRender();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Handle reset filters button in no-results message
    const resetFiltersBtn = e.target.closest("#reset-filters-btn");
    if (resetFiltersBtn) {
      resetFilters();
      return;
    }
  });

  // Debounced Search input
  if (dom.searchInput) {
    dom.searchInput.addEventListener(
      "input",
      debounce(() => {
        state.filters.search = dom.searchInput.value;
        filterCards();
      }, 300)
    );
  }

  // Sort select
  if (dom.sortSelect) {
    dom.sortSelect.addEventListener("change", () => {
      state.sort = dom.sortSelect.value;
      sortCards();
    });
  }

  // Reset filters button
  if (dom.resetBtn) {
    dom.resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetFilters();
    });
  }

  // Scroll to top
  if (dom.scrollBtn) {
    window.addEventListener("scroll", () => {
      dom.scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });
    dom.scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function handleFilterButtonClick(btn) {
  const filterValue = btn.dataset.filter;
  const filterGroup = btn.closest(".filter-group");
  if (!filterGroup) return;

  const label = filterGroup.querySelector("label, legend");
  if (!label) return;

  const labelText = label.textContent.toLowerCase();
  let filterType;

  if (labelText.includes("element")) filterType = "element";
  else if (labelText.includes("class")) filterType = "class";
  else if (labelText.includes("effect")) filterType = "effect";
  else return;

  state.filters[filterType] = filterValue === "all" ? null : filterValue;
  filterCards();

  // Update UI
  const buttonsContainer = btn.closest(".filter-buttons");
  buttonsContainer.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("active", b === btn);
  });
}

function initializeFilters() {
  document.querySelectorAll('[data-filter="all"]').forEach((btn) => {
    btn.classList.add("active");
  });
  document
    .querySelectorAll('.filter-buttons button:not([data-filter="all"])')
    .forEach((btn) => {
      btn.classList.remove("active");
    });
  filterCards();
}

function resetFilters() {
  state.filters = {
    search: "",
    element: null,
    class: null,
    effect: null,
  };

  if (dom.searchInput) dom.searchInput.value = "";
  document.querySelectorAll(".filter-buttons button").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelectorAll('[data-filter="all"]').forEach((btn) => {
    btn.classList.add("active");
  });

  filterCards();
}

// Utility Functions
function renderBuilds(builds) {
  return `
    <div class="builds-grid">
      ${builds
        .map(
          (build) => `
        <div class="build-card">
          <h3>${build.name}</h3>
          <div class="build-details">
            <p><strong>Weapon:</strong> ${build.weapon}</p>
            <p><strong>Artifacts:</strong> ${build.artifacts.join(", ")}</p>
            <p><strong>Priority Stats:</strong> ${build.stats.join(" > ")}</p>
            <p class="build-desc">${build.description}</p>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

function countSkillsByType(skills, type) {
  const effects = skills
    .flatMap((skill) => skill.effects || [])
    .filter((effect) => effectTypes[effect] === type);

  const uniqueEffects = [...new Set(effects)];
  return uniqueEffects.length;
}

function renderSkillsByType(skills, type) {
  const effects = skills
    .flatMap((skill) => skill.effects || [])
    .filter((effect) => effectTypes[effect] === type);

  const uniqueEffects = [...new Set(effects)];

  if (uniqueEffects.length === 0) {
    return `<p class="no-effects">No ${type} effects</p>`;
  }

  return `
    <ul class="effect-list">
      ${uniqueEffects
        .map(
          (effect) =>
            `<li class="effect-item">${effect.replace(/_/g, " ")}</li>`
        )
        .join("")}
    </ul>
  `;
}

function getLinkedElements(currentElement, currentId, baseId) {
  // Get base_id if exists, otherwise use element
  const variants = state.characters.filter((char) => {
    // Don't show current character
    if (char.id === currentId) return false;
    if (baseId) return char.base_id === baseId;
    return char.element.toLowerCase() === currentElement.toLowerCase();
  });

  if (variants.length === 0) {
    return '<p class="no-variants">No variants found</p>';
  }

  return variants
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (char) => `
      <a href="character-detail.html?character=${encodeURIComponent(char.id)}"
         class="variant-link"
         data-tooltip="${char.element} ${char.name}">
        <img src="${char.image}" alt="${char.name}">
      </a>
    `
    )
    .join("");
}

function setupTabs() {
  document.querySelectorAll(".effect-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".effect-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document
        .querySelectorAll(".effect-pane")
        .forEach((p) => p.classList.remove("active"));
      document
        .getElementById(`${tab.dataset.tab}-pane`)
        .classList.add("active");
    });
  });
}

// Update results counter
function updateResultsCounter() {
  const showingCount = document.getElementById("showing-count");
  const totalCount = document.getElementById("total-count");

  if (showingCount && totalCount) {
    const start = (state.currentPage - 1) * CONFIG.itemsPerPage;
    const end = Math.min(
      start + CONFIG.itemsPerPage,
      state.filteredCharacters.length
    );

    showingCount.textContent = `${start + 1}-${end}`;
    totalCount.textContent = state.filteredCharacters.length;
  }
}

// Update active filters counter
function updateActiveFiltersCount() {
  const activeFiltersCount = document.querySelector(".active-filters-count");
  if (!activeFiltersCount) return;

  // Only count filters that are actively filtering (not null/empty)
  const activeCount = Object.values(state.filters).filter(
    (filter) => filter !== null && filter !== ""
  ).length;

  activeFiltersCount.textContent = activeCount;
}

function initLazyLoad() {
  if (typeof IntersectionObserver === "undefined") {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll(".lazyload").forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }

  if (!lazyLoadObserver) {
    lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazyload");
          lazyLoadObserver.unobserve(img);
        }
      });
    });
  }

  // Only observe new images
  document.querySelectorAll(".lazyload:not([data-observed])").forEach((img) => {
    img.setAttribute("data-observed", "true");
    lazyLoadObserver.observe(img);
  });
}

function showLoading(show) {
  if (!dom.loadingIndicator) return;
  dom.loadingIndicator.style.display = show ? "block" : "none";
}

// Cleanup function
function cleanup() {
  if (lazyLoadObserver) {
    lazyLoadObserver.disconnect();
    lazyLoadObserver = null;
  }
}

// Add cleanup on page unload
window.addEventListener("beforeunload", cleanup);

// Start the application
document.addEventListener("DOMContentLoaded", init);
