You are assisting me with a Vue 3 + Pinia frontend for my FocusFlow app.

Context:
- The bet store (`useBetStore`) is already implemented with `placeBet()`, `getEmotionsForTask()`, etc.

Task:
Create a Vue 3 component named `BetForm.vue` using <script setup>.
Requirements:
1. Displays total logs, average per day, most common emotion, and recent trend with visual indicators
2. Bar chart showing all emotions logged with color coding (green for positive, red for negative, gray for neutral)
3. Side-by-side view of top 5 emotions logged before starting tasks vs after completing them
4. Handles loading, error, and empty states gracefully
5. Adapts to different screen sizes with a mobile-friendly layout
6. Color-coded trends (green for improving, red for declining, blue for stable)
7. Keep the design minimal — focus on functionality, not appearance.

Use best practices with `ref()`, `v-model`, and reactive data.
Return only the complete `BetForm.vue` file.