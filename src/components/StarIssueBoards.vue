<template>
    <div>
        <template
            v-for="(element, boardId) in teleportElements"
            :key="boardId"
        >
            <teleport
                v-if="element"
                :to="element"
            >
                <SvgIcon
                    v-if="starredBoards.has(boardId)"

                    class="star-issue-button-icon star-issue-button-icon--active has-tooltip"
                    title="Unstar issue board"
                    :path="gSvgStar"
                    :is-gitlab="true"

                    @click.stop="onClickUnstarIssueBoard(boardId)"
                />
                <SvgIcon v-else
                    class="star-issue-button-icon has-tooltip"
                    title="Star issue board"
                    :path="gSvgStarO"
                    :is-gitlab="true"

                    @click.stop="onClickStarIssueBoard(boardId, element)"
                />
            </teleport>
        </template>
    </div>
</template>

<script
    setup
    lang="ts"
>
    import {
        nextTick,
        onBeforeMount,
        onBeforeUnmount,
        type Ref,
        ref,
    } from 'vue';
    import { debounce } from 'lodash-es';
    import {
        gSvgStar,
        gSvgStarO,
    } from '../assets/icons';
    import SvgIcon from './SvgIcon.vue';
    import { useLocalStorage } from '@vueuse/core';

    const boardDropdownElement = ref<HTMLElement | null>(null);
    const teleportElements: Ref<Record<string, HTMLElement>> = ref({});

    function extractBoardLiElements() {
        nextTick(() => {
            const liElements = document.querySelectorAll('.boards-selector-wrapper .gl-new-dropdown-contents li.gl-new-dropdown-item') as NodeListOf<HTMLElement>;
            liElements.forEach((element: HTMLElement) => {
                const boardId = element.getAttribute('data-testid');
                if (!boardId) {
                    return;
                }

                teleportElements.value[boardId] = element.firstElementChild as HTMLElement;
            });
        });
    }
    const debouncedExtractBoardLiElements = debounce(extractBoardLiElements, 100);

    function registerMouseDownEvent() {
        if (!boardDropdownElement.value) {
            return;
        }

        boardDropdownElement.value.addEventListener('mousedown', debouncedExtractBoardLiElements);
    }

    function unregisterMouseDownEvent() {
        if (!boardDropdownElement.value) {
            return;
        }

        boardDropdownElement.value.removeEventListener('mousedown', debouncedExtractBoardLiElements);
    }

    onBeforeMount(() => {
        boardDropdownElement.value = document.querySelector('.boards-switcher .gl-new-dropdown-toggle');

        registerMouseDownEvent();

        window.addEventListener('message', (event) => {
            if (event.data.type === 'browser-request-completed' && !event.data.data.url.includes('is_custom=1')) {
                debouncedExtractBoardLiElements();
            }
        });
    });

    onBeforeUnmount(() => {
        unregisterMouseDownEvent();
    });

    const starredBoards = useLocalStorage('chrome-gitlab-enhancer/starred-boards', ref(new Map()));

    function onClickStarIssueBoard(boardId: string, element: HTMLElement) {
        starredBoards.value.set(boardId, { label: element.innerText, pathname: window.location.pathname });
    }

    function onClickUnstarIssueBoard(boardId: string) {
        starredBoards.value.delete(boardId);
    }
</script>

<style scoped>
    .star-issue-button-icon {
        fill: currentColor;
    }

    .star-issue-button-icon:hover {
        cursor: pointer;
        color: var(--yellow);
    }

    .star-issue-button-icon.star-issue-button-icon--active {
        color: var(--yellow);
    }
    .star-issue-button-icon.star-issue-button-icon--active:hover {
        color: var(--red);
    }
</style>
