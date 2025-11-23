<template>
  <div class="tips">
    <Navbar />

    <div class="tips-content">
      <div class="tips-hero">
        <h1>Tipy a Triky</h1>
        <p class="subtitle">Zajímavosti ze světa vaření a gastronomie</p>
      </div>

      <div v-if="loading" class="loading">Načítání článků...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else>
        <div class="filter-tabs">
          <button
            @click="selectedFilter = 'all'"
            :class="{ active: selectedFilter === 'all' }"
            class="filter-btn"
          >
            Vše
          </button>
          <button
            @click="selectedFilter = 'internal'"
            :class="{ active: selectedFilter === 'internal' }"
            class="filter-btn"
          >
            Naše články
          </button>
          <button
            @click="selectedFilter = 'external'"
            :class="{ active: selectedFilter === 'external' }"
            class="filter-btn"
          >
            Externí zdroje
          </button>
        </div>

        <div class="articles-grid">
          <article
            v-for="article in filteredArticles"
            :key="article.id"
            class="article-card"
            :class="{ external: article.type === 'external' }"
            @click="viewArticle(article.id, article.type, article.source_url)"
          >
            <div class="article-image">
              <img :src="getArticleImage(article)" :alt="article.title" />
              <span class="article-badge" :class="article.type">
                {{ article.type === 'internal' ? 'Náš článek' : 'Externí zdroj' }}
              </span>
            </div>
            <div class="article-content">
              <h3>{{ article.title }}</h3>
              <p class="article-excerpt">{{ getExcerpt(article.content) }}</p>
              <div class="article-meta">
                <span class="article-date">{{ formatDate(article.created_at) }}</span>
                <span class="article-author">Autor: {{ article.author }}</span>
              </div>
              <div class="read-more">
                {{ article.type === 'internal' ? 'Číst více' : 'Přejít na článek' }}
                <span v-if="article.type === 'external'"> ↗</span>
              </div>
            </div>
          </article>
        </div>
      </template>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { supabase } from '@/lib/supabaseClient'

type ArticleType = 'internal' | 'external'

interface ArticleImage {
  id: number
  article_id: string
  image_url: string
}

interface Article {
  id: string
  type: ArticleType
  title: string
  author: string
  content: string | null
  source_url: string | null
  created_at: string
  article_images?: ArticleImage[]
}

const router = useRouter()
const selectedFilter = ref<'all' | ArticleType>('all')
const articles = ref<Article[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchArticles = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('articles')
      .select(
        `
        *,
        article_images(*)
      `,
      )
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    articles.value = data || []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Chyba při načítání článků'
    console.error('Chyba při načítání článků:', err)
  } finally {
    loading.value = false
  }
}

const filteredArticles = computed(() => {
  if (selectedFilter.value === 'all') {
    return articles.value
  }
  return articles.value.filter((article) => article.type === selectedFilter.value)
})

const getArticleImage = (article: Article) => {
  if (article.article_images && article.article_images.length > 0) {
    return article.article_images[0]?.image_url || '/steak_pozadi.png'
  }
  return '/steak_pozadi.png'
}

const getExcerpt = (content: string | null, maxLength: number = 150) => {
  if (!content) return 'Klikněte pro zobrazení článku...'
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const viewArticle = (articleId: string, type: ArticleType, sourceUrl: string | null) => {
  if (type === 'external' && sourceUrl) {
    window.open(sourceUrl, '_blank')
  } else {
    router.push(`/tipy/${articleId}`)
  }
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.tips {
  min-height: 100vh;
  background-color: #222120;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tips::before {
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
}

.tips-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 10rem 2rem 8rem;
  position: relative;
  z-index: 1;
  width: 100%;
}

.tips-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.tips-hero h1 {
  font-size: 3rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 800;
}

.subtitle {
  font-size: 1.2rem;
  color: #ccc;
}

.loading,
.error {
  text-align: center;
  padding: 4rem 2rem;
  font-size: 1.2rem;
  color: #fff;
}

.error {
  color: #ff6b6b;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-color-hover) 100%);
  border-color: var(--accent-color);
  box-shadow: 0 8px 32px rgba(212, 136, 111, 0.3);
  transform: translateY(-2px);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.article-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.article-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-image img {
  transform: none;
}

.article-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.article-badge.internal {
  background: rgba(212, 136, 111, 0.9);
  color: #fff;
}

.article-badge.external {
  background: rgba(100, 100, 255, 0.9);
  color: #fff;
}

.article-content {
  padding: 1.5rem;
}

.article-content h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 1rem;
  font-weight: 700;
}

.article-excerpt {
  color: #ccc;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #999;
}

.article-date {
  color: #ccc;
}

.article-author {
  color: var(--accent-color);
  font-weight: 600;
}

.read-more {
  width: 100%;
  background: linear-gradient(135deg, #3b3737 0%, #474747 100%);
  color: #fff;
  border: none;
  padding: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  text-align: center;
}

.article-card:hover .read-more {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

@media (max-width: 768px) {
  .tips-content {
    padding: 6rem 1rem 2rem;
  }

  .tips-hero h1 {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    gap: 0.5rem;
  }

  .filter-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
