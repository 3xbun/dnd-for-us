<template>
  <div class="creator-container">
    <BackButton />

    <!-- Active Form View (Wizard Flow) -->
    <div v-if="!isOrdered" class="creator-card">
      <div class="creator-header">
        <h2>สร้างเซิร์ฟเวอร์ Foundry VTT ของคุณ</h2>
        <p class="subtitle">
          ปรับแต่งสเปคเซิร์ฟเวอร์และสิทธิ์การใช้งานตามต้องการ
        </p>
      </div>

      <hr class="divider" />

      <!-- Step Navigation Header -->
      <div class="step-navigation">
        <button
          @click="prevStep"
          :disabled="isPrevDisabled"
          class="nav-btn"
          title="ย้อนกลับ"
        >
          <i class="fa-solid fa-duotone fa-arrow-left"></i>
        </button>
        <div class="step-title-container">
          <span class="step-badge">ขั้นตอนที่ {{ currentStep }}/5</span>
          <h3 class="step-title-text">{{ stepTitles[currentStep - 1] }}</h3>
        </div>
        <button
          @click="nextStep"
          :disabled="isNextDisabled"
          class="nav-btn"
          title="ถัดไป"
        >
          <i class="fa-solid fa-duotone fa-arrow-right"></i>
        </button>
      </div>

      <!-- Step Progress Bar -->
      <div class="step-progress-bar">
        <div
          class="progress-fill"
          :style="{ width: ((currentStep - 1) / 4) * 100 + '%' }"
        ></div>
        <div class="progress-dots">
          <div
            v-for="step in 5"
            :key="step"
            class="progress-dot"
            :class="{
              active: step <= currentStep,
              current: step === currentStep,
            }"
            @click="goToStep(step)"
          >
            <span class="dot-number">{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Step Content Area -->
      <div class="step-content-wrapper">
        <!-- STEP 1: Billing Term -->
        <div v-show="currentStep === 1" class="step-container">
          <div class="form-section">
            <h3>1. เลือกรอบการชำระเงิน</h3>
            <p class="section-desc">
              เลือกแผนที่เหมาะกับแคมเปญของคุณ
            </p>
            <div class="grid-options">
              <div
                v-for="term in billingTerms"
                :key="term.months"
                class="option-card billing-term-card"
                :class="{ active: selectedBillingMonths === term.months }"
                @click="selectedBillingMonths = term.months"
              >
                <div class="card-radio">
                  <span class="radio-dot"></span>
                </div>
                <div class="card-details">
                  <div class="card-title">
                    {{ term.label }}
                    <span v-if="term.discountPercent > 0" class="badge-gold">
                      ประหยัด {{ term.discountPercent }}%
                    </span>
                  </div>
                  <p class="card-price">
                    เริ่มต้น ฿{{ termStartingPrice(term) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Foundry VTT Version -->
        <div v-show="currentStep === 2" class="step-container">
          <div class="form-section">
            <h3>2. เลือกเวอร์ชัน Foundry VTT</h3>
            <p class="section-desc">
              กรุณาเลือกเวอร์ชันที่เหมาะสมกับระบบและ Module ที่ต้องการใช้งาน
            </p>

            <div class="grid-options">
              <div
                v-for="ver in versionOptions"
                :key="ver.id"
                class="option-card"
                :class="{ active: selectedVersion === ver.id }"
                @click="selectedVersion = ver.id"
              >
                <div class="card-radio">
                  <span class="radio-dot"></span>
                </div>
                <div class="card-details">
                  <div class="card-title">
                    Foundry VTT v{{ ver.id }}
                    <span v-if="ver.isLatest" class="badge-accent">แนะนำ</span>
                  </div>
                  <p class="card-desc">{{ ver.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Server Specs (Memory & SSD) -->
        <div v-show="currentStep === 3" class="step-container">
          <!-- Memory Option (RAM) -->
          <div class="form-section">
            <h3>3. เลือกขนาดหน่วยความจำ (Memory / RAM)</h3>
            <p class="section-desc">
              จำนวน RAM ที่มากขึ้นช่วยเพิ่มความลื่นไหลเมื่อมีผู้เล่นหลายคน
              หรือเมื่อใส่ Module และฉากขนาดใหญ่
            </p>

            <div class="grid-options">
              <div
                v-for="mem in memoryOptions"
                :key="mem.size"
                class="option-card"
                :class="{ active: selectedMemory === mem.size }"
                @click="selectedMemory = mem.size"
              >
                <div class="card-radio">
                  <span class="radio-dot"></span>
                </div>
                <div class="card-details">
                  <div class="card-title">
                    {{ mem.size }} GB RAM
                    <span v-if="mem.isPopular" class="badge-gold">ยอดนิยม</span>
                  </div>
                  <p class="card-desc">{{ mem.recommendation }}</p>
                  <p class="card-price" v-if="mem.extraPrice > 0">
                    + ฿{{ mem.extraPrice }} / เดือน
                  </p>
                  <p class="card-price" v-else>รวมอยู่ในราคาเริ่มต้น</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Storage Option (SSD Space with 5 GB increments) -->
          <div class="form-section">
            <h3>4. กำหนดพื้นที่เก็บข้อมูล (Custom SSD Storage)</h3>
            <p class="section-desc">
              พื้นที่สำหรับจัดเก็บแผนที่, รูปภาพ และไฟล์เสียง (พื้นที่เริ่มต้น 5
              GB ฟรี! เพิ่มเติมคิดราคาเพียง ฿2 ต่อ GB)
            </p>

            <div class="custom-storage-box">
              <div class="storage-stepper">
                <button
                  @click="decrementStorage"
                  :disabled="selectedStorage <= minStorage"
                  class="stepper-btn"
                >
                  <i class="fa-solid fa-duotone fa-minus"></i> 5 GB
                </button>

                <div class="storage-display">
                  <span class="storage-value">{{ selectedStorage }}</span>
                  <span class="storage-unit">GB SSD</span>
                </div>

                <button
                  @click="incrementStorage"
                  :disabled="selectedStorage >= maxStorage"
                  class="stepper-btn"
                >
                  <i class="fa-solid fa-duotone fa-plus"></i> 5 GB
                </button>
              </div>

              <div class="storage-slider-wrapper">
                <input
                  type="range"
                  :min="minStorage"
                  :max="maxStorage"
                  step="5"
                  v-model.number="selectedStorage"
                  class="storage-slider"
                />
                <div class="slider-labels">
                  <span>{{ minStorage }} GB (เริ่มต้น)</span>
                  <span>25 GB</span>
                  <span>{{ maxStorage }} GB (สูงสุด)</span>
                </div>
              </div>

              <div class="storage-recommendation-note">
                <i class="fa-solid fa-duotone fa-circle-info"></i>
                <span v-if="selectedStorage <= 15"
                  >เหมาะสำหรับปาร์ตี้ทั่วไป แคมเปญสั้น
                  และการใช้รูปภาพขนาดมาตรฐาน</span
                >
                <span v-else-if="selectedStorage <= 25"
                  >แนะนำสำหรับการทำแคมเปญระยะยาวที่มีไฟล์รูป แผนที่
                  และเพลงประกอบจำนวนมาก</span
                >
                <span v-else
                  >จุใจระดับตำนาน รองรับไฟล์ฉาก 4K มิวสิกเพลย์ลิสต์ขนาดใหญ่
                  และโมดูลเสริมเพียบ</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 4: Foundry VTT License Option -->
        <div v-show="currentStep === 4" class="step-container">
          <div class="form-section">
            <h3>5. สิทธิ์การใช้งานลิขสิทธิ์ (Foundry VTT License)</h3>
            <p class="section-desc">
              คุณมี License Key ของตนเองเพื่อใช้ FoundryVTT แล้วหรือไม่?
            </p>

            <div class="grid-options">
              <div
                class="option-card"
                :class="{ active: licenseOption === 'own' }"
                @click="licenseOption = 'own'"
              >
                <div class="card-radio">
                  <span class="radio-dot"></span>
                </div>
                <div class="card-details">
                  <div class="card-title">ใช้คีย์ของตัวเอง</div>
                  <p class="card-desc">
                    มี License Key ที่ซื้อมาเองแล้ว สามารถนำไปกรอกใน Server
                    ได้ทันที
                  </p>
                  <p class="card-price">ไม่มีค่าใช้จ่ายเพิ่มเติม (+ ฿0)</p>
                </div>
              </div>

              <div
                class="option-card"
                :class="{ active: licenseOption === 'borrow' }"
                @click="licenseOption = 'borrow'"
              >
                <div class="card-radio">
                  <span class="radio-dot"></span>
                </div>
                <div class="card-details">
                  <div class="card-title">
                    ขอยืมสิทธิ์การใช้งานจากทางเรา
                    <span class="badge-accent">มีระบบช่วยเหลือ</span>
                  </div>
                  <p class="card-desc">
                    ยังไม่มีคีย์ แต่อยากเริ่มเล่นทันที ขอยืมคีย์ของ D&D For Us
                  </p>
                  <p class="card-price">+ ฿{{ borrowLicensePrice }} / เดือน</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 5: Premium Add-ons & Summary -->
        <div v-show="currentStep === 5" class="step-container">
          <div class="form-section">
            <h3>5. ตั้งชื่อเซิร์ฟเวอร์ (Server Name)</h3>
            <p class="section-desc">
              ชื่อนี้จะถูกนำไปใช้เป็นชื่อลิงก์สำหรับเข้าเล่นเซิร์ฟเวอร์ของคุณ
              (ภาษาอังกฤษและตัวเลขเท่านั้น)
            </p>

            <div class="input-wrapper">
              <input
                type="text"
                v-model="serverName"
                @input="normalizeServerName"
                placeholder="เช่น my-epic-campaign"
                class="styled-input"
                maxlength="30"
              />
              <span class="subdomain-suffix">.dnd-for.us</span>
            </div>

            <div
              class="url-preview"
              :class="{
                'preview-valid': isNameValid,
                'preview-invalid': serverName && !isNameValid,
              }"
            >
              <div class="preview-dot"></div>
              <span class="preview-text">
                ลิงก์เข้าเล่นของคุณจะเป็น:
                <strong
                  >https://{{
                    serverNameNormalized || "your-campaign"
                  }}.dnd-for.us</strong
                >
              </span>
            </div>
            <p
              v-if="serverName && serverName.length < 3"
              class="validation-warning"
            >
              ⚠️ ชื่อเซิร์ฟเวอร์ต้องมีความยาวอย่างน้อย 3 ตัวอักษร
            </p>
          </div>

          <!-- Premium Add-ons -->
          <div class="form-section">
            <h3>6. ส่วนเสริมพิเศษ (Premium Add-ons)</h3>
            <p class="section-desc">
              เพิ่มขีดความสามารถพิเศษในการเล่นด้วยโมดูลเสริมระดับพรีเมียมที่มีประสิทธิภาพสูงสุด
            </p>

            <div class="grid-options">
              <div
                class="option-card"
                :class="{ active: plutoniumAddon }"
                @click="plutoniumAddon = !plutoniumAddon"
              >
                <div class="card-checkbox">
                  <span class="checkbox-box" v-if="plutoniumAddon">✔</span>
                </div>
                <div class="card-details">
                  <div class="card-title">
                    Premium Module: Heromancer
                    <span class="badge-gold">ยอดฮิต</span>
                  </div>
                  <p class="card-desc">
                    ปลดล็อกขีดความสามารถในการแปลงข้อมูลตัวละคร คาถา
                    และกฎเสริมจากหนังสือจริง (Physical Books) ของคุณเข้าสู่ระบบ
                    Foundry VTT เพื่อสร้างตัวละครได้ทันทีอย่างรวดเร็วและเป็นระบบ
                  </p>
                  <p class="card-price">+ ฿{{ plutoniumPrice }} / เดือน</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Price Calculation Panel -->
          <div class="summary-panel" ref="summaryPanel">
            <h4 class="summary-title">สรุปราคาสเปคที่คุณเลือก</h4>

            <div class="summary-rows">
              <div class="summary-row">
                <span>เซิร์ฟเวอร์เริ่มต้น</span>
                <span>฿{{ basePrice }}</span>
              </div>
              <div class="summary-row" v-if="currentMemoryExtra > 0">
                <span>เพิ่มขนาด RAM เป็น {{ selectedMemory }} GB</span>
                <span>+ ฿{{ currentMemoryExtra }}</span>
              </div>
              <div class="summary-row" v-if="currentStorageExtra > 0">
                <span
                  >พื้นที่เพิ่มเติม (+{{
                    selectedStorage - minStorage
                  }}
                  GB)</span
                >
                <span>+ ฿{{ currentStorageExtra }}</span>
              </div>
              <div class="summary-row" v-if="licenseOption === 'borrow'">
                <span>ค่าธรรมเนียมยืมคีย์ FoundryVTT</span>
                <span>+ ฿{{ borrowLicensePrice }}</span>
              </div>
              <div class="summary-row" v-if="plutoniumAddon">
                <span>ส่วนเสริมพรีเมียม Plutonium: Heromancer</span>
                <span>+ ฿{{ plutoniumPrice }}</span>
              </div>
            </div>

            <hr class="summary-divider" />

            <div class="summary-row">
              <span>รอบชำระเงิน</span>
              <span>{{ selectedBillingLabel }}</span>
            </div>
            <div class="summary-row" v-if="billingDiscountAmount > 0">
              <span>ส่วนลดรอบชำระ</span>
              <span>- ฿{{ billingDiscountAmount }}</span>
            </div>

            <div class="total-row">
              <span>รวมยอดที่ต้องชำระ</span>
              <span class="total-price"
                >฿{{ totalPrice }}
                <span class="per-month">/ {{ selectedBillingLabel }}</span></span
              >
            </div>
          </div>

          <!-- Action Button -->
          <div class="action-section">
            <button
              @click="submitOrder"
              :disabled="!isNameValid"
              class="submit-btn"
              :class="{ 'btn-disabled': !isNameValid }"
            >
              สั่งซื้อเซิร์ฟเวอร์สเปคนี้
              <i class="fa-solid fa-duotone fa-wand-magic-sparkles"></i>
            </button>
            <p v-if="!isNameValid" class="button-hint">
              * กรุณาตั้งชื่อเซิร์ฟเวอร์ที่ถูกต้องก่อนดำเนินการต่อ
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Buttons (Wizard style) -->
      <div class="wizard-bottom-nav" v-if="currentStep < 5">
        <button
          @click="prevStep"
          :disabled="isPrevDisabled"
          class="wizard-nav-btn prev-btn"
        >
          <i class="fa-solid fa-duotone fa-arrow-left"></i> ย้อนกลับ
        </button>
        <button
          @click="nextStep"
          :disabled="isNextDisabled"
          class="wizard-nav-btn next-btn"
        >
          ถัดไป <i class="fa-solid fa-duotone fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Success View -->
    <div v-else class="creator-card success-card">
      <div class="success-header">
        <h2>สั่งซื้อเซิร์ฟเวอร์เสร็จสมบูรณ์!</h2>
        <p class="success-subtitle">
          เราเตรียมข้อมูลสเปคและคำสั่งซื้อของคุณเรียบร้อยแล้ว
        </p>
      </div>

      <div class="success-details">
        <p class="instruction-text">
          คัดลอกข้อความสเปคด้านล่างนี้ และส่งให้แอดมินทาง
          <a
            href="https://m.me/dnd-for.us"
            target="_blank"
            rel="noopener noreferrer"
            class="messenger-link"
            >แชท Facebook</a
          >
          เพื่อดำเนินการรันเซิร์ฟเวอร์ให้คุณทันที!
        </p>

        <!-- Spec Output Box -->
        <div class="spec-box">
          <pre id="spec-text">{{ formattedOrderText }}</pre>
        </div>

        <!-- Copy Action Button -->
        <button @click="copyOrderText" class="copy-btn">
          <span v-if="!isCopied"
            >คัดลอกสเปคเซิร์ฟเวอร์ <i class="fa-solid fa-duotone fa-copy"></i
          ></span>
          <span v-else
            >คัดลอกสำเร็จแล้ว! <i class="fa-solid fa-duotone fa-check"></i
          ></span>
        </button>

        <!-- Messenger Action Button -->
        <a
          href="https://m.me/dnd-for.us"
          target="_blank"
          rel="noopener noreferrer"
          class="messenger-btn"
        >
          ส่งสเปคทาง Facebook Messenger
          <i class="fa-brands fa-facebook-messenger"></i>
        </a>
      </div>

      <hr class="divider" />

      <div class="success-footer">
        <button @click="resetForm" class="btn-secondary">
          <i class="fa-solid fa-duotone fa-rotate-left"></i>
          สร้างเซิร์ฟเวอร์ใหม่อีกเครื่อง
        </button>
      </div>
    </div>

    <!-- Floating Cost Sticker -->
    <Transition name="slide-up">
      <div v-if="showSticker && !isOrdered" class="floating-sticker">
        <div class="sticker-info">
          <span class="sticker-label">ราคาเฉลี่ยต่อเดือน</span>
          <div class="sticker-price-box">
            <span class="sticker-price"
              >฿{{ Math.round(totalPrice / selectedBillingMonths) }}</span
            >
            <span class="sticker-period">/ เดือน</span>
          </div>
        </div>
        <button @click="scrollToSummary" class="sticker-btn">
          <span>ดูสรุป & สั่งซื้อ</span>
          <i class="fa-solid fa-duotone fa-chevron-down"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import BackButton from "../components/BackButton.vue";

// Wizard Steps Configuration
const currentStep = ref(1);
const stepTitles = ref([
  "รอบการชำระเงิน",
  "เวอร์ชันระบบ",
  "สเปคเครื่อง (RAM & SSD)",
  "ลิขสิทธิ์ระบบ",
  "ชื่อเซิร์ฟเวอร์ & สรุปรายการ",
]);

// Floating sticker visibility state
const summaryPanel = ref(null);
const showSticker = ref(true);
let observer = null;

onMounted(() => {
  if (summaryPanel.value) {
    observer = new IntersectionObserver(
      ([entry]) => {
        showSticker.value = !entry.isIntersecting;
      },
      { threshold: 0.1 },
    );
    observer.observe(summaryPanel.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const scrollToSummary = () => {
  currentStep.value = 5;
  // Wait for the DOM to update step container visibility so that summaryPanel exists in the viewport layout
  setTimeout(() => {
    if (summaryPanel.value) {
      summaryPanel.value.scrollIntoView({ behavior: "smooth" });
    }
  }, 50);
};

// Base price configuration
const basePrice = ref(89);
const borrowLicensePrice = ref(50); // Monthly fee for borrowing our license key
const plutoniumPrice = ref(29); // Premium Plutonium Module addon price

// Storage boundaries & costs
const minStorage = 5; // 5 GB included in basePrice
const maxStorage = 50; // Hard limit for standard servers
const costPerGB = 2; // 2 THB per 1 GB extra storage

// User Form State
const serverName = ref("");
const selectedVersion = ref(14);
const selectedMemory = ref(2);
const selectedStorage = ref(5);
const licenseOption = ref("own"); // 'own' or 'borrow'
const plutoniumAddon = ref(false); // Heromancer integration flag
const billingTerms = [
  { months: 1, label: "รายเดือน", discountPercent: 0 },
  { months: 6, label: "ราย 6 เดือน", discountPercent: 5 },
  { months: 12, label: "รายปี", discountPercent: 10 },
];
const selectedBillingMonths = ref(1);

const route = useRoute();
const router = useRouter();

// Order flow State
const isOrdered = ref(false);
const isCopied = ref(false);

// Normalize Server Name: lowercase, replace spaces and special characters with hyphen
const serverNameNormalized = computed(() => {
  return serverName.value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // remove all non-alphanumeric/hyphen characters
    .replace(/-+/g, "-"); // merge multiple continuous hyphens
});

// Update input display with normalized value
const normalizeServerName = () => {
  serverName.value = serverNameNormalized.value;
};

// Check if Server Name is Valid
const isNameValid = computed(() => {
  const normalized = serverNameNormalized.value;
  return normalized.length >= 3 && normalized.length <= 30;
});

// Wizard Steps Navigation Validation
const isPrevDisabled = computed(() => {
  return currentStep.value <= 1;
});

const isNextDisabled = computed(() => {
  if (currentStep.value >= 5) return true;
  return false;
});

const nextStep = () => {
  if (isNextDisabled.value) return;
  if (currentStep.value < 5) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const prevStep = () => {
  if (isPrevDisabled.value) return;
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const goToStep = (step) => {
  currentStep.value = step;
};

// Sync isOrdered and route path
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/server/summary") {
      if (!isNameValid.value) {
        router.replace("/server");
      } else {
        isOrdered.value = true;
      }
    } else if (newPath === "/server") {
      isOrdered.value = false;
    }
  },
  { immediate: true },
);

watch(isOrdered, (newVal) => {
  if (newVal && route.path !== "/server/summary") {
    router.push("/server/summary");
  } else if (!newVal && route.path === "/server/summary") {
    router.push("/server");
  }
});

// Options Lists
const versionOptions = ref([
  {
    id: 14,
    isLatest: true,
    description:
      "เวอร์ชันล่าสุด เสถียรสูง ประสิทธิภาพดีเยี่ยม รองรับฟังก์ชันใหม่",
  },
  {
    id: 13,
    isLatest: false,
    description:
      "เสถียรสูงสุด มีความเข้ากันได้ดีมากกับ Module ยอดนิยมเวอร์ชันเก่า",
  },
]);

const memoryOptions = ref([
  {
    size: 2,
    extraPrice: 0,
    isPopular: false,
    recommendation:
      "เหมาะสำหรับปาร์ตี้ขนาดเล็ก (2-4 คน) มีแผนที่และโมดูลทั่วไป",
  },
  {
    size: 4,
    extraPrice: 50,
    isPopular: true,
    recommendation:
      "แนะนำสำหรับปาร์ตี้หลัก (4-8 คน) มีเอฟเฟกต์ สภาพแสง และโมดูลเยอะ",
  },
  {
    size: 8,
    extraPrice: 150,
    isPopular: false,
    recommendation:
      "ระดับโปร สำหรับปาร์ตี้ขนาดใหญ่ 8 คนขึ้นไป แผนที่ละเอียดสูง 4K เต็มรูปแบบ",
  },
]);

// Interactive Storage Handlers
const incrementStorage = () => {
  if (selectedStorage.value + 5 <= maxStorage) {
    selectedStorage.value += 5;
  }
};

const decrementStorage = () => {
  if (selectedStorage.value - 5 >= minStorage) {
    selectedStorage.value -= 5;
  }
};

// Dynamic Price Calculations
const currentMemoryExtra = computed(() => {
  const option = memoryOptions.value.find(
    (opt) => opt.size === selectedMemory.value,
  );
  return option ? option.extraPrice : 0;
});

const currentStorageExtra = computed(() => {
  if (selectedStorage.value <= minStorage) return 0;
  return (selectedStorage.value - minStorage) * costPerGB;
});

const licenseExtraPrice = computed(() => {
  return licenseOption.value === "borrow" ? borrowLicensePrice.value : 0;
});

const plutoniumExtraPrice = computed(() => {
  return plutoniumAddon.value ? plutoniumPrice.value : 0;
});

const monthlyPrice = computed(() => {
  return (
    basePrice.value +
    currentMemoryExtra.value +
    currentStorageExtra.value +
    licenseExtraPrice.value +
    plutoniumExtraPrice.value
  );
});

const selectedBillingTerm = computed(() => {
  return billingTerms.find(
    (term) => term.months === selectedBillingMonths.value,
  );
});

const selectedBillingLabel = computed(
  () => selectedBillingTerm.value?.label || "รายเดือน",
);

const billingDiscountAmount = computed(() => {
  return Math.round(
    monthlyPrice.value *
      selectedBillingMonths.value *
      ((selectedBillingTerm.value?.discountPercent || 0) / 100),
  );
});

const termStartingPrice = (term) => {
  return Math.round(
    basePrice.value * term.months * (1 - term.discountPercent / 100),
  );
};

const totalPrice = computed(() => {
  return (
    monthlyPrice.value * selectedBillingMonths.value -
    billingDiscountAmount.value
  );
});

// Order Summary Copy Output Builder
const formattedOrderText = computed(() => {
  const licenseText =
    licenseOption.value === "borrow"
      ? "ขอยืมคีย์จากทางเรา [+฿50]"
      : "ใช้คีย์ของตัวเอง [+฿0]";

  const plutoniumText = plutoniumAddon.value
    ? "ติดตั้งส่วนเสริม (Plutonium: Heromancer) [+฿29]"
    : "ไม่ติดตั้ง [+฿0]";

  return `[ใบสั่งซื้อเซิร์ฟเวอร์ Foundry VTT - D&D For Us]
-----------------------------------------
🔮 ชื่อเซิร์ฟเวอร์: ${serverNameNormalized.value}
🌐 URL สำหรับเข้าเล่น: https://${serverNameNormalized.value}.dnd-for.us
⚙️ เวอร์ชัน Foundry: Version ${selectedVersion.value}
🧠 ขนาด RAM: ${selectedMemory.value} GB
💾 พื้นที่จัดเก็บ: ${selectedStorage.value} GB
🔑 สถานะสิทธิ์ License: ${licenseText}
✨ ส่วนเสริมพรีเมียม: ${plutoniumText}
-----------------------------------------
💵 รอบชำระเงิน: ${selectedBillingLabel.value}
💵 ค่าบริการรวม: ฿${totalPrice.value}
📌 ราคาเฉลี่ยต่อเดือน: ฿${Math.round(totalPrice.value / selectedBillingMonths.value)}
-----------------------------------------
🎉 สนใจรันระบบตามสเปคด้านบนนี้ 🎉`;
});

// Order Actions
const submitOrder = () => {
  if (isNameValid.value) {
    isOrdered.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const copyOrderText = () => {
  navigator.clipboard
    .writeText(formattedOrderText.value)
    .then(() => {
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, 3000);
    })
    .catch((err) => {
      console.error("Unable to copy", err);
    });
};

const resetForm = () => {
  serverName.value = "";
  selectedVersion.value = 14;
  selectedMemory.value = 2;
  selectedStorage.value = 5;
  licenseOption.value = "own";
  plutoniumAddon.value = false;
  selectedBillingMonths.value = 1;
  isOrdered.value = false;
  isCopied.value = false;
  currentStep.value = 1;
};
</script>

<style scoped>
.creator-container {
  max-width: 650px;
  margin: 1.5em auto;
  padding: 0 1em 3em;
  font-family: "Noto Sans Thai", sans-serif;
  color: #f5f5f5;
}

.creator-card {
  background-color: #2a2a2a;
  border-radius: 1em;
  padding: 2em;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 8px 24px;
  border: 1px solid #3a3a3a;
}

.creator-header {
  text-align: center;
  margin-bottom: 1.5em;
}

.dice-icon {
  font-size: 2.5em;
  margin-bottom: 0.2em;
}

.creator-header h2 {
  font-size: 1.6em;
  color: #ffde59;
  margin-bottom: 0.4em;
}

.subtitle {
  color: #b0b0b0;
  font-size: 0.95em;
  margin: 0;
}

.divider {
  border: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, #555555, transparent);
  margin: 1.5em 0;
}

/* Step Navigation Styles */
.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  background-color: #1e1e1e;
  border-radius: 0.8rem;
  padding: 0.8rem 1.2rem;
  border: 1px solid #383838;
}

.step-title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  text-align: center;
}

.step-badge {
  font-size: 0.75rem;
  font-weight: bold;
  color: #ffde59;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.2rem;
}

.step-title-text {
  font-size: 1.15rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.nav-btn {
  background-color: #db292f;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
  background-color: #f1353b;
  transform: scale(1.05);
}

.nav-btn:disabled {
  background-color: #353535;
  color: #666666;
  cursor: not-allowed;
}

/* Step Progress Bar Styles */
.step-progress-bar {
  position: relative;
  height: 4px;
  background-color: #3a3a3a;
  border-radius: 2px;
  margin: 1.5rem 1rem 2.5rem 1rem;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #db292f;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-dots {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
}

.progress-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #2a2a2a;
  border: 2px solid #555555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
  z-index: 2;
}

.progress-dot.active {
  border-color: #db292f;
  background-color: #db292f;
}

.progress-dot.current {
  border-color: #ffde59;
  background-color: #2a2a2a;
  box-shadow: 0 0 10px rgba(255, 222, 89, 0.5);
}

.dot-number {
  font-size: 0.8rem;
  font-weight: bold;
  color: #cccccc;
}

.progress-dot.active .dot-number {
  color: #ffffff;
}

.progress-dot.current .dot-number {
  color: #ffde59;
}

.progress-dot:not(.active):hover {
  border-color: #888888;
}

/* Wizard Bottom Nav Styles */
.wizard-bottom-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #383838;
}

.wizard-nav-btn {
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.prev-btn {
  background-color: #353535;
  color: #ffffff;
  border: 1px solid #4a4a4a;
}

.prev-btn:hover:not(:disabled) {
  background-color: #454545;
  border-color: #666666;
}

.prev-btn:disabled {
  background-color: #222222;
  color: #555555;
  border-color: #333333;
  cursor: not-allowed;
}

.next-btn {
  background-color: #db292f;
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 12px rgba(219, 41, 47, 0.2);
}

.next-btn:hover:not(:disabled) {
  background-color: #f1353b;
  box-shadow: 0 4px 15px rgba(219, 41, 47, 0.4);
  transform: translateY(-1px);
}

.next-btn:disabled {
  background-color: #4a4a4a;
  color: #888888;
  cursor: not-allowed;
  box-shadow: none;
}

/* Step Containers */
.step-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  margin-bottom: 2em;
  text-align: left;
}

.form-section h3 {
  font-size: 1.15em;
  color: #ffffff;
  margin-bottom: 0.4em;
  border-left: 3px solid #db292f;
  padding-left: 0.6em;
}

.section-desc {
  font-size: 0.88em;
  color: #a0a0a0;
  margin-bottom: 1.2em;
  line-height: 1.4;
}

/* Styled Inputs */
.input-wrapper {
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  border: 2px solid #3a3a3a;
  border-radius: 0.6em;
  padding: 0.5em 0.8em;
  margin-bottom: 0.6em;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #db292f;
}

.styled-input {
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 1.05em;
  padding: 0;
  margin: 0;
  width: 100%;
}

.subdomain-suffix {
  color: #888888;
  font-weight: bold;
  font-size: 1.05em;
  margin-left: 0.3em;
  user-select: none;
}

/* URL Preview Box */
.url-preview {
  display: flex;
  align-items: center;
  gap: 0.6em;
  background-color: #1f1f1f;
  border-radius: 0.5em;
  padding: 0.6em 1em;
  font-size: 0.85em;
  margin-top: 0.5em;
  border-left: 3px solid #555;
}

.preview-valid {
  border-left-color: #2ecc71;
}

.preview-invalid {
  border-left-color: #e74c3c;
}

.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #888;
}

.preview-valid .preview-dot {
  background-color: #2ecc71;
  box-shadow: 0 0 8px #2ecc71;
}

.preview-invalid .preview-dot {
  background-color: #e74c3c;
  box-shadow: 0 0 8px #e74c3c;
}

.preview-text {
  color: #cccccc;
}

.preview-text strong {
  color: #ffffff;
}

.validation-warning {
  color: #e74c3c;
  font-size: 0.85em;
  margin-top: 0.5em;
  margin-bottom: 0;
}

/* Custom Storage Section Controls */
.custom-storage-box {
  background-color: #1e1e1e;
  border: 1px solid #383838;
  border-radius: 0.8em;
  padding: 1.5em;
}

.storage-stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2em;
}

.stepper-btn {
  background-color: #353535;
  color: #ffffff;
  border: 1px solid #4a4a4a;
  border-radius: 0.5em;
  padding: 0.6em 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.stepper-btn:hover:not(:disabled) {
  background-color: #db292f;
  border-color: #db292f;
}

.stepper-btn:disabled {
  background-color: #222222;
  color: #555555;
  border-color: #333333;
  cursor: not-allowed;
}

.storage-display {
  text-align: center;
}

.storage-value {
  font-size: 2em;
  font-weight: bold;
  color: #ffde59;
}

.storage-unit {
  font-size: 1.1em;
  color: #ffffff;
  margin-left: 0.3em;
  font-weight: bold;
}

.storage-slider-wrapper {
  margin: 1.5em 0 1.2em 0;
}

.storage-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: #3a3a3a;
  outline: none;
  cursor: pointer;
}

.storage-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #db292f;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s;
}

