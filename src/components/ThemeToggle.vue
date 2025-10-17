<template>
  <div class="btn" @click="toggle">切换</div>
</template>
<script setup lang="ts">
import { useThemeStore } from "@/stores/modules/theme";
const themeStore = useThemeStore();
const toggle = () => themeStore.toggle();
</script>
<style scoped>
.btn {
  background: var(--primary);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
