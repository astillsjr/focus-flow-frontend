<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <input
      v-if="!multiline"
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :class="['base-input', { 'has-error': error }]"
      @input="handleInput"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    
    <textarea
      v-else
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="['base-input', 'base-textarea', { 'has-error': error }]"
      @input="handleInput"
      @blur="emit('blur')"
      @focus="emit('focus')"
    />
    
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="hint" class="hint-message">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
  multiline?: boolean
  rows?: number
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
  multiline: false,
  rows: 4,
  autocomplete: 'off'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
  focus: []
}>()

// Generate unique ID for accessibility
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333333;
}

.required-indicator {
  color: #f44336;
  margin-left: 0.25rem;
}

.base-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  color: #333333;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.base-input::placeholder {
  color: #9e9e9e;
}

.base-input:hover:not(:disabled) {
  border-color: #cccccc;
}

.base-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.base-input:disabled {
  background-color: #f5f5f5;
  color: #9e9e9e;
  cursor: not-allowed;
}

.base-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Error state */
.has-error {
  border-color: #f44336;
}

.has-error:focus {
  border-color: #f44336;
  box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  color: #f44336;
}

.hint-message {
  margin: 0;
  font-size: 0.875rem;
  color: #757575;
}
</style>