.storage-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.storage-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #db292f;
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  transition: transform 0.1s;
  cursor: pointer;
}

.storage-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.78em;
  color: #888888;
  margin-top: 0.4em;
}

.storage-recommendation-note {
  font-size: 0.82em;
  color: #a0a0a0;
  background-color: #151515;
  border-radius: 0.5em;
  padding: 0.6em 1em;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 0.6em;
}

.storage-recommendation-note i {
  color: #ffde59;
}

/* Grid Layout for Option Cards */
.grid-options {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.option-card {
  background-color: #1e1e1e;
  border: 1px solid #383838;
  border-radius: 0.8em;
  padding: 1.1em;
  display: flex;
  align-items: flex-start;
  gap: 1em;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.option-card:hover {
  background-color: #252525;
  border-color: #555555;
}

.option-card.active {
  background-color: #2a1b1b;
  border-color: #db292f;
  box-shadow: 0 0 10px rgba(219, 41, 47, 0.15);
}

.card-radio,
.card-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #555555;
  margin-top: 0.2em;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.card-checkbox {
  border-radius: 4px;
}

.option-card.active .card-radio,
.option-card.active .card-checkbox {
  border-color: #db292f;
  background-color: #db292f;
}

.radio-dot,
.checkbox-box {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: transparent;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.75em;
  font-weight: bold;
}

.option-card.active .radio-dot {
  background-color: #ffffff;
}

.card-details {
  flex-grow: 1;
}

.card-title {
  font-weight: bold;
  font-size: 1.05em;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.2em;
}

.card-desc {
  font-size: 0.85em;
  color: #a0a0a0;
  margin: 0 0 0.4em 0;
  line-height: 1.4;
}

.card-price {
  font-size: 0.85em;
  color: #ffde59;
  font-weight: bold;
  margin: 0;
}

/* Badges */
.badge-accent {
  background-color: #db292f;
  color: #ffffff;
  font-size: 0.7em;
  padding: 0.1em 0.5em;
  border-radius: 0.3em;
  font-weight: normal;
}

.badge-gold {
  background-color: #ffde59;
  color: #111111;
  font-size: 0.7em;
  padding: 0.1em 0.5em;
  border-radius: 0.3em;
  font-weight: bold;
}

/* Summary Panel CSS */
.summary-panel {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 0.8em;
  padding: 1.2em 1.5em;
  margin-top: 2em;
  text-align: left;
}

.summary-title {
  font-size: 1.1em;
  color: #ffde59;
  margin: 0 0 0.8em 0;
  font-weight: bold;
}

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #b0b0b0;
}

.summary-divider {
  border: 0;
  height: 1px;
  background-color: #333333;
  margin: 1em 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 1.05em;
}

.total-price {
  color: #db292f;
  font-size: 1.5em;
}

.per-month {
  font-size: 0.6em;
  color: #888888;
  font-weight: normal;
}

/* Action Section */
.action-section {
  margin-top: 2em;
  text-align: center;
}

.submit-btn {
  background-color: #db292f;
  color: white;
  border: none;
  font-size: 1.15em;
  font-weight: bold;
  padding: 0.8em 2.5em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(219, 41, 47, 0.3);
  width: 100%;
  max-width: 400px;
}

.submit-btn:hover:not(.btn-disabled) {
  background-color: #f1353b;
  box-shadow: 0 4px 20px rgba(219, 41, 47, 0.5);
  transform: translateY(-2px);
}

.submit-btn:active:not(.btn-disabled) {
  transform: translateY(0);
}

.btn-disabled {
  background-color: #4a4a4a;
  color: #888888;
  cursor: not-allowed;
  box-shadow: none;
}

.button-hint {
  color: #888888;
  font-size: 0.85em;
  margin-top: 0.6em;
  margin-bottom: 0;
}

/* Success Card CSS */
.success-card {
  border-color: #2ecc71;
  background-color: #1e2822;
}

.success-header {
  text-align: center;
  margin-bottom: 1.5em;
}

.success-header h2 {
  color: #2ecc71;
  font-size: 1.6em;
  margin-bottom: 0.4em;
}

.success-subtitle {
  color: #a8bfae;
  font-size: 0.95em;
  margin: 0;
}

.success-details {
  text-align: left;
}

.instruction-text {
  font-size: 0.95em;
  line-height: 1.5;
  color: #cccccc;
  margin-bottom: 1em;
}

.spec-box {
  background-color: #121614;
  border: 1px solid #2d4535;
  border-radius: 0.8em;
  padding: 1.2em;
  margin-bottom: 1.2em;
  overflow-x: auto;
}

#spec-text {
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  margin: 0;
}

