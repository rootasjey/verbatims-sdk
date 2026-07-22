<template>
  <div class="max-w-200 mx-auto px-5 pt-10 pb-20">
    <h1 class="text-3xl font-bold font-heading mb-4">About</h1>
    <p class="text-muted mb-6 leading-relaxed">
      &commat;verbatims/sdk is a TypeScript SDK for the <NuxtLink to="https://verbatims.cc" class="text-primary hover:underline">Verbatims</NuxtLink> quotes API.
      It provides a type-safe, rate-limit-aware client for browsing, searching, and managing quotes, authors,
      references, tags, and collections.
    </p>
    <p class="text-muted mb-6 leading-relaxed">
      Built with <NuxtLink to="https://zod.dev" class="text-primary hover:underline">Zod</NuxtLink> for runtime validation,
      with full TypeScript types for the best developer experience. The package also ships an optional
      <NuxtLink to="/docs#nuxt" class="text-primary hover:underline">Nuxt 4 module</NuxtLink> for auto-imported composables.
    </p>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'About - @verbatims/sdk',
})
</script>
