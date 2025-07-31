const isCharacterDetailPage =
  document.querySelector(".character-detail") !== null;

// Config
const CONFIG = {
  defaultImage: "../images/default.jpg",
  defaultProfile: "characters.html",
  itemsPerPage: 12,
};

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
    renderCharacterGrid();
    setupEventListeners();
    renderPagination();
  }
  showLoading(false);
}

// Data Loading
async function loadCharacters() {
  try {
    const response = await fetch("/characters/details/characters.json");
    const data = await response.json();
    state.characters = data.characters.map((char) => ({
      ...char,
      image: char.image || CONFIG.defaultImage,
      profile: char.profile || CONFIG.defaultProfile,
      effects: char.effects || [],
      skills: char.skills || [],
      stats: char.stats || { atk: 0, def: 0, spd: 0, hp: 0 },
    }));

    state.filteredCharacters = [...state.characters];
    state.sort = "name-asc";
    sortCards();
  } catch (error) {
    console.error("Failed to load characters:", error);
    state.characters = [];
    state.filteredCharacters = [];

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

  dom.container.innerHTML = "";

  paginatedChars.forEach((char) => {
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
          ${char.effects
            .filter((e) => e && e !== "none")
            .map((e) => `<span class="effect-tag">${e}</span>`)
            .join("")}
        </div>
        <a href="character-detail.html?character=${
          char.id
        }" class="profile-btn">View Profile</a>
      </div>
    `;
    dom.container.appendChild(card);
  });

  initLazyLoad();
  renderPagination();
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
          <p>${skill.effect}</p>
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

// Filtering, Sorting and Pagination
function filterCards() {
  const { search, element, class: charClass, effect } = state.filters;
  const normalizedSearch = normalize(search);

  state.filteredCharacters = state.characters.filter((char) => {
    const name = char.name.toLowerCase();
    const charElement = char.element.toLowerCase();
    const charClassLower = char.class.toLowerCase();
    const effects = char.effects.join(" ").toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      name.includes(normalizedSearch) ||
      charElement.includes(normalizedSearch) ||
      charClassLower.includes(normalizedSearch) ||
      effects.includes(normalizedSearch);

    const matchesElement = !element || charElement === element;
    const matchesClass = !charClass || charClassLower === charClass;
    const matchesEffect =
      !effect ||
      (effect === "none"
        ? char.effects.length === 0
        : char.effects.map((e) => e.toLowerCase()).includes(effect));

    return matchesSearch && matchesElement && matchesClass && matchesEffect;
  });

  state.currentPage = 1; // Reset to first page when filters change
  renderCharacterGrid();
}

function sortCards() {
  console.log("Current sort:", state.sort);
  const sortValue = state.sort;

  state.filteredCharacters.sort((a, b) => {
    const sortKey = sortValue.split("-")[0];
    console.log(`Sorting by ${sortKey}`);
    const aValue = (a[sortKey] || "").toString().toLowerCase();
    const bValue = (b[sortKey] || "").toString().toLowerCase();

    switch (sortValue) {
      case "name-asc":
        return aValue.localeCompare(bValue);
      case "name-desc":
        return bValue.localeCompare(aValue);
      case "element":
        return aValue.localeCompare(bValue);
      case "class":
        return aValue.localeCompare(bValue);
      default:
        return 0;
    }
  });

  renderCharacterGrid();
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

  // Add event listeners
  document.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("disabled")) return;
      state.currentPage = parseInt(btn.dataset.page);
      renderCharacterGrid();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// Event Handlers
function setupEventListeners() {
  // Search input
  if (dom.searchInput) {
    let searchTimeout;
    dom.searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.filters.search = dom.searchInput.value;
        filterCards();
      });
    });
  }

  // Filter buttons
  dom.filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filterValue = this.dataset.filter;
      const filterGroup = this.closest(".filter-group");
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
      const buttonsContainer = this.closest(".filter-buttons");
      buttonsContainer.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("active", b === this);
      });
    });
  });

  // Sort select
  if (dom.sortSelect) {
    dom.sortSelect.addEventListener("change", () => {
      state.sort = dom.sortSelect.value;
      sortCards();
    });
  }

  // Reset filters
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

function normalize(str) {
  if (str === null || str === undefined) return "";
  return str.toString().toLowerCase().trim();
}

function countSkillsByType(skills, type) {
  return skills.filter((skill) => skill.type === type).length;
}

function renderSkillsByType(skills, type) {
  const filtered = skills.filter((skill) => skill.type === type);
  if (filtered.length === 0)
    return `<p class="no-effects">No ${type} effects</p>`;

  return filtered
    .map(
      (skill) => `
    <div class="skill">
      <h3>${skill.name}</h3>
      <p>${skill.effect}</p>
    </div>
  `
    )
    .join("");
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

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazyload");
        lazyLoadObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll(".lazyload").forEach((img) => {
    lazyLoadObserver.observe(img);
  });
}

function showLoading(show) {
  if (!dom.loadingIndicator) return;
  dom.loadingIndicator.style.display = show ? "block" : "none";
}

// Start the application
document.addEventListener("DOMContentLoaded", init);
