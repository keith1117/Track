# Project working agreement

## GitHub synchronization

- After completing a user-requested implementation and passing the relevant checks, commit the task-related changes and push the current working branch to its configured GitHub remote. The user has requested this as the default workflow for this project.
- Include the implementation's required source files, assets, tests, and documentation. Preserve unrelated local changes and do not include them without authorization.
- Check the remote branch before pushing. Never force-push, rewrite shared history, or bypass branch protection. If the branch has diverged, report the situation before performing a merge or rebase that could affect unrelated work.
- Do not commit secrets, credentials, local-only configuration, or temporary debugging artifacts.
- Verify the remote branch points to the submitted commit, then report the branch and a link to the commit. If authentication, network access, or repository permissions prevent synchronization, explain the blocker and do not claim that GitHub was updated.
- Read-only questions and reviews do not require a new commit or push.

## Localization and release boundaries

- Keep one business implementation and stable training/exercise IDs. Do not fork product logic or create permanent language branches.
- English is the baseline catalog. Edit mobile/locales/en.json and zh-CN.json together; generate messages.js with mobile/scripts/build-locales.js. Never hand-edit generated messages or translate by replacing rendered strings.
- Before committing mobile changes, run `node mobile/scripts/build-locales.js --check` and `node --test` from the repository root.
- Default release configuration exposes only English. Chinese preview requires explicit TRACK_LOCALE_PREVIEW=1; saved preferences and browser locale must not bypass the public whitelist.
- Language is separate from region, price and units. Preserve track.training-history.v1 data and numeric kg/km values; language switching must preserve unsaved training inputs and filters.
- Preserve the original body-part artwork. Body-card labels are real HTML text; edited text-free copies and their source prompts are tracked separately. Cardio remains monochrome without muscle highlighting.
- Synchronize approved daily changes to dev. Merging main, publishing a release/tag, changing default branches/protection or enabling deployment requires separate user confirmation.
