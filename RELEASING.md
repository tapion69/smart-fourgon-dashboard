# Releasing Smart Fourgon Dashboard

This document describes how stable HACS versions are published.

## Versioning

Use Semantic Versioning:

```text
MAJOR.MINOR.PATCH
```

Examples:

- `1.0.7` — stable release;
- `1.0.8` — compatible bug-fix release;
- `1.1.0` — compatible feature release;
- `2.0.0` — breaking release.

## Before releasing

1. Test the dashboard on desktop.
2. Test the dashboard on smartphone.
3. Verify existing settings still load correctly.
4. Update `custom_components/smart_fourgon/manifest.json`.
5. Update `CHANGELOG.md`.
6. Push the changes to `main`.
7. Make sure the **Validate** workflow is green.

## Publishing a stable HACS release

The repository contains:

```text
.github/workflows/release.yml
```

A stable release can be started in two ways:

### Manual

1. Open the repository **Actions** tab.
2. Select **Publish HACS Release**.
3. Select **Run workflow**.
4. Enter the exact version found in `manifest.json`.
5. Run the workflow.

### Release trigger file

For automated publication, update:

```text
.github/release-trigger
```

with the exact version to publish.

The workflow validates the repository before creating anything.

## What the workflow does

Before publishing, it checks that:

- the requested version is valid;
- the version matches `manifest.json`;
- the tag does not already exist;
- JSON files are valid;
- Python syntax is valid;
- frontend JavaScript syntax is valid;
- HACS validation passes;
- Hassfest validation passes.

It then creates:

- the `vX.Y.Z` Git tag;
- the GitHub Release.

## HACS updates

HACS uses stable GitHub Releases to identify normal update versions.

Development commits may continue to be pushed to `main`, but users should only expect normal HACS update notifications when a new stable Release is published.

## Rules

- Never reuse or overwrite a published version tag.
- Do not publish a release when validation is failing.
- Keep `manifest.json`, the Git tag and the Release version aligned.
- Document user-visible changes in `CHANGELOG.md`.
