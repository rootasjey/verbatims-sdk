<template>
  <div class="min-h-screen flex flex-col font-sans antialiased bg-[var(--c-bg)] text-[var(--c-text)]">
    <header class="sticky top-0 z-50 border-b border-[var(--c-border)] bg-[var(--c-bg)]/80 backdrop-blur-md">
      <div class="max-w-240 mx-auto px-5 h-14 flex items-center justify-between gap-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg no-underline text-[var(--c-text)] hover:no-underline shrink-0">
          <img src="/images/icon-192.png" width="28" height="28" alt="Verbatims" class="shrink-0">
        </NuxtLink>

        <div class="flex items-center gap-1">
          <NuxtLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            :target="item.target"
            class="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors no-underline"
            :class="isActive(item.to) ? 'text-primary bg-primary/10' : 'text-muted hover:text-[var(--c-text)] hover:bg-surface'"
          >
            {{ item.label }}
          </NuxtLink>

          <NCombobox
            v-model="selectedTheme"
            :items="themeOptions"
            by="value"
            size="xs"
            :_combobox-trigger="{
              size: 'xs',
              btn: 'ghost',
              class: 'text-xs font-semibold text-[var(--c-muted)] border border-[var(--c-border)] rounded-full px-3 py-1 cursor-pointer transition-colors hover:text-[var(--c-text)] hover:border-[var(--c-text)] capitalize min-w-0 w-auto gap-1',
            }"
            :_combobox-list="{
              align: 'end',
            }"
          >
            <template #trigger="{ modelValue }">
              <span v-if="modelValue?.value === 'light'">&#9728;</span>
              <span v-else-if="modelValue?.value === 'dark'">&#9790;</span>
              <span v-else>&#9783;</span>
              {{ modelValue?.label || 'Dark' }}
            </template>
          </NCombobox>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <NuxtPage />
    </main>

    <footer class="border-t border-[var(--c-border)] py-6 px-5">
      <div class="max-w-240 mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p class="text-xs text-[var(--c-muted)] m-0">
          MIT &mdash;
          <NuxtLink to="https://github.com/rootasjey/verbatims-sdk" class="hover:text-[var(--c-text)]">GitHub</NuxtLink>
        </p>
        <div class="flex items-center gap-4">
          <NuxtLink to="/about" class="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] no-underline">About</NuxtLink>
          <NuxtLink to="/privacy" class="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] no-underline">Privacy</NuxtLink>
          <NuxtLink to="/terms" class="text-xs text-[var(--c-muted)] hover:text-[var(--c-text)] no-underline">Terms</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { theme, set } = useTheme()

const selectedTheme = computed({
  get: () => themeOptions.find(o => o.value === theme.value),
  set: (val) => {
    if (val) set(val.value as 'light' | 'dark' | 'system')
  },
})

const themeOptions = [
  { value: 'dark' as const, label: 'Dark' },
  { value: 'light' as const, label: 'Light' },
  { value: 'system' as const, label: 'System' },
]

const navItems = [
  { label: 'Docs', to: '/docs' },
  { label: 'About', to: '/about' },
  { label: 'GitHub', to: 'https://github.com/rootasjey/verbatims-sdk', target: '_blank' },
]

function isActive(to: string) {
  if (to === '/docs') return route.path.startsWith('/docs')
  return route.path === to
}
</script>

<style>
:root,
[data-theme="dark"] {
  --c-bg: #0a0a0b;
  --c-surface: #141416;
  --c-border: #1e1e22;
  --c-text: #e8e8e8;
  --c-muted: #6b6b7b;
}

[data-theme="light"] {
  --c-bg: #f5f5f0;
  --c-surface: #ffffff;
  --c-border: #e5e5e0;
  --c-text: #1a1a1a;
  --c-muted: #8a8a9a;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
}

body {
  margin: 0;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

.font-heading {
  font-family: 'Fraunces', serif;
}

a {
  color: inherit;
  text-decoration: none;
}

.shiki {
  font-family: 'DM Mono', 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid var(--c-border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.code-block {
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid var(--c-border);
  margin-bottom: 1rem;
}

.code-block .shiki {
  border: none;
  border-radius: 0;
  margin: 0;
}

.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
}

.code-block-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--c-muted);
}

[data-theme="dark"] .shiki,
[data-theme="dark"] .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
  font-style: var(--shiki-dark-font-style, inherit) !important;
  font-weight: var(--shiki-dark-font-weight, inherit) !important;
  text-decoration: var(--shiki-dark-text-decoration, inherit) !important;
}



.copy-btn {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  color: var(--c-text);
  border-color: var(--c-text);
}

.copy-btn.copied {
  color: #22c55e;
  border-color: #22c55e;
}
</style>
