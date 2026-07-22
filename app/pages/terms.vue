<template>
  <div class="max-w-200 mx-auto px-5 pt-10 pb-20">
    <h1 class="text-3xl font-bold font-heading mb-4">Terms of Service</h1>
    <p class="text-muted mb-4 leading-relaxed">
      This SDK is provided under the <strong>MIT License</strong>. You are free to use, modify, and distribute
      it as part of your projects, subject to the terms of the license.
    </p>
    <p class="text-muted mb-4 leading-relaxed">
      The SDK is provided "as is", without warranty of any kind. The authors are not liable for any
      damages arising from its use.
    </p>
    <p class="text-muted mb-4 leading-relaxed">
      Usage of the Verbatims API is subject to the
      <NuxtLink to="https://verbatims.cc/terms" class="text-primary hover:underline">Verbatims Terms of Service</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Terms - @verbatims/sdk',
})
</script>
