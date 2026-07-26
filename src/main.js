import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import VueMatomo from "vue-matomo";

import router from "./routes/";

createApp(App)
  .use(router)
  .use(VueMatomo, {
    // Configure your matomo server and site by providing
    host: "https://analyze.dnd-for.us",
    siteId: 1,
  })
  .mount("#app");

window._paq.push(["trackPageView"]);
