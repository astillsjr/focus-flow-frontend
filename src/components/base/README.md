# Base Components

Simple, clean, and reusable UI components built with the Focus Flow design system.

## Components

### BaseButton

A versatile button component with multiple variants and states.

**Props:**
- `type` - Button type: `'button'` | `'submit'` | `'reset'` (default: `'button'`)
- `variant` - Visual style: `'primary'` | `'secondary'` | `'danger'` | `'ghost'` (default: `'primary'`)
- `size` - Button size: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `disabled` - Disable the button (default: `false`)
- `loading` - Show loading spinner (default: `false`)
- `fullWidth` - Make button full width (default: `false`)

**Usage:**

```vue
<template>
  <!-- Primary button -->
  <BaseButton @click="handleSubmit">
    Save Changes
  </BaseButton>

  <!-- Secondary button with loading state -->
  <BaseButton variant="secondary" :loading="isLoading">
    Load More
  </BaseButton>

  <!-- Danger button -->
  <BaseButton variant="danger" @click="handleDelete">
    Delete
  </BaseButton>

  <!-- Ghost button (outline style) -->
  <BaseButton variant="ghost" @click="handleCancel">
    Cancel
  </BaseButton>

  <!-- Small submit button -->
  <BaseButton type="submit" size="sm">
    Submit
  </BaseButton>

  <!-- Full width button -->
  <BaseButton full-width>
    Continue
  </BaseButton>
</template>

<script setup lang="ts">
import { BaseButton } from '@/components/base'
</script>
```

---

### BaseCard

A simple card container with customizable padding and interactive states.

**Props:**
- `padding` - Card padding: `'none'` | `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `hoverable` - Show hover effect (default: `false`)
- `clickable` - Make card clickable with pointer cursor (default: `false`)

**Events:**
- `@click` - Emitted when card is clicked (only if `clickable` is true)

**Usage:**

```vue
<template>
  <!-- Basic card -->
  <BaseCard>
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </BaseCard>

  <!-- Card with small padding -->
  <BaseCard padding="sm">
    Compact content
  </BaseCard>

  <!-- Hoverable card -->
  <BaseCard hoverable>
    This card has a hover effect
  </BaseCard>

  <!-- Clickable card -->
  <BaseCard clickable @click="handleCardClick">
    Click me!
  </BaseCard>

  <!-- Card with no padding (for custom layouts) -->
  <BaseCard padding="none">
    <div class="custom-layout">Content</div>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard } from '@/components/base'

function handleCardClick() {
  console.log('Card clicked!')
}
</script>
```

---

### BaseInput

A standardized input component for text, textarea, and various input types.

**Props:**
- `modelValue` - Input value (v-model)
- `label` - Input label text
- `type` - Input type: `'text'` | `'email'` | `'password'` | `'number'` | `'tel'` | `'url'` | `'date'` (default: `'text'`)
- `placeholder` - Placeholder text
- `disabled` - Disable the input (default: `false`)
- `required` - Mark as required (default: `false`)
- `error` - Error message to display
- `hint` - Hint text to display (shown when no error)
- `multiline` - Render as textarea (default: `false`)
- `rows` - Number of rows for textarea (default: `4`)
- `autocomplete` - Autocomplete attribute (default: `'off'`)

**Events:**
- `@update:modelValue` - Emitted when value changes
- `@blur` - Emitted when input loses focus
- `@focus` - Emitted when input gains focus

**Usage:**

```vue
<template>
  <!-- Basic text input -->
  <BaseInput
    v-model="username"
    label="Username"
    placeholder="Enter your username"
  />

  <!-- Required email input -->
  <BaseInput
    v-model="email"
    label="Email"
    type="email"
    placeholder="you@example.com"
    required
  />

  <!-- Password input with hint -->
  <BaseInput
    v-model="password"
    label="Password"
    type="password"
    hint="Must be at least 8 characters"
  />

  <!-- Input with error -->
  <BaseInput
    v-model="taskTitle"
    label="Task Title"
    :error="titleError"
  />

  <!-- Textarea -->
  <BaseInput
    v-model="description"
    label="Description"
    placeholder="Enter description..."
    multiline
    :rows="6"
  />

  <!-- Number input -->
  <BaseInput
    v-model="amount"
    label="Bet Amount"
    type="number"
    placeholder="0"
  />

  <!-- Disabled input -->
  <BaseInput
    v-model="createdAt"
    label="Created At"
    disabled
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from '@/components/base'

const username = ref('')
const email = ref('')
const password = ref('')
const taskTitle = ref('')
const titleError = ref('Title is required')
const description = ref('')
const amount = ref(0)
const createdAt = ref('2025-10-29')
</script>
```

---

## Design Principles

### Simple and Clean
- Minimal props, maximum flexibility
- No unnecessary complexity
- Clear, semantic naming

### Consistent
- Uses design system tokens from `src/constants/design.ts`
- Follows established color palette and spacing
- Consistent behavior across all components

### Accessible
- Proper focus states
- Keyboard navigation support
- Semantic HTML
- ARIA labels where needed

### Composable
- Works well with Vue's composition API
- Easy to extend and customize
- Slots for flexible content

---

## Importing Components

### Single import:
```typescript
import { BaseButton } from '@/components/base'
```

### Multiple imports:
```typescript
import { BaseButton, BaseCard, BaseInput } from '@/components/base'
```

### Individual import:
```typescript
import BaseButton from '@/components/base/BaseButton.vue'
```

---

## Customization

### Using with Custom Styles

You can add custom classes or styles to any base component:

```vue
<template>
  <BaseCard class="my-custom-card">
    <BaseButton class="my-button">
      Custom Styled Button
    </BaseButton>
  </BaseCard>
</template>

<style scoped>
.my-custom-card {
  border: 2px solid #4CAF50;
}

.my-button {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
```

### Extending Components

Create specialized components by composing base components:

```vue
<!-- components/SubmitButton.vue -->
<template>
  <BaseButton type="submit" variant="primary" v-bind="$attrs">
    <slot />
  </BaseButton>
</template>

<script setup lang="ts">
import { BaseButton } from '@/components/base'
</script>
```

---

## Best Practices

1. **Use semantic variants**: Choose the variant that matches the action's intent
2. **Provide feedback**: Use loading states and error messages
3. **Be consistent**: Use the same components throughout the app
4. **Accessible labels**: Always provide labels for inputs
5. **Error handling**: Show clear error messages when validation fails

