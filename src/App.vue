<template>
  <div class="container">
    <header>
      <img class="logo" src="/imgs/logo.png" alt="logo" />
      <h1>D&D: For Us</h1>
    </header>
    <RouterView />
  </div>
</template>

<script setup></script>

<style lang="css" scoped>
header {
  text-align: center;
}

.logo {
  border-radius: 50%;
  width: 10vw;
  margin: 2em auto 0;
}
</style>
