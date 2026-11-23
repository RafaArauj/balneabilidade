<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const props = defineProps<{
  titulo?: string
  voltar?: boolean
}>()

const route = useRoute()
const router = useRouter()
const tituloFinal = computed(() => props.titulo ?? route.meta.title ?? '')

const irVoltar = () => (window.history.state?.back ? router.back() : router.push({ name: 'inicio' }))
</script>

<template>
  <section class="flex flex-col gap-6 px-4 pt-6 pb-6">
    <header class="flex items-center gap-2">
      <button
          v-if="voltar"
          type="button"
          class="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 active:scale-95"
          aria-label="Voltar"
          @click="irVoltar"
      >
        <span class="material-symbols-rounded text-2xl" aria-hidden="true">arrow_back</span>
      </button>

      <h1 class="min-w-0 flex-1 text-3xl font-bold">{{ tituloFinal }}</h1>

      <slot name="acoes" />
    </header>

    <slot />
  </section>
</template>
