document.addEventListener("DOMContentLoaded", () => {
  const characters = [
    {
      name: "Water Lairei",
      element: "water",
      class: "sniper",
      image: "images/WLai.jpg",
      profile: "characters/WLairei.html",
    },
    {
      name: "Earth Icateztol",
      element: "earth",
      class: "striker",
      image: "images/ETez",
      profile: "characters/WLairei.html",
    },
    // add more characters here...
  ];

  const searchInput = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filter-bar button");
  const scrollBtn = document.getElementById("scrollTopBtn");
  const container = document.getElementById("characterGrid");

  const normalize = (str) => str?.toLocaleLowerCase().trim() || "";

  // build characters from inline data

  characters.forEach((char) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.element = normalize(char.element);
    card.dataset.class = normalize(char.class);

    card.innerHTML = `
    <img src="${char.img}" alt="${char.name}">
    <h2>${char.name}</h2>
    <p>${char.element} | ${char.class}</p>
    <a href="${char.profile}">View Profile</a>
    `;

    container.appendChild(card);
  });

  //after cards load, enable search/filter logic
  const cards = document.querySelectorAll(".card");

  // live search
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = normalize(searchInput.value);
      cards.forEach((card) => {
        const name = normalize(card.querySelector("h2")?.textContent);
        const element = normalize(card.dataset.element);
        const classes = normalize(card.dataset.class);
        const match =
          name.includes(query) ||
          element.includes(query) ||
          classes.includes(query);
        card.style.display = match ? "block" : "none";
      });
    });
  }

  // filter buttons by element

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = normalize(btn.dataset.filter);
      cards.forEach((card) => {
        const element = normalize(card.dataset.element);
        const classes = normalize(card.dataset.class);
        const match =
          filter === "all" || element === filter || classes === filter;
        card.style.display = match ? "block" : "none";
      });
    });
  });
  // scroll to top

  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
