<script setup lang="ts"></script>

<template>
  <div class="h-full flex flex-col overflow-auto">
    <div class="flex justify-center items-center p-4">
      <div class="text-4xl font-bold">
        LiFocus: Rising To The Top
      </div>
    </div>
    <div class="bg-background-primary flex-1 flex items-center justify-center">
      <RouterView />
    </div>
    <div class="text-xs p-4 flex justify-center items-center bg-background-secondary c-font-revert">
      @ 2025 Copyright LiFocus. All Rights Reserved. MapleWan ♥
    </div>
  </div>
</template>

<style scoped></style>
