<template>
  <div>
    <h2>客户端对讲</h2>
    <button @click="toggleCall">{{ isTalking ? '结束对讲' : '开始对讲' }}</button>
  </div>
</template>

<script>
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

export default {
  data() {
    return {
      isTalking: false, // 对讲状态
    };
  },
  mounted() {
    listen('gpio-button-pressed', () => {
      this.toggleCall();
    });
  },
  methods: {
    toggleCall() {
      if (this.isTalking) {
        this.endCall();
      } else {
        this.startCall();
      }
    },
    startCall() {
      invoke('start_call')
          .then(() => {
            this.isTalking = true;
            console.log('开始对讲成功');
          })
          .catch((error) => {
            console.error('开始对讲失败', error);
          });
    },
    endCall() {
      invoke('end_call')
          .then(() => {
            this.isTalking = false;
            console.log('结束对讲成功');
          })
          .catch((error) => {
            console.error('结束对讲失败', error);
          });
    },
  },
};
</script>
