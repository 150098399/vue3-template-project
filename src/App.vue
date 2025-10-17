<template>
  <div class="home">
    <h1>Vue3 + TS + Pinia + Axios 主题切换模板</h1>
    <ThemeToggle />
  </div>
</template>
<script setup lang="ts">
import ThemeToggle from "@/components/ThemeToggle.vue";
</script>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
