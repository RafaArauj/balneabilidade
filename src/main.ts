import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { praias } from './data/praias'
import { carregarFotosReais } from './services/fotosPraias'

createApp(App).use(router).mount('#app')

carregarFotosReais(praias)