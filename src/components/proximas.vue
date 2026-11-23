<script setup>
import { computed } from 'vue'
import PraiaLista from "@/components/praiaLista.vue";

const props = defineProps({
  beaches: { type: Array, default: () => [] },
  limit: { type: Number, default: 3 },
})

defineEmits(['more'])

const visibleBeaches = computed(() =>
    [...props.beaches]
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
        .slice(0, props.limit)
)
</script>

<template>
  <section class="flex flex-col gap-3">
    <header class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Próximas de você</h2>
      <button
          type="button"
          class="text-lg text-[#4A90E2] hover:underline focus:outline-none focus-visible:underline"
          @click="$emit('more')"
      >Mais+</button>
    </header>

    <ul class="flex flex-col gap-3">
      <li v-for="praia in visibleBeaches" :key="praia.id">
        <RouterLink
            :to="{ name: 'praia', params: { id: praia.id } }"
            class="block rounded-2xl transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
        >
        <praia-lista
            :image="praia.image"
            :name="praia.name"
            :address="praia.address"
            :quality="praia.quality"
            :distance="praia.distance"
        />
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

