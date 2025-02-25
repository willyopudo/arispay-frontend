import { createApp } from "vue";
import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";

// Styles
import "@core/scss/template/index.scss";
import "@styles/styles.scss";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import VueCookies from "vue3-cookies";


// Create vue app
const app = createApp(App);

// Register plugins
registerPlugins(app);
app.use(Toast);
app.use(VueCookies);
// Mount vue app
app.mount("#app");
