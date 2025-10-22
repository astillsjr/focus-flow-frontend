import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Focus Flow'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    greeting: (state) => `Hello, ${state.name}!`
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    reset() {
      this.count = 0
    },
    
    setName(name: string) {
      this.name = name
    }
  }
})