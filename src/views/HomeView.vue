<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTiktok, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons'
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

        <div class="social-links">
          <p class="social-text">Sledujte nás na sociálních sítích</p>
          <div class="social-icons">
            <a href="https://www.tiktok.com" target="_blank" class="social-link tiktok">
              <FontAwesomeIcon :icon="faTiktok" />
            </a>
            <a href="https://www.instagram.com" target="_blank" class="social-link instagram">
              <FontAwesomeIcon :icon="faInstagram" />
            </a>
            <a href="https://www.youtube.com" target="_blank" class="social-link youtube">
              <FontAwesomeIcon :icon="faYoutube" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.social-links {
  position: absolute;
  bottom: 4rem;
  left: 2rem;
  text-align: left;
}

.social-text {
  color: #ccc;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.social-icons {
  display: flex;
  gap: 1.5rem;
  justify-content: flex-start;
  align-items: center;
}

.social-link {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: #fff;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.social-link.tiktok:hover {
  background: linear-gradient(135deg, #00f2ea 0%, #ff0050 100%);
  border-color: #00f2ea;
  box-shadow: 0 8px 25px rgba(0, 242, 234, 0.4);
}

.social-link.instagram:hover {
  background: linear-gradient(135deg, #405de6 0%, #e1306c 50%, #fd1d1d 100%);
  border-color: #e1306c;
  box-shadow: 0 8px 25px rgba(225, 48, 108, 0.4);
}

.social-link.youtube:hover {
  background: #ff0000;
  border-color: #ff0000;
  box-shadow: 0 8px 25px rgba(255, 0, 0, 0.4);
}

.social-link svg {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@media (max-width: 768px) {
  .social-links {
    position: static;
    margin-top: 3rem;
    left: 0;
    text-align: center;
  }

  .social-icons {
    gap: 1rem;
    justify-content: center;
  }

  .social-link {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .social-text {
    font-size: 0.9rem;
    text-align: center;
  }
}
</style>
