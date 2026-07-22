<template>
  <div class="max-w-200 mx-auto px-5 pt-10 pb-20">
    <div class="mb-10 fade-in" style="animation-delay: 0ms">
      <h1 class="text-3xl font-bold font-heading">Documentation</h1>
      <p class="text-muted mt-1">Everything you need to get started with &commat;verbatims/sdk</p>
    </div>

    <nav class="flex gap-1 mb-10 border-b border-border fade-in flex-wrap" style="animation-delay: 100ms">
      <a v-for="s in sectionLinks" :key="s.id" :href="`#${s.id}`"
         class="text-sm px-3 py-2.5 border-b-2 transition-all no-underline -mb-[1px]"
         :class="activeSection === s.id
           ? 'border-primary text-[var(--c-text)] font-medium'
           : 'border-transparent text-muted hover:text-[var(--c-text)] hover:border-[var(--c-border)]'">#{{ s.label }}</a>
    </nav>

    <section id="installation" class="mb-12 fade-in" style="animation-delay: 150ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Installation</h2>
      <div class="code-block">
        <div class="code-block-header">
          <div class="flex gap-0">
            <button v-for="pm in packageManagers" :key="pm.id" @click="pmTab = pm.id"
              class="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-1 transition-all cursor-pointer"
              :class="pmTab === pm.id ? 'bg-primary/15 text-primary' : 'text-muted hover:text-[var(--c-text)]'">{{ pm.label }}</button>
          </div>
          <button class="copy-btn" :class="{ copied: copied === 'install' }" @click="copyCode(snippets.install)">
            {{ copied === 'install' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets.install, 'bash')"></div>
      </div>

      <p class="text-muted text-sm leading-relaxed mb-4">
        Requires Node.js 18+ and <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">zod</code> as a runtime dependency. Nuxt module is optional.
      </p>
    </section>

    <section id="usage" class="mb-12 fade-in" style="animation-delay: 200ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Usage</h2>
      <p class="text-muted mb-4 leading-relaxed">
        Create a client with your API key, then access any resource through its dedicated accessor.
      </p>

      <h3 class="text-lg font-semibold font-heading mb-3">Client setup</h3>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">TypeScript</span>
          <button class="copy-btn" :class="{ copied: copied === 'quickstart' }" @click="copyCode(snippets.quickstart)">
            {{ copied === 'quickstart' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets.quickstart, 'ts')"></div>
      </div>
    </section>

    <section id="resources" class="mb-12 fade-in" style="animation-delay: 250ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Resources</h2>
      <p class="text-muted mb-4 leading-relaxed">
        Each resource exposes methods for common CRUD operations and pagination.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse mb-8">
          <thead>
            <tr class="text-left text-xs text-muted font-semibold uppercase tracking-wider">
              <th class="p-3 border-b border-border">Resource</th>
              <th class="p-3 border-b border-border">Methods</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in resources" :key="r.name" class="text-sm">
              <td class="p-3 border-b border-border font-mono font-medium">{{ r.name }}</td>
              <td class="p-3 border-b border-border text-muted">
                <span v-for="(m, i) in r.methods" :key="m">
                  <code class="text-xs bg-surface px-1.5 py-0.5 rounded">{{ m }}</code>{{ i < r.methods.length - 1 ? ' ' : '' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-lg font-semibold font-heading mb-3">Quotes</h3>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">List with filters</span>
          <button class="copy-btn" :class="{ copied: copied === 'quotes-list' }" @click="copyCode(snippets['quotes-list'])">
            {{ copied === 'quotes-list' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['quotes-list'], 'ts')"></div>
      </div>

      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">Create</span>
          <button class="copy-btn" :class="{ copied: copied === 'quotes-create' }" @click="copyCode(snippets['quotes-create'])">
            {{ copied === 'quotes-create' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['quotes-create'], 'ts')"></div>
      </div>

      <h3 class="text-lg font-semibold font-heading mt-6 mb-3">Authors</h3>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">List and get</span>
          <button class="copy-btn" :class="{ copied: copied === 'authors' }" @click="copyCode(snippets['authors'])">
            {{ copied === 'authors' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['authors'], 'ts')"></div>
      </div>

      <h3 class="text-lg font-semibold font-heading mt-6 mb-3">Search</h3>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">Full-text search</span>
          <button class="copy-btn" :class="{ copied: copied === 'search' }" @click="copyCode(snippets['search'])">
            {{ copied === 'search' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['search'], 'ts')"></div>
      </div>

      <h3 class="text-lg font-semibold font-heading mt-6 mb-3">Collections</h3>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">Create and manage</span>
          <button class="copy-btn" :class="{ copied: copied === 'collections' }" @click="copyCode(snippets['collections'])">
            {{ copied === 'collections' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['collections'], 'ts')"></div>
      </div>
    </section>

    <section id="pagination" class="mb-12 fade-in" style="animation-delay: 300ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Pagination</h2>
      <p class="text-muted mb-4 leading-relaxed">
        Every <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">list</code> method accepts <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">page</code> and <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">limit</code> params and returns a <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">pagination</code> meta object. Use the <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">paginate()</code> async generator for seamless iteration.
      </p>
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">Async generator</span>
          <button class="copy-btn" :class="{ copied: copied === 'paginate' }" @click="copyCode(snippets['paginate'])">
            {{ copied === 'paginate' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['paginate'], 'ts')"></div>
      </div>
    </section>

    <section id="nuxt" class="mb-12 fade-in" style="animation-delay: 350ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Nuxt module</h2>
      <p class="text-muted mb-4 leading-relaxed">
        The package ships an optional Nuxt 4 module that auto-imports composables for convenient access.
      </p>

      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">nuxt.config.ts</span>
          <button class="copy-btn" :class="{ copied: copied === 'nuxt-config' }" @click="copyCode(snippets['nuxt-config'])">
            {{ copied === 'nuxt-config' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['nuxt-config'], 'ts')"></div>
      </div>

      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">In any component</span>
          <button class="copy-btn" :class="{ copied: copied === 'nuxt-usage' }" @click="copyCode(snippets['nuxt-usage'])">
            {{ copied === 'nuxt-usage' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['nuxt-usage'], 'ts')"></div>
      </div>

      <p class="text-muted text-sm leading-relaxed mt-4">
        Set your API key via <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">runtimeConfig.verbatimsApiKey</code> in <code class="bg-surface px-1.5 py-0.5 rounded text-sm text-primary">nuxt.config.ts</code>.
      </p>
    </section>

    <section id="errors" class="mb-12 fade-in" style="animation-delay: 400ms">
      <h2 class="text-2xl font-bold font-heading mb-4">Error handling</h2>
      <p class="text-muted mb-4 leading-relaxed">
        The SDK throws typed errors for every HTTP status. Catch specific errors for fine-grained control.
      </p>

      <div class="overflow-x-auto mb-4">
        <table class="w-full border-collapse">
          <thead>
            <tr class="text-left text-xs text-muted font-semibold uppercase tracking-wider">
              <th class="p-3 border-b border-border">Error</th>
              <th class="p-3 border-b border-border">Status</th>
              <th class="p-3 border-b border-border">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in errorTypes" :key="e.name" class="text-sm">
              <td class="p-3 border-b border-border font-mono">{{ e.name }}</td>
              <td class="p-3 border-b border-border text-muted">{{ e.status }}</td>
              <td class="p-3 border-b border-border text-muted">{{ e.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="code-block">
        <div class="code-block-header">
          <span class="code-block-label">Error handling example</span>
          <button class="copy-btn" :class="{ copied: copied === 'errors' }" @click="copyCode(snippets['errors'])">
            {{ copied === 'errors' ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div v-html="$highlight(snippets['errors'], 'ts')"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { snippets } from '../composables/snippets'

useHead({
  title: 'Documentation - @verbatims/sdk',
})

const pmTab = ref('npm')
const copied = ref<string | null>(null)

const sectionLinks = [
  { id: 'installation', label: 'Installation' },
  { id: 'usage', label: 'Usage' },
  { id: 'resources', label: 'Resources' },
  { id: 'pagination', label: 'Pagination' },
  { id: 'nuxt', label: 'Nuxt' },
  { id: 'errors', label: 'Errors' },
]

const packageManagers = [
  { id: 'npm', label: 'npm' },
  { id: 'pnpm', label: 'pnpm' },
  { id: 'bun', label: 'bun' },
]

const resources = [
  { name: 'vb.quotes', methods: ['list', 'get', 'create', 'update', 'delete', 'paginate'] },
  { name: 'vb.authors', methods: ['list', 'get', 'create', 'update', 'paginate'] },
  { name: 'vb.references', methods: ['list', 'get', 'create', 'update', 'paginate'] },
  { name: 'vb.tags', methods: ['list', 'paginate'] },
  { name: 'vb.collections', methods: ['create', 'addQuote', 'removeQuote'] },
  { name: 'vb.search', methods: ['query', 'paginate'] },
]

const errorTypes = [
  { name: 'ValidationError', status: 400, description: 'Invalid request data' },
  { name: 'AuthError', status: 401, description: 'Missing or invalid API key' },
  { name: 'ForbiddenError', status: 403, description: 'Access denied' },
  { name: 'NotFoundError', status: 404, description: 'Resource not found' },
  { name: 'RateLimitError', status: 429, description: 'Too many requests' },
  { name: 'VerbatimsError', status: '—', description: 'Generic API error (catch-all)' },
]

const activeSection = computed(() => {
  if (import.meta.client) {
    for (const s of [...sectionLinks].reverse()) {
      const el = document.getElementById(s.id)
      if (el && el.getBoundingClientRect().top <= 120) return s.id
    }
  }
  return sectionLinks[0]?.id
})

function copyCode(key: string) {
  navigator.clipboard.writeText(snippets[key])
  copied.value = key
  setTimeout(() => { copied.value = null }, 2000)
}
</script>

<style scoped>
.fade-in {
  animation: fade-in 0.5s ease forwards;
  opacity: 0;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
