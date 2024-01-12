<template>
    <div v-if="isReady">
        <Preferences />

        <CommandPanelEnhancer
            v-if="gitlabUserId"
            :gitlab-user-id="gitlabUserId"
        />

        <IssueDetail
            v-if="isIssuePage && IID"
            :current-project-path="projectPath"
            :gitlab-user-id="gitlabUserId"
            :iid="IID"
        />

        <MergeRequestOverview
            v-if="isMergeRequestPage && !IID"
            :current-project-path="projectPath"
            :gitlab-user-id="gitlabUserId"
        />

        <MergeRequestDetail
            v-if="isMergeRequestPage && IID"
            :current-project-path="projectPath"
            :gitlab-user-id="gitlabUserId"
            :iid="IID"
        />
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        useBrowserLocation,
        useFetch,
    } from '@vueuse/core';
    import {
        computed,
        onMounted,
        ref,
    } from 'vue';
    import CommandPanelEnhancer from './components/CommandPanelEnhancer.vue';
    import MergeRequestOverview from './components/MergeRequestOverview.vue';
    import MergeRequestDetail from './components/MergeRequestDetail.vue';
    import Preferences from './components/Preferences.vue';
    import IssueDetail from './components/IssueDetail.vue';
    import { useRenderProjectAvatarIssues } from './composables/useRenderProjectAvatarIssues';

    const { render: renderProjectAvatars } = useRenderProjectAvatarIssues();

    const gitlabUserId = ref(0);

    onMounted(() => {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'chrome-request-completed' && !event.data.data.url.includes('is_custom=1')) {
                renderProjectAvatars();
            }
        });

        useFetch(`/api/v4/user`)
            .json()
            .then(({ data }) => {
                gitlabUserId.value = data?.value?.id || 0;
            });
    });

    const isReady = computed(() => !!gitlabUserId.value);

    const location = useBrowserLocation();
    const projectPath = computed(() => {
        return location.value?.pathname?.split('/-/')?.[0].slice(1) || '';
    });
    const IID = computed(() => {
        if (!location.value?.pathname) {
            return 0;
        }

        const regexPattern = /\/(\d+)\/?.*$/;
        const match = regexPattern.exec(location.value.pathname);
        return match?.length === 2 ? parseInt(match[1], 10) : 0;
    });

    const isMergeRequestPage = computed(() => location.value.pathname?.includes('merge_requests'));
    const isIssuePage = computed(() => location.value.pathname?.includes('issues'));
</script>
