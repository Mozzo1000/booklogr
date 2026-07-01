# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
## [Unreleased]
### Fixed
- Fixed an issue where registration, login, and email verification could silently ignore missing required fields, potentially causing an unexpected error instead of a proper validation message.
- Fixed an issue where a book rating of exactly 5.5 or -0.5 could bypass validation and be saved incorrectly.
- Fixed an issue where the note visibility field was not properly validated when creating or editing a note, allowing invalid values to be saved.
- Fixed an issue where the profile visibility field was not properly validated when creating or editing a profile, allowing invalid values to be saved.
- Fixed an issue where adding a book did not validate the reading status, current page, or total pages fields, allowing invalid values to be saved.
- Fixed an issue where the task type was not validated when creating a task, allowing unintended task types to be submitted.
- Fixed an issue where the task retry endpoint did not correctly verify the task ID or ownership, potentially affecting the wrong task.
- Fixed an issue where search results could be shared across different users due to a missing user identity component in the cache key.
- Resolved an issue where searching by ISBN with hyphens returned no results when using the BookLogr metadata provider.
- Resolved an issue where the search endpoint returned a 500 error instead of an empty result when the external data provider returned no books.
- Fixed an issue where books could not be correctly sorted by the date they were added.
- Fixed an issue where the sort-by-status label was displayed as an escaped string in the sort dropdown when using the French language.
- Fixed missing dark mode hover styles on the book rating component.
- Fixed subtitle text color not respecting dark mode on the book details page.
- Fixed an issue where adding a book without a title returned a 500 error instead of a validation error.
- Fixed an issue where the book subtitle was not being saved to the database when adding a book.
- Resolved an issue where sort, order, and pagination settings were not applied when viewing the All tab in the library.

### Added
- Added the ability to filter the library by author.
- Added a Notes & Quotes feed to the profile page, displaying all public notes and quotes across a users library.
- Added subtitle field to the add book and edit book modals.
- Added custom fields support, allowing users to define and attach custom metadata (text, number, date, selection, and boolean) to books. Fields can be managed from the Settings page and their values are editable from the add/edit book modals and displayed on the book details page.

### Changed
- Improved search performance by batching ISBN lookups into a single query instead of querying once per external result.
- Search results are now cached client-side to avoid redundant requests when repeating the same query.
- Book details are now cached client-side, avoiding a redundant request when revisiting a book page.
- The library page is now cached client-side per tab/sort/order/page, avoiding redundant requests when switching between tabs.
- Ratings are now included when importing books from BookLogr CSV and Goodreads formats.
- The Add to Reading List button is now disabled until the book title has finished loading.
- The Edit Book modal has been redesigned to match the Add Book modal and now supports editing description and reading status in addition to title, author, and total pages.

## [1.11.1] - 2026-06-23
### Fixed
- Resolved an issue where books manually added to the Read list had their progress incorrectly set to 0% instead of 100%.
- Fixed wrong use of env variable in CheckUpdate error handler when GitHub API fails.
- Resolved an issue where OpenLibrary errors on the book page would always show an error toast, including expected 404s that should be silently ignored.
- Fixed a z-index issue where the add book button tooltip in the search bar was hidden behind the search results.

### Changed
- Increased HTTP timeouts for external data providers to reduce failures on slow connections.
- Improved the expanded sidebar search bar to display results in a floating panel above the sidebar, with a shadow and border for better visibility.
- Release notes in the update modal now render images and GitHub-style alerts ([!NOTE], [!WARNING], etc.) correctly.

## [1.11.0] - 2026-06-21
### Added
- Searching by ISBN will now find matching books in either ISBN10/13 format by converting between them if possible.
- Added French language.
- Added Spanish language.
- Added Portuguese language.
- Added Russian language.
- Added subtitle to books page
- Added an "All" tab to the library, configurable tab visibility, and a default view setting.

### Fixed
- Fix typos in english translation.
- Resolved layout issues in the edition list by enforcing a fixed cover frame and rendering a styled fallback cover when OpenLibrary is missing a cover ID.
- Resolved an issue where sorting options displayed the incorrect translation key after switching languages.
- Resolved an issue where OpenLibrary was unreachable during searching due to a typo in the book provider code.
- Resolved an issue where reading history was fetched unnecessarily during the initial loading of the library component.
- Resolved an issue where the language filter in the edition selector was covered by the edition list, making it difficult to select a language.

### Changed
- Changed the empty-state icon in the Notes tab to a note icon to match the tab label.
- Language switcher now lists the languages in a sorted order, trying to prioritize the users web browser language to the top.
- Updated swedish translation.
- Improved image loading speeds in the book list by using smaller cover sizes.
- Changed "Want to read" to "To be read" when adding book to match the name of the reading list.
- Changed book sorting to be case-insensitive.

## [1.10.0] - 2026-05-17
### Added
- A new debug page accessible at `/debug` to help diagnose configuration issues. This page is only available when the `BL_DEBUG` environment variable is set to `true` and should only be used temporarily for troubleshooting.
- Support for OpenID Connect (OIDC) login, allowing you to authenticate using external identity providers.
- A "Login with OpenID Connect" button on the login page when configured.
- New environment variables to customize the login screen, including the ability to hide the registration button or the manual login form.
- You can now track your full reading history for each book, including the ability to record multiple start and finish dates.
- A new "Read again" option has been added to book pages, allowing you to easily start a new reading session for books you've already completed.
- Custom data provider support, you can now configure where BookLogr fetches book information. In addition to OpenLibrary, the app now supports https://metadata.booklogr.app as a metadata source.
- You can now upload a profile picture, which will be displayed on your profile and settings pages.
- Added support for the Hindi language.

