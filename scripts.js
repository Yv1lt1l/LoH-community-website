const isCharacterDetailPage =
  document.querySelector(".character-detail") !== null;

document.addEventListener("DOMContentLoaded", () => {
  // 1. First, get all DOM elements with null checks

  const searchInput = !isCharacterDetailPage
    ? document.getElementById("searchInput")
    : null;
  const sortSelect = document.getElementById("sort-select");
  const container = document.getElementById("characterGrid");

  // 2. Immediately after, add main page guard clause
  if (!isCharacterDetailPage) {
    if (!searchInput || !sortSelect || !container) {
      console.log("Missing required elements on characters page");
      return; //Exit early if on main page but missing elements
    }
  }

  const characters = [
    {
      name: "Water Lairei",
      id: "water_lairei",
      element: "Water",
      class: "Sniper",
      effects: ["Freeze"],
      image: "../images/character-images/water-Lai.jpg",
      stats: { atk: 1420, def: 980 },
      skills: [
        {
          name: "Frost Arrow",
          effect: "Deals 180% ATK damage with 50% chance to Freeze",
          type: "debuff",
        },
      ],
      profile: "characters/water_lairei.html",
    },
    {
      name: "Earth Icateztol",
      id: "earth_icateztol",
      element: "Earth",
      class: "Striker",
      effects: ["Poison"],
      image: "../images/character-images/earth-icateztol.jpg",
      stats: { atk: 1420, def: 980 },
      skills: [
        {
          name: "Frost Arrow",
          effect: "Heals 20% HP",
          type: "buff",
        },
      ],
      profile: "characters/.html",
    },
    {
      name: "Dark Alev",
      id: "dark_alev",
      element: "Dark",
      class: "Guardian",
      effects: ["Stun"],
      image: "../images/character-images/dark-Alev.jpg",
      stats: { atk: 1420, def: 980 },
      skills: [],
      profile: "characters/WLairei.html",
    },
    {
      name: "Light Ahilam",
      id: "light_ahilam",
      element: "Light",
      class: "Warrior",
      effects: [],
      image: "../images/character-images/light-ahilam.jpg",
      stats: { atk: 1420, def: 980 },
      skills: [
        {
          name: "Frost Arrow",
          effect: "Deals 180% ATK damage with 50% chance to Freeze",
        },
      ],
      profile: "characters/WLairei.html",
    },
    {
      name: "Fire Vanessa",
      id: "fire_vanessa",
      element: "Fire",
      class: "Cleric",
      effects: [],
      image: "../images/character-images/fire-vanessa.jpg",
      stats: { atk: 1420, def: 980 },
      skills: [
        {
          name: "Frost Arrow",
          effect: "Deals 180% ATK damage with 50% chance to Freeze",
        },
      ],
      profile: "characters/WLairei.html",
    },

    // add more characters here...
  ];

  if (isCharacterDetailPage) {
    // Get character ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const characterId = urlParams.get("character");

    // Find matching character
    const character = characters.find((c) => c.id === characterId);

    if (character) {
      renderCharacterDetail(character);
    } else {
      document.getElementById("character-root").innerHTML = `
      <div class="error>
      Character not found. <a href="characters.html">Return to list</a>
      </div>
      `;
    }
    return;
  } else {
    //Main pafe logic only
    if (container) {
      characters.forEach((char) => {
        const card = document.createElement("article");
        card.className = "card";

        // Set dataset attributes for filtering
        card.dataset.name = char.name.toLowerCase();
        card.dataset.element = char.element.toLowerCase();
        card.dataset.class = char.class.toLowerCase();
        card.dataset.effects = char.effects.join(" ").toLowerCase();

        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}">
            <div class="card-content">
              <h2>${char.name}</h2>
              <p class="element ${char.element.toLowerCase()}">${
          char.element
        }</p>
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
        try {
          container.appendChild(card);
        } catch (e) {
          console.error("Failed to append card:", e);
        }
      });
    }
  }

  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const scrollBtn = document.getElementById("scrollTopBtn");
  const resetBtn = document.getElementById("resetFilters");
  const cards = container.querySelectorAll(".card");
  const normalize = (str) => str?.toLocaleLowerCase().trim() || "";

  // build characters from inline data

  //after cards load, enable search/filter logic
  let activeFilters = {
    element: null,
    class: null,
    effect: null,
  };

  function initializeFilters() {
    //set "All" buttons as active by default
    document.querySelectorAll('[data-filter="all"]').forEach((btn) => {
      if (!btn.classList.contains("active")) {
        btn.classList.add("active");
      }
    });

    //clear any active states
    document
      .querySelectorAll('.filter-buttons button:not([data-filter="all"])')
      .forEach((btn) => {
        btn.classList.remove("active");
      });

    //reset active filters
    activeFilters = {
      element: null,
      class: null,
      effect: null,
    };

    filterCards();
  }

  initializeFilters();

  function renderCharacterDetail(character) {
    const container = document.getElementById("character-root");

    const charImage =
      typeof character.image === "string"
        ? character.image
        : character.image.icon || "../images/default.jpg";
    const charStats = character.stats || { atk: "N/A", def: "N/A" };
    const charSkills = character.skills || [];

    container.innerHTML = `
    <section class="character-header">
      <img src="${charImage}" 
           alt="${character.name}" 
           class="character-art">
      
      <div class="character-meta">
        <h1>${character.name}</h1>
        <div class="meta-tags">
          <span class="element ${character.element}">${character.element}</span>
          <span class="class">${character.class}</span>

          <!-- Linked Elementa Section -->
          <div class="linked-elements">
          <p class="see-other">See other ${character.element}:</p>
          <div class="element-icons">
          ${getLinkedElements(character.element, character.id)}
          </div>
        </div>
      </div>
      </div>
    </section>
    
    <section class="character-stats">
      <h2>Stats</h2>
      <div class="stat-grid">
        <div class="stat">
          <span class="stat-label">ATK</span>
          <span class="stat-value">${charStats.atk}</span>
        </div>
        <div class="stat">
          <span class="stat-label">DEF</span>
          <span class="stat-value">${charStats.DEF}</span>
        </div>
        <!-- Add other stats -->
      </div>
    </section>
      
    <section class="character-skills">
      <h2>Skills</h2>
      ${charSkills
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

    <!-- New Effects Tab System -->
    <section class="character-effects">
      <div class="effect-tabs">
        <button class="effect-tab active" data-tab="buffs">Buffs (${countSkills(
          character.skills,
          "buff"
        )})</button>
        <button class="effect-tab" data-tab="debuffs">Debuffs (${countSkills(
          character.skills,
          "debuff"
        )})</button>
      </div>

      <div class="effect-content">
        <div class="effect-pane active" id="buffs-pane">
          ${renderEffects(character.skills, "buff")}
        </div>
        <div class="effects-pane" id="debuffs-pane">
          ${renderEffects(character.skills, "debuff")}
        </div>
      </div>
    </section>
    
    <a href="characters.html" class="back-button">
      ← Back to Characters
    </a>
  `;

    // Activate the tab system
    setupTabs();
  }

  // live search
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = normalize(searchInput.value);
        filterCards();
      });
    });
  }

  // filter buttons by element
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      try {
        const filterValue = this.dataset.filter;
        const filterGroup = this.closest(".filter-group");

        if (!filterGroup) return;

        // Try to find either a label or legend
        const label = filterGroup.querySelector("label, legend");
        if (!label) {
          console.error(
            "No label or legend found in filter group:",
            filterGroup
          );
          return;
        }

        // Determine filter type based on label/legend text
        let filterType;
        const labelText = label.textContent.toLowerCase();

        if (labelText.includes("element")) {
          filterType = "element";
        } else if (labelText.includes("class")) {
          filterType = "class";
        } else if (labelText.includes("effect")) {
          filterType = "effect";
        } else {
          console.error("Unknown filter type:", labelText);
          return;
        }

        console.log(`Filter clicked: ${filterType} = ${filterValue}`);

        // Toggle active state
        const buttonsContainer = this.closest(".filter-buttons");
        if (!buttonsContainer) return;

        if (filterValue === "all") {
          activeFilters[filterType] = null;
          this.classList.add("active");
          buttonsContainer.querySelectorAll("button").forEach((b) => {
            if (b !== this) b.classList.remove("active");
          });
        } else {
          if (this.classList.contains("active")) {
            this.classList.remove("active");
            activeFilters[filterType] = null;
          } else {
            buttonsContainer.querySelectorAll("button").forEach((b) => {
              b.classList.remove("active");
            });
            this.classList.add("active");
            activeFilters[filterType] = filterValue;
          }
        }

        filterCards();
      } catch (error) {
        console.error("Filter error:", error);
      }
    });
  });

  //sort function
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      if (cards.length > 0) {
        sortCards();
      }
    });
  }

  //reset all filters
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();

      //clear search input
      if (searchInput) searchInput.value = "";

      //reset active filters
      activeFilters = {
        element: null,
        class: null,
        effect: null,
      };

      // Remove active classes from all filter buttons
      document.querySelectorAll(".filter-buttons button").forEach((btn) => {
        btn.classList.remove("active");
      });

      // Activate all "All" buttons
      document.querySelectorAll('[data-filter="all"]').forEach((btn) => {
        btn.classList.add("active");
      });

      filterCards();
    });
  }

  // scroll to top

  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  //Helper to count skills by type
  function countSkills(skills, type) {
    return skills.filter((skill) => skill.type === type).length;
  }

  //Helper to render skills by type
  function renderEffects(skills, type) {
    const filtered = skills.filter((skill) => skill.type === type);
    if (filtered.length === 0)
      return `<p class="no-effects">No ${type} effects</p>`;

    return filtered
      .map(
        (skill) => `
      <div class="skill">
        <h3>${skill.name}</h3>
        <p>${skill.effect}</p>
      </div>`
      )
      .join("");
  }

  //Helper to get linked characters
  function getLinkedElements(currentElement, currentId) {
    const sameElementChars = characters.filter(
      (char) => char.element === currentElement && char.id !== currentId
    );

    if (sameElementChars.length === 0) return "<p>No other variants</p>";

    return sameElementChars
      .map(
        (char) => `
      <a href="character-detail.html?character=${
        char.id
      }" class="element-icon" title="${char.name}">
        <img src="${char.image.icon || char.image}" alt="${char.name}"></a>`
      )
      .join("");
  }

  //Tab system setup
  function setupTabs() {
    document.querySelectorAll(".effect-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove active class from all tabs
        document
          .querySelectorAll(".effect-tab")
          .forEach((t) => t.classList.remove("active"));

        // Add active class to clicked tab
        tab.classList.add("active");

        // Hide all panes
        document
          .querySelectorAll(".effect-pane")
          .forEach((p) => p.classList.remove("active"));

        // Show corresponding pane
        document
          .getElementById(`${tab.dataset.tab}-pane`)
          .classList.add("active");
      });
    });
  }

  //Main filtering function
  function filterCards() {
    console.log("Active Filters:", activeFilters);

    if (!container) return;

    const searchQuery = searchInput ? normalize(searchInput.value) : "";

    cards.forEach((card) => {
      const name = card.dataset.name;
      const element = card.dataset.element;
      const charClass = card.dataset.class;
      const effects = card.dataset.effects || "";

      //check search query

      const searchMatch =
        !searchQuery ||
        name.includes(searchQuery) ||
        element.includes(searchQuery) ||
        charClass.includes(searchQuery) ||
        effects.includes(searchQuery);

      //check filters
      const elementMatch =
        !activeFilters.element || element === activeFilters.element;

      const classMatch =
        !activeFilters.class || charClass === activeFilters.class;

      let effectMatch = true;
      if (activeFilters.effect) {
        if (activeFilters.effect === "none") {
          effectMatch = effects === "" || effects === "none";
        } else {
          effectMatch = effects.includes(activeFilters.effect);
        }
      }

      card.style.display =
        searchMatch && elementMatch && classMatch && effectMatch
          ? "block"
          : "none";
    });

    if (!isCharacterDetailPage && container) {
      sortCards();
    }
  }

  //sorting function
  function sortCards() {
    const sortValue = sortSelect.value;
    const container = document.getElementById("characterGrid");
    const cardsArray = Array.from(
      document.querySelectorAll(".card[style*='block']")
    );
    if (!container || isCharacterDetailPage) return;
    cardsArray.sort((a, b) => {
      const aValue = a.dataset[sortValue.split("-")[0]] || "";
      const bValue = b.dataset[sortValue.split("-")[0]] || "";

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

    //re-append cards in sorted order
    cardsArray.forEach((card) => container.appendChild(card));
  }
});
