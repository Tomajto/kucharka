<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faClock, faChartSimple } from '@fortawesome/free-solid-svg-icons'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import { supabase } from '@/lib/supabaseClient'

const router = useRouter()

interface RecipeImage {
  id: number
  recipe_id: string
  image_url: string
}

interface Recipe {
  id: string
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  prep_time: number | null
  duration_minutes: number | null
  image_url: string | null
  images?: RecipeImage[]
}

const categories = [
  { id: 'all', name: 'Všechny' },
  { id: 'hlavni', name: 'Hlavní jídla' },
  { id: 'polevka', name: 'Polévky' },
  { id: 'dezert', name: 'Dezerty' },
  { id: 'salat', name: 'Saláty' },
  { id: 'snidane', name: 'Snídaně' },
]

const recipes = ref<Recipe[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('all')

const fetchRecipes = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('recipes')
      .select(
        `
        *,
        images:recipe_images(*)
      `,
      )
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    recipes.value = data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Chyba při načítání receptů'
    console.error('Chyba při načítání receptů:', err)
  } finally {
    loading.value = false
  }
}

const filteredRecipes = computed(() => {
  return recipes.value.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || recipe.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const viewRecipe = (recipeId: string) => {
  router.push(`/recepty/${recipeId}`)
}

const getRecipeImage = (recipe: Recipe) => {
  if (recipe.image_url) return recipe.image_url
  if (recipe.images && recipe.images.length > 0) return recipe.images[0]?.image_url
  return '/steak_pozadi.png' // fallback
}

onMounted(() => {
  fetchRecipes()
})
</script>

<template>
  <div class="recipes">
    <Navbar />

    <div class="recipes-container">
      <h1 class="page-title">Naše recepty</h1>
      <p class="page-subtitle">Objevte naši sbírku chutných a jednoduchých receptů</p>

      <!-- Loading -->
      <div v-if="loading" class="loading">Načítám recepty...</div>

      <!-- Error -->
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else>
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
              <img :src="getRecipeImage(recipe)" :alt="recipe.title" />
            </div>
            <div class="recipe-info">
              <h3 class="recipe-name">{{ recipe.title }}</h3>
              <div class="recipe-meta">
                <span class="meta-item" v-if="recipe.duration_minutes">
                  <FontAwesomeIcon :icon="faClock" />
                  {{ recipe.duration_minutes }} min
                </span>
                <span class="meta-item" v-if="recipe.difficulty">
                  <FontAwesomeIcon :icon="faChartSimple" />
                  {{ recipe.difficulty }}
                </span>
              </div>
              <button @click="viewRecipe(recipe.id)" class="view-recipe-btn">
                Zobrazit recept
              </button>
            </div>
          </div>
        </div>

        <!-- Žádné výsledky -->
        <div v-else class="no-results">
          <p>Nenašli jsme žádné recepty odpovídající vašemu hledání.</p>
        </div>
      </template>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
}

.recipe-description {
  color: #999;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
