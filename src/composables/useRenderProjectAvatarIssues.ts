import { useFetch } from '@vueuse/core';
import { debounce } from 'lodash-es';
import { computed } from 'vue';
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

    const isInjectAvatarTodoEnabled = computed(() => !!getSetting(Preference.TODO_RENDER_PROJECT_LOGOS, true));
    const isInjectAvatarIssueEnabled = computed(() => !!getSetting(Preference.ISSUE_RENDER_PROJECT_LOGO, true));

    function injectAvatar(projectPath: string) {
        const avatarUrl = projectAvatars[projectPath];
        if (!avatarUrl) {
            return;
        }

        if (isInjectAvatarTodoEnabled.value && window.location.href.includes('todos')) {
            const targetElements = document.querySelectorAll(`ul.todos-list a.todo-target-link[href*="${projectPath}"]`);
            targetElements.forEach((targetElement) => {
                const parentElement = targetElement.closest('li')?.children?.[0] || null;
                if (parentElement && !parentElement.children?.[0].classList.contains('chrome-gitlab-enhancer__project-avatar')) {
                    let injectElement: HTMLElement;
                    if (!avatarUrl.includes('http')) {
                        injectElement = document.createElement('div');
                        injectElement.className = 'gl-avatar gl-avatar-identicon gl-avatar-s24 gl-avatar-identicon-bg6';
                        injectElement.textContent = avatarUrl;
                    } else {
                        injectElement = document.createElement('img');
                        injectElement.setAttribute('src', avatarUrl);
                        injectElement.setAttribute('style', 'width: 24px;');
                    }

                    injectElement.classList.add('gl-mr-4', 'chrome-gitlab-enhancer__project-avatar');

                    parentElement.prepend(injectElement);
                    parentElement.classList.add('gl-align-items-center');
                }
            });
        }

        if (isInjectAvatarIssueEnabled.value) {
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
                            injectElement.setAttribute('style', 'width: 24px;');
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
    }

    function extractProjectPaths() {
        const paths: string[] = [];

        if (isInjectAvatarTodoEnabled.value && window.location.href.includes('todos')) {
            const aElements = document.querySelectorAll('ul.todos-list a.todo-target-link');
            aElements.forEach((aElement) => {
                const parts = (aElement.getAttribute('href') || '').substring(1)
                    .split('/-/');
                const projectPath = parts[0] || '';
                if (!projectPath || paths.includes(projectPath)) {
                    return;
                }

                paths.push(projectPath);
            });
        }

        if (isInjectAvatarIssueEnabled.value) {
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

    return {
        render: debounce(extractProjectPaths, 500),
    };
}
