import type { Praia } from '@/data/praias'

// Fotos reais das praias, servidas pela API do Wikimedia Commons (gratuita e sem chave).
const fotosCommons: Record<number, string> = {
  1: 'Pota das Canas, Florianópolis, Santa Catarina.jpg',
  2: 'Sambaqui - Isla de Florianópolis - Brasil.jpg',
  4: 'Balneário do Estreito, Florianópolis.jpg',
  6: 'Entardecer em Floripa - vista da praia da saudade.JPG',
  7: 'Praia do Meio, Coqueiros, Florianópolis.jpg',
  8: 'Formações rochosas da praia do Itaguaçu 04.JPG',
  10: 'Esculturas do mar.JPG',
  11: 'Cacupé (29212753523).jpg',
  12: 'Beira mar norte Florianópolis SC.jpg',
  13: 'Praia Santo Antônio de Lisboa 2005-12-29.jpg',
  14: 'Praia da Daniela By Mauro Soares - panoramio.jpg',
  15: 'Praia do Forte-Florianopolis-Brasil.JPG',
  16: 'Praia Jurerê - Floripa, Brasil (1).JPG',
  17: 'Praia de Jurerê Internacional.JPG',
  18: 'Canasvieiras.jpg',
  19: 'Praia Brava, Florianópolis - SC (2).JPG',
  20: 'Praia da Lagoinha - Florianópolis - SC.JPG',
  21: 'Praia dos Ingleses, Florianópolis (janeiro 2006).jpg',
  22: 'Ilha Santa Catarina 20 Praia Santinho.JPG',
  23: 'Barra da Lagoa, Florianópolis - SC (1).JPG',
  24: 'Joaquina centro.JPG',
  25: 'Praia do Campeche em Santa Catarina - Brasil.jpg',
  26: 'Vista da Lagoa da trilha de Ratones.jpg',
  27: 'Praia da Armação do Pântano do Sul.jpg',
  28: 'Floripa-Pantano-do-Sul.JPG',
  29: 'Praia Ribeirão da Ilha - Florianópolis, SC 01.jpg',
  30: 'Praia da Tapera.jpg',
  35: 'Praia da Solidão.jpg',
  36: 'Vista da praia de Canajurê.jpg',
  37: 'Mole e Galheta.jpg',
  38: 'Lagoa do Peri Canto Oeste (by Eliane Quadro).jpg',
  39: 'Praia do Moçambique (5378191021).jpg',
  40: 'Morro das Pedras, Florianópolis - Brasil - panoramio.jpg',
}

export interface CreditoFoto {
  autor: string
  licenca: string
  url: string
}

interface FotoCommons {
  imagem: string
  credito: CreditoFoto
}

const API = 'https://commons.wikimedia.org/w/api.php'
const LARGURA = 960
const CHAVE_CACHE = 'balneabilidade-fotos-v1'
const VALIDADE_CACHE = 7 * 24 * 60 * 60 * 1000

const textoSemHtml = (html = '') => {
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent ?? '').replace(/\s+/g, ' ').trim()
}

const lerCache = (): Record<string, FotoCommons> | null => {
  try {
    const cache = JSON.parse(localStorage.getItem(CHAVE_CACHE) ?? 'null')
    if (cache && Date.now() - cache.salvoEm < VALIDADE_CACHE) return cache.fotos
  } catch {
    // Cache inválido: busca de novo.
  }
  return null
}

const salvarCache = (fotos: Record<string, FotoCommons>) => {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({ salvoEm: Date.now(), fotos }))
  } catch {
    // Sem armazenamento: as fotos só não ficam em cache.
  }
}

const buscarNoCommons = async (arquivos: string[]) => {
  const url = new URL(API)
  Object.entries({
    action: 'query',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: String(LARGURA),
    iiextmetadatafilter: 'Artist|LicenseShortName',
    titles: arquivos.map((a) => `File:${a}`).join('|'),
    format: 'json',
    formatversion: '2',
    origin: '*',
  }).forEach(([chave, valor]) => url.searchParams.set(chave, valor))

  const resposta = await fetch(url)
  if (!resposta.ok) throw new Error(`Commons respondeu ${resposta.status}`)
  const dados = await resposta.json()

  // A API normaliza os títulos (espaços, maiúsculas): mapeia de volta para o nome pedido.
  const original = new Map<string, string>(arquivos.map((a) => [`File:${a}`, a]))
  for (const n of dados.query?.normalized ?? []) original.set(n.to, original.get(n.from) ?? n.to)

  const fotos: Record<string, FotoCommons> = {}
  for (const pagina of dados.query?.pages ?? []) {
    const info = pagina.imageinfo?.[0]
    const arquivo = original.get(pagina.title)
    if (!info || !arquivo) continue
    fotos[arquivo] = {
      imagem: info.thumburl ?? info.url,
      credito: {
        autor: textoSemHtml(info.extmetadata?.Artist?.value) || 'Autor desconhecido',
        licenca: info.extmetadata?.LicenseShortName?.value ?? 'Wikimedia Commons',
        url: info.descriptionurl,
      },
    }
  }
  return fotos
}

export const carregarFotosReais = async (praias: Praia[]) => {
  const arquivos = [...new Set(praias.map((p) => fotosCommons[p.id]).filter((a): a is string => !!a))]
  if (!arquivos.length) return

  let fotos = lerCache()
  if (!fotos || arquivos.some((a) => !fotos![a])) {
    try {
      fotos = await buscarNoCommons(arquivos)
      salvarCache(fotos)
    } catch {
      return // Sem conexão ou API fora do ar: mantém as imagens padrão.
    }
  }

  for (const praia of praias) {
    const foto = fotos[fotosCommons[praia.id] ?? '']
    if (!foto) continue
    praia.image = foto.imagem
    praia.creditoFoto = foto.credito
  }
}
