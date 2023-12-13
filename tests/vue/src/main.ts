import { createPinia } from "pinia";
import { createClassApp } from "@nailyjs/vue";

import App from "./App";
import router from "./router";

const app = createClassApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
