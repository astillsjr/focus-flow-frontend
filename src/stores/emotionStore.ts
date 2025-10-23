import { defineStore } from "pinia";

export const useEmotionStore = defineStore("emotionStore", {
  state: () => ({
    logs: [] as any[],
    stats: {} as any
  }),
  actions: {},
  getters: {}
});
