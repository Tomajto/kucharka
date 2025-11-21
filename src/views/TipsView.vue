<template>
  <div class="tips">
    <Navbar />

    <div class="tips-content">
      <div class="tips-hero">
        <h1>Tipy a Triky</h1>
        <p class="subtitle">Zajímavosti ze světa vaření a gastronomie</p>
      </div>

      <div class="filter-tabs">
        <button
          @click="selectedFilter = 'all'"
          :class="{ active: selectedFilter === 'all' }"
          class="filter-btn"
        >
          Vše
        </button>
        <button
          @click="selectedFilter = 'our'"
          :class="{ active: selectedFilter === 'our' }"
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
        >
          <div class="article-image">
            <img :src="article.image" :alt="article.title" />
            <span class="article-badge" :class="article.type">
              {{ article.type === 'our' ? 'Náš článek' : 'Externí zdroj' }}
            </span>
          </div>
          <div class="article-content">
            <h3>{{ article.title }}</h3>
            <p class="article-excerpt">{{ article.excerpt }}</p>
            <div class="article-meta">
              <span class="article-date">{{ article.date }}</span>
              <span class="article-author" v-if="article.author">
                Autor: {{ article.author }}
              </span>
              <span class="article-source" v-if="article.source">
                Zdroj: {{ article.source }}
              </span>
            </div>
            <a
              :href="article.link"
              :target="article.type === 'external' ? '_blank' : '_self'"
              class="read-more"
            >
              {{ article.type === 'our' ? 'Číst více' : 'Přejít na článek' }}
              <span v-if="article.type === 'external'">↗</span>
            </a>
          </div>
        </article>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

type ArticleType = 'our' | 'external'

interface Article {
  id: number
  title: string
  excerpt: string
  image: string
  date: string
  type: ArticleType
  link: string
  source?: string
  author?: string
}

const selectedFilter = ref<'all' | ArticleType>('all')

const articles = ref<Article[]>([
  {
    id: 1,
    title: '5 tajemství dokonalého steaku',
    excerpt:
      'Naučte se připravit steak jako v nejlepší restauraci. Sdílíme s vámi osvědčené postupy a triky, které zaručí šťavnatý a křehký výsledek.',
    image: '/steak_pozadi.png',
    date: '15. listopadu 2025',
    type: 'our',
    link: '#',
    author: 'Tomáš',
  },
  {
    id: 2,
    title: 'Jak skladovat čerstvé bylinky',
    excerpt:
      'Máte doma čerstvé bylinky a nevíte, jak je správně uskladnit? V tomto článku vám ukážeme nejlepší metody pro udržení jejich svěžesti.',
    image: '/steak_pozadi.png',
    date: '10. listopadu 2025',
    type: 'our',
    link: '#',
    author: 'Štěpán',
  },
  {
    id: 3,
    title: 'Věda za dokonalým pečením chleba',
    excerpt:
      'Podrobný průvodce chemií a fyzikou, která stojí za pečením dokonalého domácího chleba. Od kynutí těsta po křupavou kůrku.',
    image: '/steak_pozadi.png',
    date: '5. listopadu 2025',
    type: 'external',
    link: 'https://www.example.com/bread-science',
    source: 'Food Science Journal',
  },
  {
    id: 4,
    title: 'Historie české kuchyně',
    excerpt:
      'Zajímavý pohled na vývoj české gastronomie od středověku po současnost. Jak se měnily chutě a trendy v průběhu staletí.',
    image: '/steak_pozadi.png',
    date: '1. listopadu 2025',
    type: 'external',
    link: 'https://www.example.com/czech-cuisine-history',
    source: 'Gastronomie.cz',
  },
  {
    id: 5,
    title: 'Nejlepší kuchyňské nože pro domácnost',
    excerpt:
      'Poradíme vám, jaké nože si pořídit do kuchyně a jak o ně správně pečovat. Investice do kvalitních nožů se vám mnohonásobně vrátí.',
    image: '/steak_pozadi.png',
    date: '28. října 2025',
    type: 'our',
    link: '#',
    author: 'Tomáš',
  },
  {
    id: 6,
    title: 'Umami: Pátá chuť, kterou musíte poznat',
    excerpt:
      'Objevte tajemství umami - páté základní chuti. Naučte se, jak ji využít ve vaření pro dokonalé chuťové zážitky.',
    image: '/steak_pozadi.png',
    date: '20. října 2025',
    type: 'external',
    link: 'https://www.example.com/umami-guide',
    source: 'Culinary Institute',
  },
])

const filteredArticles = computed(() => {
  if (selectedFilter.value === 'all') {
    return articles.value
  }
  return articles.value.filter((article) => article.type === selectedFilter.value)
})
</script>
