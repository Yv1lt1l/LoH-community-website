<template>
  <div class="characters-page">
    <header>
      <router-link to="/">
        <img
          src="@/assets/images/Logos/LOH_BI_2LINE_BG_LIGHT.jpg"
          width="125"
          height="auto"
          alt="Lord of Heroes Logo"
        />
      </router-link>
      <h1>Characters Page</h1>
    </header>

    <main>
      <section class="filter-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search Characters..."
        />
        <button @click="scrollToTop" class="scroll-top-btn">&uarr;</button>
        <button @click="setFilter('all')">All</button>
        <button @click="resetFilters">Reset Filters</button>
        <button 
          v-for="element in elements" 
          :key="element"
          @click="setFilter(element)"
          :class="{ active: activeFilter === element }"
        >
          {{ capitalizeFirstLetter(element) }}
        </button>
        <button 
          v-for="classType in classTypes" 
          :key="classType"
          @click="setFilter(classType)"
          :class="{ active: activeFilter === classType }"
        >
          {{ capitalizeFirstLetter(classType) }}
        </button>
        <h2>Filter by Effects</h2>
        <div class="effect-filters">
          <label v-for="effect in allEffects" :key="effect">
            <input type="checkbox" :value="effect" v-model="selectedEffects" />
            {{ effect }}
          </label>
          </div>
        </section>
      
      <section class="cards">
        <div 
          v-for="character in filteredCharacters" 
          :key="character.id"
          class="character-card"
          :data-element="character.element"
          :data-class="character.class"
        >
          <img 
            :src="getImagePath(character.image)" 
            :alt="character.name"
          />
          <h3>{{ character.name }}</h3>
          <p>{{ capitalizeFirstLetter(character.element) }} | {{ capitalizeFirstLetter(character.class) }}</p>
          <router-link :to="character.profile">View Profile</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'CharactersView',
  setup() {
    const selectedEffects = ref([])
    const allEffects = ref(['burn', 'taunt', 'buff block', 'life steal']) // list all possible effects

    // Character data
    const characterList = ref([
      {
        id: 1,
        name: "Water Lairei",
        element: "water",
        class: "sniper",
        image: "water-Lai.jpg",
        profile: "/character/WLairei",
        effects: ["burn", "taunt"],
      },
      {
        id: 2,
        name: "Earth Icateztol",
        element: "earth",
        class: "striker",
        image: "earth-icateztol.jpg",
        profile: "/character/EIcateztol",
        effects: ["buff block", "life steal"]
      }
      // Add more characters here...
    ])

    // Reactive state
    const searchQuery = ref('')
    const activeFilter = ref('all')
    const showScrollBtn = ref(false)
    const elements = ref(['fire', 'water', 'earth', 'light', 'dark'])
    const classTypes = ref(['striker', 'warrior', 'guardian', 'cleric', 'commander', 'sniper'])
    const effects = ref(['buff block', 'burn', 'taunt', 'life steal']) 

    // Computed filtered list
    const filteredCharacters = computed(() => {
      const query = searchQuery.value.toLowerCase()
      const filter = activeFilter.value.toLowerCase()
      
      return characterList.value.filter(character => {
        const matchesSearch = 
          character.name.toLowerCase().includes(query) ||
          character.element.toLowerCase().includes(query) ||
          character.class.toLowerCase().includes(query)
        
        const matchesFilter = 
          filter === 'all' || 
          character.element.toLowerCase() === filter || 
          character.class.toLowerCase() === filter


          const matchesEffects = selectedEffects.value.length === 0 || 
      selectedEffects.value.every(effect =>
        character.effects.includes(effect)
      )

        return matchesSearch && matchesFilter && matchesEffects
      })
    })

    // Methods
    const setFilter = (filter) => {
      activeFilter.value = filter
    }

    const resetFilters = () => {
      activeFilter.value = 'all'
      searchQuery.value = ''
      selectedEffects.value = []
    }

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const getImagePath = (imageName) => {
       return new URL(`@/assets/images/character-images/${imageName}`, import.meta.url).href
    }

    const capitalizeFirstLetter = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    // Scroll event listener
    onMounted(() => {
      window.addEventListener('scroll', () => {
        showScrollBtn.value = window.scrollY > 300
      })
    })

    return {
      searchQuery,
      activeFilter,
      showScrollBtn,
      elements,
      classTypes,
      filteredCharacters,
      selectedEffects,
      allEffects,
      setFilter,
      resetFilters,
      scrollToTop,
      getImagePath,
      capitalizeFirstLetter

    }
  }
}
</script>

<style scoped>
@import '@/assets/stylesheet.css';

/* Ensure these critical styles are applied */
.characters-page {
  display: grid;
  grid-template-areas:
    "header header"
    "main main"
    "footer footer";
  margin: 0;
  font-size: 1.6rem;
  grid-template-columns: 22rem 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  gap: 1rem;
  padding: 1rem;
}

header {
  grid-area: header;
}

main {
  grid-area: main;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.5rem;
  padding: 1rem;
}

.card-holder {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.scroll-top-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px;
  border-radius: 50%;
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 99;
}
</style>