<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {sendMessage} from 'webext-bridge/popup'
import {Tabs} from "webextension-polyfill";
import Tab = Tabs.Tab;

const currentTabId = ref(0)

async function openOptionsPage() {
  // browser.runtime.openOptionsPage()

  console.log('popup', currentTabId.value)

  const screenshotUrl = await browser.tabs.captureVisibleTab();

  sendMessage('request-selection', {
    screenshotUrl,
    to: currentTabId.value
  }, 'background')
}

onMounted(() => {
  browser.tabs.query({active: true}).then((tabs: Tab[]) => {
    currentTabId.value = tabs[0].id || 0
  })
})
</script>

<template>
  <main class="w-[300px] h-10 text-center text-gray-700">
    <button class="btn" @click="openOptionsPage">
      Take a Screen Shot
    </button>
  </main>
</template>
