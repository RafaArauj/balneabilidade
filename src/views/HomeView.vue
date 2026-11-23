<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '@/components/searchBar.vue'
import PraiaCard from "@/components/praiaCard.vue";
import Proximas from "@/components/proximas.vue";


const router = useRouter()
const busca = ref('')

const praias = ref([
  {
    id: 1,
    image: `${import.meta.env.BASE_URL}praia-de-jurere.webp`,
    name: 'Praia Ponta das Canas',
    address: 'Rua Deputado Fernando Viegas, nº103',
    quality: 'propria',
    distance: 38,
    favorite: false,
  },
  {
    id: 2,
    image: `${import.meta.env.BASE_URL}praia-de-jurere.webp`,
    name: 'Praia do Sambaqui',
    address: 'Rodovia Rafael da Rocha Pires, nº1964.',
    quality: 'impropria',
    distance: 16.5,
    favorite: true,
  },
])

const normalizar = (texto = '') =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const praiasFiltradas = computed(() => {
  const termo = normalizar(busca.value)
  if (!termo) return praias.value

  return praias.value.filter((p) =>
      normalizar(`${p.name} ${p.address}`).includes(termo)
  )
})
</script>

<template>
  <section class="flex flex-col gap-4 pl-2">
    <span class=" text-3xl font-bold ">Encontre sua praia favorita</span>
    <SearchBar v-model="busca" />
    <span class="text-2xl font-bold pt-6">Popular</span>
    <div v-if="praiasFiltradas.length" class="flex flex-wrap gap-2">
      <praia-card
          v-for="praia in praiasFiltradas"
          :key="praia.id"
          :image="praia.image"
          :name="praia.name"
          :address="praia.address"
          :quality="praia.quality"
          :distance="praia.distance"
          v-model:favorite="praia.favorite"
      />
    </div>

    <p v-else class="py-8 text-center text-sm text-[#79747E]">
      Nenhuma praia encontrada para "{{ busca }}".
    </p>

    <proximas :beaches="praiasFiltradas"
              :limit="2"
              @more="router.push({ name: 'praias', query: busca ? { busca } : {} })"></proximas>
  </section>
</template>

