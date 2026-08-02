<template>
  <div class="home-container">
    <div class="search-section">
      <h1>ระบบสมาชิก</h1>
      <p class="desc">ตรวจสอบสถานะเซิร์ฟเวอร์และสิทธิพิเศษของคุณ</p>

      <div class="search-box">
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อเซิร์ฟเวอร์ของคุณ"
          v-model="memberID"
          @keyup.enter="goToMember"
        />
        <router-link
          :to="memberID.trim().toLowerCase()"
          :class="{ disabled: !memberID.trim() }"
        >
          <button :disabled="!memberID.trim()">ค้นหา</button>
        </router-link>
      </div>
    </div>

    <div class="divider-container">
      <div class="line"></div>
      <div class="text">หรือ</div>
      <div class="line"></div>
    </div>

    <div class="order-section">
      <h2>สั่งซื้อเซิร์ฟเวอร์ใหม่</h2>
      <p class="desc">
        สร้างและปรับสเปคเครื่องเซิร์ฟเวอร์สำหรับแคมเปญของคุณเองอย่างรวดเร็ว
      </p>

      <router-link to="/server">
        <button class="btn-primary">
          ปรับแต่ง & สั่งซื้อเซิร์ฟเวอร์
          <i class="fa-solid fa-duotone fa-chevron-right"></i>
        </button>
      </router-link>
    </div>

    <BadgesFooter />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import BadgesFooter from "../components/BadgesFooter.vue";

const memberID = ref("");
const router = useRouter();

const goToMember = () => {
  if (memberID.value.trim()) {
    router.push(`/server/${memberID.value.trim().toLowerCase()}`);
  }
};
</script>

<style lang="css" scoped>
.home-container {
  padding-top: 1.5em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2em;
}

.search-section,
.order-section {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 1em;
  padding: 1.8em;
  text-align: center;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
}

h1,
h2 {
  color: #ffde59;
  font-size: 1.5em;
  margin-bottom: 0.3em;
}

.desc {
  color: #b0b0b0;
  font-size: 0.9em;
  margin: 0 0 1.2em 0;
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  width: 100%;
}

input {
  width: 100%;
  text-align: center;
  background-color: #1a1a1a;
  border: 2px solid #3a3a3a;
  color: #ffffff;
  padding: 0.6em 1em;
  font-size: 1em;
  border-radius: 0.5em;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #db292f;
}

button {
  width: 100%;
  padding: 0.6em 1em;
  font-weight: bold;
  background-color: #db292f;
  color: #ffffff;
  border: none;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  background-color: #f1353b;
}

button:disabled {
  background-color: #4a4a4a;
  color: #888888;
  cursor: not-allowed;
}

.disabled {
  pointer-events: none;
}

/* Divider styling */
.divider-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1em;
}

.divider-container .line {
  flex-grow: 1;
  height: 1px;
  background-color: #444;
}

.divider-container .text {
  font-size: 0.8em;
  color: #777;
  font-weight: bold;
}

/* Create button styling */
.btn-primary {
  width: fit-content;
  min-width: 250px;
  background-color: #db292f;
  color: #ffffff;
  padding: 0.8em 1.5em;
  font-size: 1em;
  box-shadow: 0 4px 12px rgba(219, 41, 47, 0.2);
}

.btn-primary:hover {
  background-color: #f1353b;
  transform: translateY(-1px);
}
</style>
