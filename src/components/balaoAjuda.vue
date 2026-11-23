<script setup lang="ts">

import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    larguraMax?: number
  }>(),
  { larguraMax: 380 },
)

const MARGEM = 12
const DISTANCIA = 10

const id = useId()
const alvo = ref<HTMLElement | null>(null)
const balao = ref<HTMLElement | null>(null)
const seta = ref<HTMLElement | null>(null)

const fixo = ref(false)
const hover = ref(false)
const aberto = computed(() => fixo.value || hover.value)

const limitar = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

function posicionar() {
  const a = alvo.value
  const b = balao.value
  const s = seta.value
  if (!a || !b || !s) return

  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const r = a.getBoundingClientRect()

  const largura = Math.min(props.larguraMax, vw - MARGEM * 2)
  b.style.width = `${largura}px`
  b.style.maxHeight = 'none'
  const alturaNatural = b.scrollHeight

  const espacoCima = r.top - DISTANCIA - MARGEM
  const espacoBaixo = vh - r.bottom - DISTANCIA - MARGEM
  const lado =
    alturaNatural <= espacoCima ? 'cima'
    : alturaNatural <= espacoBaixo ? 'baixo'
    : espacoCima >= espacoBaixo ? 'cima' : 'baixo'

  const espaco = lado === 'cima' ? espacoCima : espacoBaixo
  const alturaMax = Math.max(espaco, Math.min(alturaNatural, vh - MARGEM * 2))
  const altura = Math.min(alturaNatural, alturaMax)
  b.style.maxHeight = `${alturaMax}px`

  const left = limitar(r.left, MARGEM, vw - largura - MARGEM)
  const top = limitar(lado === 'cima' ? r.top - DISTANCIA - altura : r.bottom + DISTANCIA, MARGEM, vh - altura - MARGEM)
  b.style.left = `${left}px`
  b.style.top = `${top}px`

  s.style.top = lado === 'cima' ? `${top + altura - 6}px` : `${top - 6}px`
  s.style.left = `${left + limitar(r.left + 24 - left, 16, largura - 28)}px`
  s.style.display = r.bottom < 0 || r.top > vh ? 'none' : ''
}

const aoClicarFora = (e: PointerEvent) => {
  const t = e.target as Node
  if (!alvo.value?.contains(t) && !balao.value?.contains(t)) fixo.value = false
}
const aoTeclar = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    fixo.value = false
    hover.value = false
  }
}

function ligarEventos() {
  window.addEventListener('scroll', posicionar, { capture: true, passive: true })
  window.addEventListener('resize', posicionar)
  document.addEventListener('pointerdown', aoClicarFora)
  document.addEventListener('keydown', aoTeclar)
}
function desligarEventos() {
  window.removeEventListener('scroll', posicionar, { capture: true })
  window.removeEventListener('resize', posicionar)
  document.removeEventListener('pointerdown', aoClicarFora)
  document.removeEventListener('keydown', aoTeclar)
}

watch(aberto, async (v) => {
  if (v) {
    await nextTick()
    posicionar()
    ligarEventos()
  } else {
    desligarEventos()
  }
})
onBeforeUnmount(desligarEventos)

const entrar = (e: PointerEvent) => { if (e.pointerType === 'mouse') hover.value = true }
const sair = (e: PointerEvent) => { if (e.pointerType === 'mouse') hover.value = false }
const alternar = () => {
  fixo.value = !fixo.value
  if (!fixo.value) hover.value = false
}
</script>

<template>
  <div
      ref="alvo"
      role="button"
      tabindex="0"
      class="cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
      :aria-expanded="aberto"
      :aria-describedby="aberto ? id : undefined"
      @pointerenter="entrar"
      @pointerleave="sair"
      @click="alternar"
      @keydown.enter.prevent="alternar"
      @keydown.space.prevent="alternar"
  >
    <slot />

    <Teleport to="body">
      <Transition
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
          enter-active-class="transition-opacity duration-150"
          leave-active-class="transition-opacity duration-150"
      >
        <div v-if="aberto" class="pointer-events-none fixed inset-0 z-50">
          <div
              :id="id"
              ref="balao"
              role="tooltip"
              class="pointer-events-auto fixed top-0 left-0 flex flex-col gap-2 overflow-y-auto overscroll-contain rounded-2xl bg-[#1D1B20] p-4 text-sm leading-relaxed text-white shadow-lg"
          >
            <slot name="conteudo" />
          </div>
          <span ref="seta" class="fixed h-3 w-3 rotate-45 bg-[#1D1B20]" aria-hidden="true" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
