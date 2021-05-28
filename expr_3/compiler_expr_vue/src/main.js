import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import Vue3Mermaid from "vue3-mermaid";

const app = createApp(App)
app.use(Vue3Mermaid);
installElementPlus(app)
app.mount('#app')