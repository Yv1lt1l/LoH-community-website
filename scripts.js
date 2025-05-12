// live search //

const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".cards");

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLocaleLowerCase();
    cards.forEach((card) => {
      const name = card.querySelector("h2")?.textContent.toLocaleLowerCase();
      const element = card.dataset.element?.toLocaleLowerCase() || "";
      const classes = card.dataset.class?.toLocaleLowerCase() || "";

      const matches =
        name.includes(query) ||
        element.includes(query) ||
        classes.includes(query);
      card.style.display = matches ? "block" : "none";
    });
  });
}

// filter buttons by element //

const filterButtons = document.querySelectorAll(".filter-bar button");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const element = card.dataset.element?.toLocaleLowerCase();
      card.style.display =
        filter === "all" || element === filter ? "block" : "none";
    });
  });
});

// scroll to top //

const scrollBtn = document.getElementById("scrollTopBtn");

if (scrollBtn) {
  Window.addEventListener("scroll", () => {
    scrollBtn.style.display = Window.scrollY > 300 ? "block" : "none";
  });

  scrollBtn.addEventListener("click", () => {
    Window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
