function initialize() {
    const contentWrapperDiv = document.querySelector('.layout-page .content-wrapper');
    const computedStyle = window.getComputedStyle(contentWrapperDiv);
    const paddingRight = computedStyle.getPropertyValue('padding-right')
        .replace('px', '');

    const appContainer = document.createElement('div');
    appContainer.style.right = parseInt(paddingRight || 0) + 16 + 'px';
    appContainer.id = 'chrome-gitlab-enhancer';
    document.body.appendChild(appContainer);

    const cssScript = document.createElement('link');
    cssScript.rel = 'stylesheet';
    cssScript.type = 'text/css';
    cssScript.href = chrome.runtime.getURL('/assets/main.css');
    document.body.appendChild(cssScript);

    const appScript = document.createElement('script');
    appScript.src = chrome.runtime.getURL('/assets/main.js');
    appScript.type = 'module';
    document.body.appendChild(appScript);
}

chrome.storage.local.get(function (result) {
    const domains = (result.customGitlabDomains || '').split(',')
        .map((url) => url.trim());
    domains.push('https://gitlab.com');

    if (domains.includes(window.location.origin)) {
        initialize();
    }
});

