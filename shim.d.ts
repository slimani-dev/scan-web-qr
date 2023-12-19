import type {ProtocolWithReturn} from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'current-tab': {
      title?: string,
      tabId?: number,
    },
    'request-selection': {
      screenshotUrl: string,
      to: number
    },
    'from-popup': {
      screenshotUrl: string
    },
    'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string }>
  }
}
