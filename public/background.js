function postMessage(type, data) {
    window.postMessage({ type, data });
}

// function onTabUpdated(tabId, changeInfo, tab) {
//     if (chrome.runtime.lastError || !tab.active || !tab?.url?.includes('//gitlab.')) {
//         return;
//     }
//
//     chrome.storage.local.get(function (result) {
//         chrome.scripting.executeScript({
//             target: { tabId: tab.id },
//             function: postMessage,
//             args: ['chrome-storage', result],
//         });
//
//     });
// }

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

// chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.webRequest.onCompleted.addListener(onWebRequestCompleted, { urls: ['<all_urls>'] });
