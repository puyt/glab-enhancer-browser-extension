<template>
    <div
        id="chrome-gitlab-enhancer__preferences"
        ref="rootPreferencesElement"
    >
        <div class="dropdown b-dropdown gl-dropdown btn-group gl-display-block!">
            <button
                class="btn dropdown-toggle btn-default btn-md gl-button gl-dropdown-toggle"
                style="box-shadow: none; border-color: #e24329; border-width: 1px; padding: 0.25rem 0.5rem;"
                @click.prevent="isMenuVisible = !isMenuVisible"
            >
                <SvgLogo style="width: 24px; height: 24px;" />

                <span class="gl-dropdown-button-text">GitLab Enhancer</span>

                <span
                    class="badge gl-ml-2 badge-tier badge-pill gl-badge sm has-tooltip"
                    title="View changelog for updates, located in the extension pop-up."
                >
                    2.3.1
                </span>

                <SvgIcon
                    class="gl-ml-2"
                    :path="mdiChevronDown"
                />
            </button>

            <ul
                :class="{
                    'show': isMenuVisible,
                }"
                class="dropdown-menu"
                style="right: 0; left: initial; width: 320px;"
            >
                <div class="gl-dropdown-inner">
                    <div class="gl-dropdown-contents">
                        <template
                            v-for="(preferences, group) in groupedPreferences"
                            :key="group"
                        >
                            <label class="gl-ml-3">{{ group }}</label>

                            <template
                                v-for="preference in preferences"
                                :key="preference.key"
                            >
                                <li
                                    class="gl-dropdown-item"
                                    @click="onClickItem(preference)"
                                >
                                    <button
                                        class="dropdown-item"
                                        :class="{
                                            'has-tooltip': !!preference.title,
                                        }"
                                        :style="{
                                            'flex-wrap': typeof preference.defaultValue === 'string' ? 'wrap': 'nowrap',
                                        }"
                                        :title="preference.title"
                                        @click.prevent
                                    >
                                        <SvgIcon
                                            v-if="preference.icon"

                                            :class="preference.iconClassName"
                                            class="gl-mr-3"
                                            :is-gitlab="preference.isGitlabIcon"
                                            :path="preference.icon"
                                            style="flex: 0 0 auto;"
                                        />

                                        <div class="gl-dropdown-item-text-wrapper">
                                            <p class="gl-dropdown-item-text-primary">{{ preference.label }}</p>
                                        </div>

                                        <GToggle
                                            v-if="typeof preference.defaultValue === 'boolean'"
                                            :model-value="!!getSetting(preference.key, preference.defaultValue)"
                                        />

                                        <input
                                            v-if="typeof preference.defaultValue === 'string'"

                                            class="form-control gl-border-gray-200"
                                            style="margin-left: 24px; margin-bottom: 8px;"
                                            type="text"
                                            :value="getSetting(preference.key, preference.defaultValue)"

                                            @input="onInput(preference.key, $event)"
                                        >
                                    </button>
                                </li>
                            </template>
                        </template>
                    </div>
                </div>
            </ul>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        mdiAccountCircleOutline,
        mdiChevronDown,
        mdiCommentAccountOutline,
        mdiCommentCheckOutline,
        mdiFlagOutline,
        mdiImageOutline,
        mdiKeyboardOutline,
        mdiLightbulbOffOutline,
        mdiMapMarkerOutline,
        mdiStarOutline,
    } from '@mdi/js';
    import { onClickOutside } from '@vueuse/core';
    import {
        type Ref,
        ref,
    } from 'vue';
    import {
        Preference,
        useExtensionStore,
    } from '../store';
    import {
        gSvgComments,
        gSvgEpic,
        gSvgIteration,
        gSvgLabels,
        gSvgWeight,
    } from '../assets/icons';
    import GToggle from './GToggle.vue';
    import SvgIcon from './SvgIcon.vue';
    import SvgLogo from './SvgLogo.vue';

    interface PreferenceItem {
        label: string;
        title: string;
        key: string;
        icon: string;
        isGitlabIcon: boolean;
        iconClassName: string;
        defaultValue: boolean | string;
    }

    const {
        getSetting,
        setSetting,
    } = useExtensionStore();

    const rootPreferencesElement: Ref<HTMLElement | null> = ref(null);
    const isMenuVisible = ref(false);

    onClickOutside(rootPreferencesElement, () => {
        isMenuVisible.value = false;
    });

    const groupedPreferences: Record<string, Array<PreferenceItem>> = {
        'Command Panel': [
            {
                label: 'Show starred projects',
                title: '',
                key: Preference.COMMAND_PANEL_STARRED_PROJECTS,
                icon: mdiStarOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Move "Places" after "Frequently visited"',
                title: '',
                key: Preference.COMMAND_PANEL_MOVE_PLACES,
                icon: mdiMapMarkerOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'To-Do List': [
            {
                label: 'Render project logos',
                title: '',
                key: Preference.TODO_RENDER_PROJECT_LOGOS,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
        ],
        'Issues': [
            {
                label: 'Highlight my issues',
                title: 'Highlighted with purple dashed border',
                key: Preference.ISSUE_HIGHLIGHT_MINE,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Use "Threads" in favor of "Comments" by default',
                title: '',
                key: Preference.ISSUE_USE_THREADS_BY_DEFAULT,
                icon: mdiCommentCheckOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Render project logos',
                title: 'In issue overview & board',
                key: Preference.ISSUE_RENDER_PROJECT_LOGO,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Epic"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_EPIC,
                icon: gSvgEpic,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Milestone"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_MILESTONE,
                icon: mdiFlagOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Iteration"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_ITERATION,
                icon: gSvgIteration,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Weight"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_WEIGHT,
                icon: gSvgWeight,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Validate unresolved threads',
                title: '',
                key: Preference.ISSUE_VALIDATE_UNRESOLVED_THREADS,
                icon: gSvgComments,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Required labels',
                title: 'Use comma separated values',
                key: Preference.ISSUE_REQUIRED_SCOPED_LABELS,
                icon: gSvgLabels,
                isGitlabIcon: true,
                iconClassName: '',
                defaultValue: '',
            },
        ],
        'Merge Requests': [
            {
                label: 'Highlight my MRs',
                title: 'Highlighted with purple dashed border',
                key: Preference.MR_HIGHLIGHT_MINE,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.MR_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Use "Threads" in favor of "Comments" by default',
                title: '',
                key: Preference.MR_USE_THREADS_BY_DEFAULT,
                icon: mdiCommentCheckOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Dim "Draft"',
                title: '',
                key: Preference.MR_DIM_DRAFT,
                icon: mdiLightbulbOffOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Hotkey mark as viewed',
                title: 'v',
                key: Preference.MR_HOTKEY_VIEWED,
                icon: mdiKeyboardOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            },
            {
                label: 'Hotkey mark as viewed & open next file',
                title: 'Shift+J',
                key: Preference.MR_HOTKEY_VIEWED_NEXT,
                icon: mdiKeyboardOutline,
                isGitlabIcon: false,
                iconClassName: '',
                defaultValue: true,
            }
        ],
    };

    function onInput(key: string, event: Event) {
        const target = event.target as HTMLInputElement;
        setSetting(key, target?.value || '');
    }

    function onClickItem(preference: PreferenceItem) {
        if (typeof preference.defaultValue !== 'boolean') {
            return;
        }

        setSetting(preference.key, !getSetting(preference.key, preference.defaultValue));
    }

</script>

<style
    lang="scss"
    scoped
>
    #chrome-gitlab-enhancer__preferences {
        position: fixed;
        z-index: 999;
        top: 6px;
        right: 16px;

        .btn-group {
            position: relative;
            display: inline-flex;
            vertical-align: middle;
        }

        .gl-dropdown-contents label:not(:first-child):not(:last-child) {
            margin-top: 16px;
        }

        .dropdown-item {
            flex-wrap: wrap;
            display: flex;
            justify-content: center;
        }
    }
</style>
