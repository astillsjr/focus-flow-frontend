<template>
  <div class="about">
    <div class="container">
      <div class="card">
        <h1>About Focus Flow</h1>
        <p class="mb-3">
          Focus Flow is a modern productivity application built with Vue.js 3, TypeScript, and Vite. 
          It's designed to help you maintain focus and improve your productivity through structured 
          work sessions and comprehensive analytics.
        </p>
        
        <h2>Technology Stack</h2>
        <ul class="tech-list">
          <li><strong>Vue.js 3</strong> - Progressive JavaScript framework</li>
          <li><strong>TypeScript</strong> - Type-safe JavaScript development</li>
          <li><strong>Vite</strong> - Fast build tool and development server</li>
          <li><strong>Vue Router</strong> - Official router for Vue.js</li>
          <li><strong>Pinia</strong> - State management for Vue</li>
        </ul>
        
        <h2>Features</h2>
        <ul class="features-list">
          <li>🎯 Pomodoro-style focus sessions</li>
          <li>📊 Productivity analytics and insights</li>
          <li>🎵 Ambient sound integration</li>
          <li>📱 Responsive design for all devices</li>
          <li>🌙 Dark mode support</li>
          <li>⚡ Lightning-fast performance</li>
        </ul>
        
        <div class="cta">
          <router-link to="/" class="btn">Get Started</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page component
</script>

<style scoped>
.about {
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
}

.tech-list,
.features-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.tech-list li,
.features-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.tech-list li:last-child,
.features-list li:last-child {
  border-bottom: none;
}

.cta {
  text-align: center;
  margin-top: 2rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

h2 {
  color: #34495e;
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
}
</style>