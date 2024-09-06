# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.1.0] - 2024-09-06

### Added
- Welcome screen on first login.
- Basic framework for handling long running background tasks.
- API validation for editing current page, rating and status.
- "No results found" text added when there are no results when searching.
- Error text is now shown when trying to give a higher rating than 5 or lower than 0.
- Error text is now shown when trying to set a current page higher than the books total page or lower than 0.
- Add CSV export functionality
- Account settings page (no working functionality yet)

### Fixed
- Reading progress percentage no longer shown as over 100% if current page exceeded total pages on a book.
- Search results will now only show books that have a corresponing ISBN. Without this would cause the search results to show up empty and endlessly load.

### Changed
- Number of pages shown on a book page now shows 0 instead of a loading bar if there is no data from OpenLibrary.
- Book covers will now fallback to a static "cover not found" image instead of endlessly showing a loading bar.
- Search results now uses the same loading animation as everything else.
- Reading status buttons in book action menu now has icons.

### Removed
- Profile creation on profile page. Instead the user will create it's profile in the newly added welcome screen.


## [1.0.0] - 2024-07-21

### Added

- Look up books by title or isbn, powered by OpenLibrary.
- Add books to your reading lists.
- Remove books from your reading lists.
- Add notes to read books.
- Rate your read books, 0.5-5 stars.
- Public profile of your reading lists.