import {
    useBrowserLocation,
    useLocalStorage,
} from '@vueuse/core';
import {
    onBeforeMount,
    onBeforeUnmount,
    ref,
} from 'vue';
import {
    Preference,
    useExtensionStore,
} from '../store';

export function usePersistentFilters() {
    const { getSetting } = useExtensionStore();
    if (!getSetting(Preference.GENERAL_PERSISTENT_FILTERS, true)) {
        return;
    }

    const persistentFilters = useLocalStorage('chrome-gitlab-enhancer/persistent-filters', ref(new Map()));

    function applyPersistentFilterOnLoad() {
        const location = useBrowserLocation();
        if (!location.value.pathname) {
            return;
        }


        const search = persistentFilters.value.get(location.value.pathname);
        if (!search || location.value.search === search) {
            return;
        }

        location.value.search = search;
    }

    function applyPersistentFiltersOnNavSidebar() {
        persistentFilters.value.forEach((search, href) => {
            const aElement = document.querySelector(`div.contextual-nav li > a[href*="${href.replace(/\/$/, '')}"]`);
            if (aElement) {
                aElement.setAttribute('href', `${href}${search}`);
            }
        });
    }

    function savePersistentFilters() {
        const location = useBrowserLocation();
        if (!location.value.pathname || (!document.querySelector('.vue-filtered-search-bar-container') && !document.querySelector('.filtered-search-box'))) {
            return;
        }

        persistentFilters.value.set(location.value.pathname.replace(/\/$/, ''), location.value.search);
    }

    let observer: MutationObserver | null = null;
    let lastKnownURL = window.location.href;

    function handleURLChange() {
        const currentURL = window.location.href;
        if (lastKnownURL !== currentURL) {
            lastKnownURL = currentURL;

            savePersistentFilters();
        }
    }

    onBeforeMount(() => {
        applyPersistentFilterOnLoad();

        applyPersistentFiltersOnNavSidebar();

        savePersistentFilters();

        observer = new MutationObserver(() => {
            handleURLChange();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });

    onBeforeUnmount(() => {
        observer?.disconnect?.();
    });
}
