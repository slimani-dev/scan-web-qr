import { onMessage, sendMessage } from 'webext-bridge/background'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

onMessage('request-selection', ({ data: { screenshotUrl, to } }) => {
  sendMessage('from-popup', { screenshotUrl }, { context: 'content-script', tabId: to })
})
