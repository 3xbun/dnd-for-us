<template>
  <footer class="footer">
    <div class="footer-bottom">
      <p>D&D: For Us © {{ new Date().getFullYear() }}</p>
      <p class="subtitle">
        บริการเช่าเซิร์ฟเวอร์ Foundry VTT ในประเทศไทย โดยคนไทย เพื่อคนไทย
      </p>
      <div class="social-links">
        <a
          href="https://facebook.com/dnd.for.us"
          target="_blank"
          class="social-link"
        >
          <i class="fa-brands fa-facebook"></i> ติดตามเราบน Facebook
        </a>
        <a href="https://m.me/dnd.for.us" target="_blank" class="social-link">
          <i class="fa-brands fa-facebook-messenger"></i> ติดต่อสอบถาม
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup>
import BadgesFooter from "./BadgesFooter.vue";
</script>

<style lang="css" scoped>
.footer {
  margin-top: 3em;
  padding: 2em;
  border-top: 1px solid #3a3a3a;
  text-align: center;
  color: #b0b0b0;
  background-color: #242424;
}
.footer-bottom {
  margin-top: 1.5em;
}
.subtitle {
  font-size: 0.8em;
  margin-top: 0.5em;
}
.social-links {
  display: flex;
  gap: 1em;
  justify-content: center;
}
.social-link {
  display: inline-block;
  margin-top: 1em;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9em;
}
.social-link:hover {
  text-decoration: underline;
}
</style>