### Fixed
- Resolved an issue where the mobile navigation bar was hidden on the profile page.
- Resolved an issue where a skeleton loading animation would display indefinitely if a book description was missing.
- Authentication routes for OIDC and Google now respect the `AUTH_ALLOW_REGISTRATION` environment variable, preventing new account creation via external providers when registration is disabled.
- Adjusted the padding in the search bar to prevent the loading animation from being to close to the search field.
- Corrected the share button tooltip to display the proper text instead of the internal translation key.

### Changed
- Books in your library that have no author will now display "by unknown author" instead of being blank.
- The login and registration pages have been updated to be fully responsive on mobile devices.
- The profile page layout has been refined with updated spacing for reading stats new navigation tabs.
- Improved mobile layout on the profile page to ensure the bottom of the book list is no longer obscured by the navigation bar.
- The "Add Book" modal now opens in fullscreen on mobile devices.
- Removing a book now automatically removes all associated reading sessions from your history.
- The `BL_GOOGLE_ID` environment variable no longer needs to be explicitly set to empty to disable the feature and will now default to disabled if omitted entirely.

### Removed
- The navigation bar has been removed from public-facing pages (login, registration, and profile).

## [1.9.0] - 2026-04-07
### Added
- Added loading placeholder to the profile page to prevent it from appearing blank while books are loading.
- Added the ability to change the theme from the Settings page.
- You can now change your email address and password from the Settings page.
- Added share button to profile page.
- Your active library tab is now preserved in the URL, ensuring you stay on the same tab when refreshing the page.
- Caching to the search route to improve performance and reduce repeated data requests.
- Authentication token now automatically refreshes in the background when necessary.

### Fixed
- The background color of the "all books" section title on the profile page is now transparent to correctly match the background color.
- Resolved an issue where books from the previous list remained visible during tab switches by introducing loading placeholders.
- Added bottom padding to pages to prevent content from overlapping with the mobile navigation bar.
- Prevented the application from attempting to send emails when mail settings are not properly configured. If `AUTH_REQUIRE_VERIFICATION` is enabled without a valid email setup, it will now automatically default to false to avoid errors.
- Fixed an issue where logging out did not properly invalidate the session, ensuring revoked tokens can no longer be used to access your account.
- Creating a note now verifies book ownership, preventing users from creating notes to books not present in their own library.

### Changed
- Library tabs now hide text and fill the entire width of the screen on smaller devices for a more compact mobile interface.
- The "Add Book" button on the Library page has been moved next to the sort and filter buttons and now automatically collapses on smaller screens.
- Sort and filter buttons are now responsive on smaller screens and open in a drawer.
- Buttons on the book page now render in a column on smaller screens.
- The "Update Reading" button now always stays at the bottom of the book card for a more consistent layout.
- The API route for checking if a book exists in a list by its ISBN has been changed to `/v1/books/<isbn>/status`.
- The book page now fetches data directly from the internal API instead of OpenLibrary, with the server handling external data retrieval from OpenLibrary when necessary.
- The Edition Selector on the book page is now disabled when no editions can be found.
- Search results now display books already in your library at the top of the list.

## [1.8.0] - 2026-03-31
### Added
- Added Single-user mode, allowing the application to be used without authentication for local environments.
- Added a DNF (Did Not Finish) list.
- Added support for the German language.
- Update checks in the web app can now be disabled by setting the `BL_CHECK_UPDATE` environment variable to `false`.
- Added the ability to manually add books that are not found in the OpenLibrary database.

### Fixed
- Resolved an issue where public profiles were not accessible.
- Language switcher now correctly defaults to English.
- Fixed an issue where the profile page would appear blank when the browser was set to an unsupported region.
- Resolved an issue when editing a book where the ISBN field incorrectly displayed the text "cover".

### Changed
- The frontend now hides the login and registration pages, account settings, and logout button when in single-user mode.
- The API will now display an error and refuse to start if the authentication secret key is not configured or is set to the previous default value.
- The search bar now expands to fill the entire screen on mobile devices.

## [1.7.0] - 2026-02-08
### Added
- Added support for Chinese and Arabic languages.
- Introduced a popup prompting users to manually enter missing data when adding a book to reading list.
- Added fallback for author name when retrieval fails.
- Added ability to manually edit book metadata.
- Added language filtering when selecting a book edition.

### Changed
- `BL_API_ENDPOINT` no longer require a trailing slash.

### Fixed
- Resolved an issue where the translation key `book.update_reading.finished.description` did not render correctly.

### Removed
- The home page has been removed.

## [1.6.0] - 2025-07-20
### Added
- Added list view to library and profile pages.
- Books in your library can now be sorted by title, author, date added, progress and rating.
- Added new settings tab, Interface. Users can now change language, region, timezone, and time format.
- Notes and quotes are now included in the export files.
- Books added to a list now has a date attached to it.
- The API endpoint for creating a new note now accepts an optional `created_on` value for setting the date and time for when the note was created. Defaults to the servers current date and time (UTC) if not provided.
  
### Changed
- Redesigned the Notes & Quotes UI.
- All date and times now respects the users settings.

### Fixed
- Dark/light mode is now persistent after a page refresh.
- Fixed retrieving incorrect total pages for pagination to work
- Fixed note icon color in dark mode.

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