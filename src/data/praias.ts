import { reactive } from 'vue'

export type Qualidade = 'propria' | 'impropria'

export interface Coleta {
  data: string
  qualidade: Qualidade
  eColi: number
}

export interface Avaliacao {
  autor: string
  nota: number
  comentario: string
  data: string
  limpeza?: number
  estrutura?: number
  qualidadeAgua?: number
}

export interface Praia {
  id: number
  latitude: number
  longitude: number
  image: string
  name: string
  address: string
  quality: Qualidade
  distance: number
  favorite: boolean
  descricao: string
  nota: number
  distribuicaoNotas: [number, number, number, number, number]
  avaliacoes: Avaliacao[]
  pontoColeta: string
  temperaturaAgua: number
  coletas: Coleta[]
  infraestrutura: string[]
}

const img = (arquivo: string) => `${import.meta.env.BASE_URL}${arquivo}`

export const praias = reactive<Praia[]>([
  {
    id: 1,
    latitude: -27.3949,
    longitude: -48.4268,
    image: img('praia-de-jurere.webp'),
    name: 'Praia Ponta das Canas',
    address: 'Rua Deputado Fernando Viegas, nº103',
    quality: 'propria',
    distance: 38,
    favorite: false,
    descricao:
      'Praia de águas calmas e rasas no norte da ilha, boa para famílias com crianças e para esportes como stand-up paddle.',
    nota: 4.6,
    distribuicaoNotas: [2, 3, 8, 31, 84],
    avaliacoes: [
      { autor: 'Marina S.', nota: 5, comentario: 'Água limpa e calminha, ótima para as crianças.', data: '2026-11-15' },
      { autor: 'Carlos R.', nota: 4, comentario: 'Bonita, mas o estacionamento lota cedo.', data: '2026-11-02' },
    ],
    pontoColeta: 'Em frente à Rua Deputado Fernando Viegas',
    temperaturaAgua: 22,
    coletas: [
      { data: '2026-11-18', qualidade: 'propria', eColi: 120 },
      { data: '2026-11-11', qualidade: 'propria', eColi: 85 },
      { data: '2026-11-04', qualidade: 'propria', eColi: 210 },
      { data: '2026-10-28', qualidade: 'impropria', eColi: 1100 },
      { data: '2026-10-21', qualidade: 'propria', eColi: 160 },
    ],
    infraestrutura: ['Salva-vidas', 'Estacionamento', 'Restaurantes', 'Banheiros'],
  },
  {
    id: 2,
    latitude: -27.4945,
    longitude: -48.5360,
    image: img('praia-de-jurere.webp'),
    name: 'Praia do Sambaqui',
    address: 'Rodovia Rafael da Rocha Pires, nº1964.',
    quality: 'impropria',
    distance: 16.5,
    favorite: true,
    descricao:
      'Praia tranquila da baía norte, conhecida pelo pôr do sol e pelos restaurantes de frutos do mar.',
    nota: 4.1,
    distribuicaoNotas: [4, 6, 12, 25, 33],
    avaliacoes: [
      { autor: 'Ana P.', nota: 5, comentario: 'O pôr do sol mais bonito da ilha!', data: '2026-11-10' },
      { autor: 'João M.', nota: 3, comentario: 'Lugar lindo, mas a água nem sempre está boa para banho.', data: '2026-10-30' },
    ],
    pontoColeta: 'Próximo ao trapiche',
    temperaturaAgua: 21,
    coletas: [
      { data: '2026-11-18', qualidade: 'impropria', eColi: 1450 },
      { data: '2026-11-11', qualidade: 'impropria', eColi: 920 },
      { data: '2026-11-04', qualidade: 'propria', eColi: 430 },
      { data: '2026-10-28', qualidade: 'propria', eColi: 300 },
      { data: '2026-10-21', qualidade: 'impropria', eColi: 980 },
    ],
    infraestrutura: ['Restaurantes', 'Estacionamento'],
  },
])

export const buscarPraia = (id: number) => praias.find((p) => p.id === id)


// As novas avaliações ficam salvas neste navegador. Para compartilhar entre
// diferentes dispositivos/usuários, será necessário conectar um backend.
const CHAVE_AVALIACOES = 'balneabilidade-avaliacoes-v1'

const atualizarResumo = (praia: Praia) => {
  const total = praia.distribuicaoNotas.reduce((soma, quantidade) => soma + quantidade, 0)
  const somaNotas = praia.distribuicaoNotas.reduce((soma, quantidade, indice) => soma + quantidade * (indice + 1), 0)
  praia.nota = total ? Number((somaNotas / total).toFixed(1)) : 0
}

const carregarAvaliacoesSalvas = () => {
  if (typeof localStorage === 'undefined') return
  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_AVALIACOES) ?? '{}') as Record<string, Avaliacao[]>
    praias.forEach((praia) => {
      const novas = salvas[String(praia.id)] ?? []
      novas.forEach((avaliacao) => {
        praia.avaliacoes.unshift(avaliacao)
 praia.distribuicaoNotas[avaliacao.nota - 1] =
  (praia.distribuicaoNotas[avaliacao.nota - 1] ?? 0) + 1
      })
      atualizarResumo(praia)
    })
  } catch {
    // Ignora dados locais inválidos sem impedir o carregamento da página.
  }
}

carregarAvaliacoesSalvas()

export const registrarAvaliacao = (praiaId: number, avaliacao: Avaliacao) => {
  const praia = buscarPraia(praiaId)
  if (!praia) return false
  praia.avaliacoes.unshift(avaliacao)
  praia.distribuicaoNotas[avaliacao.nota - 1] =
  (praia.distribuicaoNotas[avaliacao.nota - 1] ?? 0) + 1
  atualizarResumo(praia)

  try {
    const salvas = JSON.parse(localStorage.getItem(CHAVE_AVALIACOES) ?? '{}') as Record<string, Avaliacao[]>
    salvas[String(praiaId)] = [avaliacao, ...(salvas[String(praiaId)] ?? [])]
    localStorage.setItem(CHAVE_AVALIACOES, JSON.stringify(salvas))
  } catch {
    // A avaliação aparece na sessão atual mesmo se o navegador bloquear o armazenamento.
  }
  return true
}

const CHAVE_BALNEABILIDADE = 'balneabilidade-status-v1'

const carregarBalneabilidade = () => {
  try {
    const salvas = JSON.parse(
      localStorage.getItem(CHAVE_BALNEABILIDADE) ?? '{}'
    )

    praias.forEach((praia) => {
      const qualidade = salvas[String(praia.id)]

      if (qualidade === 'propria' || qualidade === 'impropria') {
        praia.quality = qualidade
      }
    })
  } catch {
    // Ignora dados locais invalidos.
  }
}

carregarBalneabilidade()
export const atualizarBalneabilidade = (
  praiaId: number,
  qualidade: Qualidade
) => {
  const praia = buscarPraia(praiaId)

  if (!praia) return false

  try {
    const salvas = JSON.parse(
      localStorage.getItem(CHAVE_BALNEABILIDADE) ?? '{}'
    )

    salvas[String(praiaId)] = qualidade

    localStorage.setItem(
      CHAVE_BALNEABILIDADE,
      JSON.stringify(salvas)
    )
  } catch {
    return false
  }

  praia.quality = qualidade

  return true
}