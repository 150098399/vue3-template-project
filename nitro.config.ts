import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  serverDir: "server", // API 源码目录
  routeRules: {
    "/api/**": { cors: true }, // 允许跨域
  },
});
