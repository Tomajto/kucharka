<template>
  <div class="about">
    <Navbar />

    <div class="about-content">
      <div class="about-hero">
        <h1>O nás</h1>
        <p class="subtitle">Vaše místo pro inspiraci v kuchyni</p>
      </div>

      <div class="about-section">
        <div class="content-row">
          <div class="image-wrapper">
            <img src="/stepan-pfp.png" alt="Štěpán" />
          </div>
          <div class="text-content">
            <h2>Štěpán</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
        <div class="content-row reverse">
          <div class="image-wrapper">
            <img src="/tomas-pfp.png" alt="Tomáš" />
          </div>
          <div class="text-content">
            <h2>Tomáš</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>

        <div class="section-card">
          <h2>Naše mise</h2>
          <p>
            Naší misí je sdílet lásku k vaření a přinášet vám recepty, které potěší celou rodinu.
            Věříme, že dobré jídlo spojuje lidi a vytváří nezapomenutelné chvíle. Každý den
            pracujeme v týmu na objevování nových receptů, které pečlivě testujeme a vylepšujeme.
            Zkoušíme různé ingredience, techniky a kombinace chutí, abychom vám přinesli to
            nejlepší. Naše práce zahrnuje nejen vaření samotné, ale také sdílení našich zkušeností
            na sociálních médiích, kde se s vámi propojujeme a inspirujeme navzájem. Je to
            každodenní cesta plná experimentování, učení a radosti z vytváření něčeho výjimečného.
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
</script>
