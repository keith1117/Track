# Project working agreement

## GitHub synchronization

- After completing a user-requested implementation and passing the relevant checks, commit the task-related changes and push the current working branch to its configured GitHub remote. The user has requested this as the default workflow for this project.
- Include the implementation's required source files, assets, tests, and documentation. Preserve unrelated local changes and do not include them without authorization.
- Check the remote branch before pushing. Never force-push, rewrite shared history, or bypass branch protection. If the branch has diverged, report the situation before performing a merge or rebase that could affect unrelated work.
- Do not commit secrets, credentials, local-only configuration, or temporary debugging artifacts.
- Verify the remote branch points to the submitted commit, then report the branch and a link to the commit. If authentication, network access, or repository permissions prevent synchronization, explain the blocker and do not claim that GitHub was updated.
- Read-only questions and reviews do not require a new commit or push.
