<template>
  <div class="recipe-detail">
    <Navbar />

    <div class="content">
      <div v-if="loading" class="loading">Načítám recept...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="recipe" class="recipe-container">
        <!-- Header -->
        <div class="recipe-header">
          <button @click="goBack" class="back-btn">← Zpět na recepty</button>
          <h1>{{ recipe.title }}</h1>
          <p v-if="recipe.description" class="description">{{ recipe.description }}</p>

          <div class="recipe-meta">
            <span v-if="recipe.prep_time" class="meta-item">
              <strong>Čas:</strong> {{ recipe.prep_time }} min
            </span>
            <span v-if="recipe.difficulty" class="meta-item">
              <strong>Náročnost:</strong> {{ recipe.difficulty }}
            </span>
            <span v-if="recipe.category" class="meta-item">
              <strong>Kategorie:</strong> {{ recipe.category }}
            </span>
          </div>
        </div>

        <!-- Main image -->
        <div v-if="recipe.image_url" class="main-image">
          <img :src="recipe.image_url" :alt="recipe.title" />
        </div>

        <!-- Content grid -->
        <div class="recipe-content">
          <!-- Ingredience -->
          <div class="section">
            <h2>Ingredience</h2>
            <ul v-if="recipe.ingredients && recipe.ingredients.length > 0" class="ingredients-list">
              <li v-for="ingredient in recipe.ingredients" :key="ingredient.id">
                <span class="ingredient-name">{{ ingredient.name }}</span>
                <span v-if="ingredient.amount" class="ingredient-amount">
                  {{ ingredient.amount }}
                </span>
              </li>
            </ul>
            <p v-else class="no-data">Ingredience nejsou k dispozici</p>
          </div>

          <!-- Postup -->
          <div class="section">
            <h2>Postup přípravy</h2>
            <ol v-if="recipe.steps && recipe.steps.length > 0" class="steps-list">
              <li v-for="step in recipe.steps" :key="step.id">
                {{ step.content }}
              </li>
            </ol>
            <p v-else class="no-data">Postup není k dispozici</p>
          </div>
        </div>

        <!-- Additional images -->
        <div v-if="recipe.images && recipe.images.length > 0" class="additional-images">
          <h2>Další obrázky</h2>
          <div class="image-grid">
            <img
              v-for="image in recipe.images"
              :key="image.id"
              :src="image.image_url"
              :alt="recipe.title"
            />
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { supabase } from '@/lib/supabaseClient'

interface Ingredient {
  id: number
  recipe_id: string
  name: string
  amount: string | null
}

interface Step {
  id: number
  recipe_id: string
  step_number: number
  content: string
}

interface Image {
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
  image_url: string | null
  created_at: string
  ingredients?: Ingredient[]
  steps?: Step[]
  images?: Image[]
}

const route = useRoute()
const router = useRouter()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchRecipe = async () => {
  try {
    loading.value = true
    error.value = null

    const recipeId = route.params.id as string

    // Načíst recept
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single()

    if (recipeError) throw recipeError

    // Načíst ingredience
    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeId)

    // Načíst kroky (seřazené podle step_number)
    const { data: stepsData } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true })

    // Načíst obrázky
    const { data: imagesData } = await supabase
      .from('recipe_images')
      .select('*')
      .eq('recipe_id', recipeId)

    recipe.value = {
      ...recipeData,
      ingredients: ingredientsData || [],
      steps: stepsData || [],
      images: imagesData || [],
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Chyba při načítání receptu'
    console.error('Chyba při načítání receptu:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/recepty')
}

onMounted(() => {
  fetchRecipe()
})
</script>

<style scoped>
.recipe-detail {
  min-height: 100vh;
  background-color: #222120;
  position: relative;
}

.recipe-detail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background:
    linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(34, 33, 32, 0.3) 60%,
      rgba(34, 33, 32, 0.6) 80%,
      #222120 100%
    ),
    url('/black-textured-background.jpg') top center / cover no-repeat;
  z-index: 0;
  pointer-events: none;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 20px 60px;
  color: #fff;
  position: relative;
  z-index: 1;
}

.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
}

.back-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  font-weight: 600;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateX(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.recipe-header {
  margin-bottom: 3rem;
  text-align: center;
}

.recipe-header h1 {
  font-size: 3.5rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.description {
  font-size: 1.3rem;
  color: #ccc;
  line-height: 1.8;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.recipe-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  max-width: 600px;
  margin: 0 auto;
}

.meta-item {
  color: #ccc;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item strong {
  color: var(--accent-color);
  font-weight: 700;
}

.main-image {
  width: 100%;
  max-height: 600px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 4rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
}

.section {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 2.5rem;
  transition: all 0.3s ease;
}

.section:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.section h2 {
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredients-list li {
  padding: 1.2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s;
}

.ingredients-list li:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-name {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.ingredient-amount {
  color: var(--accent-color);
  font-weight: 700;
  font-size: 1.05rem;
}

.steps-list {
  padding-left: 1.5rem;
  counter-reset: step-counter;
}

.steps-list li {
  color: #ccc;
  padding: 1.5rem 0;
  line-height: 1.8;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.2s;
}

.steps-list li:hover {
  color: #fff;
  padding-left: 0.5rem;
}

.steps-list li:last-child {
  border-bottom: none;
}

.steps-list li::marker {
  color: var(--accent-color);
  font-weight: bold;
  font-size: 1.3rem;
}

.no-data {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.additional-images {
  margin-top: 4rem;
}

.additional-images h2 {
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 800;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.image-grid img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.image-grid img:hover {
  transform: scale(1.05) translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-color: var(--accent-color);
}

@media (max-width: 768px) {
  .recipe-header h1 {
    font-size: 2.5rem;
  }

  .description {
    font-size: 1.1rem;
  }

  .recipe-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .recipe-meta {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .image-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 1.5rem;
  }

  .back-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
