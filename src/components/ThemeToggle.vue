<template>
  <div class="btn" @click="toggle">切换</div>
</template>
<script setup lang="ts">
import { useThemeStore } from "@/stores/modules/theme";
import { createPoller } from "@/utils/poller";
import { onMounted } from "vue";
const themeStore = useThemeStore();
const toggle = () => themeStore.toggle();

const func = async () => {
  return Promise.resolve(themeStore.currentTheme);
};

onMounted(() => {
  createPoller(func, {
    interval: 1000,
    onSuccess: (data) => {
      console.log(data);
    },
  }).start();
});
</script>
<style scoped>
.btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 6px 12px;
  box-sizing: border-box;
  border-radius: 4px;
  cursor: pointer;
}
</style>
