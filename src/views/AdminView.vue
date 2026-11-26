<script setup lang="ts">
import { reactive, ref } from 'vue'
import { praias, atualizarBalneabilidade } from '../data/praias'
import type { Qualidade } from '../data/praias'

const selecionadas = reactive<Record<number, Qualidade>>({})
const mensagem = ref('')
const sucesso = ref(false)

praias.forEach((praia) => {
  selecionadas[praia.id] = praia.quality
})

const salvar = (id: number) => {
  const qualidade = selecionadas[id]

  if (!qualidade) return

  sucesso.value = atualizarBalneabilidade(id, qualidade)

  mensagem.value = sucesso.value
    ? 'Balneabilidade atualizada com sucesso!'
    : 'Não foi possível salvar a alteração.'
}
</script>

<template>
  <main class="p-5 pb-24">
    <h1 class="text-2xl font-bold mb-2">
      Painel Administrativo
    </h1>

    <p class="text-gray-500 mb-6">
      Gerencie a balneabilidade das praias.
    </p>

    <p class="text-sm text-gray-500 mb-4">
      Ambiente de demonstração — dados locais.
    </p>

    <div
      v-for="praia in praias"
      :key="praia.id"
      class="bg-white rounded-2xl shadow p-4 mb-4"
    >
      <h2 class="text-lg font-bold">
        {{ praia.name }}
      </h2>

      <p class="text-sm text-gray-500 mb-3">
        {{ praia.address }}
      </p>

      <p class="mb-3">
        Condição atual:
        <strong
          :class="praia.quality === 'propria'
            ? 'text-green-600'
            : 'text-red-600'"
        >
          {{ praia.quality === 'propria'
            ? 'Própria para banho'
            : 'Imprópria para banho' }}
        </strong>
      </p>

      <label
        :for="'qualidade-' + praia.id"
        class="block mb-2"
      >
        Nova condição:
      </label>

      <select
        :id="'qualidade-' + praia.id"
        v-model="selecionadas[praia.id]"
        class="w-full border rounded-lg p-3 mb-3"
      >
        <option value="propria">Própria</option>
        <option value="impropria">Imprópria</option>
      </select>

      <button
        class="w-full bg-blue-600 text-white rounded-lg p-3"
        @click="salvar(praia.id)"
      >
        Salvar alteração
      </button>
    </div>

    <p
      v-if="mensagem"
      role="status"
      class="font-medium"
      :class="sucesso ? 'text-green-600' : 'text-red-600'"
    >
      {{ mensagem }}
    </p>
  </main>
</template>