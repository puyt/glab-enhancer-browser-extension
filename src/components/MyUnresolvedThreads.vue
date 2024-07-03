<template>
    <div>
        <div v-if="isShowMyUnresolvedEnabled">
            <template
                v-for="teleportId in teleportIds"
                :key="teleportId"
            >
                <teleport
                    v-if="teleportElements[teleportId]"
                    :to="`#${teleportId}`"
                >
                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-warning':  unresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block gl-mr-3 md gl-text-orange-500!"
                        :style="{
                            opacity: unresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="Unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAlertOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ unresolvedThreadsCount.get(teleportId) || 0 }}</span>
                    </li>

                    <li
                        :class="{
                            'badge badge-pill gl-badge badge-danger':  myUnresolvedThreadsCount.get(teleportId),
                        }"
                        class="has-tooltip gl-display-none gl-sm-display-block md gl-text-red-500!"
                        :style="{
                            opacity: myUnresolvedThreadsCount.get(teleportId) ? 1 : 0.5,
                        }"
                        title="My unresolved threads"
                    >
                        <SvgIcon
                            class="gl-icon s16 gl-mr-2"
                            :path="mdiCommentAccountOutline"
                            style="fill: currentColor;"
                        />

                        <span class="gl-font-weight-bold">{{ myUnresolvedThreadsCount.get(teleportId) || 0 }}</span>
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
    import type { GitLabDiscussion } from '../types';
    import {
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
    } from '@mdi/js';
    import {
        Preference,
        useExtensionStore,
    } from '../store';
    import SvgIcon from './SvgIcon.vue';
    import { useFetchPaging } from '../composables/useFetchPaging';

    type IID = string | Array<string>;

    interface Props {
        gitlabUserId: number,
        currentProjectPath: string,
        isMergeRequest: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        gitlabUserId: 0,
        currentProjectPath: '',
        isMergeRequest: true,
    });
    const {
        gitlabUserId,
        currentProjectPath,
        isMergeRequest,
    } = toRefs(props);

    const { getSetting } = useExtensionStore();

    const extractIssuableIds: ShallowRef<Array<IID>> = shallowRef([]);
    const discussions: Ref<Map<string, GitLabDiscussion[]>> = ref(new Map());

    function getProjectPath(iid: IID): string {
        return Array.isArray(iid) ? iid[0] : currentProjectPath.value;
    }

    function getIid(iid: IID): string {
        return Array.isArray(iid) ? iid[1] : iid;
    }

    function getTeleportId(idd: IID): string {
        return ('teleport-issuable-meta-' + getProjectPath(idd) + '-' + getIid(idd)).replace(/\//g, '_');
    }

    const isShowMyUnresolvedEnabled = computed(() => (isMergeRequest.value && !!getSetting(Preference.MR_SHOW_MY_UNRESOLVED_THREADS, true) || (!isMergeRequest.value && !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS, true))));
    const teleportIds = computed(() => extractIssuableIds.value.map((iid) => getTeleportId(iid)));

    const teleportElements = computed(() => teleportIds.value.reduce((acc, teleportId) => {
        acc[teleportId] = document.getElementById(teleportId);
        return acc;
    }, {} as Record<string, HTMLElement | null>));

    const unresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const thread = discussion?.notes?.[0] || null;
                return !!thread?.resolvable && !thread?.resolved;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    const myUnresolvedThreadsCount = computed(() => {
        const items: Map<any, any> = new Map();

        extractIssuableIds.value.forEach((iid) => {
            const id = getIid(iid);
            const totalUnresolvedThreads = (discussions.value.get(id) || []).filter((discussion) => {
                const thread = discussion?.notes?.[0] || null;
                return !!thread?.resolvable && !thread?.resolved && thread?.author?.id === gitlabUserId.value;
            });

            items.set(getTeleportId(iid), totalUnresolvedThreads.length);
        });

        return items;
    });

    function fetchDiscussions() {
        extractIssuableIds.value.forEach((iid) => {
            const path = getProjectPath(iid);
            const id = getIid(iid);

            const endpoint = `/api/v4/projects/${encodeURIComponent(path)}/${isMergeRequest.value ? 'merge_requests' : 'issues'}/${id}/discussions`;
            useFetchPaging(endpoint)
                .then(({ data }) => {
                    if (data?.value) {
                        discussions.value.set(id, data?.value || [] as GitLabDiscussion[]);
                    }
                });
        });
    }

    function extractIssuableIids() {
        const values: Array<string | Array<string>> = [];
        document.querySelectorAll('.issuable-list > li .issuable-reference')
            .forEach((el) => {
                const iid = el.textContent?.trim()
                    ?.split(isMergeRequest.value ? '!' : '#') || [];

                let resolvedId: string | string[] = iid[0];
                if (iid.length === 2) {
                    resolvedId = iid[0] === '' ? iid[1] : iid;
                }
                values.push(resolvedId);

                // add teleport placeholder
                const containerElement = el.closest(isMergeRequest.value ? '.issuable-info-container' : 'li.issue');
                const metaElement = containerElement?.querySelector('li[data-testid="issuable-comments"]');

                const placeholderElement = document.createElement('div');
                placeholderElement.className = 'gl-display-flex align-items-center';
                placeholderElement.id = getTeleportId(resolvedId);
                metaElement?.parentElement?.insertBefore(placeholderElement, metaElement.nextSibling);
            });

        extractIssuableIds.value = values;

        fetchDiscussions();
    }

    watch(isShowMyUnresolvedEnabled, (newValue) => {
        if (newValue) {
            extractIssuableIids();
        }
    }, { immediate: true });
</script>
