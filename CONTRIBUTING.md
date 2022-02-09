## Policies

We want to ensure a welcoming environment for all of our projects. Our staff follow the [TTS Code of Conduct](https://18f.gsa.gov/code-of-conduct/) and all contributors should do the same.

## Public domain

This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0 dedication. By submitting a pull request or issue, you are agreeing to comply with this waiver of copyright interest.

## Branch Management

# Branches

- This repo contains two active branches, `develop` and `main`. Main is the production branch and should _NOT_ be written to directly. Only valid and tested pull requests from the `develop` branch. Developers should work in the `develop` branch (or make their own and make PRs to develop).

### Workflow

Your Workflow should look like this,

```
^
|
|-----.
|     |_____.
|     |     |
|     |     |
|     |     |
|     |     |
|--------feature/
|     |
|--develop
|
main
```

### Naming

The following branch naming conventions can be pre-pended to your branch name

- `feature/`
- `bug/`
- `hotfix/`
- `test/`
- `docs/`

Additionally, branch names should follow the following convention

`<brief-ticket-description>-<ticket-number>`

an example of a properly formatted branch name looks like this,

`feature/appends-icon-TKT-633`

### Code Review

We run precommit hooks with husky to handle prettier and lint errors.

To prepare for code review, please follow these checks.

- branch has detailed description of work/updates
- title format follows: `[Ticket Number] : Brief statement describing what this pull request solves`.
- passed all integrated testing
- pipeline has completed successfully
- code review/design review requested as appropriate
- branch/preview link updated in ticket
