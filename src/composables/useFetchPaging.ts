import {
    type Ref,
    ref,
} from 'vue';

export async function useFetchPaging(endpoint: string, isFetchAll: boolean = true) {
    const data: Ref<Array<any>> = ref([]);
    const initialUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}is_custom=1&per_page=100`;

    try {
        const initialResponse = await fetch(initialUrl);
        if (!initialResponse.ok) {
            throw new Error('Failed to fetch data');
        }

        const initialData: Array<any> = await initialResponse.json();
        data.value.push(...initialData);

        if (isFetchAll) {
            const totalPages = parseInt(initialResponse.headers.get('x-total-pages') || '0', 10);

            const fetchPromises: Array<Promise<any>> = [];
            for (let page = 2; page <= totalPages; page++) {
                const promise = fetch(`${initialUrl}&page=${page}`)
                    .then(r => r.json());
                fetchPromises.push(promise);
            }

            const remainingPagesData: Array<any> = await Promise.all(fetchPromises);
            remainingPagesData.forEach((pageData) => {
                data.value.push(...pageData);
            });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    return { data };
}
