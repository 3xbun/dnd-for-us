<template>
  <div class="faq-container">
    <h2>คำถามที่พบบ่อย (FAQ)</h2>
    <p class="faq-desc">
      ค้นหาคำตอบสำหรับข้อสงสัยทั่วไปเกี่ยวกับการใช้งานและบริการเซิร์ฟเวอร์
    </p>

    <div class="faq-list">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="faq-item"
        :class="{ active: activeIndex === index }"
      >
        <div class="faq-question" @click="toggleFAQ(index)">
          <span class="question-text">{{ faq.question }}</span>
          <span class="faq-icon">
            <i class="fa-solid fa-chevron-down"></i>
          </span>
        </div>
        <div
          class="faq-answer-wrapper"
          :style="{ maxHeight: activeIndex === index ? '200px' : '0px' }"
        >
          <div class="faq-answer">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const activeIndex = ref(null);

const faqs = ref([
  {
    question:
      "หลังจากสมัครบริการแล้ว เซิร์ฟเวอร์ Foundry VTT จะพร้อมใช้งานเร็วแค่ไหน?",
    answer:
      "เซิร์ฟเวอร์จะถูกจัดเตรียมและเปิดใช้งานโดยอัตโนมัติทันทีหลังชำระเงิน โดยปกติแล้วจะใช้เวลาไม่เกิน 5 นาที เพื่อให้คุณสามารถเข้า Foundry VTT ได้ทันที",
  },
  {
    question:
      "ฉันจำเป็นต้องซื้อ License Foundry VTT แยกต่างหาก หรือว่ารวมอยู่ในแพ็กเกจแล้ว?",
    answer:
      "ในการใช้ Foundry VTT คุณจำเป็นต้องมี License ในการใช้งาน ซึ่งสามารถซื้อได้เองที่ foundryvtt.com โดยจะเป็นการซื้อขาดในราคา 50USD หรือสามารถเช่าจากทางเราได้ ในราคาเดือนละ 50.-",
  },
  {
    question:
      "มี World, Module และข้อมูลอยู่เดิมแล้ว สามารถใช้ข้อมูลเดิมเข้ามาได้หรือไม่?",
    answer:
      "ได้แน่นอน คุณสามารถอัปโหลด World, Module และ System เดิมที่มีอยู่ผ่านหน้าจัดการ Server ได้ด้วยตนเอง หรีือส่งไฟล์ Zip มาทางเพจให้ช่วยเหลือได้เลย",
  },
  {
    question:
      "ผู้เล่นจำเป็นต้องสมัครบัญชีหรือเสียค่าใช้จ่ายใด ๆ เพื่อเข้าร่วมเกมหรือไม่?",
    answer:
      "ไม่ต้องเลย มีเพียง DM เท่านั้นที่ต้องมีแพ็กเกจ Foundry VTT ส่วนผู้เล่นสามารถเชื่อมต่อเข้าเล่นได้ฟรีผ่านเว็บเบราว์เซอร์ทั่วไป (Chrome, Firefox, หรือ Edge) แค่ส่ง URL Server ของคุณให้คนอื่น ๆ ผู้เล่นก็เข้าสู่เกมได้ทันทีโดยไม่ต้องลงทะเบียนหรือดาวน์โหลดโปรแกรมใด ๆ",
  },
  {
    question: "เซิร์ฟเวอร์สามารถรองรับผู้เล่นพร้อมกัน ได้กี่คน?",
    answer:
      "เซิร์ฟเวอร์ระดับเริ่มต้นของเราสามารถรองรับผู้เล่นพร้อมกันได้ 10–12 คนได้อย่างสบาย ๆ พร้อมรองรับระบบระบบอัตโนมัติ (Automation) แผนที่เคลื่อนไหว (Animated Maps) และเสียงประกอบฉากโดยไม่มีปัญหาการหลุด หากมีการจัดกิจกรรมขนาดใหญ่หรือกลุ่มผู้เล่น 15 คนขึ้นไป สามารถอัปเกรดทรัพยากรเซิร์ฟเวอร์เพิ่มขึ้นได้ด้วยคลิกเดียว",
  },
  {
    question: "สเปกฮาร์ดแวร์ (CPU, RAM, Storage) ของเซิร์ฟเวอร์เป็นอย่างไร?",
    answer:
      "Foundry VTT ทุก Server ทำงานบนเครื่อง Server ประสิทธิภาพสูงที่ปรับแต่งมาเพื่อ Foundry VTT โดยเฉพาะ: CPU ใช้ vCPU บนโปรเซสเซอร์ความถี่สูงเพื่อคำนวณ แสงไดนามิก (Dynamic Lighting) และ Fog-of-War ได้รวดเร็ว, RAM ให้มา 2 GB ถึง 4 GB ต่ออินสแตนซ์ ป้องกันปัญหาหน่วยความจำเต็มเมื่อโหลดมอดูลหนักๆ และใช้ดิสก์ SSD ความเร็วสูงเพื่อการโหลดไฟล์ที่รวดเร็ว",
  },
  {
    question: "Datacenter ตั้งอยู่ที่ไหน",
    answer:
      "เรามี Datacenter ตั้งอยู่ในประเทศไทย โดยมีทั้งหมด 3 ที่ในเขตกรุงเทพฯ และปริมณฑล นี่ทำให้ค่า Latency ต่ำมากที่สุด สำหรับผู้เล่นในประเทศ และในภูมิภาค SEA ทำให้การขยับ Token และเสียงประกอบทำงานได้อย่างราบรื่น",
  },
  {
    question:
      "มีจำกัดขนาดการอัปโหลดไฟล์หรือโควตาพื้นที่เก็บข้อมูลทั้งหมด (Maps, Audio, Tokens) หรือไม่?",
    answer:
      "ขีดจำกัดพื้นที่เก็บข้อมูลจะขึ้นอยู่กับแพ็กเกจที่คุณเลือก โดยเริ่มต้นที่ 5Gb ไปจนถึง 30Gb แต่สำหรับการอัปโหลดไฟล์แต่ละไฟล์ผ่าน File Picker จะไม่จำกัดขนาด ตราบใดที่ไม่เกินโควตารวมของแพ็กเกจ คุณจึงสามารถอัปโหลดแบทเทิลแมปความละเอียดสูง ไฟล์วิดีโอ 4K หรือไฟล์เสียงยาว ๆ ได้อย่างสะดวก",
  },
  {
    question: "จะติดตั้ง Modules, Game Systems หรือ Add-on ต่าง ๆ ได้อย่างไร?",
    answer:
      "คุณสามารถ Game Systems (เช่น D&D 5e, Pathfinder 2e หรือ Call of Cthulhu) และ Modules ต่าง ๆ ได้โดยตรงผ่านเมนู Setup ของ Foundry VTT สำหรับ Premium Module เพียงวางลิงก์ Manifest (module.json) ในแท็บ Install ก็ติดตั้งได้เช่นเดียวกัน",
  },
  {
    question:
      "สามารถสร้างหลาย Campaign หรือหลาย World ใน Server เดียวได้หรือไม่?",
    answer:
      "ได้แน่นอน Foundry VTT สามารถสร้างและเก็บ World, Campaign และ Game System ได้มากเท่าที่พื้นที่เก็บข้อมูลของคุณรองรับ แม้ว่า Foundry VTT จะอนุญาตให้มี World ที่เปิดใช้งานและเข้าเล่นได้ทีละ 1 World แต่ก็ยังสามารถสลับไปมาระหว่างแคมเปญต่าง ๆ ได้ทันทีจากหน้า Setup ของ Foundry VTT",
  },
  {
    question:
      "เซิร์ฟเวอร์เปิดออนไลน์ 24/7 เพื่อให้ผู้เล่นเข้ามาจัดการ  Character Sheet นอกเวลาเซสชันได้ไหม?",
    answer:
      "ได้ครับ เซิร์ฟเวอร์ของคุณจะทำงานต่อเนื่องตลอด 24 ชั่วโมง ผู้เล่นสามารถ Login เข้าสู่ World ที่เปิดอยู่ได้ตลอดเวลาเพื่ออัปเดต Character Sheet เขียนบันทึก หรือเช็กไอเทม แม้ว่า DM จะออฟไลน์อยู่ก็ตาม",
  },
  {
    question:
      "หากต้องการยกเลิก อัปเกรด หรือปรับเปลี่ยนสเปคเซิร์ฟเวอร์ทำอย่างไร?",
    answer:
      "คุณสามารถปรับเปลี่ยนแพ็กเกจได้ตลอดเวลาผ่านหน้าระบบสมาชิก การอัปเกรดจะมีผลทันทีพร้อมคำนวณราคาตามจริง ช่วยให้คุณเพิ่ม RAM หรือพื้นที่เก็บข้อมูลได้ทันทีโดยไม่ต้องปิดเซิร์ฟเวอร์และไม่ต้องเปลี่ยน URL การเชื่อมต่อเดิม",
  },
  {
    question: "จะเกิดอะไรขึ้นกับข้อมูลของฉันหากฉันยกเลิกการสมัครสมาชิก?",
    answer:
      "หากคุณยกเลิกบริการ Server ของคุณจะยังคงใช้งานได้จนกว่าจะสิ้นสุดรอบบิลปัจจุบัน หลังจากหมดระยะเวลาสมัครสมาชิก ข้อมูลของคุณจะเข้าสู่ระยะเวลาผ่อนผัน 7 วัน ซึ่งข้อมูลจะถูกเก็บไว้อย่างปลอดภัยและคุณสามารถดาวน์โหลดไฟล์สำรองข้อมูล ZIP ได้ตลอดเวลา หลังจากพ้น 7 วัน Server ที่ไม่ใช้งานจะถูกลบอย่างปลอดภัย",
  },
  {
    question: "มีการทดลองใช้งานฟรีหรือการรับประกันคืนเงินหรือไม่?",
    answer:
      "เรามีการรับประกันคืนเงินภายใน 3 วัน โดยไม่มีความเสี่ยง หากบริการของเราไม่ตอบโจทย์ความต้องการของกลุ่มคุณ ทั้งในด้านประสิทธิภาพ Uptime หรือความง่ายในการใช้งาน คุณสามารถติดต่อทีมซัพพอร์ตของเราภายใน 3 วันนับจากวันที่สมัครเพื่อขอรับเงินคืนเต็มจำนวนได้ทันที",
  },
]);

