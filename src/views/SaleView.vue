<template>
  <div class="pos-container">
    <div class="pos-header">
      <BackButton />
      <h2>D&D For Us - POS Terminal</h2>
      <p class="subtitle">ระบบคำนวณราคาและออกบิลพร้อมเพย์อัจฉริยะ</p>
    </div>

    <div class="pos-grid">
      <!-- LEFT PANEL: Config Options -->
      <div class="pos-card config-panel">
        <h3 class="panel-title">
          <i class="fa-solid fa-sliders"></i> ตัวเลือกเซิร์ฟเวอร์
        </h3>

        <!-- 1. Customer Type Segmented Switch -->
        <div class="form-group">
          <label>ประเภทลูกค้า</label>
          <div class="segmented-control">
            <button
              type="button"
              class="segment-btn"
              :class="{ active: customerType === 'new' }"
              @click="setCustomerType('new')"
            >
              ผู้ใช้ใหม่
            </button>
            <button
              type="button"
              class="segment-btn"
              :class="{ active: customerType === 'existing' }"
              @click="setCustomerType('existing')"
            >
              ผู้ใช้เก่า
            </button>
          </div>
        </div>

        <!-- 2. Server Selector (For Existing Customer) -->
        <div v-show="customerType === 'existing'" class="form-group slide-down">
          <label>ค้นหาเซิร์ฟเวอร์เพื่อต่ออายุ</label>
          <div class="select-wrapper">
            <select v-model="selectedServerId" class="styled-select">
              <option value="">-- เลือกเซิร์ฟเวอร์ --</option>
              <option v-for="srv in Servers" :key="srv.id" :value="srv.id">
                {{ srv.fields.ServerID }}
              </option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
          <!-- Selected Server Info Block -->
          <div v-if="server" class="server-info-box">
            <p>
              <strong>รอบบิลที่:</strong>
              {{ (server.fields.MonthActive || 0) + 1 }}
            </p>
            <p>
              <strong>กำหนดชำระ:</strong>
              {{
                dayjs(server.fields.NextCollect)
                  .add(1, "day")
                  .format("DD/MM/YYYY")
              }}
            </p>
            <p v-if="serverDiscountPercent > 0" class="discount-alert">
              🎉 สิทธิ์ส่วนลดอัตโนมัติบิลนี้: {{ serverDiscountPercent }}%
              (บันทึกในระบบแล้ว)
            </p>
          </div>
        </div>

        <!-- 3. RAM Memory Options -->
        <div class="form-group">
          <label>สเปค RAM (หน่วยความจำ)</label>
          <div class="grid-buttons">
            <button
              v-for="mem in memoryOptions"
              :key="mem.size"
              type="button"
              class="option-btn"
              :class="{ active: selectedMemory === mem.size }"
              @click="selectedMemory = mem.size"
            >
              <strong>{{ mem.label }}</strong>
              <span class="extra-cost" v-if="mem.extraPrice > 0"
                >+ ฿{{ mem.extraPrice }}</span
              >
              <span class="extra-cost" v-else>เริ่มต้น</span>
            </button>
          </div>
        </div>

        <!-- 4. SSD Storage Option -->
        <div class="form-group">
          <label
            >ขนาด SSD Storage:
            <strong class="highlight">{{ selectedStorage }} GB</strong></label
          >
          <div class="storage-stepper">
            <button
              @click="decrementStorage"
              :disabled="selectedStorage <= minStorage"
              class="stepper-btn"
            >
              - 5 GB
            </button>
            <div class="storage-slider-container">
              <input
                type="range"
                :min="minStorage"
                :max="maxStorage"
                step="5"
                v-model.number="selectedStorage"
                class="storage-slider"
              />
            </div>
            <button
              @click="incrementStorage"
              :disabled="selectedStorage >= maxStorage"
              class="stepper-btn"
            >
              + 5 GB
            </button>
          </div>
          <p class="storage-hint" v-if="selectedStorage > minStorage">
            SSD เพิ่มเติม +{{ selectedStorage - minStorage }} GB (+ ฿{{
              currentStorageExtra
            }})
          </p>
        </div>

        <!-- 5. Foundry Key License Option -->
        <div class="form-group">
          <label>ลิขสิทธิ์ Foundry VTT</label>
          <div class="segmented-control">
            <button
              type="button"
              class="segment-btn"
              :class="{ active: licenseOption === 'own' }"
              @click="licenseOption = 'own'"
            >
              ใช้คีย์ของลูกค้า (+฿0)
            </button>
            <button
              type="button"
              class="segment-btn"
              :class="{ active: licenseOption === 'borrow' }"
              @click="licenseOption = 'borrow'"
            >
              ขอยืมคีย์เรา (+฿50)
            </button>
          </div>
        </div>

        <!-- 6. Premium Addons -->
        <div class="form-group">
          <label>ส่วนเสริมพรีเมียม (Add-ons)</label>
          <div
            class="checkbox-card"
            :class="{ active: plutoniumAddon }"
            @click="plutoniumAddon = !plutoniumAddon"
          >
            <div class="checkbox-box">
              <span v-if="plutoniumAddon">✔</span>
            </div>
            <div class="checkbox-label">
              <strong>Plutonium: Heromancer</strong>
              <span class="addon-cost">+ ฿29 / เดือน</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Checkout and QR Code -->
      <div class="pos-card checkout-panel">
        <h3 class="panel-title">
          <i class="fa-solid fa-receipt"></i> สรุปและชำระเงิน
        </h3>

        <!-- Interactive Cost Display -->
        <div class="total-display">
          <span class="total-label">ยอดที่ต้องชำระ</span>
          <h1 class="grand-total">฿{{ totalPrice }}</h1>
          <span
            class="discount-badge"
            v-if="appliedDiscountAmount > 0 && !customPriceActive"
          >
            (หักส่วนลดรวม ฿{{ appliedDiscountAmount }} เรียบร้อยแล้ว)
          </span>
          <span class="custom-badge" v-if="customPriceActive">
            (กำหนดราคาแบบแมนวล)
          </span>
        </div>

        <!-- Custom Discount Segment -->
        <div class="form-group discount-section">
          <label>ส่วนลดเพิ่มเติม (Discount Tool)</label>
          <div class="discount-input-row">
            <div class="disc-type-segmented">
              <button
                type="button"
                class="disc-type-btn"
                :class="{ active: manualDiscountType === 'percent' }"
                @click="manualDiscountType = 'percent'"
              >
                %
              </button>
              <button
                type="button"
                class="disc-type-btn"
                :class="{ active: manualDiscountType === 'amount' }"
                @click="manualDiscountType = 'amount'"
              >
                ฿
              </button>
            </div>
            <input
              type="number"
              v-model.number="manualDiscountValue"
              class="discount-value-input"
              min="0"
              placeholder="0"
              @focus="$event.target.select()"
            />
          </div>
          <!-- Quick Discount Buttons -->
          <div class="quick-discount-presets">
            <button
              type="button"
              @click="applyPresetDiscount('percent', 5)"
              class="preset-btn"
            >
              5%
            </button>
            <button
              type="button"
              @click="applyPresetDiscount('percent', 10)"
              class="preset-btn"
            >
              10%
            </button>
            <button
              type="button"
              @click="applyPresetDiscount('percent', 20)"
              class="preset-btn"
            >
              20%
            </button>
            <button
              type="button"
              @click="applyPresetDiscount('amount', 50)"
              class="preset-btn"
            >
              50฿
            </button>
            <button
              type="button"
              @click="applyPresetDiscount('amount', 100)"
              class="preset-btn"
            >
              100฿
            </button>
            <button
              type="button"
              @click="applyPresetDiscount('amount', 0)"
              class="preset-btn clear-disc"
            >
              ล้าง
            </button>
          </div>
        </div>

        <!-- Custom Price Toggle & Numpad Interface -->
        <div class="custom-price-section">
          <button
            type="button"
            class="toggle-custom-btn"
            :class="{ active: customPriceActive }"
            @click="toggleCustomPrice"
          >
            <i class="fa-solid fa-calculator"></i> กำหนดราคาเองแบบแมนวล (Custom
            Override)
          </button>

          <!-- Numpad Block -->
          <div v-show="customPriceActive" class="numpad-container slide-down">
            <div class="numpad-display">
              <span class="currency">฿</span>
              <input
                type="number"
                v-model.number="customPriceAmount"
                class="numpad-input"
                @focus="$event.target.select()"
              />
            </div>
            <div class="numpad-grid">
              <button
                v-for="n in [7, 8, 9, 4, 5, 6, 1, 2, 3]"
                :key="n"
                @click="handleNumClick(n)"
                class="num-key"
              >
                {{ n }}
              </button>
              <button @click="handleClear" class="num-key clear-key">C</button>
              <button @click="handleNumClick(0)" class="num-key">0</button>
              <button @click="handleBackspace" class="num-key backspace-key">
                ⌫
              </button>
            </div>
            <div class="quick-cash-row">
              <button @click="handleQuickAdd(50)" class="quick-key">+50</button>
              <button @click="handleQuickAdd(100)" class="quick-key">
                +100
              </button>
              <button @click="handleQuickAdd(500)" class="quick-key">
                +500
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic QR Code Container -->
        <div class="qr-container">
          <img
            src="/imgs/qr-code.png"
            class="background qr-image"
            alt="PromptPay QR Code"
          />
          <div class="qr-loading-overlay" v-if="isQRGenerating">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </div>
        </div>

        <!-- Breakdown Details -->
        <div class="breakdown-details" v-if="!customPriceActive">
          <div class="breakdown-row">
            <span>เซิร์ฟเวอร์เริ่มต้น</span>
            <span>฿89</span>
          </div>
          <div class="breakdown-row" v-if="currentMemoryExtra > 0">
            <span>RAM เพิ่มเติม</span>
            <span>+฿{{ currentMemoryExtra }}</span>
          </div>
          <div class="breakdown-row" v-if="currentStorageExtra > 0">
            <span>SSD พื้นที่จัดเก็บ</span>
            <span>+฿{{ currentStorageExtra }}</span>
          </div>
          <div class="breakdown-row" v-if="licenseOption === 'borrow'">
            <span>ค่าธรรมเนียมยืมสิทธิ์</span>
            <span>+฿50</span>
          </div>
          <div class="breakdown-row" v-if="plutoniumAddon">
            <span>Heromancer Module</span>
            <span>+฿29</span>
          </div>
          <div class="breakdown-row discount" v-if="appliedDiscountAmount > 0">
            <span>ส่วนลดรวมที่หักออก</span>
            <span>-฿{{ appliedDiscountAmount }}</span>
          </div>
        </div>

        <!-- POS Action Buttons -->
        <div class="checkout-actions">
          <button @click="copyPriceAmount" class="action-btn">
            <i class="fa-solid fa-copy"></i> คัดลอกราคา ({{ totalPrice }})
          </button>

          <button
            v-if="customerType === 'existing' && server"
            @click="triggerRenewal"
            class="action-btn renew-btn"
          >
            <i class="fa-solid fa-calendar-check"></i> บันทึกต่ออายุเซิร์ฟเวอร์
          </button>
        </div>
      </div>
    </div>

    <!-- QUICK CHAT TEMPLATES ACCORDION -->
    <div class="pos-card templates-panel">
      <h3 class="panel-title" @click="toggleTemplates">
        <i class="fa-solid fa-comments"></i> คลังข้อความแชทส่งให้ลูกค้า (Quick
        Chat Templates)
        <span class="accordion-arrow">{{ templatesOpen ? "▲" : "▼" }}</span>
      </h3>

      <div v-show="templatesOpen" class="templates-container">
        <!-- Quick Template Prefill Config -->
        <div class="template-prefills">
          <div class="prefill-group">
            <label>ชื่อเซิร์ฟเวอร์สำหรับ prefill:</label>
            <input
              type="text"
              v-model="templatePrefill.serverName"
              placeholder="เช่น epic-campaign"
            />
          </div>
          <div class="prefill-group">
            <label>วันหมดอายุ:</label>
            <input type="text" v-model="templatePrefill.expiryDate" />
          </div>
        </div>

        <!-- Template 1: Introduce self-service ServerCreator -->
        <div class="template-card">
          <div class="template-header">
            <strong
              >1. แนะนำระบบสร้างเซิร์ฟเวอร์ด้วยตนเอง (ServerCreator)</strong
            >
            <button @click="copyTemplateText($refs.t1)" class="copy-tmpl-btn">
              คัดลอก
            </button>
          </div>
          <pre class="template-text" ref="t1">
