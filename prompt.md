You are assisting me in implementing a Vue.js frontend for my app. 
The frontend uses:
- Vue 3 with <script setup>
- Pinia for state management
- Fetch API for backend requests
- LocalStorage to persist tokens

The backend provides betting endpoints:
- POST /api/MicroBet/initializeBettor 
- POST /api/MicroBet/placeBet 
- POST /api/MicroBet/cancelBet 
...

The app requirements:
1. When users register for the first time, a betting profile is automatically made for the user.
2. When a user makes a task, they should be given the option to place a bet on when they'll start the task.
3. When a user deletes a task, the bet for the task should be deleted if it hasn't already been resolved. 
4. When a user starts a task, the bet should be attempted to be resolved if it hasn't already been resolved.
5. When the deadline for a bet passes without the bet being completed by the user, the bet should be automatically marked a failure.
6. User should be able to see their active bets.
7. When logging out, clear Pinia store and localStorage.

Step 1: Implement Pinia betStore with state, getters, and actions 
Step 2: Implement BetForm.vue that creates bets and updates the store
Step 3: Implement BetItem.vue that creates displays an indidual bet
Step 4: Implement BetList.vue that displays the users active bets 
Step 5: Implement BetStats.vue that displays the users stats
Step 6: Implement BetDashboard.vue that integrate the stats and the list. 

Please generate the Pinia store first, fully typed, with all actions and persistence, in a format I can copy into `betStore.ts`.