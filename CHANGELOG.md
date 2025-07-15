# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
## [Unreleased]

## [1.5.0] - 2025-07-15
### Added
- Pressing `CTRL+K` now opens the search bar.
- Users can now select a specific book edition from a list of available options.
- Added documentation detailing the setup process for Google Sign-In.
- Mail server can now be configured to send the verification code to the new accounts email adress.
- Added support for multiple languages.
- Web app now checks for updates and notifies users via an icon in the footer.
  
### Changed
- Footer is now hidden on smaller screens.
- The provided `docker-compose.yml` now persists the SQLite database by mounting it to the host.
- Email verification no longer appears in the web app if the API env variable `AUTH_REQUIRE_VERIFICATION` is set to `false`. 
- The "Sign in with Google" button is now hidden on the login page when `BL_GOOGLE_ID` is empty.
- The "Sign in with Google" button is now disabled and displays an error when `BL_GOOGLE_ID` is incorrectly formatted.

### Fixed
- Mobile navigation bar now correctly displays colors in dark mode.

## [1.4.1] - 2025-07-03
### Added
- Support SQLite as alternative database

### Changed
- `AUTH_REQUIRE_VERIFICATION` env variable is now false by default.
- `EXPORT_FOLDER` env variable now defaults to `./export_data` if not set.

### Fixed
- The google authorization endpoint no longer crashes if the ID and secret was not set.

## [1.4.0] - 2025-07-02
### Added
- The search bar now displays a close button on smaller screens.
- The web interface now includes the ability to edit the total number of pages through the newly added 'Edit Book' option.
- A loading spinner is now shown while waiting for the export file to finish processing.
- Books can now be imported from BookLogrs own CSV format or Goodreads.
- Reading progress can now be entered as a percentage in addition to page number.
- Added pagination support when retrieving books from the api.
- Web interface now includes pagination controls on the library page for easier navigation.
- Dark mode.
- The version number is now displayed in the footer.

### Fixed
- Total pages are now correctly filled in automatically when adding book to list.
- Book descriptions are now being saved properly.
- Pages now include slight padding on the right side for smaller screens.
- Public profiles are now accessible even when no notes are present.
- Resolved issue where "NaN" appeared when both the current page and total pages were set to 0 on the book card. #27

### Changed
- Background tasks now run as a separate thread within the API.
- Authentication endpoints have been moved under the `/api` namespace.
- The "Add to List" button on the book page now allows users to update progress and change which reading list the book belongs to. It also detects if a book is already in a list and adjusts its behavior accordingly.
- When updating progress, the previous page number is now displayed instead of being left blank.
- Exported files are now generated using UTF-8 encoding.
- The welcome screen now appears on both the home screen and the profile page if no profile was previously created
- The provided example `.env` file now works out of the box with the included `docker-compose` setup, as the `DATABASE_URL` has been updated to point to the database container instead of localhost.
- Search results now display the authors name.
  
### Removed
- The `auth-server` has been completely removed as a dependency.
- The Docker image for background workers has been removed.
- Removed the ESC icon from the search bar in the navbar.


## [1.3.0] - 2025-01-02
### Added
- Docker image for background worker

### Fixed
- Tasks not being able to be created.
- Incorrect volume paths in provided `docker-compose.yml` file for postgres and auth-server services.

### Changed
- Account settings now have a more responsive layout.
- Worker management CLI now connects to the database via environment variable `DATABASE_URL`
- Updated `auth-server` to version 1.1.1 in the provided `docker-compose.yml` file
- Demo mode is now enabled with environment variables instead of requiring building from source.

## [1.2.0] - 2024-12-27
### Added
- Docker images for the API and web frontend. https://hub.docker.com/repository/docker/mozzo/booklogr-web and https://hub.docker.com/repository/docker/mozzo/booklogr
- Search now shows an error message when failing to retrieve results from OpenLibrary.
- Small transition when switching pages.
- Option to export data in JSON and HTML format.
- Worker management CLI tool.
- Quotes with page numbers can now be added.
- Event sharing - automatically post to Mastodon when finished reading a book.

### Fixed
- The navigation menu now disappears correctly after login and sidebar/mobile navigation will be visible without requiring a refresh of the page.
- Public profile not returning any information if there where no public notes in any books.
- 401 errors now redirect you back to the login page. This normally happens when the JWT token has expired.
- Error toast being shown on settings page when no exports files where available.

### Changed
- The provided docker-compose does no longer require a locally built `auth-server` image. Instead it pulls the image from Docker Hub. The users database is now also stored in sqlite instead of postgres, eliminating the need for a secondary postgres server container.
- The API is now available as a prebuilt docker image. The provided docker-compose has been changed to reflect this instead of building locally.
- Changed the color of the mobile navigation bar buttons to better match the styling of other similar elements.
- The layout in data tab on the settings page is now responsive. 
- Notes in the web interface has now been renamed to Notes & Quotes, to accomadate the new quotes feature.

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