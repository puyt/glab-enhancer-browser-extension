import {
    useBrowserLocation,
    useLocalStorage,
} from '@vueuse/core';
import {
    computed,
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

    const isDashboardMergeRequests = computed(() => {
        const location = useBrowserLocation();
        return location.value.pathname === '/dashboard/merge_requests';
    });

    function getCurrentPathname(): string {
        const location = useBrowserLocation();
        let pathname = location.value.pathname?.replace(/\/$/, '') || '';

        if (!pathname || !isDashboardMergeRequests.value) {
            return pathname;
        }

        // Workaround to make this work in "dashboard/merge_requests", as they share the same pathname.
        const urlSearchParams = new URLSearchParams(location.value.search);
        if (urlSearchParams.has('assignee_username')) {
            pathname += `?assignee_username=${urlSearchParams.get('assignee_username')}`;
        } else if (urlSearchParams.has('reviewer_username')) {
            pathname += `?reviewer_username=${urlSearchParams.get('reviewer_username')}`;
        }

        return pathname;
    }

    function sortQueryParams(search: string, removeKeys: string[] = []) {
        const params = new URLSearchParams(search);
        const sortedParams = new URLSearchParams();

        Array.from(params.keys())
            .sort()
            .forEach((key) => {
                if (removeKeys.includes(key)) {
                    return;
                }

                sortedParams.set(key, params.get(key) || '');
            });

        return sortedParams.toString();
    }

    function applyPersistentFilterOnLoad() {
        const pathname = getCurrentPathname();
        if (!pathname) {
            return false;
        }

        const removeSearchKeys = [
            'first_page_size',
            'page_after',
            'page',
        ];
        if (isDashboardMergeRequests.value) {
            removeSearchKeys.push('assignee_username', 'reviewer_username');
        }

        const search = persistentFilters.value.get(pathname);
        const cachedSearch = sortQueryParams(search, removeSearchKeys);

        const location = useBrowserLocation();
        const currentSearch = sortQueryParams(location.value.search as string, removeSearchKeys);

        if (!cachedSearch || cachedSearch === currentSearch) {
            return false;
        }

        window.location.href = pathname + search;
        return true;
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
        const pathname = getCurrentPathname();
        if (!pathname || (!document.querySelector('.vue-filtered-search-bar-container') && !document.querySelector('.filtered-search-box'))) {
            return;
        }

        const removeSearchKeys = [
            'first_page_size',
            'page_after',
            'page',
        ];
        if (isDashboardMergeRequests.value) {
            removeSearchKeys.push('assignee_username', 'reviewer_username');
        }

        const location = useBrowserLocation();
        const sortedSearch = sortQueryParams(location.value.search as string, removeSearchKeys);

        persistentFilters.value.set(pathname, sortedSearch ? ((isDashboardMergeRequests.value ? '&' : '?') + sortedSearch) : '');
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
        if (applyPersistentFilterOnLoad()) {
            return;
        }

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
