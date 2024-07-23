# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Welcome screen on first login.
- Basic framework for handling long running background tasks.
- API validation for editing current page.
- "No results found" text added when there are no results when searching.

### Fixed
- Reading progress percentage no longer shown as over 100% if current page exceeded total pages on a book.

### Changed
- Number of pages shown on a book page now shows 0 instead of a loading bar if there is no data from OpenLibrary.
- Book covers will now fallback to a static "cover not found" image instead of endlessly showing a loading bar.
- Search results now uses the same loading animation as everything else.

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