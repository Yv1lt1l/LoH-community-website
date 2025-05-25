<template>
    <div class="home">
      <!-- Header with logo and nav elements -->
      <header>
        <router-link :to="{ name: 'Home' }">
          <img 
            src="@/assets/images/Logos/LOH_BI_2LINE_BG_LIGHT.jpg" 
            alt="Lord of Heroes logo" 
            width="250"
            height="150"
          />
        </router-link>
        <h1>Welcome to the Lord of Heroes Chronicles Wiki!</h1>
      </header>
  
      <!-- Main content area -->
      <div class="content-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
          <h2>Quick nav</h2>
          <section class="filters">
            <h3>Filter by Element</h3>
            <ul>
              <li><a href="#">Fire</a></li>
              <li><a href="#">Water</a></li>
              <li><a href="#">Earth</a></li>
              <li><a href="#">Light</a></li>
              <li><a href="#">Dark</a></li>
            </ul>
            <h3>Filter by Class</h3>
            <ul>
              <li><a href="#">Striker</a></li>
              <li><a href="#">Warrior</a></li>
              <li><a href="#">Guardian</a></li>
              <li><a href="#">Cleric</a></li>
              <li><a href="#">Commander</a></li>
              <li><a href="#">Sniper</a></li>
            </ul>
          </section>
          <section class="lore-box">
            <h3>Lore</h3>
            <p>find lore here</p>
          </section>
        </aside>
  
        <!-- Main content -->
        <main>
          <h2>Home</h2>
          <p>
            Here is your one stop shop to find everything you need to know about the
            mobile game Lord of Heroes. Including characters, builds, guides,
            tips&amp;tricks and more!
          </p>
          <section class="section-container">
            <h2>Jump to a Section</h2>
            <section class="card-holder">
              <article class="cards">
                <img
                  src="@/assets/images/Section thumbnail/icon_archive_hero.png"
                  alt="LoH character icon"
                  width="125"
                  height="auto"
                />
                <router-link :to="{ name: 'Characters' }">Characters</router-link>
              </article>
            </section>
          </section>
        </main>
      </div>
  
      <!-- Footer -->
      <footer></footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomeView'
  }
  </script>
  
  <style scoped>
  @import '@/assets/stylesheet.css';
  
  /* Add any component-specific styles here */
  .content-wrapper {
    display: flex;
    gap: 20px;
  }
  
  .sidebar {
    flex: 0 0 250px;
  }
  
  main {
    flex: 1;
  }
  </style>