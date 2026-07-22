import { createHighlighter } from 'shiki'

export default defineNuxtPlugin(async () => {
  const highlighter = await createHighlighter({
    langs: ['ts', 'tsx', 'js', 'vue', 'bash', 'json', 'html', 'sh'],
    themes: ['github-light', 'github-dark'],
  })

  return {
    provide: {
      highlight(code: string, lang: string) {
        return highlighter.codeToHtml(code, {
          lang,
          themes: { light: 'github-light', dark: 'github-dark' },
        })
      },
    },
  }
})
