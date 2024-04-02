# chrome-gitlab-enhancer

Maximize productivity and streamline your workflow on GitLab with this [Google Chrome extension](https://chromewebstore.google.com/detail/gitlab-enhancer/jkddbjinnohhgelaibifeapocefcgmeb)!
This powerful extension introduces a suite of features specifically designed to optimize your GitLab interface, making issue tracking and merge request management more efficient and user-friendly.

## ✨ Features

**General**

- Enable/disable most of the features by toggling the preferences
- Move the close issue / merge request button to the right side to prevent accidental clicks
- Add dropdown for scoped labels in issues & merge requests
- Remember the applied filters in the overview

**Command panel**

- Render starred projects
- Move "Places" after "Frequently visited ..."
- Increased height to fill the screen

**To-Do list**

- Render project logos
- Render labels
- Receive web notifications for new To-Do items

**Issues**

- Star issue boards and access them in the command panel
- Highlight issues assigned to yourself
- Render project logos in issue overview & board when viewed in groups
- Use "Threads" in favor of "Comments" by default
- Show unresolved threads in the detail
- Show unresolved threads **created by you** in the detail, with scrollTo buttons
- Validate incomplete issues in issue detail (e.g. missing iteration, weight, specific labels, ...)

**Merge Requests**

- Highlight your MRs
- Use "Threads" in favor of "Comments" by default
- Draft merge requests are visually dimmed, making them stand out less and helping you focus on ready-to-review items.
- Render project logos in group overviews
- Show unresolved threads in the overview
- Show unresolved threads **created by you** in the overview
- Show unresolved threads **created by you** in the detail, with scrollTo buttons
- Add hotkey `v` to toggle a changed file as "viewed"
- Add hotkey `Shift+J` to mark a changed file as "viewed" and go to next page

## ⚙️ Preferences

Click on the "GitLab Enhancer" dropdown to customize the settings:

![](assets/preview-preferences.png)

## 👀 Preview

![](assets/preview-command-panel.png)

![](assets/preview-mr-unresolved.png)

![](assets/preview-mr-unresolved-2.png)

![](assets/preview-issue-validation.png)

![](assets/preview-issue-unresolved.png)

![](assets/preview-issue-unresolved-2.png)

## 🔔 Web Notifications

In order to make the web notifications work, you'll to set up the **GitLab Instance(s)** && [Personal Access Token(s)](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) in the pop-up.

![web-notifications-settings.png](assets%2Fweb-notifications-settings.png)

## 💾 Manual Installation

### Chrome

1. Run
    ```
    npm install
    npm run build
    ```

2. Open [chrome://extensions/](chrome://extensions/)
3. Enable **Developer Mode**, in the right top corner
4. Click on `Load unpacked`
5. Select the `dist` directory
    ![chrome-extension.png](assets%2Fchrome-extension.png)
