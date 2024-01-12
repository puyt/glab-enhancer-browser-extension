<template>
    <button
        :class="{
            'is-checked': modelValue,
        }"
        class="gl-flex-shrink-0 gl-toggle"
        @click.prevent="emit('update:model-value', !modelValue)"
    >
        <span class="toggle-icon">
            <svg
                class="gl-icon s16"
                viewBox="0 0 24 24"
            >
                <path :d="mdiCheck" />
            </svg>
        </span>
    </button>
</template>

<script
    lang="ts"
    setup
>
    import { mdiCheck } from '@mdi/js';
    import { toRefs } from 'vue';

    interface Props {
        modelValue: boolean,
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: false,
    });
    const {
        modelValue,
    } = toRefs(props);

    const emit = defineEmits<{
        'update:model-value': [value: boolean]
    }>();
</script>
