<script setup lang="ts">
import { useDebounceFn, useToggle, useWindowSize } from '@vueuse/core'
import 'uno.css'
import { onMounted, ref } from 'vue'
import { onMessage } from 'webext-bridge/content-script'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import QrcodeDecoder from 'qrcode-decoder'

const {
  width,
  height,
} = useWindowSize()

const [show, toggle] = useToggle(false)

watch(show, (v) => {
  if (v)
    document.body.style.overflow = 'hidden'
  else
    document.body.style.overflow = 'visible'
})

// const image = ref()
const dataUrl = ref('')

onMounted(() => {
  onMessage('from-popup', async ({ data: { screenshotUrl } }) => {
    dataUrl.value = screenshotUrl
    toggle()
  })
})

const cropImg = ref('')
const cropper = ref()
const code = ref('')
const clipboardCopied = ref(false)

const qr = new QrcodeDecoder()

const debouncedFn = useDebounceFn(() => {
  qr.decodeFromImage(cropImg.value).then((res) => {
    if (res) {
      code.value = res.data
      clipboardCopied.value = false
    }
  })
}, 1000)
const cropImage = () => {
  cropImg.value = cropper.value.getCroppedCanvas().toDataURL()
  debouncedFn()
}

const copyTextToClipboard = () => {
  navigator.clipboard.writeText(code.value)
  clipboardCopied.value = true
}

onMounted(() => {
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    if (event.isComposing || event.code === '27')
      show.value = false
  })
})
</script>

<template>
  <div style="all: unset;">
    <div
      :class="{ hidden: !show }"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
      }"
      class="fixed inset-0 bg-gray-600 z-[2147483630]"
    >
      <div v-if="show" class="fixed inset-y-6 inset-x-0 bg-gray-600">
        <section class="flex h-full flex-row items-center justify-center">
          <div class="grow p-6 h-full">
            <VueCropper
              ref="cropper"
              :aspect-ratio="1"
              :src="dataUrl"
              :auto-crop="false"
              @crop="cropImage"
            />
          </div>
          <div class="w-[400px] h-full px-6 py-12 flex flex-col items-center bg-gray-100 dark:bg-gray-700">
            <div class="aspect-square w-full">
              <img v-if="cropImg" ref="preview" width="100%" height="100%" :src="cropImg" alt="">
            </div>
            <textarea
              v-model="code" rows="2"
              class="block mt-6 grow w-full text-sm text-gray-900
                    bg-white dark:text-white"
            />
            <div class="w-full grid grid-cols-2 p-0">
              <button
                class="unset inline-flex justify-center border-0 space-x-6 py-2
                  h-full items-center text-gray-400 bg-gray-100
                  cursor-pointer hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-600"
                @click="copyTextToClipboard"
              >
                <span>Copy</span>
                <svg
                  v-if="!clipboardCopied" xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.992C17 21.55 16.551 22 15.992 22H3.008A1.006 1.006 0 0 1 2 20.992l.003-12.985C2.003 7.451 2.452 7 3.01 7H7Zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3ZM4.003 9L4 20h11V9H4.003Z"
                  />
                </svg>
                <svg
                  v-else xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.992C17 21.55 16.551 22 15.992 22H3.008A1.006 1.006 0 0 1 2 20.992l.003-12.985C2.003 7.451 2.452 7 3.01 7H7Zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3Zm6 2H4.003L4 20h11V9Zm-6.498 9l-3.535-3.536L6.38 13.05l2.121 2.122l4.243-4.243l1.414 1.414L8.502 18Z"
                  />
                </svg>
              </button>
              <button
                class="unset inline-flex justify-center border-0 space-x-6 py-2
                  h-full items-center text-gray-400 bg-gray-100
                  cursor-pointer hover:bg-gray-200 dark:text-gray-500 dark:hover:bg-gray-600"
                @click="show = false"
              >
                <span>Close</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-6 h-6 rotate-90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="m12 10.586l4.95-4.95l1.415 1.415l-4.95 4.95l4.95 4.95l-1.415 1.414l-4.95-4.95l-4.95 4.95l-1.413-1.415l4.95-4.95l-4.95-4.95L7.05 5.638l4.95 4.95Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
