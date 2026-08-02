<template>
  <div>
    <BackButton />

    <h1>ระบบสมาชิก</h1>
    <img
      src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4bcc2548-937b-4948-a8de-df85c179759b/dclcb4s-c9b126cf-505d-4d7b-a25f-9b0df66b5d92.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi80YmNjMjU0OC05MzdiLTQ5NDgtYThkZS1kZjg1YzE3OTc1OWIvZGNsY2I0cy1jOWIxMjZjZi01MDVkLTRkN2ItYTI1Zi05YjBkZjY2YjVkOTIuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.p8x1NPx9cI-TiqRMrfc4xjY7zzO5SCWiGsnjdkUQi78"
      alt=""
      class="loading"
      v-if="!loaded"
    />
    <div class="memberCard" v-if="loaded">
      <div class="informations">
        <table>
          <tbody>
            <tr>
              <td>เซิร์ฟเวอร์:</td>
              <td class="server-link-container">
                <a
                  :href="
                    'https://' + informations.fields.ServerID + '.dnd-for.us'
                  "
                  target="_blank"
                  class="server-link"
                >
                  {{ informations.fields.ServerID }}.dnd-for.us
                  <i
                    class="fa-solid fa-duotone fa-arrow-up-right-from-square"
                  ></i>
                </a>
                <a
                  v-if="informations.fields.DockerID"
                  :href="
                    'https://dnd-for.us/server/' + informations.fields.DockerID
                  "
                  target="_blank"
                  class="manage-link"
                >
                  <i class="fa-solid fa-duotone fa-terminal"></i> Console /
                  Files
                </a>
              </td>
            </tr>
            <tr>
              <td>สเปคเซิร์ฟเวอร์:</td>
              <td>
                <div class="specs-details-box">
                  <div class="spec-detail-line">
                    <i class="fa-solid fa-duotone fa-microchip icon-red"></i>
                    <span
                      ><strong>หน่วยความจำ:</strong>
                      {{ informations.fields.Ram || "2" }} GB RAM</span
                    >
                  </div>
                  <div class="spec-detail-line">
                    <i class="fa-solid fa-duotone fa-hard-drive icon-blue"></i>
                    <span
                      ><strong>พื้นที่:</strong>
                      {{ informations.fields.Storage || "5" }} GB</span
                    >
                  </div>
                  <div class="spec-detail-line">
                    <i class="fa-solid fa-duotone fa-key icon-green"></i>
                    <span>
                      <strong>License:</strong>
                      {{
                        informations.fields.hasLicense
                          ? "ใช้คีย์ตนเอง"
                          : "ใช้คีย์ของ D&D: For Us"
                      }}
                    </span>
                  </div>
                  <div class="spec-detail-line">
                    <i
                      class="fa-solid fa-duotone fa-duotone fa-sparkles icon-purple"
                    ></i>
                    <span>
                      <strong>ส่วนเสริม Heromancer: </strong>
                      <span
                        v-if="informations.fields.Heromancer"
                        class="badge-gold"
                        >ติดตั้งแล้ว</span
                      >
                      <span v-else class="text-muted">ไม่ได้ติดตั้ง</span>
                    </span>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td>สถานะระบบ:</td>
              <td>
                <span
                  v-if="informations.fields.IsActive"
                  class="status-badge status-active"
                >
                  ออนไลน์ (Active)
                </span>
                <span v-else class="status-badge status-inactive">
                  ปิดระบบ (Inactive)
                </span>
              </td>
            </tr>
            <tr>
              <td>เจ้าของ:</td>
              <td>
                {{ informations.fields.Owner?.fields?.FacebookName || "-" }}
              </td>
            </tr>
            <tr>
              <td>เป็นสมาชิกมาแล้ว:</td>
              <td>
                <div class="billing-date-wrapper">
                  <span class="billing-date-text">
                    {{
                      dayjs().diff(dayjs(informations.fields.FirstMonth), "day")
                    }}
                    วัน
                  </span>
                </div>
              </td>
            </tr>
            <tr
              v-if="
                informations.fields.NextCollect && informations.fields.IsActive
              "
            >
              <td>รอบชำระถัดไป:</td>
              <td>
                <div class="billing-date-wrapper">
                  <span class="billing-date-text">
                    {{
                      dayjs(informations.fields.NextCollect).format(
                        "DD/MM/YYYY",
                      )
                    }}
                  </span>
                  <span
                    class="billing-countdown-badge"
                    v-if="dayjs(informations.fields.NextCollect).isTomorrow()"
                  >
                    (วันพรุ่งนี้)
                  </span>
                  <span
                    class="billing-countdown-badge"
                    v-else-if="dayjs(informations.fields.NextCollect).isToday()"
                  >
                    (วันนี้)
                  </span>
                  <span class="billing-countdown-badge" v-else>
                    ({{ dayjs(informations.fields.NextCollect).fromNow() }})
                  </span>
                </div>
              </td>
            </tr>
            <tr v-if="isStudent">
              <td>ส่วนลดนักศึกษา:</td>
              <td>
                <span class="badge-gold">
                  <i class="fa-solid fa-duotone fa-graduation-cap"></i>
                  ได้รับส่วนลดนักศึกษา 20%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Payment / Renewal Action Button -->
      <div class="payment-action-box" v-if="informations.fields.IsActive">
        <button class="pay-now-btn" @click="showPaymentModal = true">
          <i class="fa-solid fa-duotone fa-credit-card"></i> ชำระค่าบริการ /
          ต่ออายุเซิร์ฟเวอร์ (฿{{ renewPrice }})
        </button>
      </div>

      <div class="stamps">
        <div
          v-for="(dis, index) in stamps"
          :key="index"
          class="stamp"
          :class="{ pump: index < informations.fields.MonthActive % 12 }"
        >
          <img src="/imgs/stamp.png" alt="stamp" />
          <p class="month">
            {{ index + 1 }}
          </p>
          <img class="discount" src="/imgs/10dis.png" v-if="dis == 10" />
          <img class="discount" src="/imgs/20dis.png" v-if="dis == 20" />
        </div>
      </div>
    </div>
    <p class="disclaimer">
      สิทธิพิเศษนี้สำหรับสมาชิกที่ต่ออายุต่อเนื่องเท่านั้น <br />
      โดยส่วนลดจะถูกหักโดยอัตโนมัติในรอบบิลที่ 6 และ 12 <br />
      ทั้งนี้ไม่สามารถโอนสิทธิ์ให้บัญชีอื่นหรือเซิร์ฟเวอร์อื่นได้
    </p>

    <!-- Payment QR Code Modal -->
    <QRCodeModal
      :visible="showPaymentModal"
      :serverName="informations.fields.ServerID"
      :productTitle="informations.fields.Products?.fields?.Title"
      :ram="informations.fields.Ram"
      :storage="informations.fields.Storage"
      :heromancer="informations.fields.Heromancer"
      :hasLicense="informations.fields.hasLicense"
      :monthActive="informations.fields.MonthActive"
      :isStudent="isStudent"
      @close="showPaymentModal = false"
      v-if="loaded"
    />
  </div>
