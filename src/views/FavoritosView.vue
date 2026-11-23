
<script setup lang="ts">
import { computed } from 'vue'
import Pagina from '@/components/layout/pagina.vue'
import PraiaLista from '@/components/praiaLista.vue'
import { praias } from '@/data/praias'

const praiasFavoritas = computed(() =>
  praias.filter((praia) => praia.favorite)
)
</script>

<template>
  <Pagina titulo="Favoritos">
    <div class="flex flex-col gap-3">

      <div v-if="praiasFavoritas.length > 0" class="flex flex-col gap-3">
        <PraiaLista
          v-for="praia in praiasFavoritas"
          :key="praia.id"
            :to="{ name: 'praia', params: { id: praia.id } }"
          :image="praia.image"
          :name="praia.name"
          :address="praia.address"
          :quality="praia.quality"
          :distance="praia.distance"
        />
      </div>

      <p v-else class="text-sm text-[#79747E]">
        Você ainda não possui praias favoritas.
      </p>
    </div>
  </Pagina>
</template>
