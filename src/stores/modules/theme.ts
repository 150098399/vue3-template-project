// src/stores/modules/theme.ts
import { defineStore } from "pinia";
import { ref } from "vue";

type Theme = "light" | "dark" | "green";

export const useThemeStore = defineStore(
  "theme",
  () => {
    const currentTheme = ref<Theme>("light"); 
    const themeList = ["light", "dark", "green"] as const;

    /* 主题切换方法 */
    const apply = (t: Theme) => {
      currentTheme.value = t;
      document.documentElement.setAttribute("data-theme", t);
    };

    const toggle = () => {
      const idx = themeList.indexOf(currentTheme.value);
      const next = themeList[(idx + 1) % themeList.length];
      if (next) {
        apply(next);
      } else {
        apply("light");
      }
    };

    /* 初始化（刷新页面后恢复） */
    const init = () => apply(currentTheme.value ?? "light");

    return { currentTheme, apply, toggle, init };
  },
  {
    persist: {
      key: "theme-store",
      storage: localStorage,
      pick: ["currentTheme"],
    },
  }
);
