import { debounce } from 'lodash-es';
import {
    Preference,
    useExtensionStore,
} from '../store';
import { computed } from 'vue';

export function useHighlightMyIssuesMrs() {
    const { getSetting } = useExtensionStore();

    const isHighlightMyIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_HIGHLIGHT_MINE, true));
    const isHighlightMyMrEnabled = computed(() => !!getSetting(Preference.MR_HIGHLIGHT_MINE, true));

    function highlight(username: string) {
        if (!username) {
            return;
        }

        if (isHighlightMyIssueEnabled.value) {
            if (window.location.href.includes('boards')) {
                const cardElements = document.querySelectorAll(`.board-card a[href="/${username}"]`);
                cardElements.forEach((element) => {
                    const parentElement = element.closest('li.board-card');
                    parentElement?.classList.add('gl-border', 'gl-border-2', 'gl-border-dashed', 'gl-border-purple-700');
                });
            }

            if (window.location.href.includes('issues') && !window.location.href.includes('dashboard')) {
                const avatarElements = document.querySelectorAll(`.issuable-meta a.gl-avatar-link[href$="/${username}"]`);
                avatarElements.forEach((element) => {
                    const parentElement = element.closest('.issuable-info-container')
                        ?.closest('li');
                    parentElement?.classList.add('gl-border!', 'gl-border-2!', 'gl-rounded-base!', 'gl-border-dashed!', 'gl-border-purple-700!', 'gl-m-3!');
                });
            }
        }

        if (isHighlightMyMrEnabled.value && window.location.href.includes('merge_requests') && !window.location.href.includes('dashboard')) {
            const avatarElements = document.querySelectorAll(`.issuable-meta li:not(.issuable-reviewers) a.author-link[href$="/${username}"]`);
            avatarElements.forEach((element) => {
                const parentElement = element.closest('.issuable-info-container')
                    ?.closest('li');
                parentElement?.classList.add('gl-border!', 'gl-border-2!', 'gl-rounded-base!', 'gl-border-dashed!', 'gl-border-purple-700!', 'gl-m-3!');
            });
        }
    }

    return {
        highlight: debounce(highlight, 500),
    };
}
