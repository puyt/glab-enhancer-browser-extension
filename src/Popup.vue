<template>
    <div>
        <div>
            <label>GitLab Token:</label>
            <input
                v-model="token"
                type="password"
            >
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
        watch,
    } from 'vue';

    const token = ref('');

    watch(() => token.value, (newValue) => {
        chrome.storage.local.set({ 'gitlabToken': newValue });
    });

    onMounted(() => {
        chrome.storage.local.get(function (result: any) {
            token.value = result.gitlabToken || '';
        });
    });
</script>
