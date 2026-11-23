<script setup lang="ts">
import NavBar from '@/components/layout/navBar.vue'
</script>

<template>
  <div class="flex h-dvh flex-col">
    <main class="relative flex-1 overflow-y-auto overscroll-contain">
      <RouterView />
    </main>

    <NavBar />
  </div>
</template>
