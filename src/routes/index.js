import { createWebHistory, createRouter } from "vue-router";

import HomeView from "../views/HomeView.vue";
import SaleView from "../views/SaleView.vue";
import MemberView from "../views/MemberView.vue";
import ServerCreator from "../views/ServerCreator.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/sale", component: SaleView },
  { path: "/server", component: ServerCreator },
  { path: "/server/summary", component: ServerCreator },
  { path: "/server/:memberID/payment", component: MemberView },
  { path: "/server/:memberID", component: MemberView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