สวัสดีครับ! ขณะนี้ทาง D&D: For Us มีระบบสร้างและเปิดเซิร์ฟเวอร์แบบอัตโนมัติด้วยตนเองเรียบร้อยแล้วครับ 🎉

ลูกค้าสามารถคลิกเข้าไปเลือกสเปค ตั้งชื่อลิงก์ห้อง และชำระเงินเพื่อเปิดใช้งานเซิร์ฟเวอร์ได้ทันทีโดยไม่ต้องรอทีมงานดำเนินการให้ครับ!

🔗 สั่งซื้อและเปิดเซิร์ฟเวอร์ได้ที่: https://dnd-for.us/create
(หรือกดเลือกเมนู "สร้างเซิร์ฟเวอร์ใหม่" บนหน้าเว็บไซต์)

ขั้นตอนง่ายๆ:
1. เลือกความจำ (RAM) และพื้นที่เก็บข้อมูล (Storage) ตามความต้องการ
2. เลือกว่าจะใช้ License Key ของตนเอง หรือเช่าของ D&D: For Us
3. ระบุชื่อเซิฟเวอร์ เช่น `{{
              templatePrefill.serverName || "my-campaign"
            }}` เพื่อนำไปสร้างลิงก์เข้าเล่น
4. สแกน QR Code ชำระค่าบริการผ่านระบบ PromptPay
5. ระบบจะติดตั้งและเตรียมเซิร์ฟเวอร์ให้พร้อมเล่นโดยอัตโนมัติทันทีภายใน 1-3 นาทีครับ! 🏹✨

