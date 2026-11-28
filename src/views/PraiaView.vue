<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Pagina from '@/components/layout/pagina.vue'
import BalaoAjuda from '@/components/balaoAjuda.vue'
import ModalFoto, { registrarPrimeiraVisita } from '@/components/modalFoto.vue'
import { buscarPraia, registrarAvaliacao, type Avaliacao, type Qualidade } from '@/data/praias'

const props = defineProps<{ id: number }>()

const praia = computed(() => buscarPraia(props.id))

// Link do endereço para o Google Maps (abre em nova aba; no celular, abre o app se instalado).
const linkMaps = computed(() => {
  if (!praia.value) return ''
  const endereco = praia.value.address.replace(/n[º°]s*/gi, '')
  const busca = `${endereco}, Florianópolis - SC`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`
})

const modalFotoAberto = ref(false)
watch(
  () => props.id,
  () => {
    modalFotoAberto.value = !!praia.value && registrarPrimeiraVisita(props.id)
  },
  { immediate: true },
)

const nomeAvaliador = ref('')
const notaAvaliador = ref(5)
const dataVisita = ref(new Date().toLocaleDateString('en-CA'))
const comentarioAvaliador = ref('')
const limpezaAvaliador = ref(5)
const estruturaAvaliador = ref(5)
const aguaAvaliador = ref(5)
const mensagemAvaliacao = ref('')

const enviarAvaliacao = () => {
  if (!praia.value || !nomeAvaliador.value.trim() || !comentarioAvaliador.value.trim() || !dataVisita.value) {
    mensagemAvaliacao.value = 'Preencha seu nome, a data da visita e o comentário.'
    return
  }
  const avaliacao: Avaliacao = {
    autor: nomeAvaliador.value.trim(),
    nota: notaAvaliador.value,
    comentario: comentarioAvaliador.value.trim(),
    data: dataVisita.value,
    limpeza: limpezaAvaliador.value,
    estrutura: estruturaAvaliador.value,
    qualidadeAgua: aguaAvaliador.value,
  }
  registrarAvaliacao(praia.value.id, avaliacao)
  nomeAvaliador.value = ''
  notaAvaliador.value = 5
  comentarioAvaliador.value = ''
  mensagemAvaliacao.value = 'Sua avaliação foi registrada neste dispositivo. Obrigado!'
}

const LIMITE_ECOLI = 800

const statusMap: Record<Qualidade, { label: string; descricao: string; bg: string; text: string; icon: string }> = {
  propria: {
    label: 'Bom para banho!',
    descricao: 'A última análise ficou dentro do limite recomendado.',
    bg: 'bg-propria',
    text: 'text-propria',
    icon: 'check_circle',
  },
  impropria: {
    label: 'Evite banho',
    descricao: 'A última análise passou do limite recomendado. Evite entrar na água.',
    bg: 'bg-impropria',
    text: 'text-impropria',
    icon: 'warning',
  },
}

const formatarData = (iso: string, opcoes: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', opcoes)

const formatarNumero = (n: number, casas = 1) => n.toLocaleString('pt-BR', { maximumFractionDigits: casas })

const totalAvaliacoes = computed(() => praia.value?.distribuicaoNotas.reduce((a, b) => a + b, 0) ?? 0)

const estrelas = (nota: number) =>
  Array.from({ length: 5 }, (_, i) => (nota >= i + 1 ? 'star' : nota >= i + 0.5 ? 'star_half' : 'star_outline'))

const distribuicao = computed(() => {
  const p = praia.value
  if (!p) return []
  const max = Math.max(...p.distribuicaoNotas, 1)
  return [5, 4, 3, 2, 1].map((n) => {
    const qtd = p.distribuicaoNotas[n - 1] ?? 0
    return { estrelas: n, qtd, largura: `${(qtd / max) * 100}%` }
  })
})

const ultimaColeta = computed(() => praia.value?.coletas[0])

const coletasProprias = computed(() => praia.value?.coletas.filter((c) => c.qualidade === 'propria').length ?? 0)

const iconesInfra: Record<string, string> = {
  'Salva-vidas': 'pool',
  Estacionamento: 'local_parking',
  Restaurantes: 'restaurant',
  Banheiros: 'wc',
}
</script>

<template>
  <Pagina v-if="praia" :titulo="praia.name" voltar>
    <template #acoes>
      <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5 active:scale-90"
          :aria-label="praia.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
          :aria-pressed="praia.favorite"
          @click="praia.favorite = !praia.favorite"
      >
        <span
            class="material-symbols-rounded icone-cheio text-2xl"
            :class="praia.favorite ? 'text-[#E5484D]' : 'text-[#79747E]'"
            aria-hidden="true"
        >favorite</span>
      </button>
    </template>

    <div class="flex flex-col gap-3">
      <img
          :src="praia.image"
          :alt="`Foto de ${praia.name}`"
          class="aspect-video w-full rounded-3xl object-cover shadow-md lg:max-h-96"
      />
      <p v-if="praia.creditoFoto" class="-mt-1 text-xs text-[#79747E]">
        Foto:
        <a :href="praia.creditoFoto.url" target="_blank" rel="noopener noreferrer" class="underline">
          {{ praia.creditoFoto.autor }}
        </a>
        · {{ praia.creditoFoto.licenca }} · Wikimedia Commons
      </p>
      <button
          type="button"
          class="-mt-1 flex w-fit items-center gap-1 rounded-full text-sm font-semibold text-primaria hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
          @click="modalFotoAberto = true"
      >
        <span class="material-symbols-rounded text-lg leading-none" aria-hidden="true">add_a_photo</span>
        Enviar uma foto desta praia
      </button>
      <p class="flex items-start gap-1 text-sm text-[#79747E]">
        <span class="material-symbols-rounded icone-cheio text-lg leading-none" aria-hidden="true">location_on</span>
        <span>
          <a
              :href="linkMaps"
              target="_blank"
              rel="noopener noreferrer"
              class="underline decoration-[#79747E]/50 underline-offset-2 transition hover:text-primaria hover:decoration-primaria focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-primaria"
              :aria-label="`${praia.address}: abrir no Google Maps (nova aba)`"
          >{{ praia.address }}<span class="material-symbols-rounded ml-0.5 align-[-0.15em] !text-[0.95em] leading-none" aria-hidden="true">open_in_new</span></a>
          · {{ formatarNumero(praia.distance) }} Km de você
        </span>
      </p>
      <p class="text-base leading-relaxed">{{ praia.descricao }}</p>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="flex flex-col gap-3">
        <h2 class="text-2xl font-bold">Qualidade da água</h2>

        <div class="flex items-center gap-3 rounded-2xl p-4 text-white" :class="statusMap[praia.quality].bg">
          <span class="material-symbols-rounded icone-cheio text-4xl" aria-hidden="true">{{ statusMap[praia.quality].icon }}</span>
          <div class="flex flex-col">
            <strong class="text-lg">{{ statusMap[praia.quality].label }}</strong>
            <span class="text-sm opacity-90">{{ statusMap[praia.quality].descricao }}</span>
          </div>
        </div>

        <dl class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1 rounded-2xl bg-superficie p-3">
            <dt class="text-xs text-[#79747E]">Última análise</dt>
            <dd class="text-lg font-bold">
              {{ ultimaColeta ? formatarData(ultimaColeta.data, { day: '2-digit', month: 'short' }) : '—' }}
            </dd>
          </div>
          <div class="flex flex-col gap-1 rounded-2xl bg-superficie p-3">
            <dt class="text-xs text-[#79747E]">Temperatura da água</dt>
            <dd class="text-lg font-bold">{{ praia.temperaturaAgua }} °C</dd>
          </div>
          <BalaoAjuda class="col-span-2 flex flex-col gap-2 rounded-2xl bg-superficie p-3">
            <dt class="flex justify-between text-xs text-[#79747E]">
              <span class="flex items-center gap-1">
                <span class="italic">E. coli</span> (NMP/100 mL)
                <span class="material-symbols-rounded text-base leading-none" aria-hidden="true">info</span>
              </span>
              <span>limite {{ LIMITE_ECOLI }}</span>
            </dt>

            <template #conteudo>
              <strong class="text-base">O que é <span class="italic">E. coli</span>?</strong>
              <p>
                A <span class="italic">Escherichia coli</span> é uma bactéria que vive no intestino de pessoas e animais.
                Quando aparece na água do mar, é sinal de contaminação por <strong>esgoto</strong> — por isso é usada
                para avaliar se a praia está boa para banho.
              </p>
              <p>
                <strong>NMP/100 mL</strong> é o Número Mais Provável de bactérias em 100 mL de água. Quanto menor,
                melhor.
              </p>
              <p>
                Até <strong>{{ LIMITE_ECOLI }}</strong> é considerado satisfatório pela Resolução CONAMA 274/2000.
                Acima disso, o banho pode causar diarreia e infecções de pele, olhos e ouvidos.
              </p>
            </template>
            <dd v-if="ultimaColeta" class="flex flex-col gap-1">
              <span class="text-lg font-bold" :class="statusMap[ultimaColeta.qualidade].text">
                {{ ultimaColeta.eColi.toLocaleString('pt-BR') }}
              </span>
              <!-- Barra: posição do valor em relação ao limite -->
              <div class="relative h-2 overflow-hidden rounded-full bg-black/10">
                <div
                    class="h-full rounded-full"
                    :class="statusMap[ultimaColeta.qualidade].bg"
                    :style="{ width: `${Math.min(ultimaColeta.eColi / (LIMITE_ECOLI * 2), 1) * 100}%` }"
                />
                <div class="absolute inset-y-0 left-1/2 w-0.5 bg-[#1D1B20]/50" title="Limite" />
              </div>
            </dd>
          </BalaoAjuda>
          <div class="col-span-2 flex flex-col gap-1 rounded-2xl bg-superficie p-3">
            <dt class="text-xs text-[#79747E]">Ponto de coleta</dt>
            <dd class="text-sm font-semibold">{{ praia.pontoColeta }}</dd>
          </div>
        </dl>

        <!-- Histórico -->
        <div class="flex flex-col gap-2">
          <h3 class="text-base font-bold">
            Últimas coletas
            <span class="font-normal text-[#79747E]">· {{ coletasProprias }} de {{ praia.coletas.length }} próprias</span>
          </h3>
          <ol class="grid grid-cols-5 gap-2">
            <li
                v-for="coleta in [...praia.coletas].reverse()"
                :key="coleta.data"
                class="flex flex-col items-center gap-1"
            >
              <span
                  class="flex h-9 w-full items-center justify-center rounded-xl text-white"
                  :class="statusMap[coleta.qualidade].bg"
                  :title="`${statusMap[coleta.qualidade].label} · E. coli ${coleta.eColi}`"
              >
                <span class="material-symbols-rounded icone-cheio text-xl" aria-hidden="true">
                  {{ coleta.qualidade === 'propria' ? 'check' : 'close' }}
                </span>
                <span class="sr-only">{{ statusMap[coleta.qualidade].label }}</span>
              </span>
              <span class="text-xs text-[#79747E]">{{ formatarData(coleta.data) }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- Avaliações -->
      <section class="flex flex-col gap-3">
        <h2 class="text-2xl font-bold">Avaliações</h2>

        <div class="flex items-center gap-5 rounded-2xl bg-superficie p-4">
          <div class="flex shrink-0 flex-col items-center gap-1">
            <span class="text-5xl font-bold leading-none">{{ formatarNumero(praia.nota) }}</span>
            <span class="flex text-amber-500" :aria-label="`Nota ${formatarNumero(praia.nota)} de 5`">
              <span
                  v-for="(icone, i) in estrelas(praia.nota)"
                  :key="i"
                  class="material-symbols-rounded text-lg leading-none"
                  :class="{ 'icone-cheio': icone !== 'star_outline' }"
                  aria-hidden="true"
              >{{ icone === 'star_outline' ? 'star' : icone }}</span>
            </span>
            <span class="text-xs text-[#79747E]">{{ totalAvaliacoes }} avaliações</span>
          </div>

          <ul class="flex flex-1 flex-col gap-1" aria-label="Distribuição das notas">
            <li v-for="linha in distribuicao" :key="linha.estrelas" class="flex items-center gap-2 text-xs">
              <span class="w-2 text-[#79747E]">{{ linha.estrelas }}</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-black/10">
                <div class="h-full rounded-full bg-amber-500" :style="{ width: linha.largura }" />
              </div>
              <span class="w-6 text-right text-[#79747E]">{{ linha.qtd }}</span>
            </li>
          </ul>
        </div>

        <form class="flex flex-col gap-3 rounded-2xl border border-[#E7E0EC] p-4" @submit.prevent="enviarAvaliacao">
          <h3 class="text-base font-bold">Conte como foi sua visita</h3>
          <label class="flex flex-col gap-1 text-sm font-semibold">
            Seu nome
            <input v-model="nomeAvaliador" required maxlength="50" placeholder="Como devemos identificar você?" class="rounded-xl border border-[#D8D2DC] bg-white px-3 py-2 font-normal outline-none focus:border-primaria" />
          </label>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold">Sua nota geral</span>
            <div class="flex gap-1" role="group" aria-label="Escolha uma nota de 1 a 5 estrelas">
              <button v-for="n in 5" :key="n" type="button" class="text-3xl text-amber-500" :aria-label="`${n} estrelas`" :aria-pressed="notaAvaliador === n" @click="notaAvaliador = n">
                <span class="material-symbols-rounded" :class="{ 'icone-cheio': notaAvaliador >= n }">{{ notaAvaliador >= n ? 'star' : 'star_outline' }}</span>
              </button>
              <span class="self-center text-sm text-[#79747E]">{{ notaAvaliador }}/5</span>
            </div>
          </div>
          <label class="flex flex-col gap-1 text-sm font-semibold">
            Data da visita
            <input v-model="dataVisita" type="date" required :max="new Date().toLocaleDateString('en-CA')" class="rounded-xl border border-[#D8D2DC] bg-white px-3 py-2 font-normal outline-none focus:border-primaria" />
          </label>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label class="flex flex-col gap-1 text-sm font-semibold">Limpeza
              <select v-model.number="limpezaAvaliador" class="rounded-xl border border-[#D8D2DC] bg-white px-2 py-2 font-normal">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} / 5</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm font-semibold">Estrutura
              <select v-model.number="estruturaAvaliador" class="rounded-xl border border-[#D8D2DC] bg-white px-2 py-2 font-normal">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} / 5</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm font-semibold">Qualidade percebida da água
              <select v-model.number="aguaAvaliador" class="rounded-xl border border-[#D8D2DC] bg-white px-2 py-2 font-normal">
                <option v-for="n in 5" :key="n" :value="n">{{ n }} / 5</option>
              </select>
            </label>
          </div>
          <label class="flex flex-col gap-1 text-sm font-semibold">
            Comentário
            <textarea v-model="comentarioAvaliador" required maxlength="500" rows="3" placeholder="O que você achou da praia?" class="resize-y rounded-xl border border-[#D8D2DC] bg-white px-3 py-2 font-normal outline-none focus:border-primaria"></textarea>
          </label>
          <p v-if="mensagemAvaliacao" class="text-sm text-[#397A35]" role="status">{{ mensagemAvaliacao }}</p>
          <button type="submit" class="rounded-xl bg-primaria px-4 py-3 font-bold text-white transition hover:opacity-90">Enviar avaliação</button>
          <p class="text-xs text-[#79747E]">As avaliações enviadas neste protótipo ficam salvas apenas neste navegador. A nota de balneabilidade oficial é apresentada separadamente.</p>
        </form>

        <ul class="flex flex-col gap-3">
          <li
              v-for="avaliacao in praia.avaliacoes"
              :key="avaliacao.autor + avaliacao.data"
              class="flex flex-col gap-1 rounded-2xl border border-[#E7E0EC] p-3"
          >
            <div class="flex items-center justify-between gap-2">
              <strong class="text-sm">{{ avaliacao.autor }}</strong>
              <span class="text-xs text-[#79747E]">{{ formatarData(avaliacao.data) }}</span>
            </div>
            <span class="flex text-amber-500" :aria-label="`Nota ${avaliacao.nota} de 5`">
              <span
                  v-for="(icone, i) in estrelas(avaliacao.nota)"
                  :key="i"
                  class="material-symbols-rounded text-base leading-none"
                  :class="{ 'icone-cheio': icone !== 'star_outline' }"
                  aria-hidden="true"
              >{{ icone === 'star_outline' ? 'star' : icone }}</span>
            </span>
            <p class="text-sm">{{ avaliacao.comentario }}</p>
            <p v-if="avaliacao.limpeza || avaliacao.estrutura || avaliacao.qualidadeAgua" class="text-xs text-[#79747E]">
              Limpeza: {{ avaliacao.limpeza ?? '—' }}/5 · Estrutura: {{ avaliacao.estrutura ?? '—' }}/5 · Água percebida: {{ avaliacao.qualidadeAgua ?? '—' }}/5
            </p>
          </li>
        </ul>
      </section>
    </div>


    <ModalFoto v-model="modalFotoAberto" :praia-id="praia.id" :praia-nome="praia.name" />
  </Pagina>

  <Pagina v-else titulo="Praia não encontrada" voltar>
    <p class="text-sm text-[#79747E]">Não encontramos essa praia. Ela pode ter sido removida.</p>
    <RouterLink :to="{ name: 'inicio' }" class="text-primaria hover:underline">Voltar ao início</RouterLink>
  </Pagina>
</template>
