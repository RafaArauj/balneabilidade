<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Pagina from "@/components/layout/pagina.vue";
import SearchBar from '@/components/searchBar.vue'
import PraiaCard from "@/components/praiaCard.vue";
import Proximas from "@/components/proximas.vue";
import { praias, REGIOES } from "@/data/praias";


const router = useRouter()

const CHAVE_FILTROS = 'balneabilidade-filtros-v1'
const FILTROS_INFRA = ['Salva-vidas', 'Estacionamento']
const ORDENACOES = [
  { valor: 'propria', rotulo: 'Próprias para banho primeiro' },
  { valor: 'distancia', rotulo: 'Mais próximas' },
  { valor: 'nome', rotulo: 'Nome (A–Z)' },
]
const ORDEM_PADRAO = 'propria'

const lerFiltrosSalvos = () => {
  try {
    const salvos = JSON.parse(localStorage.getItem(CHAVE_FILTROS) ?? '{}')
    return {
      busca: typeof salvos.busca === 'string' ? salvos.busca : '',
      ordem: ORDENACOES.some((o) => o.valor === salvos.ordem) ? salvos.ordem : ORDEM_PADRAO,
      regiao: REGIOES.includes(salvos.regiao) ? salvos.regiao : '',
      infra: Array.isArray(salvos.infra) ? salvos.infra.filter((i) => FILTROS_INFRA.includes(i)) : [],
    }
  } catch {
    return { busca: '', ordem: ORDEM_PADRAO, regiao: '', infra: [] }
  }
}

const filtrosSalvos = lerFiltrosSalvos()
const busca = ref(filtrosSalvos.busca)
const ordem = ref(filtrosSalvos.ordem)
const regiao = ref(filtrosSalvos.regiao)
const infra = ref(filtrosSalvos.infra)

watch([busca, ordem, regiao, infra], () => {
  try {
    localStorage.setItem(CHAVE_FILTROS, JSON.stringify({
      busca: busca.value, ordem: ordem.value, regiao: regiao.value, infra: infra.value,
    }))
  } catch {
    // Sem armazenamento: os filtros só não são lembrados.
  }
}, { deep: true })

// Quantos ajustes do painel estão fora do padrão (aparece no selo do botão).
const filtrosAtivos = computed(() =>
    Number(ordem.value !== ORDEM_PADRAO) + Number(!!regiao.value) + infra.value.length
)
const limparPainel = () => {
  ordem.value = ORDEM_PADRAO
  regiao.value = ''
  infra.value = []
}
const limparFiltros = () => {
  busca.value = ''
  limparPainel()
}

// Painel de filtros: abre pelo botão, fecha com Esc ou clicando fora.
const painelAberto = ref(false)
const areaFiltro = ref(null)
const botaoFiltro = ref(null)

const fecharPainel = (devolverFoco = false) => {
  painelAberto.value = false
  if (devolverFoco) botaoFiltro.value?.focus()
}
const aoClicarFora = (evento) => {
  if (painelAberto.value && areaFiltro.value && !areaFiltro.value.contains(evento.target)) fecharPainel()
}
onMounted(() => document.addEventListener('pointerdown', aoClicarFora))
onBeforeUnmount(() => document.removeEventListener('pointerdown', aoClicarFora))

const normalizar = (texto = '') =>
    texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const praiasFiltradas = computed(() => {
  const termo = normalizar(busca.value)

  return praias.filter((p) =>
      (!termo || normalizar(`${p.name} ${p.address}`).includes(termo)) &&
      (!regiao.value || p.regiao === regiao.value) &&
      infra.value.every((i) => p.infraestrutura.includes(i))
  )
})

