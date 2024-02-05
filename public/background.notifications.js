let lastFetchTodoTimestamp = Date.now();

function fetchGitLabTodos(instances) {
    instances.forEach((instanceUrl) => {
        chrome.storage.local.get([instanceUrl])
            .then((result) => {
                const token = result?.[instanceUrl] || null;
                if (!token) {
                    return;
                }

                const apiUrl = `${instanceUrl}/api/v4/todos`;

                try {
                    fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }

                            response.json()
                                .then((todos) => {
                                    const newTodos = todos.filter(todo => {
                                        const todoTimestamp = new Date(todo.created_at).getTime();
                                        return todoTimestamp > lastFetchTodoTimestamp;
                                    });

                                    newTodos.forEach((todo) => {
                                        chrome.notifications.create({
                                            type: 'basic',
                                            iconUrl: 'images/gitlab-enhancer-48.png',
                                            title: 'New GitLab Todo',
                                            message: todo.body,
                                        });
                                    });

                                    lastFetchTodoTimestamp = Date.now();
                                });
                        });
                } catch (error) {
                    console.error('Error fetching GitLab todos:', error);
                }
            });
    });
}

const initWebNotifications = () => {
    chrome.alarms.create('webNotifications', { periodInMinutes: 1 });

    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name !== 'webNotifications') {
            return;
        }

        chrome.storage.local.get(['customGitlabDomains', 'webNotificationTodos'])
            .then((items) => {
                const gitlabInstances = items.customGitlabDomains.split(',')
                    .map((domain) => domain.trim());

                if (gitlabInstances.length && items.webNotificationTodos) {
                    fetchGitLabTodos(gitlabInstances);
                }
            });
    });
}
export default initWebNotifications;
