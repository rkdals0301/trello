import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import Login from "../components/Login.vue";
import Board from "../components/Board.vue";
import Card from "../components/Card.vue";
import NotFound from "../components/Notfound.vue";
import store from "../store";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Home, meta: { requiresAuth: true } },
    { path: "/login", component: Login },
    {
      path: "/b/:bid",
      component: Board,
      meta: { requiresAuth: true },
      children: [{ path: "c/:cid", component: Card }]
    },
    { path: "/:pathMatch(.*)*", component: NotFound }
  ]
});

router.beforeEach(to => {
  if (to.meta.requiresAuth && !store.getters.isAuth) {
    return { path: "/login", query: { rPath: to.fullPath } };
  }
});

export default router;