const toggleFAQ = (index) => {
  if (activeIndex.value === index) {
    activeIndex.value = null;
  } else {
    activeIndex.value = index;
  }
};
</script>

<style scoped>
.faq-container {
  width: 100%;
  background-color: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 1em;
  padding: 1.8em;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
  box-sizing: border-box;
}

h2 {
  color: #ffde59;
  font-size: 1.5em;
  margin: 0 0 0.3em 0;
  text-align: center;
}

.faq-desc {
  color: #b0b0b0;
  font-size: 0.9em;
  margin: 0 0 1.5em 0;
  text-align: center;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  width: 100%;
}

.faq-item {
  background-color: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 0.5em;
  overflow: hidden;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.faq-item:hover {
  border-color: #444444;
}

.faq-item.active {
  border-color: #db292f;
  box-shadow: 0 0 8px rgba(219, 41, 47, 0.1);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 1.2em;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  color: #ffffff;
  transition: color 0.2s;
}

.faq-item:hover .faq-question {
  color: #ffde59;
}

.faq-item.active .faq-question {
  color: #ffde59;
}

.faq-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888888;
  transition:
    transform 0.3s ease,
    color 0.3s ease;
  font-size: 0.9em;
}

.faq-item.active .faq-icon {
  transform: rotate(180deg);
  color: #db292f;
}

.faq-answer-wrapper {
  transition: max-height 0.3s ease-out;
  overflow: hidden;
}

.faq-answer {
  padding: 0 1.2em 1.2em 1.2em;
  color: #cccccc;
  font-size: 0.9em;
  line-height: 1.6;
  border-top: 1px solid transparent;
}

.faq-item.active .faq-answer {
  border-top: 1px solid #2a2a2a;
  padding-top: 0.8em;
}
</style>
