import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    nav?: boolean
  }
}

const routes: RouteRecordRaw[] = [
 /* {
    path: '/',
    name: 'start',
    component: () => import('@/views/start.vue'),
  },*/
  {
    path: '/inicio',
    name: 'inicio',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'Início', icon: 'beach_access', nav: true },
  },
  {
    path: '/mapa',
    name: 'mapa',
    component: () => import('@/views/MapaView.vue'),
    meta: { title: 'Mapa', icon: 'map', nav: true },
  },
  {
    path: '/favoritos',
    name: 'favoritos',
    component: () => import('@/views/FavoritosView.vue'),
    meta: { title: 'Favoritos', icon: 'star', nav: true },
  },
  {
    path: '/praia/:id',
    name: 'praia',
    component: () => import('@/views/PraiaView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Praia' },
  },
{
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { title: 'Administração', icon: 'admin_panel_settings', nav: false },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'inicio' },
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

export default router
