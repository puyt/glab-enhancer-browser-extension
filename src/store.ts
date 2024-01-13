import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

type SettingValue = boolean | string | number | null;

export const enum Preference {
    COMMAND_PANEL_STARRED_PROJECTS = 'command_panel_starred_projects',
    COMMAND_PANEL_MOVE_PLACES = 'command_panel_move_places',

    GENERAL_HIGHLIGHT_MY_ISSUES_MRS = 'general_highlight_my_issues_mrs',

    ISSUE_SHOW_MY_UNRESOLVED_THREADS = 'issue_show_my_unresolved_threads',
    ISSUE_RENDER_PROJECT_AVATARS = 'issue_render_project_avatars',
    ISSUE_VALIDATE_MISSING_EPIC = 'issue_validate_missing_epic',
    ISSUE_VALIDATE_MISSING_MILESTONE = 'issue_validate_missing_milestone',
    ISSUE_VALIDATE_MISSING_ITERATION = 'issue_validate_missing_iteration',
    ISSUE_VALIDATE_MISSING_WEIGHT = 'issue_validate_missing_weight',
    ISSUE_VALIDATE_UNRESOLVED_THREADS = 'issue_validate_unresolved_threads',
    ISSUE_REQUIRED_SCOPED_LABELS = 'issue_required_scoped_labels',

    MR_SHOW_MY_UNRESOLVED_THREADS = 'mr_show_my_unresolved_threads',
}

export const useExtensionStore = defineStore('resize', () => {
        const valuesByNamespace: Ref<Map<string, SettingValue>> = useLocalStorage('pinia/extension', ref(new Map()));

        function get(key: string, defaultValue: SettingValue = null): SettingValue {
            const value = valuesByNamespace.value.get(key);
            return value === undefined ? defaultValue : value;
        }

        function set(key: string, value: SettingValue) {
            valuesByNamespace.value.set(key, value);
        }

        return {
            getSetting: get,
            setSetting: set,
        };
    },
);
