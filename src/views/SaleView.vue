<template>
  <div>
    <h2>Sales Flow</h2>
    <hr />

    <div class="step-navigation">
      <button @click="prevStep" :disabled="isPrevDisabled" class="nav-btn">
        <i class="fa-duotone fa-solid fa-arrow-left"></i>
      </button>
      <h3>ขั้นตอนที่ {{ currentStep }}: {{ stepTitles[currentStep - 1] }}</h3>
      <button @click="nextStep" :disabled="isNextDisabled" class="nav-btn">
        <i class="fa-duotone fa-solid fa-arrow-right"></i>
      </button>
    </div>

    <div class="content">
      <div class="step-wrapper">
        <div v-show="currentStep === 1" class="step-container">
          <div class="options">
            <p
              class="btn"
              @click="customer = 50"
              :class="{ active: customer == 50 }"
            >
              ผู้ใช้ใหม่
            </p>
            <p
              class="btn"
              @click="customer = 0"
              :class="{ active: customer == 0 }"
            >
              ผู้ใช้เก่า
            </p>
          </div>

          <!-- OLD Customer -->
          <div class="servers" v-show="customer == 0">
            <table>
              <tbody>
                <tr v-for="server in Servers" :key="server.id">
                  <td>
                    <a
                      :href="
                        'https://dnd-for.us/server/' + server.fields.DockerID
                      "
                      target="_blank"
                      >{{ server.fields.ServerID }}</a
                    >
                  </td>
                  <td>{{ server.fields.Products.fields.Title }}</td>
                  <td>
                    {{
                      dayjs(server.fields.NextCollect).add(1, "day").fromNow()
                    }}
                  </td>
                  <td class="btn" @click="subscribe(server)">ต่ออายุ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-show="currentStep === 2" class="step-container">
          <p>
            เมื่อลูกค้าทักมา (DM/Line/Inbox) อย่าเพิ่งขายทันที
            ให้ถามคำถามเหล่านี้ก่อน:
          </p>
          <ul>
            <li>ปกติเล่นกันกี่คน</li>
            <li>
              ใช้ Module เยอะไหม หรือเน้นใช้ภาพความละเอียดสูง (4K) หรือเปล่า
            </li>
            <li>เคยใช้ Foundry มาก่อนไหม</li>
          </ul>
        </div>

        <!-- STEP 2 -->
        <div v-show="currentStep === 3" class="step-container">
          <div class="images">
            <img
              v-for="t in tiers"
              :key="t.id"
              @click="selectTier(t)"
              :src="t.img"
              :alt="'tier' + t.id"
              :class="{ active: tier === t.id }"
            />
          </div>
          <br />
          <strong>Custom Price (กำหนดราคาเอง) </strong>
          <input type="number" v-model="customPrice" />
        </div>

        <!-- STEP 3 -->
        <div v-show="currentStep === 4" class="step-container payment">
          <p>
            จำนวนเงินที่ต้องชำระ:
            {{ totalPrice }}
            บาท
            <span v-if="discountPercent > 0" class="discount-badge">
              (ส่วนลด {{ discountPercent }}% สำหรับรอบบิลที่
              {{ (server?.fields?.MonthActive || 0) + 1 }})
            </span>
          </p>
          <img src="/imgs/qr-code.png" class="background" />
        </div>

        <!-- STEP 4 -->
        <div v-show="currentStep === 5" class="step-container">
          <p class="toCopy">
            ขณะนี้ทางเราเตรียมระบบ Foundry VTT Server
            ให้พร้อมใช้งานเรียบร้อยแล้ว 🎉
          </p>
          <p class="toCopy">
            เพื่อให้การตั้งค่าเสร็จสมบูรณ์ รบกวนลูกค้าช่วยตั้ง "ชื่อ"
            สำหรับเซิร์ฟเวอร์ (ภาษาอังกฤษ) เพื่อใช้เป็นลิงก์สำหรับเข้าเล่นครับ
          </p>
          <p class="toCopy">
            ตัวอย่าง: หากตั้งชื่อว่า `awesomedm` ลิงก์ของลูกค้าจะเป็น
            `awesomedm.dnd-for.us`
          </p>
          <p class="toCopy">
            เมื่อได้รับข้อมูลเรียบร้อย
            จะรีบดำเนินการในขั้นตอนสุดท้ายและแจ้งยืนยันการเข้าใช้งานทันที 🏹✨
          </p>
          <p class="toCopy">ขอบคุณที่ใช้บริการ D&D: For Us 🐉</p>
          <p @click="copyText" class="btn">
            คัดลอก<i class="fa-duotone fa-solid fa-copy"></i>
          </p>
        </div>

        <!-- STEP 5 -->
        <div v-show="currentStep === 6" class="step-container">
          <div v-if="customer > 0">
            <p>
              <input
                type="text"
                placeholder="URL Server"
                v-model="serverURL"
              />.dnd-for.us
            </p>
            <p class="toCopy">Server Foundry VTT ของคุณพร้อมใช้งานแล้ว</p>
            <p class="toCopy">เปิดใช้งานได้แล้วที่:</p>
            <p class="toCopy">🔗 URL: {{ serverURL }}.dnd-for.us</p>
            <p class="toCopy">
              🔑 รหัสผ่าน Admin: สามารถตั้งได้เองเมื่อเข้าใช้งานครั้งแรก
              อย่าลืมตั้งรหัสผ่านเพื่อความปลอดภัย
            </p>
            <p class="toCopy">
              💻 คุณสามารถสมัครสมาชิกที่เว็บ https://dnd-for.us
              เพื่อควบคุมเซิร์ฟเวอร์ (เปิด/ปิด/รีสตาร์ท) ผ่าน Dashboard
              ได้ด้วยตัวเอง และดูระบบสมาชิกได้ที่ https://member.dnd-for.us
            </p>
            <p class="toCopy">
              ขอบคุณที่ใช้บริการเช่า Server กับเรา ขอให้เป็น Campaign
              ที่ยอดเยี่ยม!
            </p>
            <p class="toCopy">
              สิทธิ์ใช้งานจะสิ้นสุดวันที่
              {{ dayjs().add(1, "month").format("DD/MM/YYYY") }}
              เมื่อใกล้ถึงเวลาจะมีข้อความส่งไปเตือนอีกทีครับ
              มีคำถามเพิ่มเติมแจ้งได้เลยนะครับ 😊
            </p>
            <p @click="copyText" class="btn">
              คัดลอก<i class="fa-duotone fa-solid fa-copy"></i>
            </p>
          </div>
          <div v-else>
            <p class="toCopy">ได้รับยอดเงินเรียบร้อยครับ</p>
            <p class="toCopy">ขอบคุณที่ต่ออายุบริการ D&D: For Us ครับ 🐉</p>
            <p class="toCopy">
              อย่าลืมตรวจสอบสิทธิพิเศษของคุณที่ member.dnd-for.us/{{
                server.fields.ServerID
              }}
            </p>
            <p class="toCopy">
              สิทธิ์ใช้งานรอบใหม่จะสิ้นสุดวันที่
              {{ dayjs().add(1, "month").format("DD/MM/YYYY") }}
              ขอบคุณที่สนับสนุนเราเสมอมา มีคำถามเพิ่มเติมแจ้งได้เลยนะครับ 😊
            </p>
            <p @click="copyText" class="btn">
              คัดลอก<i class="fa-duotone fa-solid fa-copy"></i>
            </p>
            <p
              @click="extendSubscribe(server.id, server.fields.NextCollect)"
              class="btn"
            >
              ต่ออายุ <i class="fa-duotone fa-solid fa-calendar-plus"></i>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watchEffect, ref, computed, onMounted, onBeforeMount } from "vue";
