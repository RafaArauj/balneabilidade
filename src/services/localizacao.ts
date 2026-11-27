export const ENDERECO_PADRAO = {
  descricao: 'R. Antônio Dib Mussi, 366 - Centro',
  latitude: -27.5915,
  longitude: -48.5565,
}

const FATOR_ESTRADA = 1.3

export const distanciaAteUsuario = (latitude: number, longitude: number) => {
  const rad = (graus: number) => (graus * Math.PI) / 180
  const dLat = rad(latitude - ENDERECO_PADRAO.latitude)
  const dLon = rad(longitude - ENDERECO_PADRAO.longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(ENDERECO_PADRAO.latitude)) * Math.cos(rad(latitude)) * Math.sin(dLon / 2) ** 2
  const linhaReta = 2 * 6371 * Math.asin(Math.sqrt(a))
  return Math.round(linhaReta * FATOR_ESTRADA * 10) / 10
}
