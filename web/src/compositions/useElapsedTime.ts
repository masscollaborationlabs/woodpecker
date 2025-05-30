import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';

export function useElapsedTime(running: Ref<boolean>, startTime: Ref<number | undefined>) {
  const time = ref<number | undefined>(startTime.value);
  const timer = ref<ReturnType<typeof setInterval>>();

  function stopTimer() {
    if (timer.value !== undefined) {
      clearInterval(timer.value);
      timer.value = undefined;
    }
  }

  function startTimer() {
    stopTimer();

    if (time.value === undefined || !running.value) {
      return;
    }

    timer.value = setInterval(() => {
      if (time.value !== undefined) {
        time.value += 1000;
      }
    }, 1000);
  }

  watch([running, startTime], () => {
    time.value = startTime.value;

    // should run, has a start-time and is not running atm
    if (running.value && time.value !== undefined && timer.value === undefined) {
      startTimer();
    }

    // should not run or has no start-time and is running atm
    if ((!running.value || time.value === undefined) && timer.value !== undefined) {
      stopTimer();
    }
  });

  onMounted(startTimer);

  onBeforeUnmount(stopTimer);

  return {
    time: computed(() => (time.value === undefined ? 0 : time.value)),
    running,
  };
}