หากติดขัดขั้นตอนใดในระหว่างดำเนินการ สามารถแชทแจ้งแอดมินเข้ามาได้ตลอดเวลาเลยนะครับ 😊</pre
          >
        </div>

        <!-- Template 2: Post-creation setup guidelines -->
        <div class="template-card">
          <div class="template-header">
            <strong
              >2.
              ขั้นตอนและลิงก์ตั้งค่าหลังการติดตั้งเซิร์ฟเวอร์เสร็จสิ้น</strong
            >
            <button @click="copyTemplateText($refs.t2)" class="copy-tmpl-btn">
              คัดลอก
            </button>
          </div>
          <pre class="template-text" ref="t2">
ยินดีต้อนรับสู่ D&D: For Us ครับ! 🎉 ระบบได้ทำการติดตั้งและตั้งค่าเซิร์ฟเวอร์ของคุณเสร็จสมบูรณ์เรียบร้อยแล้วครับ

คุณสามารถเข้าไปจัดการและเริ่มใช้งานเซิร์ฟเวอร์ได้ผ่านลิงก์ต่อไปนี้เลยครับ:

1. 🎮 ลิงก์เข้าเล่นห้อง Foundry VTT:
   🔗 URL: https://{{ templatePrefill.serverName || "your-server" }}.dnd-for.us
   *ในการเข้าเล่นครั้งแรก ระบบจะให้คุณตั้งรหัสผ่านผู้ดูแลระบบ (Admin Password) ทันที กรุณาตั้งค่าเพื่อความปลอดภัยด้วยนะครับ*

2. 💻 แผงควบคุมเซิร์ฟเวอร์ (Console / Restart / Files):
   🔗 ลิงก์ควบคุม: https://dnd-for.us/server/{{
              templatePrefill.ID || "your-server"
            }}
   *ใช้สำหรับการ สั่งรีสตาร์ทเซิร์ฟเวอร์ เคลียร์ไฟล์ หรือดึงข้อมูลโมดูลต่างๆ ผ่านทางเว็บบอร์ดโดยตรง*

