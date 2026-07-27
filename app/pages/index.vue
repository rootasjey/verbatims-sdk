<template>
  <div class="relative overflow-x-hidden">
    <section class="relative px-5 pt-20 pb-14 max-w-240 mx-auto text-center">
      <div class="animate-hero">
        <a
          href="https://www.npmjs.com/package/@verbatims/sdk"
          target="_blank"
          class="inline-flex items-center gap-2.5 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide no-underline border border-primary/15 bg-primary/[0.06] hover:bg-primary/15 hover:border-primary/30 transition-all"
        >
          <span class="font-mono text-xs font-bold tracking-tight">&commat;verbatims/sdk</span>
          <span class="w-1 h-1 rounded-full bg-border"></span>
          <span class="text-muted">v{{ version }}</span>
          <span class="w-1 h-1 rounded-full bg-border"></span>
          <span class="text-muted">MIT</span>
        </a>

        <h1 class="font-heading text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-4">
          TypeScript SDK for the
          <span class="text-primary italic">Verbatims</span> quotes API
        </h1>
        <p class="text-muted text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Browse, search, and manage quotes from literature, film, and music.
          Fully typed, paginated, and rate-limit-aware.
        </p>

        <div class="flex justify-center gap-3 flex-wrap">
          <NuxtLink
            to="/docs"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold no-underline hover:bg-primary-600 transition-colors shadow-sm"
          >
            Get started &rarr;
          </NuxtLink>
          <a
            href="https://github.com/rootasjey/verbatims-sdk"
            target="_blank"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted no-underline hover:text-[var(--c-text)] hover:border-[var(--c-text)] transition-colors"
          >
            GitHub &rarr;
          </a>
        </div>
      </div>
    </section>

    <div class="max-w-240 mx-auto px-5">
      <div class="border-t border-dashed border-[var(--c-border)]"></div>
    </div>

    <section class="px-5 py-14 max-w-240 mx-auto">
      <div class="max-w-160 mx-auto">
        <p class="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-5 text-center">
          Installation
        </p>
        <div class="code-block">
          <div class="code-block-header">
            <div class="flex items-center gap-1">
              <button
                v-for="pm in packageManagers"
                :key="pm.id"
                @click="pmTab = pm.id"
                class="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer"
                :class="pmTab === pm.id ? 'bg-primary/15 text-primary' : 'text-muted hover:text-[var(--c-text)]'"
              >
                {{ pm.label }}
              </button>
            </div>
            <button class="copy-btn" :class="{ copied: codeCopied }" @click="copyCode">
              {{ codeCopied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          <div v-html="$highlight(codeSnippet, 'bash')"></div>
        </div>
      </div>
    </section>

    <div class="max-w-240 mx-auto px-5">
      <div class="border-t border-dashed border-[var(--c-border)]"></div>
    </div>

    <section class="px-5 py-14 max-w-240 mx-auto">
      <p class="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-muted mb-10 text-center">
        Capabilities
      </p>
      <div class="max-w-160 mx-auto space-y-10">
        <div v-for="feature in features" :key="feature.title">
          <div class="flex items-center gap-3 mb-3">
            <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
            <h3 class="font-heading text-base font-semibold">{{ feature.title }}</h3>
          </div>
          <p class="text-sm text-muted leading-relaxed mb-4 ml-5">{{ feature.description }}</p>
          <div class="code-block">
            <div class="code-block-header">
              <span class="code-block-label">TypeScript</span>
              <button class="copy-btn" :class="{ copied: copiedFeature === feature.title }" @click="copyFeature(feature.title, feature.code)">
                {{ copiedFeature === feature.title ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <div v-html="$highlight(feature.code, 'ts')"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { version } from '../../package.json'
import { snippets } from '../composables/snippets'

useHead({
  title: '@verbatims/sdk - TypeScript SDK for the Verbatims quotes API',
  meta: [
    { name: 'description', content: 'Browse, search, and manage 10,000+ quotes from literature, film, and music — fully typed, paginated, and rate-limit-aware.' },
  ],
})

const pmTab = ref('npm')
const codeCopied = ref(false)
const copiedFeature = ref<string | null>(null)

const packageManagers = [
  { id: 'npm', label: 'npm' },
  { id: 'pnpm', label: 'pnpm' },
  { id: 'bun', label: 'bun' },
]

const installCommands: Record<string, string> = {
  npm: snippets.install,
  pnpm: 'pnpm add @verbatims/sdk',
  bun: 'bun add @verbatims/sdk',
}

const codeSnippet = computed(() => installCommands[pmTab.value])

function copyFeature(title: string, code: string) {
  navigator.clipboard.writeText(code)
  copiedFeature.value = title
  setTimeout(() => { copiedFeature.value = null }, 2000)
}

function copyCode() {
  navigator.clipboard.writeText(codeSnippet.value)
  codeCopied.value = true
  setTimeout(() => { codeCopied.value = false }, 2000)
}

const features = [
  {
    title: 'One-liner queries',
    description: 'Full TypeScript autocomplete for every filter — author, language, tag, sort, and more.',
    code: "const { data } = await vb.quotes.list({ language: 'fr', limit: 10 })",
  },
  {
    title: 'Seamless pagination',
    description: 'Async generator that iterates through all results without ever thinking about page numbers.',
    code: 'for await (const q of vb.quotes.paginate()) { ... }',
  },
  {
    title: 'Nuxt module included',
    description: 'Add the module to nuxt.config.ts and get auto-imported composables like useQuotes().',
    code: "modules: ['@verbatims/sdk/nuxt/module']",
  },
]
</script>

<style scoped>
.animate-hero {
  animation: animate-hero 0.8s ease forwards;
  opacity: 0;
}

@keyframes animate-hero {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
