<template>
  <Settings :title="$t('repo.settings.badge.badge')">
    <template #titleActions>
      <a v-if="badgeUrl" :href="badgeUrl" target="_blank">
        <img :src="badgeUrl" />
      </a>
    </template>

    <InputField v-slot="{ id }" :label="$t('repo.settings.badge.type')">
      <SelectField
        :id="id"
        v-model="badgeType"
        :options="[
          {
            value: 'url',
            text: $t('repo.settings.badge.type_url'),
          },
          {
            value: 'markdown',
            text: $t('repo.settings.badge.type_markdown'),
          },
          {
            value: 'html',
            text: $t('repo.settings.badge.type_html'),
          },
        ]"
        required
      />
    </InputField>
    <InputField v-slot="{ id }" :label="$t('repo.settings.badge.branch')">
      <SelectField :id="id" v-model="branch" :options="branches" required />
    </InputField>

    <div v-if="badgeContent" class="flex flex-col space-y-4">
      <div>
        <pre class="code-box">{{ badgeContent }}</pre>
      </div>
    </div>
  </Settings>
</template>

<script lang="ts" setup>
import { useStorage } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SelectOption } from '~/components/form/form.types';
import InputField from '~/components/form/InputField.vue';
import SelectField from '~/components/form/SelectField.vue';
import Settings from '~/components/layout/Settings.vue';
import useApiClient from '~/compositions/useApiClient';
import useConfig from '~/compositions/useConfig';
import { requiredInject } from '~/compositions/useInjectProvide';
import { usePaginate } from '~/compositions/usePaginate';
import { useWPTitle } from '~/compositions/useWPTitle';

const apiClient = useApiClient();
const repo = requiredInject('repo');

const badgeType = useStorage('woodpecker:last-badge-type', 'markdown');

const defaultBranch = computed(() => repo.value.default_branch);
const branches = ref<SelectOption[]>([]);
const branch = ref<string>('');

async function loadBranches() {
  branches.value = (await usePaginate((page) => apiClient.getRepoBranches(repo.value.id, { page })))
    .map((b) => ({
      value: b,
      text: b,
    }))
    .filter((b) => b.value !== defaultBranch.value);
  branches.value.unshift({
    value: '',
    text: defaultBranch.value,
  });
}

const baseUrl = `${window.location.protocol}//${window.location.hostname}${
  window.location.port ? `:${window.location.port}` : ''
}`;
const { rootPath } = useConfig();
const badgeUrl = computed(
  () => `${rootPath}/api/badges/${repo.value.id}/status.svg${branch.value !== '' ? `?branch=${branch.value}` : ''}`,
);
const repoUrl = computed(
  () =>
    `${rootPath}/repos/${repo.value.id}${branch.value !== '' ? `/branches/${encodeURIComponent(branch.value)}` : ''}`,
);

const badgeContent = computed(() => {
  if (badgeType.value === 'url') {
    return `${baseUrl}${badgeUrl.value}`;
  }

  if (badgeType.value === 'markdown') {
    return `[![status-badge](${baseUrl}${badgeUrl.value})](${baseUrl}${repoUrl.value})`;
  }

  if (badgeType.value === 'html') {
    return `<a href="${baseUrl}${repoUrl.value}" target="_blank">\n  <img src="${baseUrl}${badgeUrl.value}" alt="status-badge" />\n</a>`;
  }

  return '';
});

onMounted(() => {
  loadBranches();
});

watch(repo, () => {
  loadBranches();
});

const { t } = useI18n();
useWPTitle(computed(() => [t('repo.settings.badge.badge'), repo.value.full_name]));
</script>
