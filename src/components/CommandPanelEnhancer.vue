<template>
    <div>
        <teleport
            v-if="starredPlaceholder"
            :to="starredPlaceholder"
        >
            <StarredProjects
                :gitlab-user-id="gitlabUserId"
                :match="searchQuery"
            />
        </teleport>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import { useMutationObserver } from '@vueuse/core';
    import { debounce } from 'lodash-es';
    import {
        computed,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
        toRefs,
    } from 'vue';
    import StarredProjects from './StarredProjects.vue';
    import {
        Preference,
        useExtensionStore,
    } from '../store';

    interface Props {
        gitlabUserId: number,
    }

    const props = withDefaults(defineProps<Props>(), {
        gitlabUserId: 0,
    });
    const {
        gitlabUserId,
    } = toRefs(props);

    const {
        getSetting,
    } = useExtensionStore();

    const starredPlaceholder: Ref<HTMLElement | null> = ref(null);

    let sidebarSearchButtonElement: HTMLElement | null = null;
    const commandPanelElement: Ref<HTMLElement | null> = ref(null);
    let stopObserving: (() => void) | null = null;

    const commandPanelSearchInputElement: Ref<HTMLElement | null> = ref(null);
    const searchQuery: Ref<string> = ref('');

    const isMovePlacesEnabled = computed(() => !!getSetting(Preference.COMMAND_PANEL_MOVE_PLACES, true));

    function reorderCommandPanelItems() {
        if (!isMovePlacesEnabled.value || searchQuery.value !== '' || !commandPanelElement.value) {
            return;
        }

        const liElements = commandPanelElement.value.querySelectorAll('.global-search-results > ul > li');
        if (liElements?.length >= 3) {
            const firstElement = liElements[0];
            const fourthItem = liElements[3];
            fourthItem?.parentNode?.insertBefore(firstElement, fourthItem);

            firstElement.classList.add('gl-border-t', 'gl-border-t-gray-200', 'gl-pt-2', 'gl-mt-2', 'gl-mt-3');
        }
    }

    function renderStarredProjects() {
        const listElement = commandPanelElement.value?.querySelector('.global-search-results ul') || null;
        if (!listElement) {
            return;
        }

        starredPlaceholder.value = document.createElement('li');
        starredPlaceholder.value.className = 'gl-p-0 gl-m-0 gl-pt-2';
        starredPlaceholder.value?.setAttribute('bordered', 'true');
        listElement.prepend(starredPlaceholder.value);
    }

    function enhance() {
        reorderCommandPanelItems();
        renderStarredProjects();
    }

    function handleInputChange(event: Event) {
        const target = event.target as HTMLInputElement;
        searchQuery.value = target.value;

        debouncedEnhance();
    }

    function onHideCommandPanel() {
        commandPanelSearchInputElement.value?.removeEventListener('input', debouncedInputChange);

        commandPanelSearchInputElement.value = null;
        commandPanelElement.value = null;

        stopObserving?.();
        stopObserving = null;
    }

    function onShowCommandPanel() {
        const parentElement = document.getElementById('super-sidebar-search-modal');
        commandPanelElement.value = document.getElementById('super-sidebar-search-modal___BV_modal_content_') || null;

        if (!parentElement || !commandPanelElement.value) {
            onHideCommandPanel();
            return;
        }

        commandPanelSearchInputElement.value = commandPanelElement.value?.querySelector('input#search');
        commandPanelSearchInputElement.value?.addEventListener('input', debouncedInputChange);

        stopObserving?.();
        const { stop } = useMutationObserver(
            parentElement,
            () => {
                setTimeout(() => {
                    if (!document.body.contains(commandPanelElement.value)) {
                        onHideCommandPanel();
                    }
                }, 300);
            },
            {
                childList: true,
                subtree: true,
            },
        );
        stopObserving = stop;

        enhance();
    }

    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === '/') {
            const targetElement = event.target as HTMLElement;
            if (![
                'INPUT',
                'TEXTAREA',
            ].includes(targetElement.tagName)) {
                onShowCommandPanel();
            }
        }
    }

    const debouncedInputChange = debounce(handleInputChange, 300);
    const debouncedHandleKeyPress = debounce(handleKeyPress, 200);
    const debouncedEnhance = debounce(enhance, 200);

    onMounted(() => {
        window.addEventListener('keydown', debouncedHandleKeyPress);

        sidebarSearchButtonElement = document.getElementById('super-sidebar-search');
        if (sidebarSearchButtonElement) {
            sidebarSearchButtonElement.addEventListener('click', onShowCommandPanel);
        }
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', debouncedHandleKeyPress);

        if (sidebarSearchButtonElement) {
            sidebarSearchButtonElement.removeEventListener('click', reorderCommandPanelItems);
        }
    });
</script>
