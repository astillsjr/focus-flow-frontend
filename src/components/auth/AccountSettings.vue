<template>
  <DashboardLayout>
    <div class="account-settings" :style="cssVars">
      <BaseCard padding="lg" class="section">
      <h2>Change Password</h2>

      <form @submit.prevent="onChangePassword" class="form">
        <BaseInput
          v-model="oldPassword"
          label="Current password"
          type="password"
          required
          :disabled="loadingChange"
          :error="changeError"
          autocomplete="current-password"
        />
        <BaseInput
          v-model="newPassword"
          label="New password"
          type="password"
          required
          :disabled="loadingChange"
          autocomplete="new-password"
          hint="Must be at least 8 characters"
        />
        <BaseInput
          v-model="confirmPassword"
          label="Confirm new password"
          type="password"
          required
          :disabled="loadingChange"
          autocomplete="new-password"
        />

        <BaseButton type="submit" :loading="loadingChange" full-width>
          Update Password
        </BaseButton>

        <p v-if="changeSuccess" class="success">Password updated.</p>
      </form>
      </BaseCard>

      <BaseCard padding="lg" class="section danger">
      <h2>Delete Account</h2>
      <p class="danger-text">This will permanently delete your account and all associated data.</p>

      <form @submit.prevent="openDeleteConfirm" class="form">
        <BaseInput
          v-model="deletePassword"
          label="Confirm with your password"
          type="password"
          required
          :disabled="loadingDelete"
          :error="deleteError"
          autocomplete="current-password"
        />
        <BaseButton type="submit" tone="danger" :loading="loadingDelete" full-width>
          Delete Account
        </BaseButton>
      </form>
      </BaseCard>

      <BaseConfirmModal
        :isOpen="confirmOpen"
        title="Delete account"
        message="This action cannot be undone. Are you sure you want to delete your account?"
        :loading="loadingDelete"
        @confirm="onDeleteAccount"
        @cancel="onCancelDelete"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import { BaseButton, BaseCard, BaseInput, BaseConfirmModal } from '@/components/base'
import { useDesignTokens } from '@/composables/useDesignTokens'

const { cssVars } = useDesignTokens()

const router = useRouter()
const auth = useAuthStore()

// Change password form
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loadingChange = ref(false)
const changeError = ref('')
const changeSuccess = ref(false)

async function onChangePassword() {
  changeError.value = ''
  changeSuccess.value = false
  if (newPassword.value !== confirmPassword.value) {
    changeError.value = 'New passwords do not match'
    return
  }
  if (newPassword.value.length < 8) {
    changeError.value = 'Password must be at least 8 characters'
    return
  }
  loadingChange.value = true
  try {
    await auth.changePassword(oldPassword.value, newPassword.value)
    changeSuccess.value = true
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    changeError.value = e instanceof Error ? e.message : 'Failed to change password'
  } finally {
    loadingChange.value = false
  }
}

// Delete account
const deletePassword = ref('')
const loadingDelete = ref(false)
const deleteError = ref('')
const confirmOpen = ref(false)

function openDeleteConfirm() {
  deleteError.value = ''
  confirmOpen.value = true
}

async function onDeleteAccount() {
  loadingDelete.value = true
  deleteError.value = ''
  try {
    await auth.deleteAccount(deletePassword.value)
    router.push('/login')
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'Failed to delete account'
  } finally {
    loadingDelete.value = false
    deletePassword.value = ''
  }
}

function onCancelDelete() {
  if (!loadingDelete.value) {
    confirmOpen.value = false
  }
}
</script>

<style scoped>
.account-settings {
  max-width: 520px;
  margin: var(--spacing-xl) auto;
  padding: 0 var(--spacing-md);
  display: grid;
  gap: var(--spacing-lg);
}
.section h2 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
}
.form {
  display: grid;
  gap: var(--spacing-md);
}
.success {
  color: var(--color-completed);
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}
.section.danger {
  border: 1px solid var(--color-error);
  background: rgba(207, 102, 121, 0.1);
}
.danger-text {
  color: var(--color-error);
  margin: 0 0 var(--spacing-md) 0;
}
</style>