3. 💳 ระบบสมาชิกและการชำระเงินต่ออายุ:
   🔗 ลิงก์ตรวจสอบ: https://member.dnd-for.us/server/{{
              templatePrefill.serverName || "your-server"
            }}
   *ใช้สำหรับดูสถานะเซิร์ฟเวอร์ ตรวจสอบวันหมดอายุรอบบิล และชำระเงินผ่าน QR Code PromptPay เพื่อต่ออายุในรอบบิลถัดไป*

ขอให้มีความสุขกับแคมเปญใหม่นะครับ! มีคำถามเพิ่มเติมสอบถามแอดมินได้เสมอครับ 🐉✨</pre
          >
        </div>

        <!-- Template 3: Guide on self-service renewal -->
        <div class="template-card">
          <div class="template-header">
            <strong>3. แนะนำขั้นตอนการต่ออายุเซิร์ฟเวอร์ด้วยตนเอง</strong>
            <button @click="copyTemplateText($refs.t3)" class="copy-tmpl-btn">
              คัดลอก
            </button>
          </div>
          <pre class="template-text" ref="t3">
สวัสดีครับ! ขณะนี้คุณสามารถดำเนินการชำระค่าบริการและต่ออายุเซิร์ฟเวอร์ด้วยตนเองได้อย่างรวดเร็วตลอด 24 ชั่วโมงผ่านระบบสมาชิกเลยครับ 💳

ขั้นตอนการต่ออายุด้วยตนเอง:
1. เข้าไปที่หน้าเว็บบอร์ดสมาชิกของคุณ:
   🔗 URL: https://member.dnd-for.us/server/{{
              templatePrefill.serverName || "your-server"
            }}
2. ตรวจสอบสเปคและราคาทั้งหมด จากนั้นกดปุ่ม **"ชำระค่าบริการ / ต่ออายุเซิร์ฟเวอร์"**
3. (ถ้ามี) กรอกรหัสโปรโมชันของคุณในกล่อง "โค้ดส่วนลด" และกดใช้โค้ดเพื่อรับส่วนลดเพิ่มเติม!
4. ระบบจะเปิดหน้าต่างสแกน QR Code PromptPay ขึ้นมาโดยอัตโนมัติ
5. สแกนจ่ายเงินตามยอดที่ระบุ ระบบจะปรับสถานะและขยายสิทธิ์วันหมดอายุรอบบิลใหม่ให้คุณทันทีภายใน 1 นาทีครับ 🎉

สิทธิ์การใช้งานของคุณในรอบบิลใหม่นี้จะสิ้นสุดในวันที่ {{
              templatePrefill.expiryDate || "วันหมดอายุรอบถัดไป"
            }} ครับ

ขอบคุณที่ต่ออายุและใช้บริการอย่างต่อเนื่องกับทางเรานะครับ ขอให้แคมเปญราบรื่นและสนุกสุดมันส์ครับ! 😊🐉
</pre
          >
        </div>

        <!-- Template 4: Quick troubleshooting instructions -->
        <div class="template-card">
          <div class="template-header">
            <strong
              >4. แนะนำวิธีแก้ไขปัญหาเบื้องต้น (เซิร์ฟเวอร์ค้าง /
              เข้าห้องไม่ได้)</strong
            >
            <button @click="copyTemplateText($refs.t4)" class="copy-tmpl-btn">
              คัดลอก
            </button>
          </div>
          <pre class="template-text" ref="t4">
สวัสดีครับ หากคุณกำลังพบปัญหาเซิร์ฟเวอร์ค้าง โหลดไม่ขึ้น หรือเข้าเล่น Foundry VTT ไม่ได้ คุณสามารถสั่งรีสตาร์ทตัวคอนเทนเนอร์ด้วยตนเองเพื่อแก้ไขปัญหาเบื้องต้นได้ทันทีครับ:

1. เข้าไปที่ระบบจัดการเซิร์ฟเวอร์ของคุณ:
   🔗 URL: https://dnd-for.us/server/{{
              templatePrefill.serverName || "your-server"
            }}
2. ลงชื่อเข้าใช้งานด้วยบัญชีของคุณ
3. มองหาตัวเลือกและกดปุ่ม **"Restart Server"** (ระบบจะทำความสะอาด Cache และเริ่มต้นรัน Foundry Container ใหม่ใน 10-15 วินาทีครับ)
4. เมื่อรีสตาร์ทเสร็จสิ้น ให้ลองรีเฟรชหน้าห้องเล่น Foundry VTT อีกครั้งเพื่อเข้าใช้งานตามปกติ

หากทำตามขั้นตอนรีสตาร์ทดังกล่าวแล้วหน้าเว็บยังใช้งานไม่ได้ หรือพบปัญหาอื่นๆ รบกวนแชทแจ้งแอดมินเพื่อรีบเข้าไปตรวจสอบระบบหลังบ้านให้ทันทีเลยนะครับ! 🛠️✨</pre
          >
        </div>

        <!-- Template 5: Welcoming back returning or successfully renewed customers -->
        <div class="template-card">
          <div class="template-header">
            <strong
              >5. ขอบคุณและต้อนรับลูกค้าเก่า / ลูกค้าต่ออายุสำเร็จ (Welcome Back
              & Renewal Success)</strong
            >
            <button @click="copyTemplateText($refs.t5)" class="copy-tmpl-btn">
              คัดลอก
            </button>
          </div>
          <pre class="template-text" ref="t5">
ทางเราได้รับยอดชำระเงินและขยายเวลาการใช้งานเซิร์ฟเวอร์ของคุณเรียบร้อยแล้วครับ 🎉

