<template>
  <div class="relative overflow-x-hidden">
    <section class="text-center px-5 pt-20 pb-12 max-w-240 mx-auto">
      <div class="animate-in" style="animation-delay: 0ms">
        <div class="inline-flex items-center gap-1.5 bg-primary/10 text-sm font-semibold px-3.5 py-1.5 rounded-full mb-8 tracking-wide">
          <span class="font-heading text-base font-bold tracking-tight">&commat;verbatims/sdk</span>
          <span class="text-xs text-muted">v0.1.0</span>
        </div>
        <h1 class="font-heading text-5xl md:text-6xl leading-tight tracking-tight mb-5 font-600">
          TypeScript SDK for the<br><span class="text-primary italic font-600">Verbatims</span> quotes API
        </h1>
      </div>
      <div class="animate-in" style="animation-delay: 100ms">
        <p class="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Browse, search, and manage quotes, authors, references, tags, and collections. Full TypeScript support with built-in pagination and rate-limit handling.
        </p>
      </div>
      <div class="animate-in flex justify-center gap-3 flex-wrap" style="animation-delay: 200ms">
        <NuxtLink to="/docs" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold no-underline hover:bg-primary-600 transition-colors">
          Get started &rarr;
        </NuxtLink>
        <a href="https://github.com/rootasjey/verbatims-sdk" target="_blank" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted no-underline hover:text-[var(--c-text)] hover:border-[var(--c-text)] transition-colors">
          GitHub &rarr;
        </a>
      </div>
    </section>

    <section class="px-5 pb-10 max-w-240 mx-auto">
      <div class="code-block max-w-160 mx-auto animate-in" style="animation-delay: 300ms">
        <div class="code-block-header">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background: #ff5f57"></span>
            <span class="w-2.5 h-2.5 rounded-full" style="background: #febc2e"></span>
            <span class="w-2.5 h-2.5 rounded-full" style="background: #28c840"></span>
            <span class="code-block-label ml-3">Installation</span>
          </div>
          <button class="copy-btn" :class="{ copied: installCopied }" @click="copyInstall">
            {{ installCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets.install, 'bash')"></div>
      </div>
    </section>

    <section class="px-5 pb-10 max-w-240 mx-auto">
      <div class="code-block max-w-160 mx-auto animate-in" style="animation-delay: 400ms">
        <div class="code-block-header">
          <span class="code-block-label">Quick start</span>
          <button class="copy-btn" :class="{ copied: quickstartCopied }" @click="copyQuickstart">
            {{ quickstartCopied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets.quickstart, 'ts')"></div>
      </div>
    </section>

    <section class="px-5 pb-20 max-w-240 mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in" style="animation-delay: 500ms">
        <div v-for="feature in features" :key="feature.title" class="p-5 bg-surface border border-border rounded-xl">
          <h3 class="font-heading text-lg font-semibold mb-2">{{ feature.title }}</h3>
          <p class="text-sm text-muted leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { snippets } from '../composables/snippets'

useHead({
  title: '@verbatims/sdk - Verbatims API TypeScript SDK',
  meta: [
    { name: 'description', content: 'TypeScript SDK for the Verbatims quotes API. Browse, search, and manage quotes, authors, references, and collections.' },
  ],
})

const installCopied = ref(false)
const quickstartCopied = ref(false)

function copyInstall() {
  navigator.clipboard.writeText(snippets.install)
  installCopied.value = true
  setTimeout(() => { installCopied.value = false }, 2000)
}

function copyQuickstart() {
  navigator.clipboard.writeText(snippets.quickstart)
  quickstartCopied.value = true
  setTimeout(() => { quickstartCopied.value = false }, 2000)
}

const features = [
  {
    title: 'Type-safe',
    description: 'Full TypeScript support with Zod runtime validation. Every API response is validated against its schema.',
  },
  {
    title: 'Paginated iteration',
    description: 'Built-in async generator for seamless pagination. Iterate through all results without worrying about pages.',
  },
  {
    title: 'Automatic retry',
    description: 'Rate-limit aware with exponential backoff retry. Handles 429 responses and network errors gracefully.',
  },
]
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.6s ease forwards;
  opacity: 0;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
