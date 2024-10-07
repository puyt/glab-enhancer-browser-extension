# Changelog

## 2.8.9 - 2024.10 (07/10/2024)
### 🪲 Bug Fixes
- **ui, issue**: fix alignment total unresolved threads button. By puyt
- **permission**: remove trailing slashes from instances when requesting permissions. By puyt
- **permission**: allow permission requests for http. By puyt in #25
- **persistent-filters**: apply filters only on issues, boards & MR pages. By puyt
- **ui**: fix alignment stats favorite projects in command panel. By puyt
- disable MR hotkeys when using the rich text editor. By puyt in #27

## 2.8.8 - 2024.9 (30/09/2024)

### 🪲 Bug Fixes

- **css**: replace removed utility classes with style.

## 2.8.7 (03/07/2024)

### 🪲 Bug Fixes

- fix color issue validate button.
- fix color starred projects in command panel.
- fix "my unresolved threads" badge in MR detail.
- fix unresolved threads badges in MR overview.
- fix highlight my issues & MRs with for GitLab 17.x.

## 2.8.6 (03/07/2024)

### 🪲 Bug Fixes

- fix position preferences button with new GitLab update.

## 2.8.5 (02/07/2024)

### 🪲 Bug Fixes

- position preferences dropdown with new GitLab Duo chat button.

## 2.8.4 (14/05/2024)

### 🪲 Bug Fixes

- **issue-boards**: correct redirect for starred boards using board ID.

## 2.8.3 (03/04/2024)

### 🪲 Bug Fixes

- **persistent-filters**: allow update filters after applying persistent ones.

## 2.8.2 (02/04/2024)

### 🪲 Bug Fixes

- **persistent-filters**: fix infinite page refreshes + make it work for "dashboards/merge_requests".

## 2.8.1 (31/03/2024)

### 🪲 Bug Fixes

- **general**: disable persistent filters for dashboard MR views to stop continuous refreshes.

## 2.8.0 (30/03/2024)

### ✨ Features

- **issue**: add ability to star issue boards.
- **general**: add persistent filters for overviews.

### 🪲 Bug Fixes

- **command-panel**: fix re-order "My Places" with new GitLab update.

## 2.7.1 (05/03/2024)

### 🪲 Bug Fixes

- **command-panel**: fix re-order "Places".

## 2.7.0 (25/02/2024)

### ✨ Features

- **mr**: render project logo in MR group overview.

### 🪲 Bug Fixes

- **config**: ignore whitespace in multiple gitlab instances definition.

## 2.6.2 (07/02/2024)

### 🪲 Bug Fixes

- **scoped-labels-dropdown**: resolve label update in issue boards.

## 2.6.1 (06/02/2024)

### ✨ Features

- **scoped-labels-dropdown**: enable for group issue boards.

### 🪲 Bug Fixes

- **issue**: fix validation by fetching all discussions.

## 2.6.0 (05/02/2024)

### ✨ Features

- **background**: add web notifications for new to dos ([docs](https://github.com/puyt/chrome-gitlab-enhancer?tab=readme-ov-file#-web-notifications)).
- add changelog in gitlab enhancer dropdown.

### ♻️ Enhancements

- **scoped-labels-dropdown**: include chevron in click area.

### 🪲 Bug Fixes

- **scoped-labels-dropdown**: adjust z-index and visibility in dark mode.
- make icons visible in dark mode.

## 2.5.0 (26/01/2024)

### ✨ Features

- **issue, mr**: add dropdown for scoped labels
- **command-panel**: increase height to fill screen

## 2.4.0 (18/01/2024)

### ✨ Features

- **todos**: add render labels for issues & mrs

### 🪲 Bug Fixes

- **mr, issue**: fix favor thread over comment when textarea is not empty

## 2.3.1 (17/01/2024)

### ✨ Features

- add tooltip on version badge for changelog info

## 2.3.0 (16/01/2024)

### ✨ Features

- **todos**: render project logo
- **mr**: add hotkey "v" to mark file as viewed
- **popup**: render the changelog
- show current version in the dropdown
- **issue, mr**: use threads over comments by default

### ♻️ Enhancements

- **permission**: request optional permissions for content scripts

### 🗒️ Other

- **refactor**: split highlight my issues & mrs into 2 settings

## 2.2.0 (15/01/2024)

### ✨ Features

- **preference**: add mark as viewed & next file
- **preference**: add tooltip my issues & mrs

### ♻️ Enhancements

- **issue**: hide validate if validation is disabled
- **store**: rename the local storage key

### 🪲 Bug Fixes

- **mr**: fix badge alignment

### 🗒️ Other

- **refactor**: remove need for universal site access

## 2.1.0 (13/01/2024)

### ✨ Features

- show unresolved threads in issue overview
- add Dim "Draft" Mrs

### ♻️ Enhancements

- add arrow nav support in starred projects
- increase avatar size project

## 2.0.0 (12/01/2024)

- 🚀 Initial release in the Chrome Web Store
