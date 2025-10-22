<template>
  <div class="home">
    <div class="container">
      <div class="hero">
        <h1 class="hero-title">Welcome to Focus Flow</h1>
        <p class="hero-subtitle">
          A modern Vue.js application for productivity and focus management.
        </p>
        <div class="hero-actions">
          <button class="btn" @click="startFocus">Start Focus Session</button>
          <button class="btn btn-secondary" @click="viewStats">View Statistics</button>
        </div>
      </div>
      
      <div class="features">
        <h2>Features</h2>
        <div class="features-grid">
          <div class="card feature-card">
            <h3>🎯 Focus Sessions</h3>
            <p>Structured focus sessions with customizable timers and breaks.</p>
          </div>
          <div class="card feature-card">
            <h3>📊 Analytics</h3>
            <p>Track your productivity with detailed analytics and insights.</p>
          </div>
          <div class="card feature-card">
            <h3>🎵 Ambient Sounds</h3>
            <p>Enhance your focus with curated ambient soundscapes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startFocus = () => {
  // TODO: Implement focus session logic
  console.log('Starting focus session...')
}

const viewStats = () => {
  // TODO: Navigate to stats page
  console.log('Viewing statistics...')
}
</script>

<style scoped>
.home {
  min-height: calc(100vh - 80px);
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>