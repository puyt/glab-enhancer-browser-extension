import {
    Preference,
    useExtensionStore,
} from '../store';
import { onMounted } from 'vue';

export function useThreadsByDefault() {
    const { getSetting } = useExtensionStore();

    if (!getSetting(Preference.GENERAL_USE_THREADS_BY_DEFAULT, true)) {
        return
    }

    onMounted(() => {
        const textArea = document.querySelector('form.common-note-form textarea') as HTMLTextAreaElement
        if (textArea.textContent !== '') {
            return;
        }

        const element = document.querySelector('form.common-note-form .note-form-actions .js-comment-submit-button ul.gl-new-dropdown-contents li[data-testid="listbox-item-discussion"]') as HTMLElement;
        element?.click()
    });
}
