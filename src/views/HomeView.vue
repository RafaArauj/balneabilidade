<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Pagina from "@/components/layout/pagina.vue";
import SearchBar from '@/components/searchBar.vue'
import PraiaCard from "@/components/praiaCard.vue";
import Proximas from "@/components/proximas.vue";
import { praias } from "@/data/praias";


const router = useRouter()
const busca = ref('')

const normalizar = (texto = '') =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const praiasFiltradas = computed(() => {
  const termo = normalizar(busca.value)
  if (!termo) return praias

  return praias.filter((p) =>
      normalizar(`${p.name} ${p.address}`).includes(termo)
  )
})
</script>

<template>
  <Pagina titulo="Encontre sua praia favorita">
    <SearchBar v-model="busca" />

    <section class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold">Popular</h2>

      <!-- Grid: quantas colunas couberem (2 no celular, mais no computador) -->
      <div
          v-if="praiasFiltradas.length"
          class="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]"
      >
        <PraiaCard
            v-for="praia in praiasFiltradas"
            :key="praia.id"
            :image="praia.image"
            :name="praia.name"
            :address="praia.address"
            :quality="praia.quality"
            :distance="praia.distance"
            v-model:favorite="praia.favorite"
            :to="{ name: 'praia', params: { id: praia.id } }"
        />
      </div>

      <p v-else class="py-8 text-center text-sm text-[#79747E]">
        Nenhuma praia encontrada para "{{ busca }}".
      </p>
    </section>

    <Proximas
        :beaches="praiasFiltradas"
        :limit="2"
        @more="router.push({ name: 'mapa' })"
    />
  </Pagina>
</template>
