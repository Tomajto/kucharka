<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">Kuchařka</h3>
        <p class="footer-text">Vaše inspirace pro každodenní vaření</p>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">Navigace</h4>
        <ul class="footer-links">
          <li><a href="/">Domů</a></li>
          <li><a href="/recepty">Recepty</a></li>
          <li><a href="#tipy">Tipy</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">Kontakt</h4>
        <ul class="footer-links">
          <li><a href="mailto:info@kucharka.cz">info@kucharka.cz</a></li>
          <li><a href="tel:+420123456789">+420 123 456 789</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-heading">Sledujte nás</h4>
        <ul class="footer-links">
          <li><a href="#facebook">Facebook</a></li>
          <li><a href="#instagram">Instagram</a></li>
          <li><a href="#youtube">YouTube</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Kuchařka. Všechna práva vyhrazena.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: #ccc;
  padding: 3rem 0 1rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-title {
  font-size: 1.5rem;
  color: #fff;
  font-weight: 700;
  margin: 0;
}

.footer-text {
  color: #999;
  font-size: 0.95rem;
  line-height: 1.6;
}

.footer-heading {
  font-size: 1.1rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--accent-color);
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 2rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-bottom p {
  color: #777;
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer {
    padding: 2rem 0 1rem;
  }
}
</style>
