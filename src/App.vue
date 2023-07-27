<script setup>
import { ref } from 'vue'
import { useThree } from './useThree'
const threeRef = ref()

useThree(threeRef)
</script>

<template>
  <div ref="threeRef">
    
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
