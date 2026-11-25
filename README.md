# Balneabilidade - Florianópolis

Projeto Vue 3 + Vite.

## Executar localmente

```sh
npm install
npm run dev
```

## Funcionalidades adicionadas

- Mapa interativo com Leaflet e OpenStreetMap.
- Marcadores para as praias cadastradas em `src/data/praias.ts`.
- Acesso à página de cada praia pelo marcador ou pela lista do mapa.
- Formulário de avaliação com nota geral, data da visita, limpeza, estrutura, qualidade percebida da água e comentário.
- Novas avaliações e médias ficam salvas no `localStorage` do navegador.

## Importante sobre as avaliações

O projeto é publicado como aplicação estática. Portanto, nesta versão as avaliações ficam armazenadas somente no navegador/dispositivo em que foram enviadas. Para que todos os usuários vejam avaliações compartilhadas, será necessário conectar um serviço de backend e banco de dados (por exemplo, Supabase ou Firebase), além de implementar autenticação/moderação.

As coordenadas das praias no arquivo `src/data/praias.ts` são pontos aproximados para posicionamento dos marcadores. Ajuste latitude e longitude quando tiver os pontos oficiais de coleta/localização.
