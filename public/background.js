function postMessage(type, data) {
    window.postMessage({ type, data });
}

function onWebRequestCompleted(details) {
    if (details.tabId < 0) {
        return;
    }

    chrome.tabs.get(details.tabId, (tab) => {
        if (chrome.runtime.lastError || !tab.active || !tab?.url?.includes('//gitlab.')) {
            return;
        }

        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            function: postMessage,
            args: ['chrome-request-completed', details],
        });
    });
}

function getCustomDomains(callback) {
    chrome.storage.local.get(['customGitlabDomains'], function(result) {
        if (result.customGitlabDomains && result.customGitlabDomains.length > 0) {
            callback(result.customGitlabDomains.split(','));
        }
    });
}

chrome.webRequest.onCompleted.addListener(onWebRequestCompleted, { urls: ['<all_urls>'] });

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
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['/content.js']
                });
            }
        } catch(_) { /* empty */ }
    });
});
