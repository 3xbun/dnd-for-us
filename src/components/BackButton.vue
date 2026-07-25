<template>
  <div class="back-link">
    <router-link to="/">
      <button class="btn-secondary">
        <i class="fa-solid fa-arrow-left"></i> กลับหน้าหลัก
      </button>
    </router-link>
  </div>
</template>

<style lang="css" scoped>
.back-link {
  margin-bottom: 1.5em;
  text-align: left;
}
.back-link {
  margin-bottom: 1.5em;
  text-align: left;
}

.btn-secondary {
  background-color: #353535;
  color: #e0e0e0;
  border: 1px solid #4a4a4a;
  border-radius: 0.5em;
  padding: 0.5em 1em;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
}

.btn-secondary:hover {
  background-color: #454545;
  color: #ffffff;
  border-color: #666666;
}
</style>
