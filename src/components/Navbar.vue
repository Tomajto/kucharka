<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <a href="/" class="logo">Kuchařka</a>

      <button class="menu-toggle" @click="toggleMenu" :class="{ active: isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li><a href="/" :class="{ active: route.path === '/' }" @click="closeMenu">Domů</a></li>
        <li>
          <a href="/recepty" :class="{ active: route.path === '/recepty' }" @click="closeMenu"
            >Recepty</a
          >
        </li>
        <li>
          <a href="/o-nas" :class="{ active: route.path === '/o-nas' }" @click="closeMenu">O nás</a>
        </li>
        <li>
          <a href="/tipy" :class="{ active: route.path === '/tipy' }" @click="closeMenu">Tipy</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logo {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-decoration: none;
  cursor: pointer;
  z-index: 1001;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  z-index: 1001;
}

.menu-toggle span {
  width: 25px;
  height: 3px;
  background: #fff;
  transition: all 0.3s;
  border-radius: 3px;
}

.menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.nav-links {
  display: flex;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--accent-color);
}

@media (max-width: 768px) {
  .nav-content {
    padding: 0 1.5rem;
  }

  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: -150%;
    left: 0;
    width: 100%;
    height: auto;
    max-height: 0;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.95);
    flex-direction: column;
    gap: 0;
    padding-top: 0;
    padding-bottom: 0;
    transition: all 0.4s ease-in-out;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .nav-links.active {
    top: 0;
    max-height: 500px;
    padding-top: 6rem;
    padding-bottom: 2rem;
  }

  .nav-links li {
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-links a {
    display: block;
    padding: 1.5rem 2rem;
    font-size: 1.2rem;
  }
}
</style>
