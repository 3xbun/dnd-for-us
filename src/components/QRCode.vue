<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">&times;</button>

      <div class="payment-header">
        <h3><i class="fa-solid fa-duotone fa-qrcode"></i> สแกนเพื่อชำระเงิน</h3>
        <p class="subtitle">
          ต่ออายุเซิร์ฟเวอร์ <strong>{{ serverName }}</strong>
        </p>
      </div>

      <div class="payment-body">
        <div class="amount-box">
          <span class="amount-label">ยอดชำระเงิน:</span>
          <span class="amount-value">฿{{ calculatedAmount }}</span>
        </div>

        <div v-if="isStudent" class="student-discount-banner">
          <i class="fa-solid fa-duotone fa-graduation-cap"></i>
          ได้รับส่วนลดนักศึกษา 20% แล้ว
        </div>

        <!-- PrompPay QR Frame with generated QR -->
        <div class="qr-container">
          <div v-if="loading" class="qr-loading">
            <i class="fa-solid fa-duotone fa-spinner fa-spin"></i> กำลังสร้าง QR
            Code...
          </div>
          <img
            v-else
            :src="qrImageSrc"
            class="qr-image"
            alt="PromptPay QR Code"
          />
        </div>

        <div class="payment-instructions">
          <p>
            <i class="fa-solid fa-duotone fa-circle-info"></i>
            กรุณาสแกนคิวอาร์โค้ดนี้เพื่อชำระเงินผ่านแอปพลิเคชันธนาคาร
          </p>
          <p class="highlight-info">
            ยอดเงินตรงตามที่ระบุ: <strong>฿{{ calculatedAmount }}</strong>
          </p>
        </div>
      </div>

      <div class="payment-footer">
        <button class="btn-success" @click="closeModal">
          <i class="fa-solid fa-duotone fa-check"></i> เสร็จสิ้น
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import mergeImages from "merge-images";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  serverName: {
    type: String,
    default: "",
  },
  productTitle: {
    type: String,
    default: "",
  },
  ram: {
    type: [String, Number],
    default: 2,
  },
  storage: {
    type: [String, Number],
    default: 5,
  },
  heromancer: {
    type: Boolean,
    default: false,
  },
  hasLicense: {
    type: Boolean,
    default: false,
  },
  monthActive: {
    type: Number,
    default: 0,
  },
  isStudent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const qrImageSrc = ref("");
const loading = ref(true);

const closeModal = () => {
  emit("close");
};

const calculatedAmount = computed(() => {
  // Base package price from Product Title
  let basePrice = 89; // Fallback default

  // Extra RAM
  const ramVal = parseInt(props.ram) || 2;
  let ramExtra = 0;
  if (ramVal === 4) ramExtra = 50;
  else if (ramVal === 8) ramExtra = 150;

  // Extra Storage
  const storageVal = parseInt(props.storage) || 5;
  const storageExtra = storageVal > 5 ? (storageVal - 5) * 2 : 0;

  // License Key Borrow
  const licenseExtra = !props.hasLicense ? 50 : 0;

  // Heromancer Module Addon
  const heromancerExtra = props.heromancer ? 29 : 0;

  const totalBeforeDiscount =
    basePrice + ramExtra + storageExtra + licenseExtra + heromancerExtra;

  // Stamp discount percent mapping:
  // Month 6 (MonthActive = 5 completed) has 10% discount
  // Month 12 (MonthActive = 11 completed) has 20% discount
  let discountPercent = 0;
  if (props.monthActive === 5) {
    discountPercent = 10;
  } else if (props.monthActive === 11) {
    discountPercent = 20;
  }

  // Apply 20% discount if student
  if (props.isStudent) {
    discountPercent = 20;
  }

  const discountAmount = Math.round(
    totalBeforeDiscount * (discountPercent / 100),
  );

  return totalBeforeDiscount - discountAmount;
});

const generateQRCode = async () => {
  if (!calculatedAmount.value) return;
  loading.value = true;
  try {
    const payload = generatePayload("1103702535150", {
      amount: calculatedAmount.value,
    });
    const qrBase64 = await QRCode.toDataURL(payload, {
      margin: 2,
      width: 500,
    });

    // Merge generated QR onto the background frame (imgs/qr-code.png)
    const b64 = await mergeImages(
      [
        { src: "/imgs/qr-code.png" },
        { src: qrBase64, x: 250, y: 250, width: 300, height: 300 },
      ],
      {
        width: 1000,
        height: 1000,
      },
    );
    qrImageSrc.value = b64;
  } catch (error) {
    console.error("Failed to generate QR Code:", error);
  } finally {
    loading.value = false;
  }
};

// Re-generate QR Code when visibility or amount changes
watch(
  () => [props.visible, calculatedAmount.value],
  ([newVisible]) => {
    if (newVisible) {
      generateQRCode();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.25s ease;
}

.modal-content {
  background-color: #242424;
  border: 1px solid #333;
  border-radius: 1em;
  width: 90%;
  max-width: 450px;
  padding: 2em;
  position: relative;
  box-shadow: rgba(0, 0, 0, 0.5) 0px 10px 30px;
  animation: slideUp 0.3s ease;
  color: #fff;
}

.close-btn {
  position: absolute;
  top: 0.2em;
  right: 0.5em;
  background: none;
  border: none;
  color: #888;
  font-size: 1.8em;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.payment-header {
  text-align: center;
  margin-bottom: 1.5em;
}

.payment-header h3 {
  font-size: 1.4em;
  color: #ffde59;
  margin-bottom: 0.3em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.subtitle {
  color: #aaa;
  font-size: 0.9em;
  margin: 0;
}

.amount-box {
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 0.5em;
  padding: 0.8em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2em;
}

.student-discount-banner {
  background-color: #ffde59;
  color: #111111;
  font-size: 0.85em;
  font-weight: bold;
  text-align: center;
  padding: 0.5em;
  border-radius: 0.5em;
  margin-bottom: 1.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.amount-label {
  color: #aaa;
  font-weight: bold;
}

.amount-value {
  color: #ffde59;
  font-size: 1.6em;
  font-weight: bold;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.8em;
  margin-bottom: 1.2em;
  min-height: 250px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.qr-image {
  width: 100%;
  height: auto;
  display: block;
}

.qr-loading {
  color: #333;
  font-weight: bold;
  font-size: 1.1em;
}

.payment-instructions {
  font-size: 0.85em;
  color: #ccc;
  line-height: 1.5;
  background-color: #1a1a1a;
  border-left: 3px solid #ffde59;
  padding: 0.6em 1em;
  border-radius: 0 0.5em 0.5em 0;
  text-align: left;
  margin-bottom: 1.5em;
}

.payment-instructions p {
  margin: 0 0 0.4em 0;
}

.payment-instructions p:last-child {
  margin-bottom: 0;
}

.highlight-info {
  color: #ffde59;
}

.payment-footer {
  text-align: center;
}

.btn-success {
  background-color: #2ecc71;
  color: #111;
  border: none;
  font-size: 1.1em;
  font-weight: bold;
  padding: 0.6em 2.5em;
  border-radius: 0.5em;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  width: 100%;
  justify-content: center;
}

.btn-success:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
}

.btn-success:active {
  transform: translateY(0);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