🎮 ลิงก์เข้าเล่นห้อง Foundry VTT:
🔗 URL: https://{{ templatePrefill.serverName || "your-server" }}.dnd-for.us

💳 เช็กประวัติและวันหมดอายุสมาชิกได้ที่:
🔗 URL: https://member.dnd-for.us/server/{{
              templatePrefill.serverName || "your-server"
            }}

📅 สิทธิ์การใช้งานรอบบิลใหม่ได้รับการขยายถึงวันที่:
{{ templatePrefill.expiryDate || "วันหมดอายุรอบถัดไป" }} ครับ

ขอบคุณมาก ๆ นะครับที่ไว้วางใจให้ D&D: For Us ช่วยดูแลเซิร์ฟเวอร์ FoundryVTT ของคุณอย่างต่อเนื่องเสมอมา 🛡️

หากติดปัญหาระหว่างทำแคมเปญใหม่ หรือต้องการเพิ่มสเปค RAM/Storage สามารถส่งข้อความมาหาแอดมินได้ตลอดเวลาเลยนะครับ ขอให้สนุกกับเนื้อเรื่องแคมเปญรอบใหม่ครับ! 😊✨</pre
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, computed, onBeforeMount } from "vue";
import mergeImages from "merge-images";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import axios from "axios";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/th";

dayjs.extend(relativeTime);
dayjs.locale("th");

import BackButton from "../components/BackButton.vue";

// Base price configurations matching ServerCreator.vue
const basePrice = ref(89);
const borrowLicensePrice = ref(50);
const plutoniumPrice = ref(29);

const minStorage = 5;
const maxStorage = 50;
const costPerGB = 2;

// Selections
const selectedMemory = ref(2);
const selectedStorage = ref(5);
const licenseOption = ref("own");
const plutoniumAddon = ref(false);
const customerType = ref("new");

// Custom Overrides State
const customPriceActive = ref(false);
const customPriceAmount = ref(0);

// NocoDB State
const Servers = ref([]);
const selectedServerId = ref("");
const server = ref(null);

// Manual Discount State
const manualDiscountType = ref("percent"); // 'percent' or 'amount'
const manualDiscountValue = ref(0);

// Template Collapsible
const templatesOpen = ref(false);
const templatePrefill = ref({
  ID: "",
  serverName: "",
  expiryDate: dayjs().add(1, "month").format("DD/MM/YYYY"),
});

// Loading Indicators
const isQRGenerating = ref(false);

// Options List
const memoryOptions = [
  { size: 2, extraPrice: 0, label: "2 GB RAM" },
  { size: 4, extraPrice: 50, label: "4 GB RAM" },
  { size: 8, extraPrice: 150, label: "8 GB RAM" },
];

const setCustomerType = (type) => {
  customerType.value = type;
  if (type === "new") {
    selectedServerId.value = "";
    server.value = null;
    manualDiscountValue.value = 0;
  }
};

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

const toggleCustomPrice = () => {
  customPriceActive.value = !customPriceActive.value;
  if (customPriceActive.value) {
    customPriceAmount.value = totalPrice.value;
  }
};

const toggleTemplates = () => {
  templatesOpen.value = !templatesOpen.value;
};

// Preset discount handler
const applyPresetDiscount = (type, val) => {
  manualDiscountType.value = type;
  manualDiscountValue.value = val;
};

