import { createApp } from "vue";
import App from "./App.vue";
import pinia from "./stores";
import router from "./router";
import "./assets/styles/index.scss";
const app = createApp(App);

app.use(pinia).use(router).mount("#app");
