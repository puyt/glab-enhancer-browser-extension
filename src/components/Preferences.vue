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

                <SvgIcon
                    class="gl-ml-1"
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
        mdiFlagOutline,
        mdiImageOutline,
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
                iconClassName: 's24',
                defaultValue: true,
            },
        ],
        'General': [
            {
                label: 'Highlight my issues & merge requests',
                title: '',
                key: Preference.GENERAL_HIGHLIGHT_MY_ISSUES_MRS,
                icon: mdiAccountCircleOutline,
                isGitlabIcon: false,
                iconClassName: 'gl-ml-1 s24',
                defaultValue: true,
            },
        ],
        'Issues': [
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.ISSUE_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Render project avatars',
                title: 'In issue overview & board',
                key: Preference.ISSUE_RENDER_PROJECT_AVATARS,
                icon: mdiImageOutline,
                isGitlabIcon: false,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Epic"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_EPIC,
                icon: gSvgEpic,
                isGitlabIcon: true,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Milestone"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_MILESTONE,
                icon: mdiFlagOutline,
                isGitlabIcon: false,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Iteration"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_ITERATION,
                icon: gSvgIteration,
                isGitlabIcon: true,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Validate missing "Weight"',
                title: '',
                key: Preference.ISSUE_VALIDATE_MISSING_WEIGHT,
                icon: gSvgWeight,
                isGitlabIcon: true,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Validate unresolved threads',
                title: '',
                key: Preference.ISSUE_VALIDATE_UNRESOLVED_THREADS,
                icon: gSvgComments,
                isGitlabIcon: true,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
            {
                label: 'Required labels',
                title: 'Use comma separated values',
                key: Preference.ISSUE_REQUIRED_SCOPED_LABELS,
                icon: gSvgLabels,
                isGitlabIcon: true,
                iconClassName: 'gl-ml-2',
                defaultValue: '',
            },
        ],
        'Merge Requests': [
            {
                label: 'Show # of my unresolved threads',
                title: '',
                key: Preference.MR_SHOW_MY_UNRESOLVED_THREADS,
                icon: mdiCommentAccountOutline,
                isGitlabIcon: false,
                iconClassName: 'gl-ml-2',
                defaultValue: true,
            },
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
        top: 8px;
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
