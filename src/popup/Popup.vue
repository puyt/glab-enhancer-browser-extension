<template>
    <div class="popup-wrapper">
        <header>
            <SvgLogo />

            <h1>GLab Enhancer</h1>

            <span>{{ Version }}</span>
        </header>

        <div class="popup-content">
            <div class="popup-settings">
                <h2 style="margin-top: 0;">GitLab Instance(s)</h2>

                <SettingTextInput
                    label=""
                    setting-key="customGitlabDomains"
                    title="Use comma separated values"
                    @saved="requestPermissions"
                />

                <template v-if="gitlabInstances.length">
                    <h2>Personal Access Tokens</h2>

                    <template
                        v-for="instance in gitlabInstances"
                        :key="instance"
                    >
                        <SettingTextInput
                            :is-sensitive="true"
                            :label="instance"
                            :setting-key="instance"
                            title="Used for web notifications"
                        />
                    </template>

                    <h2>Web Notifications</h2>

                    <SettingCheckboxes :items="webNotificationSettings" />
                </template>
            </div>

            <footer>
                <a
                    href="https://github.com/puyt/glab-enhancer-browser-extension"
                    style="color: var(--gray-dark); display: flex; align-items: center;"
                    target="_blank"
                >
                    <SvgIcon
                        class="s24"
                        :path="mdiGithub"
                        style="margin-right: 4px; width: 24px;"
                    />

                    <span style="font-size: 14px;">GitHub</span>
                </a>
            </footer>
        </div>
    </div>
</template>

<script
    lang="ts"
    setup
>
    import Version from '../../VERSION?raw'; //eslint-disable-line
    import SvgLogo from '../components/SvgLogo.vue';
    import SettingTextInput from './SettingTextInput.vue';
    import SettingCheckboxes from './SettingCheckboxes.vue';
    import {
        onMounted,
        type Ref,
        ref,
    } from 'vue';
    import { mdiGithub } from '@mdi/js';
    import SvgIcon from '../components/SvgIcon.vue';

    const gitlabInstances: Ref<Array<string>> = ref([]);
    onMounted(() => {
        chrome.storage.local.get(['customGitlabDomains'], (result: any) => {
            gitlabInstances.value = (result?.customGitlabDomains || []).split(',')
                .map((instanceUrl) => instanceUrl.trim()
                    .replace(/\/$/, ''));
        });
    });

    const webNotificationSettings = [
        {
            settingKey: 'webNotificationTodos',
            label: 'To Dos',
        },
    ];

    function requestPermissions(value: string) {
        const instances = value.split(',')
            .map((instanceUrl) => instanceUrl.trim()
                .replace(/\/$/, ''));
        gitlabInstances.value = instances;

        instances.forEach((instanceUrl: string) => {
            if (!instanceUrl) {
                return;
            }

            chrome.permissions.request({
                permissions: [
                    'webRequest',
                    'scripting',
                ],
                origins: [`${instanceUrl}/*`],
            });
        });
    }
</script>

<style
    lang="scss"
    scoped
>
    .popup-wrapper {
        flex-direction: column;
        display: flex;
        min-height: 380px;
        overflow: hidden;
    }

    .popup-content {
        flex: 1 1 0;

        flex-direction: column;
        display: flex;
    }

    .popup-settings {
        padding: 0 16px;

        & > div + div {
            margin-top: 8px;
        }

        h2 {
            margin-top: 24px;
            margin-bottom: 8px;
        }
    }

    header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;

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

        span {
            margin-left: 8px;
            padding: 4px 8px;

            color: #7b58cf;

            font-weight: bold;
            border-radius: 16px;
            background-color: white;
        }
    }

    footer {
        display: flex;
        justify-content: end;
        padding: 8px 16px 8px 0;
    }
</style>
