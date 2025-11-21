<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="home">
    <Navbar />

    <div class="background">
      <div class="hero">
        <div class="hero-content">
          <h1 class="hero-title">Vítejte v naší kuchařce!</h1>
          <p class="hero-text">
            Hledáte inspiraci pro každodenní vaření? U nás najdete jednoduché recepty plné chuti,
            které zvládne úplně každý.
          </p>
          <a href="/recepty">
            <button class="cta-button">Prohlédnout recepty</button>
          </a>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
