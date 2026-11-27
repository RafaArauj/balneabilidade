import { reactive } from 'vue'
import type { CreditoFoto } from '@/services/fotosPraias'
import { distanciaAteUsuario } from '@/services/localizacao'

export type Qualidade = 'propria' | 'impropria'

export const REGIOES = ['Norte', 'Sul', 'Leste', 'Centro', 'Continente'] as const
export type Regiao = (typeof REGIOES)[number]

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
  creditoFoto?: CreditoFoto
  name: string
  regiao: Regiao
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

// Praias de Florianópolis do Relatório de Balneabilidade nº 55/2026 do IMA-SC (27/11/2026).
// Nome, ponto de coleta, data e condição vêm do relatório; usamos um ponto principal por praia
// (o do posto de guarda-vidas quando existe). O relatório não traz E. coli nem coordenadas:
// esses valores são estimativas. A distância vem de services/localizacao.ts.
interface DadosRelatorioIma {
  id: number
  name: string
  regiao: Regiao
  ponto: string
  local: string
  quality: Qualidade
  data: string
  latitude: number
  longitude: number
  pontosProprios: number
  pontosTotal: number
}

const estimarEColi = (id: number, qualidade: Qualidade) =>
  qualidade === 'propria' ? 60 + ((id * 53) % 400) : 1100 + ((id * 97) % 1500)

const praiaIma = (d: DadosRelatorioIma): Praia => ({
  id: d.id,
  latitude: d.latitude,
  longitude: d.longitude,
  image: img('praia-de-jurere.webp'),
  name: d.name,
  regiao: d.regiao,
  address: d.local.replace(/^Em frente à /, ''),
  quality: d.quality,
  distance: distanciaAteUsuario(d.latitude, d.longitude),
  favorite: false,
  descricao:
    d.pontosTotal > 1
      ? `Monitorada pelo IMA em ${d.pontosTotal} pontos; ${d.pontosProprios} estavam próprios para banho no relatório nº 55/2026.`
      : 'Monitorada pelo IMA em 1 ponto de coleta.',
  nota: 0,
  distribuicaoNotas: [0, 0, 0, 0, 0],
  avaliacoes: [],
  pontoColeta: `Ponto ${d.ponto} (IMA): ${d.local}`,
  temperaturaAgua: 22,
  coletas: [{ data: d.data, qualidade: d.quality, eColi: estimarEColi(d.id, d.quality) }],
  infraestrutura: d.local.includes('Guarda-Vidas') ? ['Salva-vidas'] : [],
})

