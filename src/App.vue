<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useThree } from './useThree'
const threeRef = ref()
const observerRef = ref()
const canvasRef = ref()

onMounted(() => {
  useThree(threeRef, observerRef, canvasRef)
})
</script>

<template>
  <canvas ref="canvasRef" style="width: 100%; height: 1318px" />
  <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex;">
    <div ref="threeRef" style="width: 100%; height: 100%;" />
    <!-- <div ref="observerRef" style="width: 100%; height: 100%;"></div> -->
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