// Computed extras
const currentMemoryExtra = computed(() => {
  const opt = memoryOptions.find((o) => o.size === selectedMemory.value);
  return opt ? opt.extraPrice : 0;
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

// Server list selection watcher
watch(selectedServerId, (newId) => {
  if (newId) {
    const s = Servers.value.find((srv) => srv.id === newId);
    if (s) {
      server.value = s;
      customerType.value = "existing";
      // Map server properties directly to POS options
      selectedMemory.value = parseInt(s.fields.Ram) || 2;
      selectedStorage.value = parseInt(s.fields.Storage) || 5;
      licenseOption.value = s.fields.hasLicense ? "own" : "borrow";
      plutoniumAddon.value = !!s.fields.Heromancer;

      // Auto-prefill discount based on server active months
      if (serverDiscountPercent.value > 0) {
        manualDiscountType.value = "percent";
        manualDiscountValue.value = serverDiscountPercent.value;
      } else {
        manualDiscountValue.value = 0;
      }

      // Sync template prefill server name and renewal details
      templatePrefill.value.serverName = s.fields.ServerID;
      templatePrefill.value.ID = s.fields.DockerID;
      if (s.fields.NextCollect) {
        templatePrefill.value.expiryDate = dayjs(s.fields.NextCollect)
          .add(1, "month")
          .format("DD/MM/YYYY");
      }
    }
  } else {
    server.value = null;
    manualDiscountValue.value = 0;
  }
});

// Automated server loyalty discount percentages
const serverDiscountPercent = computed(() => {
  if (
    customerType.value === "existing" &&
    server.value?.fields?.MonthActive !== undefined
  ) {
    const months = server.value.fields.MonthActive;
    if (months === 5) {
      return 10;
    } else if (months === 11) {
      return 20;
    }
  }
  return 0;
});

// Dynamic subtotal price before discounts
const subTotalPrice = computed(() => {
  return (
    basePrice.value +
    currentMemoryExtra.value +
    currentStorageExtra.value +
    licenseExtraPrice.value +
    currentStorageExtra.value -
    currentStorageExtra.value + // placeholder math
    plutoniumExtraPrice.value
  );
});

// Computed applied discount value (Baht)
const appliedDiscountAmount = computed(() => {
  const sub = subTotalPrice.value;
  if (manualDiscountType.value === "percent") {
    const val = Math.max(0, Math.min(100, manualDiscountValue.value || 0));
    return Math.round(sub * (val / 100));
  } else {
    return Math.max(0, manualDiscountValue.value || 0);
  }
});

// Grand total price
const totalPrice = computed(() => {
  if (customPriceActive.value) {
    return customPriceAmount.value;
  }
  const sub = subTotalPrice.value;
  return Math.max(0, sub - appliedDiscountAmount.value);
});

// Numpad key handlers
const handleNumClick = (num) => {
  const currentStr = customPriceAmount.value.toString();
  if (currentStr === "0" || customPriceAmount.value === 0) {
    customPriceAmount.value = num;
  } else {
    customPriceAmount.value = parseInt(currentStr + num.toString()) || 0;
  }
};

const handleClear = () => {
  customPriceAmount.value = 0;
};

const handleBackspace = () => {
  const currentStr = customPriceAmount.value.toString();
  if (currentStr.length <= 1) {
    customPriceAmount.value = 0;
  } else {
    customPriceAmount.value = parseInt(currentStr.slice(0, -1)) || 0;
  }
};

const handleQuickAdd = (val) => {
  customPriceAmount.value = (customPriceAmount.value || 0) + val;
};

// Clipboard actions
const copyPriceAmount = () => {
  navigator.clipboard.writeText(totalPrice.value.toString()).then(() => {
    alert("คัดลอกราคา " + totalPrice.value + " บาท เรียบร้อย!");
  });
};

const copyTemplateText = (element) => {
  if (element) {
    navigator.clipboard.writeText(element.innerText).then(() => {
      alert("คัดลอกข้อความเทมเพลตเรียบร้อย!");
    });
  }
};

// QR Code Generation
const generateQRCode = async () => {
  if (totalPrice.value < 0) return;
  isQRGenerating.value = true;
  try {
    const payload = generatePayload("1103702535150", {
      amount: totalPrice.value,
    });
    const qrBase64 = await QRCode.toDataURL(payload, {
      margin: 2,
      width: 500,
    });

    await mergeImages(
      [
        { src: "/imgs/qr-code.png" },
        { src: qrBase64, x: 250, y: 250, width: 300, height: 300 },
      ],
      {
        width: 1000,
        height: 1000,
      },
    ).then((b64) => {
      const qrImg = document.querySelector("img.qr-image");
      if (qrImg) {
        qrImg.src = b64;
      }
    });
  } catch (err) {
    console.error("QR Generation failed", err);
  } finally {
    isQRGenerating.value = false;
  }
};

// Dynamic QR Update Watcher
watch(
  totalPrice,
  () => {
    generateQRCode();
  },
  { immediate: true },
);

// Server Renewal Action (Patch Request)
const triggerRenewal = () => {
  if (!server.value) return;
  const currentCollect = server.value.fields.NextCollect;
  const nextCollectFormatted = dayjs(currentCollect)
    .add(1, "month")
    .format("YYYY-MM-DD");

  const payload = {
    id: server.value.id,
    fields: {
      NextCollect: nextCollectFormatted,
    },
  };

  alert(
    `กำลังตรวจสอบการส่งคำขอต่ออายุเซิร์ฟเวอร์\nรหัสเครื่อง: ${server.value.fields.ServerID}\nวันที่เดิม: ${currentCollect}\nวันที่ใหม่: ${nextCollectFormatted}`,
  );

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
      alert("✓ ต่ออายุเซิร์ฟเวอร์เสร็จสมบูรณ์ในระบบเรียบร้อย!");
      // Reload Server records to sync status
      fetchServers();
      selectedServerId.value = "";
      server.value = null;
    })
    .catch((err) => {
      console.error("Renewal request failed", err);
      alert(
        "❌ เกิดข้อผิดพลาดในการเรียกต่ออายุระบบ กรุณาตรวจสอบ API คีย์และอินเทอร์เน็ต",
      );
    });
};

const fetchServers = () => {
  axios
    .get(
      "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mpjw5xxzr2364bf/records",
      {
        headers: {
          "xc-token": import.meta.env.VITE_NDB_API,
        },
        params: {
          offset: "0",
          limit: "99",
          where: "",
          viewId: "vwtkcrrqkk0mr48o",
        },
      },
    )
    .then((res) => {
      Servers.value = res.data.records;
    })
    .catch((err) => {
      console.error("Failed to load records on boot", err);
    });
};

onBeforeMount(() => {
  fetchServers();
});
</script>

<style scoped>
.pos-container {
  max-width: 900px;
  margin: 1.5em auto;
  padding: 0 1em 3em;
  font-family: "Noto Sans Thai", sans-serif;
  color: #f5f5f5;
}

.pos-header {
  text-align: center;
  margin-bottom: 2em;
}

.pos-header h2 {
  font-size: 1.8em;
  color: #ffde59;
  margin-top: 0.5em;
  margin-bottom: 0.2em;
}

.subtitle {
  color: #b0b0b0;
  font-size: 0.95em;
  margin: 0;
}

/* Master Layout Grid */
.pos-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 1.5em;
  margin-bottom: 2em;
}

@media (max-width: 768px) {
  .pos-grid {
    grid-template-columns: 1fr;
  }
}

.pos-card {
  background-color: #2a2a2a;
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 8px 24px;
  border: 1px solid #3a3a3a;
  height: fit-content;
}

