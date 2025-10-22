<template>
  <div class="bet-history">
    <div class="history-header">
      <h3>Bet History</h3>
      <div class="history-controls">
        <div class="filter-controls">
          <select v-model="statusFilter" class="filter-select">
            <option value="">All Bets</option>
            <option value="pending">Pending</option>
            <option value="success">Successful</option>
            <option value="failure">Failed</option>
          </select>
        </div>
        <button @click="refreshHistory" class="btn btn-secondary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-small"></span>
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading && bets.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading bet history...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="refreshHistory" class="btn btn-secondary">Retry</button>
    </div>

    <div v-else-if="filteredBets.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3>No bets found</h3>
      <p>{{ statusFilter ? 'No bets match your current filter.' : 'You haven\'t placed any bets yet.' }}</p>
      <button v-if="!statusFilter" @click="initializeBettor" class="btn btn-primary" :disabled="isLoading">
        Initialize Bettor
      </button>
    </div>

    <div v-else class="bets-content">
      <!-- Bet Statistics -->
      <div class="bet-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalBets }}</div>
          <div class="stat-label">Total Bets</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ successfulBets.length }}</div>
          <div class="stat-label">Successful</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ failedBets.length }}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalWagered }}</div>
          <div class="stat-label">Total Wagered</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ totalRewards }}</div>
          <div class="stat-label">Total Rewards</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ successRate }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>

      <!-- Bet List -->
      <div class="bets-list">
        <div
          v-for="bet in filteredBets"
          :key="bet._id"
          class="bet-item"
          :class="getBetItemClass(bet)"
        >
          <div class="bet-header">
            <div class="bet-info">
              <h4 class="bet-task">{{ getTaskTitle(bet.task) }}</h4>
              <div class="bet-meta">
                <span class="bet-amount">{{ bet.wager }} points</span>
                <span class="bet-deadline">{{ formatDate(bet.deadline) }}</span>
              </div>
            </div>
            <div class="bet-status">
              <span class="status-badge" :class="getStatusBadgeClass(bet)">
                {{ getStatusText(bet) }}
              </span>
            </div>
          </div>

          <div class="bet-details">
            <div class="bet-timeline">
              <div class="timeline-item">
                <span class="timeline-label">Placed:</span>
                <span class="timeline-value">{{ formatDate(bet.createdAt) }}</span>
              </div>
              <div class="timeline-item">
                <span class="timeline-label">Deadline:</span>
                <span class="timeline-value" :class="{ overdue: isOverdue(bet) }">
                  {{ formatDate(bet.deadline) }}
                </span>
              </div>
              <div v-if="bet.success !== undefined" class="timeline-item">
                <span class="timeline-label">Resolved:</span>
                <span class="timeline-value">
                  {{ bet.success ? 'Success' : 'Failed' }}
                </span>
              </div>
            </div>

            <div v-if="bet.success === true" class="bet-reward">
              <div class="reward-info">
                <span class="reward-label">Reward:</span>
                <span class="reward-value">+{{ bet.wager * 2 }} points</span>
              </div>
            </div>

            <div v-if="bet.success === false" class="bet-loss">
              <div class="loss-info">
                <span class="loss-label">Lost:</span>
                <span class="loss-value">-{{ bet.wager }} points</span>
              </div>
            </div>
          </div>

          <div class="bet-actions">
            <button
              v-if="canResolveBet(bet)"
              @click="resolveBet(bet)"
              class="btn btn-sm btn-success"
              :disabled="isLoading"
            >
              Resolve
            </button>
            <button
              v-if="canResolveExpiredBet(bet)"
              @click="resolveExpiredBet(bet)"
              class="btn btn-sm btn-warning"
              :disabled="isLoading"
            >
              Resolve Expired
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBetsStore } from '@/stores/bets'
import { useTasksStore } from '@/stores/tasks'
import type { BetDoc } from '@/types/api'

const betsStore = useBetsStore()
const tasksStore = useTasksStore()

// Local state
const statusFilter = ref<'pending' | 'success' | 'failure' | ''>('')

// Computed properties
const bets = computed(() => betsStore.bets)
const pendingBets = computed(() => betsStore.pendingBets)
const successfulBets = computed(() => betsStore.successfulBets)
const failedBets = computed(() => betsStore.failedBets)
const totalWagered = computed(() => betsStore.totalWagered)
const totalRewards = computed(() => betsStore.totalRewards)
const isLoading = computed(() => betsStore.isLoading)
const error = computed(() => betsStore.error)

