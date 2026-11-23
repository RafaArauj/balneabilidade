<script setup lang="ts">
import { useRoute } from 'vue-router'
import NavBar from '@/components/layout/navBar.vue'
const route = useRoute()
</script>

<template>
  <div class="flex h-screen flex-col">
    <main class="flex-1 overflow-y-auto" :class="{ 'py-4': !route.meta.hideNav }">
      <RouterView />
    </main>

    <NavBar v-if="!route.meta.hideNav" />
  </div>
</template>
