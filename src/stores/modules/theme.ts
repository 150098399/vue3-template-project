// src/stores/modules/theme.ts
import { defineStore } from "pinia";
import { ref, watch } from "vue";

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

    // 核心：只要 currentTheme 被插件恢复，就立即 apply
    watch(currentTheme, (val) => apply(val), { immediate: true });

    return { currentTheme, apply, toggle };
  },
  {
    persist: {
      key: "theme-store",
      storage: localStorage,
      pick: ["currentTheme"],
    },
  }
);
