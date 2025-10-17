import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import pinia from "./stores";
import "./assets/styles/index.scss";
import { useThemeStore } from "./stores/modules/theme";

const app = createApp(App);

app.use(pinia).mount("#app");

useThemeStore().init();
