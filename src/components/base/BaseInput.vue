<template>
  <div class="base-input-wrapper" :style="cssVars">
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
import { useDesignTokens } from '@/composables/useDesignTokens'

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

const { cssVars } = useDesignTokens()
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.required-indicator {
  color: var(--color-error);
  margin-left: var(--spacing-xs);
}

.base-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text);
  background-color: var(--color-surface-variant);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

.base-input::placeholder {
  color: var(--color-text-muted);
}

.base-input:hover:not(:disabled) {
  border-color: var(--color-border-dark);
}

.base-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.1);
}

.base-input:disabled {
  background-color: var(--color-background-muted);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.base-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Error state */
.has-error {
  border-color: var(--color-error);
}

.has-error:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(207, 102, 121, 0.1);
}

.error-message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.hint-message {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>

