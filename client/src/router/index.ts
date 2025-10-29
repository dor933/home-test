import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/requester",
  },
  {
    path: "/requester",
    name: "Requester",
    component: () => import("../views/RequesterView.vue"),
  },
  {
    path: "/validator",
    name: "Validator",
    component: () => import("../views/ValidatorView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