import mergeImages from "merge-images";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";

dayjs.extend(relativeTime);
dayjs.locale("th");

import axios from "axios";

const Servers = ref([]);
const server = ref({
  id: "",
  fields: {
    ServerID: "",
    DockerID: "",
    IsActive: false,
    NextCollect: "",
    FirstMonth: "",
  },
});

const currentStep = ref(1);
const stepTitles = ref([
  "ประเภทลูกค้า",
  "รับโจทย์",
  "เลือกแพ็กเกจ",
  "ชำระเงิน",
  "ตั้งค่า Server",
  "ส่งมอบ Server",
]);

const tiers = ref([
  { id: 4, price: 99, img: "/imgs/tier4.png", title: "Adventurer's Gear" },
  { id: 1, price: 129, img: "/imgs/tier1.png", title: "Goblins Pack" },
  { id: 2, price: 199, img: "/imgs/tier2.png", title: "Mimics Trickery" },
  { id: 3, price: 499, img: "/imgs/tier3.png", title: "Dragons Hoard" },
]);

const tier = ref(1);
const price = computed(
  () => tiers.value.find((t) => t.id === tier.value)?.price || 0,
);

const selectTier = (selectedTier) => {
  tier.value = selectedTier.id;
};

const customer = ref(50);
const serverURL = ref();
const totalPrice = ref(0);
const customPrice = ref(0);

const discountPercent = computed(() => {
  if (customer.value === 0 && server.value?.fields?.MonthActive !== undefined) {
    if (server.value.fields.MonthActive === 5) {
      return 10;
    } else if (server.value.fields.MonthActive === 11) {
      return 20;
    }
  }
  return 0;
});

const isPrevDisabled = computed(() => {
  return currentStep.value <= 1;
});

const isNextDisabled = computed(() => {
  if (currentStep.value >= 6) return true;
  if (currentStep.value === 1 && customer.value === 0) return true;
  return false;
});