const totalBets = computed(() => bets.value.length)

const successRate = computed(() => {
  if (totalBets.value === 0) return 0
  const successful = successfulBets.value.length
  const total = successful + failedBets.value.length
  return total > 0 ? Math.round((successful / total) * 100) : 0
})

const filteredBets = computed(() => {
  if (!statusFilter.value) return bets.value
  
  switch (statusFilter.value) {
    case 'pending':
      return pendingBets.value
    case 'success':
      return successfulBets.value
    case 'failure':
      return failedBets.value
    default:
      return bets.value
  }
})

// Methods
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleString()
}

const getTaskTitle = (taskId: string) => {
  const task = tasksStore.getTaskById(taskId)
  return task ? task.title : `Task ${taskId.slice(0, 8)}...`
}

const getBetItemClass = (bet: BetDoc) => {
  if (bet.success === true) return 'bet-success'
  if (bet.success === false) return 'bet-failure'
  if (isOverdue(bet)) return 'bet-overdue'
  return 'bet-pending'
}

const getStatusBadgeClass = (bet: BetDoc) => {
  if (bet.success === true) return 'status-success'
  if (bet.success === false) return 'status-failure'
  if (isOverdue(bet)) return 'status-overdue'
  return 'status-pending'
}

const getStatusText = (bet: BetDoc) => {
  if (bet.success === true) return 'Success'
  if (bet.success === false) return 'Failed'
  if (isOverdue(bet)) return 'Overdue'
  return 'Pending'
}

const isOverdue = (bet: BetDoc) => {
  return bet.success === undefined && new Date(bet.deadline) < new Date()
}

const canResolveBet = (bet: BetDoc) => {
  return bet.success === undefined && !isOverdue(bet)
}

const canResolveExpiredBet = (bet: BetDoc) => {
  return bet.success === undefined && isOverdue(bet)
}

const refreshHistory = async () => {
  await betsStore.fetchBetHistory(statusFilter.value || undefined)
}

const initializeBettor = async () => {
  await betsStore.initializeBettor()
  await refreshHistory()
}

const resolveBet = async (bet: BetDoc) => {
  await betsStore.resolveBet(bet.task)
  await refreshHistory()
}

const resolveExpiredBet = async (bet: BetDoc) => {
  await betsStore.resolveExpiredBet(bet.task)
  await refreshHistory()
}

// Watch for filter changes
watch(statusFilter, () => {
  refreshHistory()
})

// Lifecycle
onMounted(async () => {
  await refreshHistory()
})
</script>

<style scoped>
.bet-history {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 1000px;
  margin: 0 auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 1rem;
}

.history-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.history-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.bets-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.bet-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bets-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bet-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #ddd;
  transition: all 0.3s ease;
}

.bet-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.bet-item.bet-success {
  border-left-color: #28a745;
}

.bet-item.bet-failure {
  border-left-color: #dc3545;
}

.bet-item.bet-overdue {
  border-left-color: #ffc107;
  background-color: #fff8e1;
}

.bet-item.bet-pending {
  border-left-color: #007bff;
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.bet-info {
  flex: 1;
}

.bet-task {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.bet-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.bet-amount {
  font-weight: 500;
  color: #007bff;
}

.bet-deadline {
  color: #666;
}

.bet-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-success {
  background-color: #d4edda;
  color: #155724;
}

.status-failure {
  background-color: #f8d7da;
  color: #721c24;
}

.status-overdue {
  background-color: #fff3cd;
  color: #856404;
}

.bet-details {
  margin-bottom: 1rem;
}

.bet-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.timeline-label {
  color: #666;
  font-weight: 500;
}

.timeline-value {
  color: #2c3e50;
}

.timeline-value.overdue {
  color: #dc3545;
  font-weight: 500;
}

.bet-reward {
  background-color: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #c3e6cb;
}

.reward-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reward-label {
  font-weight: 500;
}

.reward-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.bet-loss {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.loss-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loss-label {
  font-weight: 500;
}

.loss-value {
  font-weight: bold;
  font-size: 1.1rem;
}

.bet-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.spinner-small {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .history-controls {
    justify-content: center;
  }
  
  .bet-stats {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .bet-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bet-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .bet-actions {
    justify-content: center;
  }
}
</style>
