# Base Components - Quick Start Guide

Simple, clean, and reusable UI components for Focus Flow.

## What's Included

Three core components to standardize your UI:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **BaseButton** | Buttons & actions | 4 variants, 3 sizes, loading states |
| **BaseCard** | Content containers | Customizable padding, hover effects |
| **BaseInput** | Form inputs | Text, textarea, validation, hints |

## Quick Start

### 1. Import Components

```vue
<script setup lang="ts">
import { BaseButton, BaseCard, BaseInput } from '@/components/base'
</script>
```

### 2. Use in Templates

```vue
<template>
  <BaseCard>
    <h2>Login</h2>
    <BaseInput v-model="username" label="Username" />
    <BaseInput v-model="password" label="Password" type="password" />
    <BaseButton type="submit" @click="login">Login</BaseButton>
  </BaseCard>
</template>
```

## Common Patterns

### Form with Validation

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput
      v-model="email"
      label="Email"
      type="email"
      required
      :error="errors.email"
    />
    
    <BaseButton type="submit" :loading="isSubmitting">
      Submit
    </BaseButton>
  </form>
</template>
```

### Card Grid

```vue
<template>
  <div class="card-grid">
    <BaseCard v-for="item in items" :key="item.id" hoverable>
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <BaseButton size="sm" @click="viewItem(item)">
        View Details
      </BaseButton>
    </BaseCard>
  </div>
</template>

<style>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
```

### Action Buttons

```vue
<template>
  <div class="actions">
    <BaseButton variant="primary" @click="save">Save</BaseButton>
    <BaseButton variant="ghost" @click="cancel">Cancel</BaseButton>
    <BaseButton variant="danger" @click="deleteItem">Delete</BaseButton>
  </div>
</template>
```

## Migration Examples

### Before (Old Code)

```vue
<template>
  <div class="my-form">
    <div class="form-group">
      <label>Task Title</label>
      <input v-model="title" type="text" />
    </div>
    
    <button @click="save" :disabled="isSaving">
      {{ isSaving ? 'Saving...' : 'Save Task' }}
    </button>
    
    <button @click="cancel">Cancel</button>
  </div>
</template>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
}

button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
}
</style>
```

### After (Using Base Components)

```vue
<template>
  <BaseCard>
    <BaseInput
      v-model="title"
      label="Task Title"
      placeholder="Enter task title"
    />
    
    <div class="actions">
      <BaseButton @click="save" :loading="isSaving">
        Save Task
      </BaseButton>
      
      <BaseButton variant="ghost" @click="cancel">
        Cancel
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseButton, BaseCard, BaseInput } from '@/components/base'
</script>

<style scoped>
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
```

**Benefits:**
- Less custom CSS
- Consistent styling
- Built-in loading states
- Better accessibility
- Easier to maintain

## Styling Tips

### Don't Override Base Styles

**Bad:**
```vue
<BaseButton class="my-button">Click</BaseButton>

<style>
.my-button {
  background-color: red !important; /* Don't do this */
}
</style>
```

**Good:**
```vue
<BaseButton variant="danger">Click</BaseButton>
```

### Use Wrapper Classes

**Good:**
```vue
<div class="button-wrapper">
  <BaseButton>Click</BaseButton>
</div>

<style>
.button-wrapper {
  padding: 1rem;
  text-align: center;
}
</style>
```

### Compose Components

**Good:**
```vue
<!-- Create specialized components -->
<template>
  <BaseCard padding="lg" hoverable>
    <slot />
    <div class="card-footer">
      <BaseButton size="sm" variant="ghost">
        <slot name="action" />
      </BaseButton>
    </div>
  </BaseCard>
</template>
```

## Component Variants

### BaseButton Variants

```vue
<BaseButton variant="primary">Primary Action</BaseButton>
<BaseButton variant="secondary">Secondary Action</BaseButton>
<BaseButton variant="danger">Destructive Action</BaseButton>
<BaseButton variant="ghost">Subtle Action</BaseButton>
```

**When to use:**
- **Primary**: Main actions (Save, Submit, Create)
- **Secondary**: Alternative actions (Load More, Refresh)
- **Danger**: Destructive actions (Delete, Remove)
- **Ghost**: Subtle actions (Cancel, Back)

### BaseButton Sizes

```vue
<BaseButton size="sm">Small</BaseButton>
<BaseButton size="md">Medium (default)</BaseButton>
<BaseButton size="lg">Large</BaseButton>
```

### BaseCard Padding

```vue
<BaseCard padding="sm">Compact</BaseCard>
<BaseCard padding="md">Default</BaseCard>
<BaseCard padding="lg">Spacious</BaseCard>
<BaseCard padding="none">No padding</BaseCard>
```


## Common Issues

### Issue: Button not showing loading state
```vue
<!-- Wrong -->
<BaseButton :loading="loading">Save</BaseButton>

<!-- Correct -->
<BaseButton :loading="isLoading">Save</BaseButton>
```
Make sure your loading variable is reactive (use `ref()` or `reactive()`)

### Issue: Input not updating
```vue
<!-- Wrong -->
<BaseInput :value="name" />

<!-- Correct -->
<BaseInput v-model="name" />
```
Use `v-model` for two-way binding

### Issue: Card not stretching
```vue
<!-- If cards aren't filling space in a grid -->
<style>
.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: stretch; /* Add this */
}
</style>
```



