<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Pagina from '@/components/layout/pagina.vue'
import { praias } from '@/data/praias'
import { ENDERECO_PADRAO } from '@/services/localizacao'

const router = useRouter()
let mapa: L.Map | undefined
let marcadores: L.LayerGroup | undefined

const selecionadaId = ref<number | null>(null)
const praiaSelecionada = computed(() => praias.find((p) => p.id === selecionadaId.value) ?? null)
const praiasListadas = computed(() => (praiaSelecionada.value ? [praiaSelecionada.value] : praias))
const mostrarTodas = () => {
  selecionadaId.value = null
  mapa?.closePopup()
}

// Pin (gota) que marca a localização do usuário, no azul do app. A ponta fica exatamente na coordenada.
const PIN_LARGURA = 30
const PIN_ALTURA = 40
const COR_USUARIO = '#5b8fd9'
const svgPin = (cor: string) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${PIN_LARGURA}" height="${PIN_ALTURA}" viewBox="0 0 30 40" aria-hidden="true"
       style="display:block;filter:drop-shadow(0 2px 3px rgb(0 0 0 / .35))">
    <path d="M15 1.5C7.5 1.5 1.5 7.4 1.5 14.8c0 9.9 13.5 23.7 13.5 23.7s13.5-13.8 13.5-23.7C28.5 7.4 22.5 1.5 15 1.5z"
          fill="${cor}" stroke="#fff" stroke-width="2.5"/>
    <circle cx="15" cy="14.8" r="5.2" fill="#fff"/>
  </svg>`

onMounted(async () => {
  await nextTick()
  if (mapa) return
  mapa = L.map('mapa-florianopolis', { scrollWheelZoom: false }).setView([-27.5954, -48.548], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa)
  marcadores = L.layerGroup().addTo(mapa)

  L.marker([ENDERECO_PADRAO.latitude, ENDERECO_PADRAO.longitude], {
    icon: L.divIcon({
      className: '',
      html: svgPin(COR_USUARIO),
      iconSize: [PIN_LARGURA, PIN_ALTURA],
      iconAnchor: [PIN_LARGURA / 2, PIN_ALTURA - 1.5],
      popupAnchor: [0, -PIN_ALTURA + 4],
    }),
    title: 'Você está aqui',
    alt: `Sua localização: ${ENDERECO_PADRAO.descricao}`,
    zIndexOffset: 1000,
  })
    .bindPopup(`<strong>Você está aqui</strong><br>${ENDERECO_PADRAO.descricao}`)
    .addTo(mapa)

  praias.forEach((praia) => {
    const cor = praia.quality === 'propria' ? '#57a03b' : '#a3302f'
    const icone = L.divIcon({
      className: '',
      html: `<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:50%;background:${cor};box-shadow:0 1px 6px #333"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })
    const marcador = L.marker([praia.latitude, praia.longitude], { icon: icone }).addTo(marcadores!)
    marcador.bindPopup(`<strong>${praia.name}</strong><br>${praia.quality === 'propria' ? 'Própria para banho' : 'Imprópria para banho'}<br><span>Nota dos visitantes: ${praia.nota.toLocaleString('pt-BR')} / 5</span>`)
    marcador.on('click', () => {
      marcador.openPopup()
    })
    marcador.on('popupclose', () => {
      if (selecionadaId.value === praia.id) selecionadaId.value = null
    })
    marcador.on('popupopen', () => {
      selecionadaId.value = praia.id
      const el = marcador.getPopup()?.getElement()
      if (!el || el.querySelector('button')) return
      const botao = document.createElement('button')
      botao.type = 'button'
      botao.textContent = 'Ver detalhes da praia'
      botao.style.cssText = 'display:block;margin-top:8px;color:#2563eb;text-decoration:underline;cursor:pointer'
      botao.addEventListener('click', () => router.push({ name: 'praia', params: { id: praia.id } }))
      el.querySelector('.leaflet-popup-content')?.appendChild(botao)
    })
  })
})

onBeforeUnmount(() => {
  mapa?.remove()
  mapa = undefined
})
</script>

<template>
  <Pagina titulo="Mapa das praias">
    <div class="flex flex-col gap-3">
      <p class="text-sm text-[#79747E]">Explore Florianópolis e selecione um marcador para consultar a situação da praia.</p>
      <div class="flex flex-wrap gap-4 text-xs">
        <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-[#57a03b]"></span> Própria para banho</span>
        <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-full bg-[#a3302f]"></span> Imprópria para banho</span>
<!--
        <span class="flex items-center gap-1"><span class="material-symbols-rounded icone-cheio text-lg leading-none text-primaria" aria-hidden="true">location_on</span> Você está aqui</span>
-->
      </div>
      <div id="mapa-florianopolis" class="z-0 h-[55vh] min-h-[360px] w-full rounded-3xl border border-black/10 shadow-sm" role="application" aria-label="Mapa interativo das praias cadastradas em Florianópolis"></div>
      <div class="flex items-center justify-between gap-3" aria-live="polite">
        <h2 class="text-lg font-bold">{{ praiaSelecionada ? 'Praia selecionada no mapa' : 'Praias cadastradas' }}</h2>
        <button
            v-if="praiaSelecionada"
            type="button"
            class="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-primaria transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            @click="mostrarTodas"
        >
          <span class="material-symbols-rounded text-lg leading-none" aria-hidden="true">close</span>
          Mostrar todas ({{ praias.length }})
        </button>
      </div>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li v-for="praia in praiasListadas" :key="praia.id">
          <RouterLink :to="{ name: 'praia', params: { id: praia.id } }" class="flex items-center justify-between gap-3 rounded-2xl bg-superficie p-3 transition hover:opacity-80">
            <span class="min-w-0">
              <strong class="block truncate text-sm">{{ praia.name }}</strong>
              <span class="text-xs text-[#79747E]">Nota {{ praia.nota.toLocaleString('pt-BR')}}/5</span>
            </span>
            <span class="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-white" :class="praia.quality === 'propria' ? 'bg-propria' : 'bg-impropria'">
              {{ praia.quality === 'propria' ? 'Própria' : 'Imprópria' }}
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </Pagina>
</template>
