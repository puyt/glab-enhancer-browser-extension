import { useFetch } from '@vueuse/core';
import { debounce } from 'lodash-es';
import {
    computed,
    watch,
} from 'vue';
import {
    Preference,
    useExtensionStore,
} from '../store';

async function fetchProject(path: string | number) {
    const { data } = await useFetch(`/api/v4/projects/${encodeURIComponent(path)}?is_custom=1`)
        .json();

    return data?.value || null;
}

export function useRenderProjectAvatarIssues() {
    const { getSetting } = useExtensionStore();

    const projectAvatars = {};

    const isInjectAvatarEnabled = computed(() => !!getSetting(Preference.ISSUE_RENDER_PROJECT_AVATARS, true));

    function injectAvatar(projectPath: string) {
        const avatarUrl = projectAvatars[projectPath];
        if (!avatarUrl) {
            return;
        }

        if (window.location.href.includes('issues')) {
            const targetElements = document.querySelectorAll(`li.issue a.issue-title-text[href*="${projectPath}"]`);
            targetElements.forEach((targetElement) => {
                const parentElement = targetElement?.parentElement?.parentElement?.parentElement || null;
                if (parentElement && !parentElement.children?.[0].classList.contains('chrome-gitlab-enhancer__project-avatar')) {
                    let injectElement: HTMLElement;
                    if (!avatarUrl.includes('http')) {
                        injectElement = document.createElement('div');
                        injectElement.className = 'gl-avatar gl-avatar-identicon gl-avatar-s24 gl-avatar-identicon-bg6';
                        injectElement.textContent = avatarUrl;
                    } else {
                        injectElement = document.createElement('img');
                        injectElement.setAttribute('src', avatarUrl);
                        injectElement.setAttribute('style', 'width: 20px;');
                    }

                    injectElement.classList.add('gl-mr-5', 'chrome-gitlab-enhancer__project-avatar');

                    parentElement.prepend(injectElement);
                    parentElement.classList.add('gl-align-items-center');
                }
            });
        }

        if (window.location.href.includes('boards') && avatarUrl.includes('http')) {
            const targetElements = document.querySelectorAll(`li.board-card span[title="${projectPath}"]`);
            targetElements.forEach((targetElement) => {
                if (targetElement.parentElement && targetElement.previousElementSibling) {
                    const imgElement = document.createElement('img');
                    imgElement.setAttribute('src', avatarUrl);
                    imgElement.setAttribute('style', 'width: 20px;');
                    imgElement.classList.add('chrome-gitlab-enhancer__project-avatar');

                    targetElement.parentElement.replaceChild(imgElement, targetElement.previousElementSibling);
                    targetElement.parentElement.classList.add('gl-display-flex', 'gl-align-items-center');
                }
            });
        }
    }

    function extractProjectPaths() {
        const paths: string[] = [];

        if (window.location.href.includes('issues')) {
            const liElements = document.querySelectorAll('ul.issues-list li.issue .issuable-info .issuable-reference');
            liElements.forEach((liElement) => {
                const projectPath = liElement?.textContent?.split('#')?.[0].trim() || '';
                if (!projectPath || paths.includes(projectPath)) {
                    return;
                }

                paths.push(projectPath);
            });
        }

        if (window.location.href.includes('boards')) {
            const cardElements = document.querySelectorAll('div.boards-app ul.board-list li.board-card');
            cardElements.forEach((cardElement) => {
                const parts = (cardElement.getAttribute('data-item-path') || '').split('#');
                const projectPath = parts[0] || '';
                if (!projectPath || paths.includes(projectPath)) {
                    return;
                }

                paths.push(projectPath);
            });
        }

        paths.forEach((path) => {
            if (!projectAvatars[path]) {
                fetchProject(path)
                    .then((data) => {
                        projectAvatars[path] = data?.avatar_url || data?.name?.charAt(0) || null;

                        injectAvatar(path);
                    });
            } else {
                injectAvatar(path);
            }
        });
    }

    function render() {
        if (!isInjectAvatarEnabled.value) {
            return;
        }

        extractProjectPaths();
    }

    watch(isInjectAvatarEnabled, () => {
        window.location.reload();
    });

    return {
        render: debounce(render, 500),
    };
}
