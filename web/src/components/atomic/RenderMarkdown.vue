<template>
  <span v-html="contentHTML" />
</template>

<script setup lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

const contentHTML = computed<string>(() => {
  const dirtyHTML = marked.parse(props.content);
  return DOMPurify.sanitize(dirtyHTML as string, { USE_PROFILES: { html: true } });
});
</script>
