<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavItem from '@/components/layout/navItem.vue'

const router = useRouter()

// Itens vêm das rotas com meta.nav = true (src/router/index.ts)
const items = computed(() => router.getRoutes().filter((r) => r.meta.nav))
</script>

<template>
  <nav class="w-full shrink-0 bg-nav py-1">
    <ul class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }">
      <li v-for="item in items" :key="String(item.name)" class="flex justify-center">
        <RouterLink :to="{ name: item.name }" custom v-slot="{ isExactActive, navigate }">
          <NavItem
            :icon="item.meta.icon ?? ''"
            :label="item.meta.title ?? ''"
            :active="isExactActive"
            @click="navigate"
          />
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
