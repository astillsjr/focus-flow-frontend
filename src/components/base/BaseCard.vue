<template>
  <div :class="['base-card', `padding-${padding}`, { hoverable, clickable }]" @click="handleClick">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  hoverable: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  background-color: #1E1E1E;
  border: 1px solid #4D4D4D;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Padding variants */
.padding-none {
  padding: 0;
}

.padding-sm {
  padding: 0.75rem;
}

.padding-md {
  padding: 1rem;
}

.padding-lg {
  padding: 1.5rem;
}

/* Hoverable */
.hoverable:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  background-color: #2A2A2A;
}

/* Clickable */
.clickable {
  cursor: pointer;
}

.clickable:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-color: #666666;
  background-color: #2A2A2A;
}

.clickable:active {
  transform: translateY(1px);
}
</style>

