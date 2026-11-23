<script setup>
defineProps({
  placeholder: { type: String, default: 'Pesquisar praia' },
})

const query = defineModel({ type: String, default: '' })

const iconStyle = {
  fontFamily: "'Material Symbols Rounded'",
  fontFeatureSettings: "'liga'",
  fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
}
</script>

<template>
  <label
      class="flex h-14  md:w-full lg:w-100 items-center gap-3 rounded-full bg-[#ECE6F0] px-4 transition
           focus-within:ring-2 focus-within:ring-[#4A4458]"
  >
    <span class="text-2xl leading-none text-[#49454F]" :style="iconStyle" aria-hidden="true">search</span>

    <input
        v-model="query"
        type="search"
        class="h-full flex-1 bg-transparent text-base text-[#1D1B20]
             focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        :placeholder="placeholder"
        :aria-label="placeholder"
    />

    <!-- Limpar -->
    <button
        v-if="query"
        type="button"
        class="text-2xl leading-none text-[#49454F] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A4458]"
        aria-label="Limpar pesquisa"
        @click="query = ''"
    >
      <span :style="iconStyle" aria-hidden="true">close</span>
    </button>
  </label>
</template>

