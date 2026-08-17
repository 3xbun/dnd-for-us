<template>
  <div class="overview">
    <div class="item">
      <p>Active MRR</p>
      <p class="number">
        <count-up :end-val="stats.mrr" class="inline"></count-up>฿
        <span
          v-if="stats.comparison.mrr"
          class="comparison"
          :class="{
            green: stats.mrr > stats.comparison.mrr,
            red: stats.mrr < stats.comparison.mrr,
          }"
          title="Change from previous month"
        >
          <i
            class="fa-duotone fa-solid"
            :class="{
              'fa-arrow-trend-up': stats.mrr > stats.comparison.mrr,
              'fa-arrow-trend-down': stats.mrr < stats.comparison.mrr,
            }"
          ></i>
          {{ Math.abs(stats.mrr - stats.comparison.mrr).toFixed(0) }}฿
        </span>
      </p>
    </div>
    <div class="item">
      <p>Active Subscriptions</p>
      <p class="number">
        <count-up :end-val="stats.activeSub"></count-up>
        <span
          v-if="stats.comparison.activeSub"
          class="comparison"
          :class="{
            green: stats.activeSub > stats.comparison.activeSub,
            red: stats.activeSub < stats.comparison.activeSub,
          }"
          title="Change from previous month"
        >
          <i
            class="fa-duotone fa-solid"
            :class="{
              'fa-arrow-trend-up': stats.activeSub > stats.comparison.activeSub,
              'fa-arrow-trend-down':
                stats.activeSub < stats.comparison.activeSub,
            }"
          ></i>
          {{ Math.abs(stats.activeSub - stats.comparison.activeSub) }}
        </span>
      </p>
    </div>
    <div class="item">
      <p>Customer Churn Rate</p>
      <p class="number">
        <count-up :end-val="(stats.churnRate * 100).toFixed(2)"></count-up>%
      </p>
    </div>
    <div class="item">
      <p>Average Revenue Per User (ARPU)</p>
      <p class="number">
        <count-up :end-val="stats.arpu"></count-up>฿
        <span
          v-if="stats.comparison.arpu"
          class="comparison"
          :class="{
            green: stats.arpu > stats.comparison.arpu,
            red: stats.arpu < stats.comparison.arpu,
          }"
          title="Change from previous month"
        >
          <i
            class="fa-duotone fa-solid"
            :class="{
              'fa-arrow-trend-up': stats.arpu > stats.comparison.arpu,
              'fa-arrow-trend-down': stats.arpu < stats.comparison.arpu,
            }"
          ></i>
          {{ Math.abs(stats.arpu - stats.comparison.arpu).toFixed(2) }}฿
        </span>
      </p>
    </div>
    <div class="item">
      <p>New Customers</p>
      <p class="number">
        <count-up :end-val="stats.newCustomers"></count-up>
        <span
          v-if="stats.comparison.newCustomers"
          class="comparison"
          :class="{
            green: stats.newCustomers > stats.comparison.newCustomers,
            red: stats.newCustomers < stats.comparison.newCustomers,
          }"
          title="Change from previous month"
        >
          <i
            class="fa-duotone fa-solid"
            :class="{
              'fa-arrow-trend-up':
                stats.newCustomers > stats.comparison.newCustomers,
              'fa-arrow-trend-down':
                stats.newCustomers < stats.comparison.newCustomers,
            }"
          ></i>
          {{ Math.abs(stats.newCustomers - stats.comparison.newCustomers) }}
        </span>
      </p>
    </div>
    <div class="item">
      <p>Avg. Subscription (Months)</p>
      <p class="number">
        <count-up
          :end-val="stats.avgSubLength"
          :options="{ decimalPlaces: 1 }"
        ></count-up>
      </p>
    </div>
    <div class="item">
      <p>Revenue Churn Rate</p>
      <p class="number">
        <count-up
          :end-val="(stats.revenueChurnRate * 100).toFixed(2)"
        ></count-up
        >%
      </p>
    </div>
    <div class="item">
      <p>Net MRR Growth</p>
      <p
        class="number"
        :class="{ green: stats.netMRRGrowth > 0, red: stats.netMRRGrowth < 0 }"
      >
        <count-up :end-val="stats.netMRRGrowth"></count-up>฿
      </p>
    </div>
  </div>
  <div class="breakdowns">
    <div class="breakdown">
      <h3>New Subscribers (สมาชิกใหม่ 30 วันที่ผ่านมา)</h3>
      <ul>
        <li v-for="sale in newSubscribers" :key="sale.id">
          <span>
            <strong>{{
              sale.fields?.Owner?.fields?.FacebookName || "ไม่ทราบชื่อ"
            }}</strong>
            <br />
            <span class="server-badge">{{ sale.fields?.ServerID }}</span>
          </span>
          <span class="product-title">
            {{ getServerPrice(sale) }}฿ / เดือน
          </span>
        </li>
      </ul>
    </div>
    <div class="breakdown">
      <h3>Next Collect (กำหนดชำระเงินสัปดาห์นี้)</h3>
      <ul>
        <li v-for="sale in nextCollectSales" :key="sale.id">
          <div>
            <span>
              <strong>{{
                sale.fields?.Owner?.fields?.FacebookName || "ไม่ทราบชื่อ"
              }}</strong>
              <span class="server-badge">{{ sale.fields?.ServerID }}</span>
            </span>
            <span class="product-title">
              {{ dayjs(sale.fields?.NextCollect).add(1, "day").fromNow() }}
              (กำหนด:
              {{
                dayjs(sale.fields?.NextCollect)
                  .add(1, "day")
                  .format("DD/MM/YYYY")
              }})
            </span>
          </div>
          <div class="btns">
            <a
              v-if="sale.fields?.Owner?.fields?.FacebookName"
              :href="
                'https://facebook.com/search/top/?q=' +
                encodeURIComponent(sale.fields?.Owner?.fields?.FacebookName)
              "
              target="_blank"
              class="btn facebook"
              >ค้นหา Facebook <i class="fa-brands fa-facebook-messenger"></i
            ></a>
            <a class="btn" @click="addOneMonth(sale)">
              ต่ออายุ <i class="fa-duotone fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </li>
      </ul>
    </div>
    <div class="breakdown">
      <h3>Recent Churns (เซิร์ฟเวอร์ที่หมดอายุ)</h3>
      <ul>
        <li v-for="sale in recentChurns" :key="sale.id">
          <span>
            <strong>{{
              sale.fields?.Owner?.fields?.FacebookName || "ไม่ทราบชื่อ"
            }}</strong>
            <br />
            <span class="server-badge expired">{{
              sale.fields?.ServerID
            }}</span>
          </span>
          <span class="product-title">
            {{ getServerPrice(sale) }}฿ / เดือน <br />(หมดอายุเมื่อ:
            {{
              sale.fields?.NextCollect
                ? dayjs(sale.fields.NextCollect)
                    .add(1, "day")
                    .format("DD/MM/YYYY")
                : "ไม่ระบุ"
            }})
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import CountUp from "vue-countup-v3";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { computed, onBeforeMount, ref } from "vue";

