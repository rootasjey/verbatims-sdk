export type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const themeCookie = useCookie<Theme>('verbatims-theme', { default: () => 'dark' })

  const initialDomTheme = import.meta.client
    ? (document.documentElement.getAttribute('data-theme-preference') as Theme | null)
    : null

  const theme = ref<Theme>(initialDomTheme || themeCookie.value || 'dark')

  if (import.meta.client && initialDomTheme && initialDomTheme !== themeCookie.value) {
    themeCookie.value = initialDomTheme
  }

  const systemDark = ref<'dark' | 'light'>(
    import.meta.client && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  )

  const resolvedTheme = computed(() => {
    if (theme.value === 'system') return systemDark.value
    return theme.value
  })

  useHead({
    htmlAttrs: {
      'data-theme': resolvedTheme,
    },
  })

  function set(t: Theme) {
    theme.value = t
    if (import.meta.client) {
      themeCookie.value = t
      localStorage.setItem('verbatims-theme', t)
    }
  }

  if (import.meta.client) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      systemDark.value = e.matches ? 'dark' : 'light'
    })
  }

  return { theme, set, resolvedTheme }
}
