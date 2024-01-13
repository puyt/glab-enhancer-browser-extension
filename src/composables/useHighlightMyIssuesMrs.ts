import { debounce } from 'lodash-es';
import {
    Preference,
    useExtensionStore,
} from '../store';

export function useHighlightMyIssuesMrs() {
    const { getSetting } = useExtensionStore();

    function highlight(username: string) {
        if (!username || !getSetting(Preference.GENERAL_HIGHLIGHT_MY_ISSUES_MRS, true)) {
            return;
        }

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

        if (window.location.href.includes('merge_requests') && !window.location.href.includes('dashboard')) {
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