dayjs.extend(relativeTime);

const sales = ref([]);

const getServerPrice = (sale) => {
  const fields = sale.fields;
  if (!fields) return 0;

  const basePrice = 89;

  const ram = parseInt(fields.Ram) || 2;
  let ramExtra = 0;
  if (ram === 4) ramExtra = 50;
  else if (ram === 8) ramExtra = 150;

  const storage = parseInt(fields.Storage) || 5;
  const storageExtra = storage > 5 ? (storage - 5) * 2 : 0;

  const licenseExtra = fields.hasLicense ? 0 : 50;
  const heromancerExtra = fields.Heromancer ? 29 : 0;

  const totalBeforeDiscount =
    basePrice + ramExtra + storageExtra + licenseExtra + heromancerExtra;

  let discountPercent = 0;
  const monthActive = fields.MonthActive || 0;
  if (monthActive === 5) {
    discountPercent = 10;
  } else if (monthActive === 11) {
    discountPercent = 20;
  }

  if (fields.isStudent) {
    discountPercent = 20;
  }

  const discountAmount = Math.round(
    totalBeforeDiscount * (discountPercent / 100),
  );
  return totalBeforeDiscount - discountAmount;
};

const newSubscribers = computed(() => {
  return sales.value
    .filter((sale) => {
      const firstMonth = sale.fields?.FirstMonth;
      if (!firstMonth) return false;
      return dayjs().diff(dayjs(firstMonth), "days") < 31;
    })
    .sort((a, b) => {
      const dateA = new Date(a.fields?.FirstMonth || 0);
      const dateB = new Date(b.fields?.FirstMonth || 0);
      return dateB - dateA;
    })
    .slice(0, 5);
});

