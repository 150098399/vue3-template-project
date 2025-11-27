import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  msg: "Hello from Nitro",
  time: new Date().toISOString(),
}));
