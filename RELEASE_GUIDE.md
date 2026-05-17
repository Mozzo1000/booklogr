# Release Guide

This document outlines the step-by-step process for preparing, testing, and publishing a new release of BookLogr.

---

## Checklist

Use this checklist as a quick reference when executing a release.

### Preparation
- [ ] Ensure `main` branch is up to date.
- [ ] Move changelog items from `## [Unreleased]` to a new version section in `CHANGELOG.md`.
- [ ] Run `poetry run bump-my-version bump minor` (or `patch`) to automatically update all project configuration files.
- [ ] Commit version changes and changelog updates to `main`.

### Testing
- [ ] Run the local docker-compose test file to verify new features and environment variables locally. 
  - `sudo docker compose -f docker-compose.test.yml up --build --no-deps --force-recreate`
- [ ] Manually trigger the **Build and Publish API** GitHub Action using a release candidate tag (e.g., `v1.10.0-rc1`).
- [ ] Manually trigger the **Build and Publish Web** GitHub Action using the same release candidate tag (e.g., `v1.10.0-rc1`).
- [ ] Update private and demo instance to use the `-rc1` containers and verify all new features and migrations function as expected.

### Deploying
- [ ] Manually trigger the **Build and Publish API** GitHub Action using the official version tag (e.g., `v1.10.0`).
- [ ] Manually trigger the **Build and Publish Web** GitHub Action using the official version tag (e.g., `v1.10.0`).
- [ ] Create and publish a GitHub Release matching the tag (e.g., `v1.10.0`) with highlights and full changelog details.

> [!IMPORTANT]
> When running the Github Actions, you **MUST** prepend a `v` to the version number string (e.g., `v1.10.0` or `v1.9.1`). Otherwise, the image tag conventions expected by the production deployment patterns will break.