.copy-btn {
  background-color: #2ecc71;
  color: #111111;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  padding: 0.8em 2em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
}

.copy-btn:hover {
  background-color: #2ecc71e0;
  transform: translateY(-2px);
}

.copy-btn:active {
  transform: translateY(0);
}

.messenger-btn {
  background-color: #0084ff;
  color: #ffffff;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  padding: 0.8em 2em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  text-decoration: none;
  margin-top: 0.8em;
  box-sizing: border-box;
}

.messenger-btn:hover {
  background-color: #0073e6;
  transform: translateY(-2px);
}

.messenger-btn:active {
  transform: translateY(0);
}

.messenger-link {
  color: #0084ff;
  text-decoration: underline;
  font-weight: bold;
  transition: color 0.2s ease;
}

.messenger-link:hover {
  color: #33a1ff;
}

.success-footer {
  text-align: center;
  margin-top: 1.5em;
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

@keyframes celebrate {
  0% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1.1) rotate(5deg);
  }
}

@media (max-width: 480px) {
  .creator-card {
    padding: 1.2em;
  }
  .input-wrapper {
    padding: 0.4em 0.6em;
  }
  .subdomain-suffix {
    font-size: 0.9em;
  }
  .styled-input {
    font-size: 0.95em;
  }
  .total-price {
    font-size: 1.3em;
  }
  .storage-stepper {
    flex-direction: column;
    gap: 0.8em;
  }
  .stepper-btn {
    width: 100%;
  }

  /* Wizard Mobile styles */
  .step-navigation {
    padding: 0.6rem 0.8rem;
    margin-bottom: 1rem;
  }
  .step-title-text {
    font-size: 1rem;
  }
  .step-badge {
    font-size: 0.7rem;
  }
  .nav-btn {
    width: 32px;
    height: 32px;
  }
  .step-progress-bar {
    margin: 1.5rem 1rem 2rem 1rem;
  }
  .progress-dot {
    width: 20px;
    height: 20px;
  }
  .dot-number {
    font-size: 0.65rem;
  }
  .wizard-bottom-nav {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }
  .wizard-nav-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }
}

/* Floating Cost Sticker Styles */
.floating-sticker {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translate(-50%, 0);
  width: calc(100% - 2rem);
  max-width: 590px;
  background-color: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #db292f;
  border-radius: 1rem;
  padding: 0.8rem 1.2rem;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 15px rgba(219, 41, 47, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  box-sizing: border-box;
}

.sticker-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.sticker-label {
  font-size: 0.75rem;
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.1rem;
}

.sticker-price-box {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.sticker-price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #ffde59;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.sticker-period {
  font-size: 0.75rem;
  color: #888888;
}

.sticker-btn {
  background-color: #db292f;
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(219, 41, 47, 0.3);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sticker-btn:hover {
  background-color: #f1353b;
  box-shadow: 0 4px 15px rgba(219, 41, 47, 0.4);
  transform: translateY(-2px);
}

.sticker-btn:active {
  transform: translateY(0);
}

/* Slide Up Transition for Sticker */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 30px);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (max-width: 480px) {
  .floating-sticker {
    bottom: 1rem;
    padding: 0.6rem 1rem;
  }
  .sticker-price {
    font-size: 1.2rem;
  }
  .sticker-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
