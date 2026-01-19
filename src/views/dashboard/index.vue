<script setup lang="ts">
import { logoutApi } from '@/api/auth'

function logout() {
  logoutApi()
}
</script>

<template>
  <div>Dashboard</div>
  <button @click="logout">
    Logout
  </button>
</template>

<style scoped></style>
