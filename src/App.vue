<script setup lang="ts">
import NavBar from '@/components/layout/navBar.vue'
</script>

<template>
  <div class="flex h-dvh flex-col lg:flex-row">
    <main class="relative flex-1 overflow-y-auto overscroll-contain">
      <RouterView />
    </main>

    <NavBar />
  </div>
</template>