const nextCollectSales = computed(() => {
  return sales.value
    .filter(
      (sale) =>
        sale.fields?.IsActive &&
        sale.fields?.NextCollect &&
        dayjs(sale.fields.NextCollect).add(1, "day").isAfter(dayjs()) &&
        dayjs(sale.fields.NextCollect).add(1, "day").diff(dayjs(), "days") <= 7,
    )
    .sort((a, b) => {
      const dateA = new Date(a.fields.NextCollect);
      const dateB = new Date(b.fields.NextCollect);
      return dateA - dateB;
    });
});

const addOneMonth = (sale) => {
  const currentCollect =
    sale.fields?.NextCollect || dayjs().format("YYYY-MM-DD");
  const nextCollectFormatted = dayjs(currentCollect)
    .add(1, "month")
    .format("YYYY-MM-DD");

  const payload = {
    id: sale.id,
    fields: {
      NextCollect: nextCollectFormatted,
      MonthActive: (sale.fields?.MonthActive || 0) + 1,
    },
  };

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
      fetchDashboardData();
    })
    .catch((err) => console.error(err));
};

const recentChurns = computed(() => {
  return sales.value
    .filter((sale) => !sale.fields?.IsActive && sale.fields?.ServerID)
    .sort((a, b) => {
      const dateA = new Date(a.fields?.NextCollect || 0);
      const dateB = new Date(b.fields?.NextCollect || 0);
      return dateB - dateA;
    })
    .slice(0, 5);
});

const stats = computed(() => {
  const activeSales = sales.value.filter((sale) => sale.fields?.IsActive);
  const churnedSales = sales.value.filter(
    (sale) => !sale.fields?.IsActive && sale.fields?.ServerID,
  );
  const recentlyChurnedSales = churnedSales.filter((sale) => {
    if (!sale.fields?.NextCollect) return false;
    // Churned/expired within the last 30 days
    return dayjs().diff(dayjs(sale.fields.NextCollect), "days") <= 30;
  });
  
  const newSales = activeSales.filter(
    (sale) => sale.fields?.MonthActive === 1 || sale.fields?.MonthActive === 0,
  );

  const mrr = activeSales.reduce(
    (total, sale) => total + getServerPrice(sale),
    0,
  );
  const activeSub = activeSales.length;

  const customerChurnRate =
    sales.value.length > 0 ? churnedSales.length / sales.value.length : 0;

  const churnedMRR = recentlyChurnedSales.reduce(
    (total, sale) => total + getServerPrice(sale),
    0,
  );

  const totalRevenueEver = sales.value.reduce(
    (total, sale) =>
      total + getServerPrice(sale) * (sale.fields?.MonthActive || 1),
    0,
  );
  const revenueChurnRate =
    totalRevenueEver > 0 ? churnedMRR / totalRevenueEver : 0;

  const newMRR = newSales.reduce(
    (total, sale) => total + getServerPrice(sale),
    0,
  );
  const netMRRGrowth = newMRR - churnedMRR;

  const newCustomers = newSales.length;
  const totalSubMonths = activeSales.reduce(
    (total, sale) => total + (sale.fields?.MonthActive || 0),
    0,
  );
  const avgSubLength = activeSub > 0 ? totalSubMonths / activeSub : 0;

  // --- Comparison Stats (Previous Month) ---
  const previous_mrr = mrr - netMRRGrowth;
  const previous_activeSub = activeSub - (newCustomers - recentlyChurnedSales.length);
  const previous_arpu =
    previous_activeSub > 0 ? previous_mrr / previous_activeSub : 0;
  const previous_newCustomers = sales.value.filter(
    (s) => s.fields?.IsActive && s.fields?.MonthActive === 2,
  ).length;

  return {
    mrr,
    activeSub,
    churnRate: customerChurnRate,
    revenueChurnRate,
    netMRRGrowth,
    arpu: activeSub > 0 ? mrr / activeSub : 0,
    newCustomers,
    avgSubLength,
    comparison: {
      mrr: previous_mrr,
      activeSub: previous_activeSub,
      arpu: previous_arpu,
      newCustomers: previous_newCustomers,
    },
  };
});

