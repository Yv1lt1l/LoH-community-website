const isCharacterDetailPage =
  document.querySelector(".character-detail") !== null;

document.addEventListener("DOMContentLoaded", () => {
  const characters = [
    {
      name: "Water Lairei",
      element: "Water",
      class: "Sniper",
      effects: ["freeze"],
      image: "../images/character-images/icons/water-Lai.jpg",
      profile: "characters/WLairei.html",
    },
    {
      name: "Earth Icateztol",
      element: "Earth",
      class: "Striker",
      effects: ["poison"],
      image: "../images/character-images/icons/earth-icateztol.jpg",
      profile: "characters/WLairei.html",
    },
    {
      name: "Dark Alev",
      element: "Dark",
      class: "Guardian",
      effects: ["stun"],
      image: "../images/character-images/icons/dark-Alev.jpg",
      profile: "characters/WLairei.html",
    },
    {
      name: "Light Ahilam",
      element: "Light",
      class: "Warrior",
      effects: [""],
      image: "../images/character-images/icons/light-ahilam.jpg",
      profile: "characters/WLairei.html",
    },
    {
      name: "Fire Vanessa",
      element: "Fire",
      class: "Cleric",
      effects: [""],
      image: "../images/character-images/icons/fire-vanessa.jpg",
      profile: "characters/WLairei.html",
    },

    // add more characters here...
  ];

  const searchInput = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const scrollBtn = document.getElementById("scrollTopBtn");
  const resetBtn = document.getElementById("resetFilters");
  const container = document.getElementById("characterGrid");
  const sortSelect = document.getElementById("sort-select");

  const normalize = (str) => str?.toLocaleLowerCase().trim() || "";

  // build characters from inline data

  characters.forEach((char) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.element = normalize(char.element);
    card.dataset.class = normalize(char.class);
    card.dataset.effects = char.effects.map((e) => normalize(e)).join(" ");
    card.dataset.name = normalize(char.name);

    card.innerHTML = `
    <img src="${char.image}" alt="${char.name}">
    <div class="card-content">
    <h2>${char.name}</h2>
    <p class="element ${char.element}">${char.element}</p>
    <p class="class"> ${char.class}</p>
    <div class="effects">${char.effects
      .map((e) => `<span class="effect-tag">${e}</span>`)
      .join("")}</div>
    <a href="${char.profile}" class="profile-btn">View Profile</a>
    </div>
    `;

    container.appendChild(card);
  });

  //after cards load, enable search/filter logic
  const cards = document.querySelectorAll(".card");
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

  // live search
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = normalize(searchInput.value);
        filterCards();
      }, 300); // 300ms delay
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

  //Main filtering function
  function filterCards() {
    const searchQuery = searchInput ? normalize(searchInput.value) : "";

    cards.forEach((card) => {
      const name = card.dataset.name;
      const element = card.dataset.element;
      const charClass = card.dataset.class;
      const effects = card.dataset.effects;

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
      const effectMatch =
        !activeFilters.effect ||
        effects.split(" ").includes(activeFilters.effect);

      card.style.display =
        searchMatch && elementMatch && classMatch && effectMatch
          ? "block"
          : "none";
    });

    sortCards();
  }

  //sorting function
  function sortCards() {
    const sortValue = sortSelect.value;
    const container = document.getElementById("characterGrid");
    const cardsArray = Array.from(
      document.querySelectorAll(".card[style*='block']")
    );

    cardsArray.sort((a, b) => {
      switch (sortValue) {
        case "name-asc":
          return a.dataset.name.localeCompare(b.dataset.name);
        case "name-desc":
          return b.dataset.name.localeCompare(a.dataset.name);
        case "element":
          return a.dataset.element.localeCompare(b.dataset.element);
        case "class":
          return a.dataset.class.localeCompare(b.dataset.class);
        default:
          return 0;
      }
    });

    //re-append cards in sorted order
    cardsArray.forEach((card) => container.appendChild(card));
  }
});
