<template>
  <div class="hello">
    <h2>{{ msg }}</h2>
    <p>This is a sample component to demonstrate Vue.js functionality.</p>
    <button @click="increment" class="btn">Count: {{ count }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
defineProps<{
  msg: string
}>()

// Reactive state
const count = ref(0)

// Methods
const increment = () => {
  count.value++
}
</script>

<style scoped>
.hello {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 1rem 0;
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 1rem;
}
</style>