.panel-title {
  font-size: 1.25em;
  color: #ffde59;
  border-bottom: 1px solid #3a3a3a;
  padding-bottom: 0.6em;
  margin-bottom: 1em;
  display: flex;
  align-items: center;
  gap: 0.5em;
}

/* Form Styling */
.form-group {
  margin-bottom: 1.5em;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 0.9em;
  color: #cccccc;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.highlight {
  color: #ffde59;
}

/* Segmented Control Button Toggle */
.segmented-control {
  display: flex;
  background-color: #1a1a1a;
  padding: 0.25em;
  border-radius: 0.5em;
  border: 1px solid #383838;
}

.segment-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #888888;
  padding: 0.6em 0.8em;
  border-radius: 0.4em;
  font-size: 0.88em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-btn.active {
  background-color: #db292f;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(219, 41, 47, 0.3);
}

/* Select Control */
.select-wrapper {
  position: relative;
  width: 100%;
}

.styled-select {
  width: 100%;
  background-color: #1a1a1a;
  border: 1.5px solid #3a3a3a;
  border-radius: 0.5em;
  padding: 0.7em 1em;
  color: white;
  appearance: none;
  outline: none;
  font-size: 0.9em;
  cursor: pointer;
}

.styled-select:focus {
  border-color: #db292f;
}

.select-arrow {
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.75em;
  color: #666;
  pointer-events: none;
}

.server-info-box {
  background-color: #1a1a1a;
  border: 1px dashed #db292f;
  border-radius: 0.5em;
  padding: 0.8em 1em;
  margin-top: 0.8em;
  font-size: 0.85em;
  line-height: 1.5;
  color: #cccccc;
}

.discount-alert {
  color: #2ecc71;
  font-weight: bold;
  margin-top: 0.2em;
}

/* Option Grid buttons */
.grid-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6em;
}

.option-btn {
  background-color: #1e1e1e;
  border: 1px solid #383838;
  border-radius: 0.5em;
  padding: 0.8em 0.4em;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  min-height: 60px;
}

.option-btn:hover {
  border-color: #555555;
  background-color: #252525;
}

.option-btn.active {
  background-color: #2a1b1b;
  border-color: #db292f;
  color: #ffffff;
}

.option-btn strong {
  font-size: 0.9em;
  margin-bottom: 0.2em;
}

.option-btn .extra-cost {
  font-size: 0.75em;
  color: #ffde59;
}

/* Stepper Storage Control */
.storage-stepper {
  display: flex;
  align-items: center;
  gap: 0.8em;
  background-color: #1e1e1e;
  border: 1px solid #383838;
  border-radius: 0.5em;
  padding: 0.5em 0.8em;
}

.stepper-btn {
  background-color: #353535;
  color: #ffffff;
  border: 1px solid #4a4a4a;
  border-radius: 0.3em;
  padding: 0.4em 0.8em;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  font-size: 0.85em;
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

.storage-slider-container {
  flex-grow: 1;
}

.storage-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #3a3a3a;
  outline: none;
  cursor: pointer;
}

.storage-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #db292f;
  border: 1.5px solid #ffffff;
}

.storage-hint {
  font-size: 0.78em;
  color: #888888;
  margin-top: 0.4em;
  text-align: right;
  margin-bottom: 0;
}

/* Checkbox Add-ons */
.checkbox-card {
  background-color: #1e1e1e;
  border: 1px solid #383838;
  border-radius: 0.5em;
  padding: 0.8em 1em;
  display: flex;
  align-items: center;
  gap: 0.8em;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s ease;
}

.checkbox-card:hover {
  background-color: #252525;
}

.checkbox-card.active {
  background-color: #2a1b1b;
  border-color: #db292f;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #555555;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75em;
  background-color: transparent;
  flex-shrink: 0;
}

.checkbox-card.active .checkbox-box {
  border-color: #db292f;
  background-color: #db292f;
}

.checkbox-label {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.88em;
}

.addon-cost {
  color: #ffde59;
  font-weight: bold;
}

/* RIGHT PANEL Checkout display */
.total-display {
  text-align: center;
  background-color: #1a1a1a;
  padding: 1.2em;
  border-radius: 0.8em;
  border: 1px solid #333333;
  margin-bottom: 1.2em;
}

