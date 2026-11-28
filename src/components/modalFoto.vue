<script lang="ts">
const CHAVE_VISITAS = 'balneabilidade-praias-visitadas-v1'


export const registrarPrimeiraVisita = (praiaId: number) => {
  try {
    const visitadas: number[] = JSON.parse(localStorage.getItem(CHAVE_VISITAS) ?? '[]')
    if (visitadas.includes(praiaId)) return false
    localStorage.setItem(CHAVE_VISITAS, JSON.stringify([...visitadas, praiaId]))
    return true
  } catch {
    return false
  }
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ praiaId: number; praiaNome: string }>()
const aberto = defineModel<boolean>({ default: false })

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const TAMANHO_MAXIMO_MB = 10

const dialogo = ref<HTMLDialogElement | null>(null)
const arquivo = ref<File | null>(null)
const previa = ref('')
const credito = ref('')
const autorizo = ref(false)
const erro = ref('')
const enviado = ref(false)

const podeEnviar = computed(() => !!arquivo.value && autorizo.value)

const limparPrevia = () => {
  if (previa.value) URL.revokeObjectURL(previa.value)
  previa.value = ''
}

const reiniciar = () => {
  limparPrevia()
  arquivo.value = null
  credito.value = ''
  autorizo.value = false
  erro.value = ''
  enviado.value = false
}

const sincronizar = (valor: boolean) => {
  if (valor) {
    reiniciar()
    if (dialogo.value && !dialogo.value.open) dialogo.value.showModal()
  } else if (dialogo.value?.open) {
    dialogo.value.close()
  }
}

watch(aberto, sincronizar, { flush: 'post' })
onMounted(() => sincronizar(aberto.value))

onBeforeUnmount(limparPrevia)

const fechar = () => {
  aberto.value = false
}

const escolherArquivo = (evento: Event) => {
  const entrada = evento.target as HTMLInputElement
  const escolhido = entrada.files?.[0]
  erro.value = ''
  limparPrevia()
  arquivo.value = null
  if (!escolhido) return

  if (!TIPOS_ACEITOS.includes(escolhido.type)) {
    erro.value = 'Escolha uma imagem em JPG, PNG, WEBP ou HEIC.'
    entrada.value = ''
    return
  }
  if (escolhido.size > TAMANHO_MAXIMO_MB * 1024 * 1024) {
    erro.value = `A foto tem mais de ${TAMANHO_MAXIMO_MB} MB. Escolha uma imagem menor.`
    entrada.value = ''
    return
  }
  arquivo.value = escolhido
  previa.value = URL.createObjectURL(escolhido)
}

const enviar = () => {
  if (!arquivo.value) {
    erro.value = 'Escolha uma foto para enviar.'
    return
  }
  if (!autorizo.value) {
    erro.value = 'Confirme que a foto é sua e pode ser publicada.'
    return
  }
  limparPrevia()
  enviado.value = true
}
</script>


<template>
  <dialog
      ref="dialogo"
      class="m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl bg-white p-0 text-[#1D1B20] shadow-xl backdrop:bg-black/50"
      aria-labelledby="modal-foto-titulo"
      @close="fechar"
      @click.self="fechar"
  >
    <div class="flex flex-col gap-4 p-5">
      <header class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h2 id="modal-foto-titulo" class="text-xl font-bold">
            {{ enviado ? 'Foto enviada para análise' : 'Nos ajude a enriquecer nossas fotos' }}
          </h2>
          <p v-if="!enviado" class="text-sm text-[#49454F]">
            Esteve em {{ praiaNome }}? Envie uma foto sua da praia para ajudar outros visitantes a conhecê-la.
          </p>
        </div>
        <button
            type="button"
            class="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#49454F] transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            aria-label="Fechar"
            @click="fechar"
        >
          <span class="material-symbols-rounded text-2xl leading-none" aria-hidden="true">close</span>
        </button>
      </header>

      <!-- Depois do envio -->
      <div v-if="enviado" class="flex flex-col items-center gap-3 py-2 text-center" role="status">
        <span class="flex h-14 w-14 items-center justify-center rounded-full bg-propria/15 text-propria" aria-hidden="true">
          <span class="material-symbols-rounded icone-cheio !text-[1.875rem] leading-none">hourglass_top</span>
        </span>
        <p class="text-base">
          Recebemos sua foto de {{ praiaNome }}. Ela vai passar por análise da nossa equipe e
          se aprovada, aparecerá na página da praia.
        </p>
        <button
            type="button"
            class="mt-1 rounded-full bg-primaria px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2"
            @click="fechar"
        >Entendi</button>
      </div>

      <!-- Formulário -->
      <form v-else class="flex flex-col gap-4" novalidate @submit.prevent="enviar">
        <label
            for="modal-foto-arquivo"
            class="relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-[#79747E]/60 bg-superficie text-center text-sm text-[#49454F] transition hover:border-primaria focus-within:ring-2 focus-within:ring-primaria"
        >
          <img v-if="previa" :src="previa" alt="Prévia da foto escolhida" class="absolute inset-0 h-full w-full object-cover" />
          <template v-else>
            <span class="material-symbols-rounded text-4xl leading-none text-primaria" aria-hidden="true">add_a_photo</span>
            <span class="font-semibold">Escolher foto</span>
            <span class="text-xs text-[#79747E]">JPG, PNG, WEBP ou HEIC, até {{ TAMANHO_MAXIMO_MB }} MB</span>
          </template>
          <input
              id="modal-foto-arquivo"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="escolherArquivo"
          />
        </label>
        <p v-if="arquivo" class="-mt-2 truncate text-xs text-[#79747E]">
          {{ arquivo.name }} · toque na imagem para trocar
        </p>

        <label class="flex flex-col gap-1 text-sm font-semibold text-[#49454F]" for="modal-foto-credito">
          Nome para o crédito (opcional)
          <input
              id="modal-foto-credito"
              v-model="credito"
              type="text"
              maxlength="60"
              autocomplete="name"
              placeholder="Como quer aparecer na foto"
              class="h-11 rounded-xl border border-[#79747E] px-3 text-base font-normal text-[#1D1B20] focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
          />
        </label>

        <label class="flex items-start gap-2 text-sm text-[#1D1B20]" for="modal-foto-autorizo">
          <input id="modal-foto-autorizo" v-model="autorizo" type="checkbox" class="mt-0.5 h-5 w-5 shrink-0 accent-primaria" />
          Tirei esta foto e autorizo sua publicação no Praia em dia.
        </label>

        <p v-if="erro" class="text-sm font-semibold text-impropria" role="alert">{{ erro }}</p>

        <div class="flex justify-end gap-2">
          <button
              type="button"
              class="rounded-full px-4 py-2.5 text-sm font-semibold text-primaria transition hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
              @click="fechar"
          >Agora não</button>
          <button
              type="submit"
              class="rounded-full bg-primaria px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2 aria-disabled:opacity-50"
              :aria-disabled="!podeEnviar"
          >Enviar foto</button>
        </div>
      </form>
    </div>
  </dialog>
</template>
