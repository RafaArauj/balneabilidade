<template>
  <component 
    :is="to ? RouterLink : 'article'"
    :to="to || undefined"
    class="flex items-center gap-4 rounded-2xl border border-[#E7E0EC] bg-white p-3 shadow-sm">
    <!-- Miniatura -->
    <img
        :src="image"
        :alt="name"
        class="h-16 w-16 shrink-0 rounded-xl object-cover"
        loading="lazy"
    />

    <!-- Informações -->
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <h3 class="truncate text-sm font-bold text-[#1D1B20]">{{ name }}</h3>

      <p class="flex items-center gap-1 text-xs text-[#79747E]">
        <span class="shrink-0 text-lg leading-none" :style="iconStyle" aria-hidden="true">location_on</span>
        <span class="truncate">{{ address }}</span>
      </p>

      <span class="text-sm text-[#79747E]">{{ formattedDistance }}</span>
    </div>

    <!-- Qualidade para banho -->
    <span
        class="flex h-11 w-24 shrink-0 items-center justify-center rounded-xl px-2 text-center text-sm font-medium leading-tight text-white"
        :class="status.class"
    >{{ status.label }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

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

const iconStyle = {
  fontFamily: "'Material Symbols Rounded'",
  fontFeatureSettings: "'liga'",
  fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
}
</script>