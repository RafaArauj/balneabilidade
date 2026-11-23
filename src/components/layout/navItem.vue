<script setup lang="ts">
import { computed, type CSSProperties, type PropType } from 'vue'

const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, default: '' },
  active: { type: Boolean, default: false },
  variant: { type: String as PropType<'outlined' | 'rounded' | 'sharp'>, default: 'rounded' },
  filled: { type: Boolean, default: true },

  indicatorClass: { type: String, default: 'bg-nav-ativo' },
  iconClass:      { type: String, default: 'text-nav-ativo' },

  inactiveIndicatorClass: { type: String, default: 'bg-transparent' },
  inactiveIconClass:      { type: String, default: 'text-nav-ativo' },

  circleClass: { type: String, default: 'bg-[#4A4458]' },
  labelClass:  { type: String, default: 'text-[#49454F]' },
})

defineEmits(['click'])

const fontFamilies = {
  outlined: 'Material Symbols Outlined',
  rounded: 'Material Symbols Rounded',
  sharp: 'Material Symbols Sharp',
}

const iconStyle = computed<CSSProperties>(() => ({
  fontFamily: `'${fontFamilies[props.variant] ?? fontFamilies.rounded}'`,
  fontFeatureSettings: "'liga'",
  WebkitFontFeatureSettings: "'liga'",
  fontVariationSettings: `'FILL' ${props.filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 20`,
  wordWrap: 'normal',
  direction: 'ltr',
}))
</script>
<template>
  <button
      type="button"
      class="group inline-flex flex-col items-center gap-1 bg-transparent p-0 cursor-pointer focus:outline-none"
      :aria-current="active ? 'page' : undefined"
      @click="$emit('click', $event)"
  >
    <span
        class="flex h-8 w-16 items-center justify-center rounded-full transition
             group-hover:brightness-95 group-active:scale-95
             group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-focus-visible:ring-[#4A4458]"
        :class="active ? indicatorClass : inactiveIndicatorClass"
    >
      <span
          class="flex h-5.5 w-5.5 items-center justify-center rounded-full"
          :class="circleClass"
      >
        <span
            class="inline-block select-none whitespace-nowrap text-base font-normal not-italic leading-none normal-case tracking-normal antialiased"
            :class="active ? iconClass : inactiveIconClass"
            :style="iconStyle"
            aria-hidden="true"
        >{{ icon }}</span>
      </span>
    </span>

    <span
        class="text-xs tracking-wide"
        :class="[labelClass, active ? 'font-bold' : 'font-medium']"
    >{{ label }}</span>
  </button>
</template>

