import { ref, onMounted, onUnmounted } from 'vue';

export function useNotificationTimer(duration: number, close: () => void) {
  const progress = ref(100);
  let timer: number | null = null;
  let interval: number | null = null;
  let remaining = duration;
  let startTime: number;

  const start = () => {
    startTime = Date.now();

    interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress.value = ((remaining - elapsed) / duration) * 100;
    }, 50);

    timer = setTimeout(() => {
        close();
    }, remaining);
  }

  const pause = () => {
    if (timer) clearTimeout(timer);
    if (interval) clearInterval(interval);
    remaining -= (Date.now() - startTime);
  }

  const resume = () => {
    start();
  }

  onMounted(start);
  onUnmounted(() => {
    if (timer) clearTimeout(timer);
    if (interval) clearInterval(interval);
  });

  return {
    progress,
    pause,
    resume,
  };
}
