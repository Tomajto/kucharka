<script setup lang="ts">
import { ref, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faClock, faChartSimple } from '@fortawesome/free-solid-svg-icons'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'

const categories = [
  { id: 'all', name: 'Všechny' },
  { id: 'main', name: 'Hlavní jídla' },
  { id: 'soup', name: 'Polévky' },
  { id: 'dessert', name: 'Dezerty' },
  { id: 'salad', name: 'Saláty' },
  { id: 'breakfast', name: 'Snídaně' },
]
const recipes = ref([
  {
    id: 1,
    name: 'Svíčková na smetaně',
    image: '/steak_pozadi.png',
    time: '120 min',
    difficulty: 'Střední',
    category: 'main',
  },
  {
    id: 2,
    name: 'Kuřecí řízek',
    image: '/steak_pozadi.png',
    time: '30 min',
    difficulty: 'Lehké',
    category: 'main',
  },
  {
    id: 3,
    name: 'Guláš',
    image: '/steak_pozadi.png',
    time: '90 min',
    difficulty: 'Střední',
    category: 'main',
  },
  {
    id: 4,
    name: 'Smažený sýr',
    image: '/steak_pozadi.png',
    time: '20 min',
    difficulty: 'Lehké',
    category: 'main',
  },
  {
    id: 5,
    name: 'Vepřo knedlo zelo',
    image: '/steak_pozadi.png',
    time: '150 min',
    difficulty: 'Náročné',
    category: 'main',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
  {
    id: 6,
    name: 'Rajská omáčka',
    image: '/steak_pozadi.png',
    time: '45 min',
    difficulty: 'Lehké',
    category: 'soup',
  },
])

const searchQuery = ref('')
const selectedCategory = ref('all')

// Filtrované recepty podle vyhledávání a kategorie
const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || recipe.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}
</script>

<template>
  <div class="recipes">
    <Navbar />

    <div class="recipes-container">
      <h1 class="page-title">Naše recepty</h1>
      <p class="page-subtitle">Objevte naši sbírku chutných a jednoduchých receptů</p>

      <!-- Vyhledávání -->
      <div class="search-bar">
        <div class="search-wrapper">
          <FontAwesomeIcon :icon="faMagnifyingGlass" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Hledat recept..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Kategorie -->
      <div class="categories">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="['category-btn', { active: selectedCategory === category.id }]"
        >
          {{ category.name }}
        </button>
      </div>

      <!-- Počet výsledků -->
      <div class="results-count">
        Nalezeno {{ filteredRecipes.length }}
        {{
          filteredRecipes.length === 1
            ? 'recept'
            : filteredRecipes.length < 5
              ? 'recepty'
              : 'receptů'
        }}
      </div>

      <!-- Grid receptů -->
      <div v-if="filteredRecipes.length > 0" class="recipes-grid">
        <div v-for="recipe in filteredRecipes" :key="recipe.id" class="recipe-card">
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.name" />
          </div>
          <div class="recipe-info">
            <h3 class="recipe-name">{{ recipe.name }}</h3>
            <div class="recipe-meta">
              <span class="meta-item">
                <FontAwesomeIcon :icon="faClock" />
                {{ recipe.time }}
              </span>
              <span class="meta-item">
                <FontAwesomeIcon :icon="faChartSimple" />
                {{ recipe.difficulty }}
              </span>
            </div>
            <button class="view-recipe-btn">Zobrazit recept</button>
          </div>
        </div>
      </div>

      <!-- Žádné výsledky -->
      <div v-else class="no-results">
        <p>Nenašli jsme žádné recepty odpovídající vašemu hledání.</p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
