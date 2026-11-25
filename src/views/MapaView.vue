<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Pagina from '@/components/layout/pagina.vue'
import { praias } from '@/data/praias'

const router = useRouter()
let mapa: L.Map | undefined
let marcadores: L.LayerGroup | undefined

onMounted(async () => {
  await nextTick()
  if (mapa) return
  mapa = L.map('mapa-florianopolis', { scrollWheelZoom: false }).setView([-27.5954, -48.548], 10)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa)
  marcadores = L.layerGroup().addTo(mapa)

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
    marcador.on('popupopen', () => {
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
      </div>
      <div id="mapa-florianopolis" class="z-0 h-[55vh] min-h-[360px] w-full rounded-3xl border border-black/10 shadow-sm" role="application" aria-label="Mapa interativo das praias cadastradas em Florianópolis"></div>
      <h2 class="text-lg font-bold">Praias cadastradas</h2>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li v-for="praia in praias" :key="praia.id">
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