</template>

<script setup>
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isTomorrow from "dayjs/plugin/isTomorrow";
import "dayjs/locale/th";
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import BackButton from "../components/BackButton.vue";
import QRCodeModal from "../components/QRCode.vue";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.locale("th");

const stamps = [0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 20];

const route = useRoute();
const router = useRouter();

const loaded = ref(false);
const memberID = route.params.memberID;
const informations = ref([]);
const showPaymentModal = ref(false);

// Sync showPaymentModal and route path
watch(
  () => route.path,
  (newPath) => {
    const currentMemberID = route.params.memberID;
    if (newPath === `/server/${currentMemberID}/payment`) {
      showPaymentModal.value = true;
    } else if (newPath === `/server/${currentMemberID}`) {
      showPaymentModal.value = false;
    }
  },
  { immediate: true },
);

watch(showPaymentModal, (newVal) => {
  const currentMemberID = route.params.memberID;
  if (newVal && route.path !== `/server/${currentMemberID}/payment`) {
    router.push(`/server/${currentMemberID}/payment`);
  } else if (!newVal && route.path === `/server/${currentMemberID}/payment`) {
    router.push(`/server/${currentMemberID}`);
  }
});

const isStudent = computed(() => {
  return !!(
    informations.value?.fields?.isStudent ||
    informations.value?.fields?.IsStudent
  );
});

const renewPrice = computed(() => {
  if (!informations.value?.fields) return 0;

  // Base package price from Product Title
  const productTitle = informations.value.fields.Products?.fields?.Title || "";
  let basePrice = 89; // Fallback default

  // Extra RAM
  const ram = parseInt(informations.value.fields.Ram) || 2;
  let ramExtra = 0;
  if (ram === 4) ramExtra = 50;
  else if (ram === 8) ramExtra = 150;

  // Extra Storage
  const storage = parseInt(informations.value.fields.Storage) || 5;
  const storageExtra = storage > 5 ? (storage - 5) * 2 : 0;

  // License Key Borrow
  const licenseExtra = informations.value.fields.hasLicense ? 0 : 50;

  // Heromancer Module Addon
  const heromancerExtra = informations.value.fields.Heromancer ? 29 : 0;

  const totalBeforeDiscount =
    basePrice + ramExtra + storageExtra + licenseExtra + heromancerExtra;

  // Stamp discount percent mapping:
  // Month 6 (MonthActive = 5 completed) has 10% discount
  // Month 12 (MonthActive = 11 completed) has 20% discount
  const monthActive = informations.value.fields.MonthActive || 0;
  let discountPercent = 0;
  if (monthActive === 5) {
    discountPercent = 10;
  } else if (monthActive === 11) {
    discountPercent = 20;
  }

  // Student Discount 20%
  if (isStudent.value) {
    discountPercent = 20;
  }

  const discountAmount = Math.round(
    totalBeforeDiscount * (discountPercent / 100),
  );
  return totalBeforeDiscount - discountAmount;
});

