<template>
    <div>
        <div v-if="isShowMyUnresolvedEnabled">
            <template
                v-for="teleportId in teleportIds"
                :key="teleportId"
            >
                <teleport :to="`#${teleportId}`">
                    <li
                        class="has-tooltip gl-display-none gl-sm-display-block gl-mr-3 md gl-text-orange-500!"
                        :class="{
                            'badge badge-pill gl-badge badge-warning':  mrUnresolvedThreadsCount.get(teleportId),
                        }"
                        :style="{
                            opacity: mrUnresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="Unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAlertOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ mrUnresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        class="has-tooltip gl-display-none gl-sm-display-block md gl-text-red-500!"
                        :class="{
                            'badge badge-pill gl-badge badge-danger':  myUnresolvedMrThreadsCount.get(teleportId),
                        }"
                        :style="{
                            opacity: myUnresolvedMrThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="My unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAccountOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedMrThreadsCount.get(teleportId) || 0 }}</span>
                    </li>
                </teleport>
            </template>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        computed,
        ref,
        type Ref,
        shallowRef,
        type ShallowRef,
        toRefs,
        watch,
    } from 'vue';
    import type {
        GitLabDiscussion,
        GitLabMergeRequest,
    } from '../types';
    import { useFetch } from '@vueuse/core';
    import {
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
    } from '@mdi/js';
    import {
        Preference,
        useExtensionStore,
    } from '../store';
    import SvgIcon from './SvgIcon.vue';

    type IID = string | Array<string>;

    interface Props {
        gitlabUserId: number,
        currentProjectPath: string,
    }

    const props = withDefaults(defineProps<Props>(), {
        gitlabUserId: 0,
        currentProjectPath: '',
    });
    const {

        gitlabUserId,
        currentProjectPath,
    } = toRefs(props);

    const { getSetting } = useExtensionStore();

    const extractedMrIds: ShallowRef<Array<IID>> = shallowRef([]);
    const myMrs: ShallowRef<Array<GitLabMergeRequest>> = shallowRef([]);
    const mrDiscussions: Ref<Map<string, GitLabDiscussion[]>> = ref(new Map());

    function getProjectPath(iid: IID): string {
        return Array.isArray(iid) ? iid[0] : currentProjectPath.value;
    }

    function getIid(iid: IID): string {
        return Array.isArray(iid) ? iid[1] : iid;
    }

    function getTeleportId(idd: IID): string {
        return ('teleport-mr-meta-' + getProjectPath(idd) + '-' + getIid(idd)).replace(/\//g, '_');
    }

    const isShowMyUnresolvedEnabled = computed(() => !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS, true));
    const teleportIds = computed(() => extractedMrIds.value.map((iid) => getTeleportId(iid)));

    const mrUnresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractedMrIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (mrDiscussions.value.get(id) || []).filter((discussion) => {
                const thread = discussion?.notes?.[0] || null;
                return !!thread?.resolvable && !thread?.resolved;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedMrThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractedMrIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (mrDiscussions.value.get(id) || []).filter((discussion) => {
                const thread = discussion?.notes?.[0] || null;
                return !!thread?.resolvable && !thread?.resolved && thread?.author?.id === gitlabUserId.value;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    function fetchMrDiscussions() {
        extractedMrIds.value.forEach((iid) => {
            const path = getProjectPath(iid);
            const id = getIid(iid);

            useFetch(`/api/v4/projects/${encodeURIComponent(path)}/merge_requests/${id}/discussions?per_page=100&is_custom=1`)
                .json()
                .then(({ data }) => {
                    if (data?.value) {
                        mrDiscussions.value.set(id, data?.value || [] as GitLabDiscussion[]);
                    }
                });
        });
    }

    function fetchMyMrs() {
        useFetch(`/api/v4/merge_requests?scope=assigned_to_me&per_page=100&state=opened`)
            .json()
            .then(({ data }) => {
                myMrs.value = data.value || [];
            });
    }

    function extractMrIids() {
        const values: Array<string | Array<string>> = [];
        document.querySelectorAll('li.merge-request .issuable-reference')
            .forEach((el) => {
                const iid = el.textContent?.trim()
                    ?.split('!') || [];

                let resolvedId: string | string[] = iid[0];
                if (iid.length === 2) {
                    resolvedId = iid[0] === '' ? iid[1] : iid;
                }
                values.push(resolvedId);

                // add teleport placeholder
                const containerElement = el.closest('.issuable-info-container');
                const metaElement = containerElement?.querySelector('.issuable-meta > ul');
                const placeholderElement = document.createElement('div');
                placeholderElement.className = 'gl-display-flex';
                placeholderElement.id = getTeleportId(resolvedId);
                metaElement?.append(placeholderElement);
            });

        extractedMrIds.value = values;

        fetchMrDiscussions();
    }

    watch(isShowMyUnresolvedEnabled, (newValue) => {
        if (newValue) {
            fetchMyMrs();
            extractMrIids();
        }
    }, { immediate: true });
</script>
