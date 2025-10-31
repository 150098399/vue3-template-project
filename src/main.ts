import { createApp } from "vue";
import App from "./App.vue";
import pinia from "./stores";
import "./assets/styles/index.scss";
const app = createApp(App);

app.use(pinia).mount("#app");