const nextStep = () => {
  if (isNextDisabled.value) return;

  if (currentStep.value === 1) {
    if (customer.value === 0) {
      currentStep.value = 4;
    } else {
      currentStep.value = 2;
    }
  } else if (currentStep.value === 2) {
    currentStep.value = 3;
  } else if (currentStep.value === 3) {
    currentStep.value = 4;
  } else if (currentStep.value === 4) {
    if (customer.value === 0) {
      currentStep.value = 6;
    } else {
      currentStep.value = 5;
    }
  } else if (currentStep.value === 5) {
    currentStep.value = 6;
  }
};

const prevStep = () => {
  if (isPrevDisabled.value) return;

  if (currentStep.value === 6) {
    if (customer.value === 0) {
      currentStep.value = 4;
    } else {
      currentStep.value = 5;
    }
  } else if (currentStep.value === 5) {
    currentStep.value = 4;
  } else if (currentStep.value === 4) {
    if (customer.value === 0) {
      currentStep.value = 1;
    } else {
      currentStep.value = 3;
    }
  } else if (currentStep.value === 3) {
    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    currentStep.value = 1;
  }
};

const copyText = (event) => {
  const parent = event.currentTarget.parentElement;
  const texts = parent.querySelectorAll(".toCopy");
  const textToCopy = Array.from(texts)
    .map((el) => el.innerText)
    .join("\n");
  navigator.clipboard.writeText(textToCopy);
};

const generateQRCode = async () => {
  const payload = generatePayload("1103702535150", {
    amount: totalPrice.value,
  });
  const qrBase64 = await QRCode.toDataURL(payload, {
    margin: 2,
    width: 500,
  });

  mergeImages(
    [
      { src: "imgs/qr-code.png" },
      { src: qrBase64, x: 250, y: 250, width: 300, height: 300 },
    ],
    {
      width: 1000,
      height: 1000,
    },
  ).then((b64) => {
    const qrImg = document.querySelector("img.background");
    if (qrImg) {
      qrImg.src = b64;
    }
  });
};

const subscribe = (s) => {
  currentStep.value = 4;

  server.value = s;
  const t = s.fields.Products.fields.Title;
  tier.value = tiers.value.filter((tier) => tier.title == t)[0].id;
};

const extendSubscribe = (id, CollectDate) => {
  const NextCollect = dayjs(CollectDate).add(1, "month").format("YYYY-MM-DD");
  const payload = {
    id: id,
    fields: {
      NextCollect: NextCollect,
    },
  };

  console.log(payload);

  axios
    .patch(
      "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mpjw5xxzr2364bf/records",
      payload,
      {
        headers: {
          "xc-token": import.meta.env.VITE_NDB_API,
        },
      },
    )
    .then((res) => {
      Servers.value = res.data.records;
      console.log(res.data);
    });
};

watchEffect(() => {
  // Re-generate QR code when selections change
  if (price.value !== undefined) {
    if (customPrice.value == 0) {
      const basePrice = price.value + customer.value;
      const discountAmount = Math.round(
        basePrice * (discountPercent.value / 100),
      );
      totalPrice.value = basePrice - discountAmount;
    } else {
      totalPrice.value = customPrice.value;
    }
    generateQRCode();
  }
});

onBeforeMount(() => {
  const options = {
    method: "GET",
    headers: {
      "xc-token": import.meta.env.VITE_NDB_API,
    },
  };

  axios
    .request({
      ...options,
      url: "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mpjw5xxzr2364bf/records",
      params: {
        offset: "0",
        limit: "99",
        where: "",
        viewId: "vwtkcrrqkk0mr48o",
      },
    })
    .then((res) => {
      Servers.value = res.data.records;
    });
});
</script>

<style lang="css" scoped>
.step-container {
  margin: 1em;
  margin-left: 1em;
  background-color: #353535;
  padding: 1em;
  border-radius: 0.5em;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1em;
}

.nav-btn {
  background-color: #db292f;
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 0.5em;
  cursor: pointer;
  width: 15%;
  max-width: 64px;
}

.nav-btn:disabled {
  background-color: #535353;
  cursor: not-allowed;
}

.customersType {
  display: flex;
  justify-content: center;
  gap: 1em;
}

.images {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-around;
  gap: 0.5em;
}

.images img {
  width: 33%;
  border-radius: 0.5em;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.btn {
  background-color: #db292f;
  width: fit-content;
  padding: 0.25em 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
}

.payment {
  position: relative;
}

.background {
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
}

.qrcode {
  position: absolute;
  top: 25%;
  left: 50%;
  width: 65%;
  transform: translateX(-50%);
  border-radius: 1em;
}

img.active {
  border: solid 2px #db292f;
}

.options {
  display: flex;
  justify-content: center;
  gap: 1em;
}

.options > .btn {
  background-color: #535353;
}

.btn.active {
  background-color: #db292f;
}

.servers table {
  width: 100%;
}

.servers td {
  padding: 0.5em;
}

.servers .btn {
  text-align: center;
}

.discount-badge {
  color: #2ecc71;
  font-weight: bold;
  margin-left: 0.5em;
}
</style>
