<template>
  <div class="article-detail">
    <Navbar />

    <div class="content">
      <div v-if="loading" class="loading">Načítání článku...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <template v-else-if="article">
        <button @click="goBack" class="back-btn">← Zpět na články</button>

        <article class="article-container">
          <div class="article-header">
            <span class="article-badge" :class="article.type">
              {{ article.type === 'internal' ? 'Náš článek' : 'Externí zdroj' }}
            </span>
            <h1>{{ article.title }}</h1>
            <div class="article-meta">
              <span class="author">Autor: {{ article.author }}</span>
              <span class="date">{{ formatDate(article.created_at) }}</span>
            </div>
          </div>

          <div
            v-if="
              article.article_images &&
              article.article_images.length > 0 &&
              article.article_images[0]
            "
            class="main-image"
          >
            <img :src="article.article_images[0].image_url" :alt="article.title" />
          </div>

          <div class="article-body">
            <div v-if="article.type === 'internal' && article.content" class="content-text">
              <p v-for="(paragraph, index) in formatContent(article.content)" :key="index">
                {{ paragraph }}
              </p>
            </div>

            <div
              v-else-if="article.type === 'external' && article.source_url"
              class="external-link"
            >
              <p>Tento článek je dostupný na externím webu:</p>
              <a :href="article.source_url" target="_blank" class="external-btn">
                Přejít na článek ↗
              </a>
            </div>
          </div>

          <div
            v-if="article.article_images && article.article_images.length > 1"
            class="additional-images"
          >
            <h2>Další obrázky</h2>
            <div class="image-grid">
              <img
                v-for="(image, index) in article.article_images.slice(1)"
                :key="image.id"
                :src="image.image_url"
                :alt="`${article.title} - obrázek ${index + 2}`"
              />
            </div>
          </div>
        </article>
      </template>
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

interface ArticleImage {
  id: number
  article_id: string
  image_url: string
}

interface Article {
  id: string
  type: 'internal' | 'external'
  title: string
  author: string
  content: string | null
  source_url: string | null
  created_at: string
  article_images?: ArticleImage[]
}

const route = useRoute()
const router = useRouter()

const article = ref<Article | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const fetchArticle = async () => {
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
      .eq('id', route.params.id)
      .single()

    if (fetchError) throw fetchError

    article.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Chyba při načítání článku'
    console.error('Chyba při načítání článku:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatContent = (content: string) => {
  return content.split('\n').filter((p) => p.trim() !== '')
}

const goBack = () => {
  router.push('/tipy')
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  background-color: #222120;
  position: relative;
  display: flex;
  flex-direction: column;
}

.article-detail::before {
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

.content {
  flex: 1;
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 10rem 2rem 6rem;
  width: 100%;
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

.back-btn {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  margin-bottom: 2rem;
  font-weight: 600;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.article-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.article-header {
  padding: 2.5rem 2.5rem 1.5rem;
  position: relative;
}

.article-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
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

.article-header h1 {
  color: #fff;
  font-size: 2.5rem;
  line-height: 1.3;
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.article-meta {
  display: flex;
  gap: 2rem;
  color: #ccc;
  font-size: 0.95rem;
}

.article-meta .author {
  font-weight: 600;
  color: var(--accent-color);
}

.article-meta .date {
  color: #999;
}

.main-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-body {
  padding: 2.5rem;
}

.content-text {
  color: #ddd;
  font-size: 1.1rem;
  line-height: 1.8;
}

.content-text p {
  margin-bottom: 1.5rem;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.external-link {
  text-align: center;
  padding: 2rem;
}

.external-link p {
  color: #ccc;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.external-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #3b3737 0%, #474747 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.external-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

.additional-images {
  padding: 0 2.5rem 2.5rem;
}

.additional-images h2 {
  color: #fff;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-grid img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.3s;
}

.image-grid img:hover {
  transform: none;
}

@media (max-width: 768px) {
  .content {
    padding: 6rem 1rem 2rem;
  }

  .article-header {
    padding: 2rem 1.5rem 1.5rem;
  }

  .article-header h1 {
    font-size: 1.8rem;
  }

  .article-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .main-image {
    height: 250px;
  }

  .article-body {
    padding: 2rem 1.5rem;
  }

  .content-text {
    font-size: 1rem;
  }

  .additional-images {
    padding: 0 1.5rem 2rem;
  }

  .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