const fetchDashboardData = () => {
  const options = {
    method: "GET",
    headers: {
      "xc-token": import.meta.env.VITE_NDB_API,
    },
  };

  axios
    .get(
      "https://ndb.3xbun.com/api/v3/data/p0w0egc69gysun8/mpjw5xxzr2364bf/records",
      {
        ...options,
        params: {
          offset: "0",
          limit: "1000",
          where: "",
        },
      },
    )
    .then((res) => {
      sales.value = res.data.records || [];
    })
    .catch((err) => console.error(err));
};

onBeforeMount(() => {
  fetchDashboardData();
});
</script>

<style lang="css" scoped>
.overview {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1em;
  margin: 1em 0;
}

.item {
  flex-grow: 1;
  flex-basis: 200px;
  background-color: #353535;
  padding: 1em 1em;
  border-radius: 0.5em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.primary {
  background-color: #1a6f43;
}

.number {
  font-size: 2em;
  font-weight: 500 !important;
  display: flex;
  align-items: center;
}

.item > p {
  margin: 0;
  font-weight: 200;
}

.comparison {
  font-size: 0.6em;
  font-weight: 500;
  margin-left: 0.5em;
  display: flex;
  align-items: center;
}

.comparison i {
  margin-right: 0.25em;
}

.number.green {
  color: #42b983;
}

.red {
  color: #db292f;
}

.breakdowns {
  display: flex;
  gap: 1em;
  margin-top: 1em;
  flex-direction: column;
}

.breakdown {
  flex: 1;
  background-color: #353535;
  padding: 1em;
  border-radius: 0.5em;
}

.breakdown ul {
  list-style: none;
  padding: 0;
}

.breakdown li {
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  border-radius: 0.5em;
}

.breakdown li:nth-child(even) {
  background-color: #303030;
}

.breakdown li > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  font-style: italic;
  color: #aaa;
  text-align: right;
}

.server-badge {
  background-color: #e67e22;
  color: white;
  padding: 0.1em 0.5em;
  border-radius: 0.25em;
  font-size: 0.8em;
  margin-left: 0.6em;
  font-weight: bold;
  display: inline-block;
  vertical-align: middle;
}

.server-badge.expired {
  background-color: #db292f;
}

.btn {
  background-color: #db292f;
  width: fit-content;
  padding: 0.25em 0.5em;
  border-radius: 0.5em;
  cursor: pointer;
  color: white;
  text-decoration: none;
  align-self: center;
}

.btns {
  gap: 0.5em;
}

.btns .btn {
  width: 100%;
  text-align: right;
}

.btn i {
  margin-left: 0.25em;
}

.facebook {
  background: #0866ff;
}
</style>
