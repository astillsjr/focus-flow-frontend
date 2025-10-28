<template>
  <div class="nudge-container">
    <TransitionGroup name="nudge" tag="div" class="nudge-list">
      <div
        v-for="nudge in nudgeStore.activeNudges"
        :key="nudge.nudgeId"
        class="nudge-card"
      >
        <div class="nudge-header">
          <div class="nudge-icon">🔔</div>
          <div class="nudge-title">Time to get started!</div>
          <button class="nudge-close" @click="dismiss(nudge.nudgeId)" aria-label="Dismiss notification">
            ×
          </button>
        </div>
        
        <div class="nudge-body">
          <h4 class="task-title">{{ nudge.taskTitle }}</h4>
          <p class="nudge-message">{{ nudge.message }}</p>
        </div>
        
        <div class="nudge-actions">
          <button class="btn-start" @click="handleStart(nudge.taskId, nudge.nudgeId)">
            Start Task
          </button>
          <button class="btn-dismiss" @click="dismiss(nudge.nudgeId)">
            Dismiss
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNudgeStore } from '../../stores/nudgeStore'
import { useTaskStore } from '../../stores/taskStore'

const nudgeStore = useNudgeStore()
const taskStore = useTaskStore()

function dismiss(nudgeId: string) {
  nudgeStore.dismissNudge(nudgeId)
}

async function handleStart(taskId: string, nudgeId: string) {
  try {
    // Mark task as started
    await taskStore.markStarted(taskId)
    
    // Dismiss the nudge
    dismiss(nudgeId)
    
    console.log('✅ Task started successfully')
  } catch (error) {
    console.error('Failed to start task:', error)
  }
}
</script>

<style scoped>
.nudge-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  pointer-events: none;
}

.nudge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nudge-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  border-left: 4px solid #4CAF50;
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nudge-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.nudge-icon {
  font-size: 24px;
  line-height: 1;
}

.nudge-title {
  flex: 1;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.nudge-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.nudge-close:hover {
  color: #333;
}

.nudge-body {
  margin-bottom: 12px;
}

.task-title {
  margin: 0 0 8px 0;
  color: #4CAF50;
  font-size: 16px;
  font-weight: 600;
}

.nudge-message {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 14px;
}

.nudge-actions {
  display: flex;
  gap: 8px;
}

.btn-start,
.btn-dismiss {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-start {
  background-color: #4CAF50;
  color: white;
}

.btn-start:hover {
  background-color: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-start:active {
  transform: translateY(0);
}

.btn-dismiss {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-dismiss:hover {
  background-color: #e0e0e0;
}

/* Transition animations */
.nudge-enter-active,
.nudge-leave-active {
  transition: all 0.3s ease;
}

.nudge-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.nudge-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.nudge-move {
  transition: transform 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .nudge-container {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .nudge-card {
    padding: 12px;
  }
}
</style>

