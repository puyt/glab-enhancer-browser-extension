<template>
    <div>
        <teleport
            v-if="teleportElement"
            :to="teleportElement"
        >
            <div
                v-if="isShowMyUnresolvedEnabled && myUnresolvedThreads.length"
                class="gl-display-flex gl-align-items-center gl-pl-4 gl-rounded-base gl-min-h-7 gl-bg-red-100 gl-mr-3 has-tooltip"
                title="My unresolved threads"
            >
                <SvgIcon
                    class="gl-icon gl-mr-3"
                    :path="mdiCommentAccountOutline"
                />

                <span>{{ myUnresolvedThreads.length }}</span>

                <div class="gl-ml-3 btn-group">
                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        title="Go to my previous unresolved thread"
                        @click.prevent="scrollToUnresolved(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        title="Go to my next unresolved thread"
                        @click.prevent="scrollToUnresolved(+1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChecronDown"
                        />
                    </button>
                </div>
            </div>

            <div
                v-if="unresolvedThreads.length"
                class="gl-display-flex gl-align-items-center gl-pl-4 gl-rounded-base gl-min-h-7 gl-bg-orange-100 gl-mr-3 has-tooltip"
                title="Total unresolved threads"
            >
                <SvgIcon
                    class="gl-icon gl-mr-3"
                    :path="mdiCommentAlertOutline"
                />

                <span>{{ unresolvedThreads.length }}</span>

                <div class="gl-ml-3 btn-group">
                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        title="Go to previous unresolved thread"
                        @click.prevent="scrollToUnresolved(-1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChevronUp"
                        />
                    </button>

                    <button
                        class="btn discussion-previous-btn gl-rounded-base! gl-px-2! btn-default btn-md gl-button btn-default-tertiary btn-icon"
                        title="Go to next unresolved thread"
                        @click.prevent="scrollToUnresolved(+1)"
                    >
                        <SvgIcon
                            class="gl-button-icon"
                            :is-gitlab="true"
                            :path="gSvgChecronDown"
                        />
                    </button>
                </div>
            </div>

            <div
                v-if="filteredValidateStatuses.length > 0"
                class="dropdown b-dropdown gl-dropdown btn-group gl-display-block!"
                @mouseenter.prevent="isMenuVisible = true"
                @mouseleave.prevent="isMenuVisible = false"
            >
                <button
                    :class="{
                        'gl-bg-green-100!': !invalidCount,
                        'gl-border-green-500!': !invalidCount,
                        'gl-text-green-500!': !invalidCount,
                        'gl-bg-red-100!': invalidCount,
                        'gl-border-red-500!': invalidCount,
                        'gl-text-red-500!': invalidCount,
                        'gl-font-weight-bold!': invalidCount,
                    }"
                    class="btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle gl-pl-3!"
                    style="box-shadow: none; border-width: 1px;"

                >
                    <SvgIcon
                        class="gl-mr-3"
                        :path="!invalidCount ?  mdiCheckCircleOutline : mdiMinusCircle"
                        :style="{
                            fill: !invalidCount ? '#108548': '#dd2b0e',
                        }"
                    />

                    <span class="gl-dropdown-button-text">
                        {{ !invalidCount ? 'Valid' : 'Incomplete' }}

                        <span
                            v-if="invalidCount"
                            class="badge gl-ml-2 badge-danger badge-pill gl-badge sm"
                            style="background-color: #ae1800; color: #fdd4cd;"
                        >
                            {{ invalidCount }}
                        </span>
                    </span>

                    <SvgIcon
                        v-if="false"
                        class="gl-ml-1"
                        :path="mdiChevronDown"
                    />
                </button>

                <ul
                    :class="{
                    'show': isMenuVisible,
                }"
                    class="dropdown-menu"
                    style="right: 0; left: initial; width: auto; min-width: 0;"
                >
                    <div class="gl-dropdown-inner">
                        <div class="gl-dropdown-contents">
                            <template
                                v-for="status in filteredValidateStatuses"
                                :key="status.key"
                            >
                                <li class="gl-dropdown-item">
                                    <button
                                        class="dropdown-item"
                                    >
                                        <div class="gl-dropdown-item-text-wrapper gl-display-flex gl-justify-content-center">
                                        <span
                                            :class="{
                                                'badge-success': status.isValid,
                                                'badge-danger': !status.isValid,
                                            }"
                                            class="badge badge-pill gl-badge lg"
                                        >
                                            <SvgIcon
                                                class="gl-badge-icon gl-ml-1 gl-mr-3"
                                                :is-gitlab="status.isGitlabIcon"
                                                :path="status.icon"
                                            />

                                            {{ status.label }}
                                        </span>
                                        </div>
                                    </button>
                                </li>
                            </template>
                        </div>
                    </div>
                </ul>
            </div>
        </teleport>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        computed,
        nextTick,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
        shallowRef,
        type ShallowRef,
        toRefs,
    } from 'vue';
    import type {
        GitLabDiscussion,
        GitlabIssue,
    } from '../types';
    import { useFetch } from '@vueuse/core';
    import { debounce } from 'lodash-es';
    import {
        Preference,
        useExtensionStore,
    } from '../store';
    import {
        mdiCheckCircleOutline,
        mdiChevronDown,
        mdiCommentAccountOutline,
        mdiCommentAlertOutline,
        mdiFlagTriangle,
        mdiMinusCircle,
    } from '@mdi/js';
    import SvgIcon from './SvgIcon.vue';
    import {
        gSvgChecronDown,
        gSvgChevronUp,
        gSvgComments,
        gSvgEpic,
        gSvgIteration,
        gSvgLabels,
        gSvgWeight,
    } from '../assets/icons';
    import { useThreadsByDefault } from '../composables/useThreadsByDefault';

    interface Props {
        gitlabUserId: number,
        iid: number,
        currentProjectPath: string,
    }

    const props = withDefaults(defineProps<Props>(), {
        gitlabUserId: 0,
        iid: 0,
        currentProjectPath: '',
    });
    const {
        gitlabUserId,
        iid,
        currentProjectPath,
    } = toRefs(props);

    useThreadsByDefault();

    const { getSetting } = useExtensionStore();

    const isMenuVisible = ref(false);
    const teleportElement: Ref<HTMLElement | null> = ref(null);

    const issue: ShallowRef<GitlabIssue | null> = shallowRef(null);
    const discussions: ShallowRef<GitLabDiscussion[]> = shallowRef([]);
    const selectedUnresolvedIndex = ref(-1);

    const isShowMyUnresolvedEnabled = computed(() => !!getSetting(Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS, true));
    const unresolvedThreads = computed(() => discussions.value.filter((discussion) => {
        const thread = discussion?.notes?.[0] || null;
        return !!thread?.resolvable && !thread?.resolved;
    }));
    const myUnresolvedThreads = computed(() => unresolvedThreads.value.filter((discussion) => discussion?.notes?.[0]?.author?.id === gitlabUserId.value));
    const validateStatuses = computed(() => {
        const statuses = [
            {
                key: Preference.ISSUE_VALIDATE_MISSING_EPIC,
                label: 'Epic',
                icon: gSvgEpic,
                isGitlabIcon: true,
                isValid: issue.value?.epic !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_MILESTONE,
                label: 'Milestone',
                icon: mdiFlagTriangle,
                isGitlabIcon: false,
                isValid: issue.value?.milestone !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_ITERATION,
                label: 'Iteration',
                icon: gSvgIteration,
                isGitlabIcon: true,
                isValid: issue.value?.iteration !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_MISSING_WEIGHT,
                label: 'Weight',
                icon: gSvgWeight,
                isGitlabIcon: true,
                isValid: issue.value?.weight !== null ? 1 : 0,
            },
            {
                key: Preference.ISSUE_VALIDATE_UNRESOLVED_THREADS,
                label: 'Unresolved threads',
                icon: gSvgComments,
                isGitlabIcon: true,
                isValid: unresolvedThreads.value.length === 0,
            },
        ];

        const requiredLabels = getSetting(Preference.ISSUE_REQUIRED_SCOPED_LABELS, '') as string;
        if (requiredLabels !== '') {
            const labels = requiredLabels.split(',');
            const labelStatuses = labels.map((requiredLabel) => {
                return {
                    key: requiredLabel as Preference,
                    label: `Label "${requiredLabel}"`,
                    icon: gSvgLabels,
                    isGitlabIcon: true,
                    isValid: issue.value?.labels.some((label) => label.startsWith(requiredLabel.trim())) ? 1 : 0,
                };
            });

            statuses.push(...labelStatuses);
        }

        return statuses;
    });
    const filteredValidateStatuses = computed(() => validateStatuses.value.filter((status) => !!getSetting(status.key, true)));
    const invalidCount = computed(() => filteredValidateStatuses.value.filter((status) => !status.isValid).length);

    function render() {
        teleportElement.value?.remove();
        teleportElement.value = document.createElement('div');
        teleportElement.value?.classList.add('gl-ml-auto', 'gl-display-flex');

        const stickyElement = document.querySelector('.issue-sticky-header .issue-sticky-header-text');
        if (stickyElement) {
            stickyElement.append(teleportElement.value);
            return;
        }

        const targetElement = document.querySelector('.issue-details .detail-page-header-actions');
        targetElement?.prepend(teleportElement.value);
    }

    const debouncedRender = debounce(render, 400);

    async function fetchIssue() {
        if (!iid.value) {
            return;
        }

        const { data } = await useFetch(`/api/v4/projects/${encodeURIComponent(currentProjectPath.value)}/issues/${iid.value}?is_custom=1`)
            .json();
        issue.value = data?.value || null as GitlabIssue | null;

        nextTick(() => render());
    }

    async function fetchIssueDiscussions() {
        if (!iid.value) {
            return;
        }

        const { data } = await useFetch(`/api/v4/projects/${encodeURIComponent(currentProjectPath.value)}/issues/${iid.value}/discussions?is_custom=1`)
            .json();
        discussions.value = data?.value || [] as GitLabDiscussion[];
    }

    const debouncedFetchIssue = debounce(async () => {
        await fetchIssue();
    }, 300);
    const debouncedFetchIssueDiscussions = debounce(async () => {
        await fetchIssueDiscussions();
    }, 300);

    function scrollToUnresolved(adjustment: number) {
        if (selectedUnresolvedIndex.value === -1) {
            selectedUnresolvedIndex.value = adjustment > 0 ? 0 : unresolvedThreads.value.length - 1;
        } else {
            selectedUnresolvedIndex.value = (selectedUnresolvedIndex.value + adjustment + unresolvedThreads.value.length) % unresolvedThreads.value.length;
        }

        const selectorId = `note_${unresolvedThreads.value?.[selectedUnresolvedIndex.value]?.notes?.[0]?.id}`;
        document.getElementById(selectorId)
            ?.scrollIntoView({ behavior: 'smooth' });
    }

    onMounted(() => {
        window.addEventListener('scroll', debouncedRender);
        window.addEventListener('message', (event) => {
            if (event.data.type === 'browser-request-completed' && !event.data.data.url.includes('is_custom=1') && !event.data.data.url.includes('realtime_changes')) {
                debouncedFetchIssue();
                debouncedFetchIssueDiscussions();
            }
        });

        debouncedFetchIssue();
        debouncedFetchIssueDiscussions();
    });

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', debouncedRender);
    });
</script>

<style
    lang="scss"
    scoped
>
    .dropdown-menu {
        margin: 0;
        padding-top: 0.25rem;
        border: none;
    }

    .gl-dropdown-inner {
        max-height: 400px;

        border: 1px solid rgb(191, 191, 195);
        border-radius: 0.25rem;
    }

    .gl-dropdown-contents {
        flex-wrap: wrap;
        display: flex;
        justify-content: center;
        min-width: 360px;

        padding: 1rem;
        gap: 8px;
    }

    .gl-dropdown-item {
        padding: 0;

        .dropdown-item {
            padding: 0;
            pointer-events: none;

            .gl-dropdown-item-text-wrapper {
                margin: 0;
                padding: 0;
            }
        }
    }
</style>