onMounted(() => {
  axios
    .get(
      `https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mpjw5xxzr2364bf/records?where=%28ServerID%2C%20eq%2C%20${memberID}%29`,
      {
        headers: {
          "xc-token": import.meta.env.VITE_NDB_API,
        },
      },
    )
    .then((res) => {
      informations.value = res.data.records[0];
      loaded.value = true;
    })
    .catch((err) => console.log(err));
});
</script>

<style scoped>
table {
  width: 100%;
}
tr {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 0.6em;
}

td {
  width: 100%;
}

.server-link {
  color: #ffde59;
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-weight: bold;
}

.server-link:hover {
  color: #ffffff;
}

.specs-details-box {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 0.6em;
  padding: 0.8em 1em;
  margin: 0.25em 0 0.5em 0;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  text-align: left;
}

.spec-detail-line {
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-size: 0.9em;
  color: #e0e0e0;
}

.spec-detail-line i {
  width: 1.2em;
  text-align: center;
}

.spec-detail-line span {
  display: flex;
  align-items: center;
  gap: 0.25em;
}

.icon-gold {
  color: #ffde59;
}

.icon-red {
  color: #db292f;
}

.icon-blue {
  color: #3498db;
}

.icon-green {
  color: #2ecc71;
}

.icon-purple {
  color: #9b59b6;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25em 0.6em;
  border-radius: 0.4em;
  font-size: 0.85em;
  font-weight: bold;
}

.status-active {
  background-color: #1e2822;
  color: #2ecc71;
  border: 1px solid rgba(46, 204, 113, 0.2);
}

.status-inactive {
  background-color: #2d1d1d;
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.badge-gold {
  background-color: #ffde59;
  color: #111111;
  font-size: 0.75em;
  padding: 0.1em 0.4em;
  border-radius: 0.3em;
  font-weight: bold;
  margin-left: 0.3em;
}

.text-muted {
  color: #888888;
}

td:first-child {
  width: 30%;
  text-align: right;
  padding-right: 0.5em;
  font-weight: bold;
}

.stamps {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  background-color: #121212;
  border-radius: 1em;
  margin-top: 1em;
  padding: 1em 0 0.5em;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.stamp {
  width: 16%;
  position: relative;
  filter: grayscale(1);
}

.pump {
  filter: none;
}

.month {
  position: absolute;
  width: 2em;
  text-align: center;
  top: 0;
  right: 31%;
  color: #ffde59;
}

.discount {
  position: absolute;
  width: 2em;
  text-align: center;
  top: 40%;
  right: 45%;
  color: #ffde59;
}

.disclaimer {
  color: #5f5f5f;
  text-align: center;
}

.loading {
  filter: hue-rotate(300deg) saturate(200%);
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

.payment-action-box {
  margin-top: 1.5em;
  padding: 0 1em;
}

.pay-now-btn {
  background: linear-gradient(135deg, #db292f, #b31c21);
  color: #ffffff;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  padding: 0.9em 2em;
  border-radius: 0.6em;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  box-shadow: 0 4px 15px rgba(219, 41, 47, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6em;
}

.pay-now-btn:hover {
  background: linear-gradient(135deg, #f1353b, #db292f);
  box-shadow: 0 6px 20px rgba(219, 41, 47, 0.6);
  transform: translateY(-2px);
}

.pay-now-btn:active {
  transform: translateY(0);
}

.server-link-container {
  display: flex;
  align-items: center;
  gap: 1em;
  flex-wrap: wrap;
}

.manage-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  background-color: #1a1a1a;
  color: #3498db;
  border: 1px solid #3498db;
  border-radius: 0.4em;
  padding: 0.25em 0.6em;
  font-size: 0.85em;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease;
}

.manage-link:hover {
  background-color: #3498db;
  color: #ffffff;
  box-shadow: 0 0 8px rgba(52, 152, 219, 0.4);
}

.billing-date-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
}

.billing-countdown-badge {
  color: #ffde59;
  font-size: 0.9em;
  font-weight: bold;
}

@media screen and (max-width: 600px) {
  .discount {
    width: 1.8em;
  }

  .month {
    top: -5%;
  }

  .pay-now-btn {
    font-size: 1em;
    padding: 0.8em 1.5em;
  }
}
</style>