export const praias = reactive<Praia[]>([
  {
    id: 1,
    latitude: -27.3949,
    longitude: -48.4268,
    image: img('praia-de-jurere.webp'),
    name: 'Ponta das Canas',
    regiao: 'Norte',
    address: 'Rua Deputado Fernando Viegas, nº103',
    quality: 'propria',
    distance: distanciaAteUsuario(-27.3949, -48.4268),
    favorite: false,
    descricao:
      'Praia de águas calmas e rasas no norte da ilha, boa para famílias com crianças e para esportes como stand-up paddle.',
    nota: 4.6,
    distribuicaoNotas: [2, 3, 8, 31, 84],
    avaliacoes: [
      { autor: 'Marina S.', nota: 5, comentario: 'Água limpa e calminha, ótima para as crianças.', data: '2026-11-15' },
      { autor: 'Carlos R.', nota: 4, comentario: 'Bonita, mas o estacionamento lota cedo.', data: '2026-11-02' },
    ],
    pontoColeta: 'Ponto 23 (IMA): Rua Deputado Fernando Viegas, nº103',
    temperaturaAgua: 22,
    coletas: [
      { data: '2026-11-25', qualidade: 'propria', eColi: 140 },
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
    name: 'Sambaqui',
    regiao: 'Norte',
    address: 'Rodovia Rafael da Rocha Pires, nº1964.',
    quality: 'propria',
    distance: distanciaAteUsuario(-27.4945, -48.5360),
    favorite: true,
    descricao:
      'Praia tranquila da baía norte, conhecida pelo pôr do sol e pelos restaurantes de frutos do mar.',
    nota: 4.1,
    distribuicaoNotas: [4, 6, 12, 25, 33],
    avaliacoes: [
      { autor: 'Ana P.', nota: 5, comentario: 'O pôr do sol mais bonito da ilha!', data: '2026-11-10' },
      { autor: 'João M.', nota: 3, comentario: 'Lugar lindo, mas a água nem sempre está boa para banho.', data: '2026-10-30' },
    ],
    pontoColeta: 'Ponto 15 (IMA): Rodovia Rafael da Rocha Pires, nº1964, próximo da Praça Macário da Rocha',
    temperaturaAgua: 21,
    coletas: [
      { data: '2026-11-23', qualidade: 'propria', eColi: 380 },
      { data: '2026-11-18', qualidade: 'impropria', eColi: 1450 },
      { data: '2026-11-11', qualidade: 'impropria', eColi: 920 },
      { data: '2026-11-04', qualidade: 'propria', eColi: 430 },
      { data: '2026-10-28', qualidade: 'propria', eColi: 300 },
      { data: '2026-10-21', qualidade: 'impropria', eColi: 980 },
    ],
    infraestrutura: ['Restaurantes', 'Estacionamento'],
  },
  praiaIma({ id: 4, name: 'Balneário', regiao: 'Continente', ponto: '02', local: 'Em frente à Rua José Cândido da Silva', quality: 'impropria', data: '2026-11-23', latitude: -27.5880, longitude: -48.5800, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 6, name: 'Saudade', regiao: 'Continente', ponto: '04', local: 'Rua Desembargador Pedro Silva, nº1768, em frente à Rua Pascoal Simone', quality: 'impropria', data: '2026-11-23', latitude: -27.6050, longitude: -48.5770, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 7, name: 'Meio', regiao: 'Continente', ponto: '05', local: 'Rua Desembargador Pedro Silva, nº702', quality: 'impropria', data: '2026-11-23', latitude: -27.5970, longitude: -48.5790, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 8, name: 'Itaguaçu', regiao: 'Continente', ponto: '06', local: 'Rua Desembargador Pedro Silva, nº3130', quality: 'propria', data: '2026-11-23', latitude: -27.6120, longitude: -48.5880, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 10, name: 'Bom Abrigo', regiao: 'Continente', ponto: '08', local: 'Em frente à Rua Theófilo Almeida', quality: 'impropria', data: '2026-11-23', latitude: -27.6095, longitude: -48.5830, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 11, name: 'Cacupé', regiao: 'Norte', ponto: '09', local: 'Estrada Haroldo Soares Glavan, em frente à Passagem A, próximo ao nº4000', quality: 'propria', data: '2026-11-23', latitude: -27.5380, longitude: -48.5200, pontosProprios: 1, pontosTotal: 2 }),
  praiaIma({ id: 12, name: 'Beira-Mar Norte', regiao: 'Centro', ponto: '11', local: 'Avenida Jornalista Rubens de Arruda Ramos, nº5197, próximo ao bolsão da CASAN', quality: 'impropria', data: '2026-11-23', latitude: -27.5800, longitude: -48.5420, pontosProprios: 0, pontosTotal: 2 }),
  praiaIma({ id: 13, name: 'Santo Antônio de Lisboa', regiao: 'Norte', ponto: '12', local: 'Rua Quinze de Novembro, em frente à Praça Roldão da Rocha Pires', quality: 'propria', data: '2026-11-23', latitude: -27.5070, longitude: -48.5200, pontosProprios: 2, pontosTotal: 2 }),
  praiaIma({ id: 14, name: 'Daniela', regiao: 'Norte', ponto: '16', local: 'Em frente à Rua dos Cactos', quality: 'propria', data: '2026-11-25', latitude: -27.4520, longitude: -48.5400, pontosProprios: 2, pontosTotal: 2 }),
  praiaIma({ id: 15, name: 'Forte', regiao: 'Norte', ponto: '17', local: 'Servidão José Cardoso de Oliveira, nº87, na entrada da praia ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-25', latitude: -27.4400, longitude: -48.5200, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 16, name: 'Jurerê', regiao: 'Norte', ponto: '18', local: 'Em frente à Rua das Moreias', quality: 'propria', data: '2026-11-25', latitude: -27.4370, longitude: -48.4970, pontosProprios: 3, pontosTotal: 4 }),
  praiaIma({ id: 17, name: 'Jurerê Internacional', regiao: 'Norte', ponto: '53', local: 'Em frente à Rua do Salmão, próximo das quadras de areia', quality: 'propria', data: '2026-11-25', latitude: -27.4330, longitude: -48.5050, pontosProprios: 2, pontosTotal: 2 }),
  praiaIma({ id: 18, name: 'Canasvieiras', regiao: 'Norte', ponto: '20', local: 'Em frente à Rua das Flores, nº618', quality: 'propria', data: '2026-11-25', latitude: -27.4270, longitude: -48.4620, pontosProprios: 6, pontosTotal: 8 }),
  praiaIma({ id: 19, name: 'Brava', regiao: 'Norte', ponto: '25', local: 'Em frente à Rua Sinésio Duarte, nº192, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-25', latitude: -27.3990, longitude: -48.4140, pontosProprios: 3, pontosTotal: 4 }),
  praiaIma({ id: 20, name: 'Lagoinha do Norte', regiao: 'Norte', ponto: '26', local: 'Estrada Jornalista Jaime de Arruda Ramos, nº416, à esquerda da saída da lagoa', quality: 'propria', data: '2026-11-25', latitude: -27.3890, longitude: -48.4240, pontosProprios: 2, pontosTotal: 2 }),
  praiaIma({ id: 21, name: 'Ingleses', regiao: 'Norte', ponto: '28', local: 'Estrada Dom João Becker, nº305, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-25', latitude: -27.4370, longitude: -48.3930, pontosProprios: 6, pontosTotal: 8 }),
  praiaIma({ id: 22, name: 'Santinho', regiao: 'Norte', ponto: '31', local: 'Em frente à Rua Raul Pereira Caldas, nº388, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-25', latitude: -27.4620, longitude: -48.3770, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 23, name: 'Barra da Lagoa', regiao: 'Leste', ponto: '88', local: 'Rua Aconchego do Mar, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-24', latitude: -27.5750, longitude: -48.4220, pontosProprios: 2, pontosTotal: 2 }),
  praiaIma({ id: 24, name: 'Joaquina', regiao: 'Leste', ponto: '33', local: 'Em frente à Avenida Prefeito Acácio Garibaldi São Thiago, nº1416, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-24', latitude: -27.6290, longitude: -48.4490, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 25, name: 'Campeche', regiao: 'Sul', ponto: '35', local: 'Em frente à Avenida Pequeno Príncipe, nº3348', quality: 'propria', data: '2026-11-24', latitude: -27.6750, longitude: -48.4800, pontosProprios: 4, pontosTotal: 5 }),
  praiaIma({ id: 26, name: 'Lagoa da Conceição', regiao: 'Leste', ponto: '41', local: 'Rua Laurindo Januário da Silveira, nº2469, ao lado do Posto de Guarda-Vidas', quality: 'impropria', data: '2026-11-24', latitude: -27.5960, longitude: -48.4690, pontosProprios: 2, pontosTotal: 8 }),
  praiaIma({ id: 27, name: 'Armação do Pântano do Sul', regiao: 'Sul', ponto: '44', local: 'Avenida Antônio Borges dos Santos, nº1772, em frente à Igreja', quality: 'propria', data: '2026-11-24', latitude: -27.7480, longitude: -48.5050, pontosProprios: 2, pontosTotal: 3 }),
  praiaIma({ id: 28, name: 'Pântano do Sul', regiao: 'Sul', ponto: '93', local: 'Em frente à Rua José Corrêa Hulse, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-24', latitude: -27.7800, longitude: -48.5080, pontosProprios: 1, pontosTotal: 2 }),
  praiaIma({ id: 29, name: 'Ribeirão da Ilha', regiao: 'Sul', ponto: '47', local: 'Rodovia Baldicero Filomeno, nº7938, próximo à Travessa Sabino da Silva', quality: 'impropria', data: '2026-11-23', latitude: -27.7280, longitude: -48.5620, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 30, name: 'Tapera', regiao: 'Sul', ponto: '48', local: 'Rua da Praia, nº356', quality: 'impropria', data: '2026-11-23', latitude: -27.6900, longitude: -48.5600, pontosProprios: 0, pontosTotal: 1 }),
  praiaIma({ id: 35, name: 'Solidão', regiao: 'Sul', ponto: '65', local: 'Rua Inério Joaquim da Silva, nº1082, à esquerda da foz do rio', quality: 'propria', data: '2026-11-24', latitude: -27.7930, longitude: -48.5300, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 36, name: 'Canajurê', regiao: 'Norte', ponto: '68', local: 'Em frente à Servidão Waldemar Medeiros, nº51', quality: 'propria', data: '2026-11-25', latitude: -27.4310, longitude: -48.4790, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 37, name: 'Mole', regiao: 'Leste', ponto: '71', local: 'Rodovia Jornalista Manoel de Menezes, nº2001, ao lado do Posto de Guarda-Vidas', quality: 'propria', data: '2026-11-24', latitude: -27.6010, longitude: -48.4330, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 38, name: 'Lagoa do Peri', regiao: 'Sul', ponto: '74', local: 'Rodovia Francisco Thomaz dos Santos, SC-406, nº3512, em frente à sede do Parque', quality: 'propria', data: '2026-11-24', latitude: -27.7290, longitude: -48.5070, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 39, name: 'Moçambique', regiao: 'Leste', ponto: '87', local: 'Rodovia João Gualberto Soares, SC-406, acesso principal à praia', quality: 'propria', data: '2026-11-24', latitude: -27.5100, longitude: -48.4050, pontosProprios: 1, pontosTotal: 1 }),
  praiaIma({ id: 40, name: 'Morro das Pedras', regiao: 'Sul', ponto: '91', local: 'Rodovia Francisco Thomaz dos Santos, SC-406, nº2089', quality: 'propria', data: '2026-11-24', latitude: -27.7150, longitude: -48.5040, pontosProprios: 1, pontosTotal: 1 }),
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