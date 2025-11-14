import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("@/views/home/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(), // 去掉 URL 中的 #
  routes,
});

export default router;
