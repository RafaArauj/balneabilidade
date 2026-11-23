<script setup lang="ts">
import NavBar from '@/components/layout/navBar.vue'
</script>

<template>
  <div class="flex h-dvh flex-col">
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>

    <NavBar />
  </div>
</template>
