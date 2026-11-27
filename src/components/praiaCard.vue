<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, default: '' },
  quality: {
    type: String,
    default: 'propria',
    validator: (v) => ['propria', 'impropria'].includes(v),
  },
  distance: { type: Number, default: null },
  to: { type: [String, Object], default: null },
})

const favorite = defineModel('favorite', { type: Boolean, default: false })

const statusMap = {
  propria:   { label: 'Bom para banho!', class: 'bg-propria' },
  impropria: { label: 'Evite banho',     class: 'bg-impropria' },
}

const status = computed(() => statusMap[props.quality])

const formattedDistance = computed(() =>
    props.distance == null
        ? ''
        : `${props.distance.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Km`
)

const iconStyle = (filled) => ({
  fontFamily: "'Material Symbols Rounded'",
  fontFeatureSettings: "'liga'",
  fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
})
</script>

<template>
  <article
      class="relative flex aspect-[3/4] w-full flex-col justify-end overflow-hidden rounded-3xl bg-cover bg-center p-2 shadow-md transition lg:hover:-translate-y-1 lg:hover:shadow-lg"
      :style="{ backgroundImage: `url('${image}')` }"
  >
    <RouterLink
        v-if="to"
        :to="to"
        class="absolute inset-0 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primaria"
        :aria-label="`Ver detalhes de ${name}`"
    />

    <!-- Favoritar -->
    <button
        type="button"
        class="absolute right-3 top-3 z-10 leading-none transition active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
        :aria-label="favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        :aria-pressed="favorite"
        @click="favorite = !favorite"
    >
      <span
          class="text-2xl drop-shadow"
          :class="favorite ? 'text-[#E5484D]' : 'text-white'"
          :style="iconStyle(true)"
          aria-hidden="true"
      >favorite</span>
    </button>

    <div class="pointer-events-none flex flex-col gap-1.5 rounded-2xl bg-white/75 px-3 pb-1.5 pt-3 backdrop-blur-md">
      <!-- Altura fixa de 2 linhas para título e endereço: todos os cards ficam alinhados -->
      <h3 class="line-clamp-2 h-10 text-sm font-bold leading-5 text-[#1D1B20]" :title="name">{{ name }}</h3>

      <p class="flex h-[1.875rem] items-start gap-1 overflow-hidden text-xs leading-[0.9375rem] text-[#79747E]" :title="address">
        <span class="shrink-0 text-lg leading-none" :style="iconStyle(true)" aria-hidden="true">location_on</span>
        <span class="line-clamp-2">{{ address }}</span>
      </p>

      <span
          class="mx-auto mt-1 flex h-11 w-full max-w-40 items-center justify-center rounded-xl px-3 text-center text-sm font-medium leading-tight text-white"
          :class="status.class"
      >{{ status.label }}</span>

      <span class="text-center text-xs text-[#79747E]">{{ formattedDistance }}</span>
    </div>
  </article>
</template>

