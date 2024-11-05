<script setup lang="ts">
import { createAxiosClient } from '@nailyjs/rpc/axios'
import { ref } from 'vue'
import { WelcomeServer } from '../common/welcome-protocol'

const message = ref('Loading...')

function requestMessage() {
  message.value = 'Loading...'
  createAxiosClient({
    ssr: false,
    urlOrAxiosInstance: '/rpc',
  })
    .request<WelcomeServer>(WelcomeServer)
    .sayHello('world')
    .then(msg => message.value = JSON.stringify(msg))
    .catch(() => message.value = 'Failed to fetch message')
}
requestMessage()
</script>

<template>
  <div>
    <h1>Hello Vite + Vue 3 + TypeScript + Naily JSON RPC!</h1>
    <h2>{{ message }}</h2>
    <button @click="requestMessage">
      Refresh
    </button>
    <a href="__inspect" target="_blank" style="text-decoration: none; margin-top:10px; display: block;">visit /__inspect/ to inspect the intermediate state</a>
  </div>
</template>
