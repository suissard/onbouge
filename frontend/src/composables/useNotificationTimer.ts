import { ref, onMounted, onUnmounted } from 'vue';

/**
 * A Vue composable that provides a timer for notifications.
 * @param {number} duration - The duration of the timer in milliseconds.
 * @param {() => void} close - A callback function to be called when the timer finishes.
 * @returns {{
 *   progress: import('vue').Ref<number>,
 *   pause: () => void,
 *   resume: () => void
 * }} - An object containing the timer's progress, and functions to pause and resume the timer.
 */
export function useNotificationTimer(duration: number, close: () => void) {
  const progress = ref(100);
  let timer: number | null = null;
  let interval: number | null = null;
  let remaining = duration;
  let startTime: number;

  /**
   * Starts the timer.
   */
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

  /**
   * Pauses the timer.
   */
  const pause = () => {
    if (timer) clearTimeout(timer);
    if (interval) clearInterval(interval);
    remaining -= (Date.now() - startTime);
  }

  /**
   * Resumes the timer.
   */
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
