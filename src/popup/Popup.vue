<template>
    <div>
        <header>
            <SvgLogo />

            <h1>GitLab Enhancer</h1>
        </header>
        <div>
            <label title="Use comma separated values">Custom domain(s):</label>

            <div style="display: flex;">
                <input
                    v-model="customDomains"
                    type="text"
                >

                <button
                    title="Save"
                    @click="persistDomains"
                >
                    <SvgIcon
                        :is-gitlab="false"
                        :path="mdiContentSaveOutline"
                        style="fill: currentColor;"
                    />
                </button>
            </div>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import {
        onMounted,
        ref,
    } from 'vue';
    import SvgLogo from '../components/SvgLogo.vue';
    import SvgIcon from '../components/SvgIcon.vue';
    import { mdiContentSaveOutline } from '@mdi/js';

    const originalCustomDomains = ref('');
    const customDomains = ref('');

    function persistDomains() {
        if (customDomains.value !== originalCustomDomains.value) {
            chrome.storage.local.set({ 'customGitlabDomains': customDomains.value });
        }

        if (customDomains.value !== '') {
            customDomains.value.split(',')
                .forEach((customDomain) => {
                    chrome.permissions.request({
                        permissions: [
                            'webRequest',
                            'activeTab',
                            'scripting',
                        ],
                        origins: [`${customDomain}/*`],
                    });
                });
        }
    }

    onMounted(() => {
        chrome.storage.local.get(function (result: any) {
            originalCustomDomains.value = result.customGitlabDomains || '';
            customDomains.value = originalCustomDomains.value;
        });
    });
</script>

<style
    lang="scss"
    scoped
>
    header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        svg {
            width: 48px;
            height: 48px;
            margin-right: 8px;
        }

        h1 {
            margin: 0;
            font-size: 26px;
            line-height: 48px;
            white-space: nowrap;
        }

    }

    label {
        display: flex;

        font-size: 16px;
        line-height: 32px;
        font-weight: bold;
    }

    input {
        width: 100%;
        min-height: 32px;
        padding: 3px 4px;
        border-radius: 4px;
        border-color: transparent;
    }

    button {
        color: white;
        min-width: 32px;
        margin-left: 8px;
        border: 1px solid white;
        border-radius: 4px;
        outline: none;
        background-color: rgba(255, 255, 255, 0.1);
        transition: background-color 0.3s ease-in-out;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            color: #7B45C8;
            cursor: pointer;
            background-color: rgba(255, 255, 255, 0.5);
        }

        &:active {
            color: #7B45C8;
            background-color: rgba(255, 255, 255, 0.7);
        }
    }
</style>
