<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const comecar = () => router.replace({ name: 'inicio' })
</script>

<template>
  <div class="h-full bg-[url(/praia-de-jurere.webp)] bg-cover bg-center text-center">
    <div class="flex h-full flex-col justify-between py-20">
      <h1 class="font-logo pt-22 text-5xl text-white">Praia em dia</h1>
      <div>
        <button
          type="button"
          class="rounded-2xl bg-blue-400 px-12 py-2 text-white transition hover:brightness-95 active:scale-95"
          @click="comecar"
        >
          Começar
        </button>
      </div>
    </div>
  </div>
</template>
