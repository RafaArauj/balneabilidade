<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const props = defineProps<{
  titulo?: string
}>()

const route = useRoute()
const tituloFinal = computed(() => props.titulo ?? route.meta.title ?? '')
</script>

<template>
  <section class="flex flex-col gap-6 px-4 pt-6 pb-6">
    <h1 class="text-3xl font-bold">{{ tituloFinal }}</h1>
    <slot />
  </section>
</template>
