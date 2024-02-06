<template>
    <div>
        <template
            v-for="(element, scope) in teleportElements"
            :key="scope"
        >
            <teleport
                v-if="element"
                :to="element"
            >
                <SvgIcon
                    :path="mdiChevronDown"
                    style="margin: -1px; pointer-events: none;"
                />

                <ul
                    :class="{
                        'show': selectedScope === scope,
                    }"
                    class="dropdown-menu"
                    :style="{
                        left: offsetLeft,
                    }"
                    style="width: 240px;"
                >
                    <div class="gl-dropdown-inner">
                        <div class="gl-dropdown-contents">
                            <template
                                v-for="label in groupedScopedLabels[scope]"
                                :key="label.name"
                            >
                                <li
                                    class="gl-dropdown-item"
                                    style="padding: 8px 16px;"
                                    @click="updateIssueLabel(label.name)"
                                >
                                    <GLabel
                                        :color="label.color"
                                        class="gl-mb-0! gl-mr-0!"
                                        :is-small="false"
                                        :label="label.name"
                                        :text-color="label.text_color"
                                    />
                                </li>
                            </template>
                        </div>
                    </div>
                </ul>
            </teleport>
        </template>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import { mdiChevronDown } from '@mdi/js';
    import { useFetch } from '@vueuse/core';
    import {
        computed,
        onBeforeUnmount,
        onMounted,
        type Ref,
        ref,
    } from 'vue';
    import GLabel from './GLabel.vue';
    import SvgIcon from './SvgIcon.vue';
    import { debounce } from 'lodash-es';
    import { useExtractProjectPaths } from '../composables/useExtractProjectPaths';
    import { useFetchPaging } from '../composables/useFetchPaging';

    interface GitLabLabel {
        id: number,
        name: string,
        color: string,
        text_color: string,
    }

    interface Props {
        currentProjectPath: string,
        csrfToken: string,
        iid: number,
    }

    const props = defineProps<Props>();

    const { extract: extractProjectPaths } = useExtractProjectPaths();

    const scopedLabels = ref({});
    const teleportElements: Ref<Record<string, HTMLElement>> = ref({});
    const selectedScope = ref('');
    const offsetLeft = ref('0');

    const isIssueBoard = computed(() => window.location.href.includes('/-/boards'));
    const iid = computed(() => {
        if (props.iid) {
            return props.iid;
        }

        if (isIssueBoard.value) {
            return parseInt(document.querySelector('li.board-card.is-active')?.getAttribute('data-item-iid') || '0');
        }

        return 0;
    })

    const groupedScopedLabels = computed(() => {
        return Object.keys(scopedLabels.value)
            .reduce((acc: Record<string, Array<GitLabLabel>>, key: string) => {
                const scope = key.split('::')?.[0] || '';
                if (scope) {
                    if (!acc[scope]) {
                        acc[scope] = [];
                    }

                    acc[scope].push(scopedLabels.value[key]);
                }

                return acc;
            }, {});
    });

    function updateIssueLabel(label: string) {
        if (!iid.value) {
            return;
        }

        useFetch(`/api/v4/projects/${encodeURIComponent(props.currentProjectPath)}/issues/${iid.value}`, {
            headers: { 'X-CSRF-TOKEN': props.csrfToken },
        })
            .put({ add_labels: [label] });
    }

    function onClickLabelHandler(event: Event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const target = event.target as HTMLElement;

        document.querySelectorAll('div.labels-select-wrapper span.gl-label')
            .forEach((element) => {
                const spanElement = element as HTMLSpanElement;
                spanElement.style.zIndex = 'initial';
            });

        const parentElement = target?.parentElement?.parentElement as HTMLSpanElement || null;
        const scope = parentElement?.getAttribute('data-qa-label-name')
            ?.split('::')?.[0] || '';

        if (parentElement) {
            parentElement.style.zIndex = '1';
        }
        selectedScope.value = selectedScope.value === scope ? '' : scope;
        offsetLeft.value = 0 - (parentElement?.offsetLeft || 0) + 'px';
    }

    async function onClickDocumentHandler() {
        if (!Object.keys(scopedLabels.value).length) {
            await fetchMultipleProjectLabels();
        }

        setTimeout(() => {
            if (document.querySelector('#js-right-sidebar-portal .gl-drawer-header')) {
                deboundedInjectTeleports();
            }
        }, 400);
    }

    function injectTeleports() {
        if (!iid.value || !document.querySelector('div.labels-select-wrapper .shortcut-sidebar-dropdown-toggle')) {
            return;
        }

        const labelsWrapperElement = document.querySelector('div.labels-select-wrapper');
        if (!labelsWrapperElement) {
            return;
        }

        Object.keys(groupedScopedLabels.value)
            .forEach((scope) => {
                const labelElement = labelsWrapperElement.querySelector(`span.gl-label[data-qa-label-name^="${scope}::"]`);
                if (!labelElement) {
                    return;
                }

                labelElement.classList.add('gl-overflow-visible');

                const scopeSpanElement = labelElement.querySelector('span.gl-label-text');
                scopeSpanElement?.setAttribute('style', 'border-radius: 16px 0 0 16px;');

                const teleportElement = labelElement.querySelector('span.gl-label-text-scoped');
                if (teleportElement) {
                    teleportElements.value[scope] = teleportElement as HTMLElement;
                    teleportElement.addEventListener('click', onClickLabelHandler);
                }
            });
    }

    async function fetchProjectLabels(projectPath: string) {
        const { data } = await useFetchPaging(`/api/v4/projects/${encodeURIComponent(projectPath)}/labels`);

        if (Array.isArray(data.value)) {
            data.value.forEach((item: GitLabLabel) => {
                if (item.name.includes('::') && !scopedLabels.value[item.name]) {
                    scopedLabels.value[item.name] = item;
                }
            });
        }
    }

    async function fetchMultipleProjectLabels() {
        const paths = extractProjectPaths();
        const promises = paths.map((path) => fetchProjectLabels(path));

        await Promise.all(promises);
    }

    const deboundedInjectTeleports = debounce(injectTeleports, 400);
    onMounted(async () => {
        if (!props.currentProjectPath) {
            setTimeout(() => {
                fetchMultipleProjectLabels();
            }, 600);
        } else {
            await fetchProjectLabels?.(props.currentProjectPath);
        }

        if (window.location.href.includes('/-/boards')) {
            document.body.addEventListener('mouseup', onClickDocumentHandler);
        } else {
            window.addEventListener('message', (event) => {
                if (event.data.type === 'browser-request-completed' && !event.data.data.url.includes('is_custom=1')) {
                    deboundedInjectTeleports();
                }
            });
        }
    });

    onBeforeUnmount(() => {
        document.body.removeEventListener('mouseup', onClickDocumentHandler);

        Object.values(teleportElements.value)
            .forEach((element) => {
                element.removeEventListener('click', onClickLabelHandler);
            });
    });
</script>

<style
    lang="scss"
    scoped
>
    li.gl-dropdown-item:hover {
        cursor: pointer;
        background-color: #ececef;
    }
</style>
