<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavItem from '@/components/layout/navItem.vue'

const router = useRouter()

const items = computed(() => router.getRoutes().filter((r) => r.meta.nav))

const CHAVE_RECOLHIDA = 'balneabilidade-nav-recolhida-v1'

const lerRecolhida = () => {
  try {
    return localStorage.getItem(CHAVE_RECOLHIDA) === '1'
  } catch {
    return false
  }
}

const recolhida = ref(lerRecolhida())

watch(recolhida, (valor) => {
  try {
    localStorage.setItem(CHAVE_RECOLHIDA, valor ? '1' : '0')
  } catch {
  }
})
</script>

<template>
  <nav
      class="w-full shrink-0 bg-nav pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]
             lg:order-first lg:flex lg:h-full lg:flex-col lg:justify-between lg:gap-6 lg:overflow-hidden lg:border-r lg:border-black/5 lg:px-3 lg:py-6
             lg:transition-[width] lg:duration-200 motion-reduce:transition-none"
      :class="recolhida ? 'lg:w-20' : 'lg:w-64'"
      aria-label="Navegação principal"
  >
    <div class="lg:flex lg:flex-col lg:gap-6">
    <RouterLink
        v-if="!recolhida"
        :to="{ name: 'inicio' }"
        class="hidden min-w-0 rounded-full pl-3 text-primaria focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A4458] lg:flex lg:items-center"
        aria-label="Praia em dia: ir para o início"
    >
      <span class="whitespace-nowrap pt-1 font-marca text-[1.7rem] font-bold leading-none" aria-hidden="true">Praia em dia</span>
    </RouterLink>

    <ul
        class="grid gap-4 lg:flex lg:flex-col lg:gap-1"
        :style="{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }"
    >
      <li v-for="item in items" :key="String(item.name)" class="flex justify-center lg:block">
        <RouterLink :to="{ name: item.name }" custom v-slot="{ isExactActive, navigate }">
          <NavItem
            :icon="item.meta.icon ?? ''"
            :label="item.meta.title ?? ''"
            :active="isExactActive"
            :compacto="recolhida"
            @click="navigate"
          />
        </RouterLink>
      </li>
    </ul>
    </div>

    <button
        type="button"
        class="hidden h-14 w-full shrink-0 items-center gap-3 rounded-full text-[#49454F] transition hover:bg-black/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A4458] lg:flex"
        :class="recolhida ? 'justify-center' : 'px-4'"
        :aria-label="recolhida ? 'Expandir menu' : 'Recolher menu'"
        :aria-expanded="!recolhida"
        :title="recolhida ? 'Expandir menu' : undefined"
        @click="recolhida = !recolhida"
    >
      <span class="material-symbols-rounded text-2xl leading-none" aria-hidden="true">
        {{ recolhida ? 'left_panel_open' : 'left_panel_close' }}
      </span>
      <span v-if="!recolhida" class="whitespace-nowrap text-sm font-medium tracking-wide">Recolher menu</span>
    </button>
  </nav>
</template>
