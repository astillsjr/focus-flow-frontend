import { defineStore } from "pinia";

export const useBetStore = defineStore("betStore", {
  state: () => ({
    activeBets: [] as any[],
    expiredBets: [] as any[]
  }),
  actions: {},
  getters: {}
});
