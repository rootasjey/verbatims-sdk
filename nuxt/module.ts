import { defineNuxtModule, addImportsSources } from 'nuxt/kit'
import { fileURLToPath } from 'node:url'

export default defineNuxtModule({
  meta: {
    name: '@verbatims/sdk/nuxt',
    configKey: 'verbatims',
  },
  defaults: {
    apiKey: '',
    apiBaseUrl: '/api/v1',
  },
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.verbatimsApiKey = options.apiKey
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    ;(nuxt.options.runtimeConfig.public as Record<string, unknown>).verbatimsApiBaseUrl = options.apiBaseUrl

    const composablesPath = fileURLToPath(new URL('./composables.ts', import.meta.url))

    addImportsSources([
      {
        from: composablesPath,
        imports: [
          'useVerbatimsClient',
          'useQuotes',
          'useSearchQuotes',
        ],
      },
    ])
  },
})
