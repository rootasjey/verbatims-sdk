import { createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'

export default defineNuxtPlugin(async () => {
  const highlighter = await createHighlighter({
    langs: ['ts', 'tsx', 'js', 'vue', 'bash', 'json', 'html', 'sh'],
    themes: ['github-light', 'github-dark'],
    engine: createJavaScriptRegexEngine(),
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