const comparadores = {
  propria: (a, b) => Number(b.quality === 'propria') - Number(a.quality === 'propria'),
  distancia: (a, b) => a.distance - b.distance,
  nome: (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
}

// Popular segue a ordenação escolhida (padrão: próprias para banho primeiro).
const praiasPopulares = computed(() =>
    [...praiasFiltradas.value].sort(comparadores[ordem.value] ?? comparadores[ORDEM_PADRAO])
)

// "Popular" é um carrossel de 1 linha: cabem tantos cards quanto a largura permite
// (mínimo de 9,5rem no celular, 11rem no sm e 12rem no lg, como no grid anterior)
// e os botões < e > deslizam uma "página" de cards por vez.
const REM = 16
const ESPACO = 0.75 * REM // gap-3

const carrossel = ref(null)
const larguraCard = ref('calc((100% - 0.75rem) / 2)')
const podeVoltar = ref(false)
const podeAvancar = ref(false)
let observador

const larguraMinimaCard = () =>
    (window.matchMedia('(min-width: 64rem)').matches ? 12
        : window.matchMedia('(min-width: 40rem)').matches ? 11
            : 9.5) * REM

const atualizarSetas = () => {
  const el = carrossel.value
  if (!el) return
  podeVoltar.value = el.scrollLeft > 1
  podeAvancar.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const medir = () => {
  const el = carrossel.value
  if (!el) return
  const estilo = getComputedStyle(el)
  const util = el.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight)
  const porLinha = Math.max(1, Math.floor((util + ESPACO) / (larguraMinimaCard() + ESPACO)))
  larguraCard.value = `${(util - ESPACO * (porLinha - 1)) / porLinha}px`
  nextTick(atualizarSetas)
}

const deslizar = (direcao) => {
  const el = carrossel.value
  if (!el) return
  const estilo = getComputedStyle(el)
  const passo = el.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight) + ESPACO
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direcao * passo, behavior: reduzirMovimento ? 'auto' : 'smooth' })
}

onMounted(() => {
  medir()
  observador = new ResizeObserver(medir)
  if (carrossel.value) observador.observe(carrossel.value)
})
onBeforeUnmount(() => observador?.disconnect())

watch(praiasFiltradas, async () => {
  await nextTick()
  if (carrossel.value) carrossel.value.scrollLeft = 0
  atualizarSetas()
})

// Ao trocar a ordenação, os cards trocam de lugar mas o carrossel fica parado.
// Sem isso, o scroll snap do navegador "segue" o card que estava encaixado até a nova posição dele.
watch(ordem, async () => {
  const el = carrossel.value
  if (!el) return
  const posicao = el.scrollLeft
  el.style.scrollSnapType = 'none'
  await nextTick()
  el.scrollLeft = posicao
  requestAnimationFrame(() => {
    el.style.scrollSnapType = ''
    el.scrollLeft = posicao
    atualizarSetas()
  })
})
</script>

