function postMessage(type, data) {
    window.postMessage({ type, data });
}

function onWebRequestCompleted(details) {
    if (details.tabId < 0) {
        return;
    }

    chrome.tabs.get(details.tabId)
        .then((tab) => {
            if (chrome.runtime.lastError || !tab.active || !tab?.url?.includes('//gitlab.')) {
                return;
            }

            chrome.scripting.executeScript({
                target: { tabId: details.tabId },
                func: postMessage,
                args: ['browser-request-completed', details],
            });
        });
}

function getCustomDomains(callback) {
    chrome.storage.local.get(['customGitlabDomains'])
        .then(((result) => {
            const customDomains = result?.customGitlabDomains?.split(',') || [];
            callback(customDomains);
        }));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') {
        return;
    }

    getCustomDomains((domains) => {
        if (!tab.url) {
            return
        }

        try {
            const tabUrl = new URL(tab.url);
            const matchingDomain = domains.find((domain) => domain.includes(tabUrl.origin));

            if (matchingDomain) {
                chrome.permissions.contains({
                    permissions: [
                        'webRequest',
                        'scripting',
                    ],
                    origins: [`${matchingDomain}/*`],
                }).then((response) => {
                    if (!response) {
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['/content.js'],
                    });
                });

            }
        } catch (_) { /* empty */
        }
    });
});

chrome?.webRequest?.onCompleted?.addListener(onWebRequestCompleted, { urls: ['<all_urls>'] });
