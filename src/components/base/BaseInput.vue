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
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local'
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
  color: #FFFFFF;
}

.required-indicator {
  color: #CF6679;
  margin-left: 0.25rem;
}

.base-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  color: #FFFFFF;
  background-color: #1E1E1E;
  border: 1px solid #4D4D4D;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.base-input::placeholder {
  color: #808080;
}

.base-input:hover:not(:disabled) {
  border-color: #666666;
}

.base-input:focus {
  outline: none;
  border-color: #BB86FC;
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.base-input:disabled {
  background-color: #0F0F0F;
  color: #4D4D4D;
  cursor: not-allowed;
}

.base-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Error state */
.has-error {
  border-color: #CF6679;
}

.has-error:focus {
  border-color: #CF6679;
  box-shadow: 0 0 0 3px rgba(207, 102, 121, 0.1);
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  color: #CF6679;
}

.hint-message {
  margin: 0;
  font-size: 0.875rem;
  color: #808080;
}
</style>

