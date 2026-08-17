<template>
  <div class="dashboard-view-container">
    <BackButton />

    <div class="dashboard-header">
      <h2>ฝ่ายขาย - แดชบอร์ด (Sales Dashboard)</h2>
      <p class="subtitle">รายงานยอดขาย รายรับสม่ำเสมอรายเดือน (MRR) และสถิติสมาชิก</p>
    </div>

    <DashboardComponent />
  </div>
</template>

<script setup>
import BackButton from "../components/BackButton.vue";
import DashboardComponent from "../components/Dashboard.vue";
</script>

<style lang="css" scoped>
.dashboard-view-container {
  max-width: 900px;
  margin: 1.5em auto;
  padding: 0 1em 3em;
  font-family: "Noto Sans Thai", sans-serif;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}

.dashboard-header {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 1em;
  padding: 1.8em;
  text-align: center;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
  box-sizing: border-box;
}

h2 {
  color: #ffde59;
  font-size: 1.8em;
  margin: 0 0 0.3em 0;
}

.subtitle {
  color: #b0b0b0;
  font-size: 0.95em;
  margin: 0;
}
</style>
