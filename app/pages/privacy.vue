<template>
  <div class="max-w-200 mx-auto px-5 pt-10 pb-20">
    <h1 class="text-3xl font-bold font-heading mb-4">Privacy Policy</h1>
    <p class="text-muted mb-4 leading-relaxed">
      This SDK does not collect, store, or transmit any personal data. It is a client-side library
      that communicates with the Verbatims API using the API key you provide.
    </p>
    <p class="text-muted mb-4 leading-relaxed">
      No analytics, telemetry, or tracking is included in the package. Your API key is used solely
      to authenticate requests to the Verbatims API and is never logged or transmitted elsewhere.
    </p>
    <p class="text-muted mb-4 leading-relaxed">
      For questions about data handling, please refer to the
      <NuxtLink to="https://verbatims.cc/privacy" class="text-primary hover:underline">Verbatims Privacy Policy</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy - @verbatims/sdk',
})
</script>