<template>
  <Pagina titulo="Encontre sua praia favorita">
    <div ref="areaFiltro" class="relative flex items-center gap-2" @keydown.esc="fecharPainel(true)">
      <SearchBar v-model="busca" class="min-w-0 flex-1 lg:flex-none" />

      <button
          ref="botaoFiltro"
          type="button"
          class="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[#49454F] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A4458]"
          :class="painelAberto ? 'bg-nav-ativo text-[#1D1B20]' : 'bg-[#ECE6F0]'"
          :aria-label="filtrosAtivos ? `Ordenar e filtrar (${filtrosAtivos} ativos)` : 'Ordenar e filtrar'"
          :aria-expanded="painelAberto"
          aria-controls="painel-filtros"
          @click="painelAberto = !painelAberto"
      >
        <span class="material-symbols-rounded text-2xl" aria-hidden="true">tune</span>
        <span
            v-if="filtrosAtivos"
            class="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primaria px-1 text-xs font-bold text-white"
            aria-hidden="true"
        >{{ filtrosAtivos }}</span>
      </button>

      <div
          v-if="painelAberto"
          id="painel-filtros"
          class="absolute right-0 top-full z-20 mt-2 flex w-[min(20rem,100%)] flex-col gap-4 rounded-3xl bg-white p-4 shadow-lg ring-1 ring-black/5"
          role="group"
          aria-label="Ordenar e filtrar praias"
      >
        <label class="flex flex-col gap-1 text-sm font-semibold text-[#49454F]">
          Ordenar por
          <select v-model="ordem" class="h-11 rounded-xl border border-[#79747E] bg-white px-3 text-base font-normal text-[#1D1B20] focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria">
            <option v-for="opcao in ORDENACOES" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-sm font-semibold text-[#49454F]">
          Região
          <select v-model="regiao" class="h-11 rounded-xl border border-[#79747E] bg-white px-3 text-base font-normal text-[#1D1B20] focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria">
            <option value="">Todas as regiões</option>
            <option v-for="opcao in REGIOES" :key="opcao" :value="opcao">{{ opcao }}</option>
          </select>
        </label>

        <fieldset class="flex flex-col gap-2">
          <legend class="mb-1 text-sm font-semibold text-[#49454F]">Infraestrutura</legend>
          <label v-for="opcao in FILTROS_INFRA" :key="opcao" class="flex items-center gap-2 text-base text-[#1D1B20]">
            <input v-model="infra" type="checkbox" :value="opcao" class="h-5 w-5 accent-primaria" />
            {{ opcao }}
          </label>
        </fieldset>

        <div class="flex items-center justify-between border-t border-black/10 pt-3">
          <button
              type="button"
              class="text-sm text-primaria hover:underline disabled:text-[#C4C4C4] disabled:no-underline"
              :disabled="!filtrosAtivos"
              @click="limparPainel"
          >Limpar</button>
          <button
              type="button"
              class="rounded-full bg-primaria px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
              @click="fecharPainel(true)"
          >Ver {{ praiasFiltradas.length }} {{ praiasFiltradas.length === 1 ? 'praia' : 'praias' }}</button>
        </div>
      </div>
    </div>

    <section class="flex flex-col gap-3" aria-roledescription="carrossel" aria-label="Praias populares">
      <header class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Popular</h2>
        <div v-if="podeVoltar || podeAvancar" class="flex items-center gap-1">
          <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full text-[#4A90E2] transition hover:bg-black/5 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria disabled:cursor-default disabled:text-[#C4C4C4] disabled:hover:bg-transparent disabled:active:scale-100"
              aria-label="Praias anteriores"
              aria-controls="carrossel-populares"
              :disabled="!podeVoltar"
              @click="deslizar(-1)"
          >
            <span class="material-symbols-rounded text-3xl" aria-hidden="true">chevron_left</span>
          </button>
          <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full text-[#4A90E2] transition hover:bg-black/5 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria disabled:cursor-default disabled:text-[#C4C4C4] disabled:hover:bg-transparent disabled:active:scale-100"
              aria-label="Próximas praias"
              aria-controls="carrossel-populares"
              :disabled="!podeAvancar"
              @click="deslizar(1)"
          >
            <span class="material-symbols-rounded text-3xl" aria-hidden="true">chevron_right</span>
          </button>
        </div>
      </header>

      <!-- Carrossel de 1 linha: vaza até a borda da página (-mx-4/px-4) e encaixa em cada card -->
      <ul
          v-show="praiasFiltradas.length"
          id="carrossel-populares"
          ref="carrossel"
          class="-mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          @scroll.passive="atualizarSetas"
      >
        <li
            v-for="praia in praiasPopulares"
            :key="praia.id"
            class="shrink-0 snap-start"
            :style="{ width: larguraCard }"
        >
          <PraiaCard
              :image="praia.image"
              :name="praia.name"
              :address="praia.address"
              :quality="praia.quality"
              :distance="praia.distance"
              v-model:favorite="praia.favorite"
              :to="{ name: 'praia', params: { id: praia.id } }"
          />
        </li>
      </ul>

      <p v-if="!praiasFiltradas.length" class="py-8 text-center text-sm text-[#79747E]">
        <template v-if="busca">Nenhuma praia encontrada para "{{ busca }}" com os filtros atuais.</template>
        <template v-else>Nenhuma praia encontrada com os filtros atuais.</template>
        <button type="button" class="mt-2 block w-full text-primaria hover:underline" @click="limparFiltros">
          Limpar filtros
        </button>
      </p>
    </section>

    <Proximas
        :beaches="praiasFiltradas"
        :limit="2"
        @more="router.push({ name: 'mapa' })"
    />
  </Pagina>
</template>