.total-label {
  font-size: 0.8em;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.grand-total {
  font-size: 2.8em;
  color: #ffde59;
  font-weight: bold;
  line-height: 1.1;
  margin: 0.1em 0;
}

.discount-badge {
  font-size: 0.78em;
  color: #2ecc71;
  font-weight: bold;
}

.custom-badge {
  font-size: 0.78em;
  color: #e67e22;
  font-weight: bold;
}

/* Discount Section Styles */
.discount-section {
  background-color: #1f1f1f;
  border: 1px solid #3a3a3a;
  border-radius: 0.6em;
  padding: 1em;
  margin-bottom: 1.2em;
}

.discount-input-row {
  display: flex;
  gap: 0.5em;
  margin-bottom: 0.6em;
}

.disc-type-segmented {
  display: flex;
  background-color: #111;
  padding: 0.2em;
  border-radius: 0.4em;
  border: 1px solid #444;
}

.disc-type-btn {
  background: transparent;
  border: none;
  color: #888;
  padding: 0.4em 0.8em;
  font-size: 0.85em;
  font-weight: bold;
  border-radius: 0.3em;
  cursor: pointer;
  transition: all 0.15s;
}

.disc-type-btn.active {
  background-color: #3182ce;
  color: white;
}

.discount-value-input {
  flex-grow: 1;
  background-color: #111;
  border: 1px solid #444;
  color: white;
  padding: 0.4em 0.8em;
  border-radius: 0.4em;
  font-size: 1.05em;
  font-weight: bold;
  text-align: right;
  width: 100%;
}

.quick-discount-presets {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.3em;
}

.preset-btn {
  background-color: #2d2d2d;
  color: #ccc;
  border: none;
  border-radius: 0.3em;
  padding: 0.4em 0;
  font-size: 0.78em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}

.preset-btn:hover {
  background-color: #3d3d3d;
  color: white;
}

.preset-btn.clear-disc {
  background-color: #c0392b;
  color: white;
}

.preset-btn.clear-disc:hover {
  background-color: #e74c3c;
}

/* Custom Overrides section & Numpad */
.custom-price-section {
  margin-bottom: 1.2em;
}

.toggle-custom-btn {
  background-color: #353535;
  color: #ffffff;
  border: 1px solid #4a4a4a;
  border-radius: 0.5em;
  padding: 0.6em 1em;
  font-size: 0.82em;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.toggle-custom-btn.active {
  background-color: #2a1b1b;
  border-color: #e67e22;
  color: #e67e22;
}

.numpad-container {
  background-color: #1c1c1c;
  border: 1px solid #444444;
  border-radius: 0.6em;
  padding: 1em;
  margin-top: 0.6em;
}

.numpad-display {
  display: flex;
  align-items: center;
  background-color: #111111;
  border: 1.5px solid #444444;
  border-radius: 0.4em;
  padding: 0.5em;
  margin-bottom: 0.8em;
}

.numpad-display .currency {
  font-size: 1.2em;
  font-weight: bold;
  color: #e67e22;
  margin-right: 0.4em;
}

.numpad-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.4em;
  font-weight: bold;
  color: white;
  text-align: right;
  width: 100%;
  padding: 0;
}

.numpad-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4em;
  margin-bottom: 0.6em;
}

.num-key {
  background-color: #2d2d2d;
  color: white;
  border: none;
  border-radius: 0.3em;
  padding: 0.6em 0;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s ease;
}

.num-key:hover {
  background-color: #3a3a3a;
}

.clear-key {
  background-color: #c0392b;
}

.clear-key:hover {
  background-color: #e74c3c;
}

.backspace-key {
  background-color: #4a5568;
}

.backspace-key:hover {
  background-color: #718096;
}

.quick-cash-row {
  display: flex;
  gap: 0.4em;
}

.quick-key {
  flex: 1;
  background-color: #2b6cb0;
  color: white;
  border: none;
  border-radius: 0.3em;
  padding: 0.5em 0;
  font-size: 0.85em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
}

.quick-key:hover {
  background-color: #3182ce;
}

/* Live QR Code image styles */
.qr-container {
  position: relative;
  width: 100%;
  max-width: 250px;
  margin: 1.2em auto;
  aspect-ratio: 1;
  background-color: #ffffff;
  border-radius: 0.8em;
  padding: 0.8em;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
}

.qr-loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #db292f;
  font-size: 2em;
}

/* Breakdown rows styling */
.breakdown-details {
  background-color: #1a1a1a;
  border-radius: 0.6em;
  padding: 0.8em;
  margin-top: 1em;
  font-size: 0.82em;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  color: #a0a0a0;
}

.breakdown-row.discount {
  color: #2ecc71;
  font-weight: bold;
}

/* Actions */
.checkout-actions {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  margin-top: 1.2em;
}

.action-btn {
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 0.5em;
  padding: 0.8em;
  font-size: 0.9em;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  transition: all 0.2s;
  box-shadow: 0 3px 6px rgba(49, 130, 206, 0.2);
}

.action-btn:hover {
  background-color: #4299e1;
}

.renew-btn {
  background-color: #27ae60;
  box-shadow: 0 3px 6px rgba(39, 174, 96, 0.2);
}

.renew-btn:hover {
  background-color: #2ecc71;
}

/* Chat Templates Collapsible accordion */
.templates-panel {
  margin-top: 1.5em;
}

.templates-panel .panel-title {
  cursor: pointer;
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-arrow {
  font-size: 0.8em;
  color: #888;
}

.templates-container {
  margin-top: 1.5em;
  border-top: 1px solid #3a3a3a;
  padding-top: 1.2em;
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  text-align: left;
}

.template-prefills {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  background-color: #1e1e1e;
  border-radius: 0.5em;
  padding: 0.8em 1em;
  border: 1px solid #383838;
}

.prefill-group {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.prefill-group label {
  font-size: 0.8em;
  color: #888;
  font-weight: bold;
}

.prefill-group input {
  background-color: #111;
  border: 1px solid #444;
  color: white;
  padding: 0.4em 0.6em;
  border-radius: 0.3em;
  font-size: 0.85em;
}

.template-card {
  background-color: #1f1f1f;
  border-radius: 0.6em;
  border: 1px solid #3a3a3a;
  overflow: hidden;
}

.template-header {
  background-color: #1a1a1a;
  padding: 0.6em 1em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  border-bottom: 1px solid #323232;
}

.copy-tmpl-btn {
  background-color: #db292f;
  color: white;
  border: none;
  border-radius: 0.3em;
  padding: 0.3em 0.8em;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
}

.copy-tmpl-btn:hover {
  background-color: #f1353b;
}

.template-text {
  padding: 1em;
  margin: 0;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.82em;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #d1d5db;
  line-height: 1.5;
  user-select: all;
  background-color: #141414;
}

/* Animations and transitions */
.slide-down {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
