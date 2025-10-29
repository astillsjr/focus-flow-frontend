<template>
  <DashboardLayout>
    <div class="demo-container">
      <h1>Base Components Demo</h1>
      <p class="subtitle">Simple, clean, and reusable UI components</p>

      <!-- Button Variants -->
      <BaseCard>
        <h2>Buttons</h2>
        
        <div class="demo-section">
          <h3>Variants</h3>
          <div class="button-row">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
          </div>
        </div>

        <div class="demo-section">
          <h3>Sizes</h3>
          <div class="button-row">
            <BaseButton size="sm">Small</BaseButton>
            <BaseButton size="md">Medium</BaseButton>
            <BaseButton size="lg">Large</BaseButton>
          </div>
        </div>

        <div class="demo-section">
          <h3>States</h3>
          <div class="button-row">
            <BaseButton :loading="isLoading" @click="toggleLoading">
              {{ isLoading ? 'Loading...' : 'Click to Load' }}
            </BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton full-width>Full Width</BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Cards -->
      <BaseCard>
        <h2>Cards</h2>
        
        <div class="demo-section">
          <h3>Padding Variants</h3>
          <div class="cards-grid">
            <BaseCard padding="sm">
              <strong>Small Padding</strong>
              <p>Compact content</p>
            </BaseCard>
            <BaseCard padding="md">
              <strong>Medium Padding</strong>
              <p>Default spacing</p>
            </BaseCard>
            <BaseCard padding="lg">
              <strong>Large Padding</strong>
              <p>Spacious layout</p>
            </BaseCard>
          </div>
        </div>

        <div class="demo-section">
          <h3>Interactive Cards</h3>
          <div class="cards-grid">
            <BaseCard hoverable>
              <strong>Hoverable Card</strong>
              <p>Hover to see effect</p>
            </BaseCard>
            <BaseCard clickable @click="handleCardClick">
              <strong>Clickable Card</strong>
              <p>Click me! ({{ clickCount }} clicks)</p>
            </BaseCard>
          </div>
        </div>
      </BaseCard>

      <!-- Form Inputs -->
      <BaseCard>
        <h2>Form Inputs</h2>
        
        <form @submit.prevent="handleSubmit" class="demo-form">
          <BaseInput
            v-model="formData.name"
            label="Name"
            placeholder="Enter your name"
            required
          />

          <BaseInput
            v-model="formData.email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            :error="emailError"
          />

          <BaseInput
            v-model="formData.password"
            label="Password"
            type="password"
            hint="Must be at least 8 characters"
            required
          />

          <BaseInput
            v-model="formData.amount"
            label="Amount"
            type="number"
            placeholder="0"
          />

          <BaseInput
            v-model="formData.description"
            label="Description"
            placeholder="Enter description..."
            multiline
            :rows="4"
          />

          <div class="form-actions">
            <BaseButton type="submit" variant="primary">
              Submit Form
            </BaseButton>
            <BaseButton type="button" variant="ghost" @click="resetForm">
              Reset
            </BaseButton>
          </div>
        </form>
      </BaseCard>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '../layout/DashboardLayout.vue'
import { BaseButton, BaseCard, BaseInput } from './index'

// Button demo state
const isLoading = ref(false)

function toggleLoading() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}

// Card demo state
const clickCount = ref(0)

function handleCardClick() {
  clickCount.value++
}

// Form demo state
const formData = ref({
  name: '',
  email: '',
  password: '',
  amount: 0,
  description: ''
})

const emailError = computed(() => {
  if (formData.value.email && !formData.value.email.includes('@')) {
    return 'Please enter a valid email address'
  }
  return ''
})

function handleSubmit() {
  console.log('Form submitted:', formData.value)
  alert('Form submitted! Check console for data.')
}

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    password: '',
    amount: 0,
    description: ''
  }
  clickCount.value = 0
}
</script>

<style scoped>
.demo-container {
  max-width: 900px;
  margin: 0 auto;
}

.subtitle {
  color: #757575;
  margin-bottom: 2rem;
}

h2 {
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
}

h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #666666;
}

.demo-section {
  margin-bottom: 2rem;
}

.demo-section:last-child {
  margin-bottom: 0;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.demo-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 0.5rem;
}

@media (max-width: 768px) {
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

