# Check for updates

BookLogr includes a built-in mechanism to notify you when a new version is available.
By default, the web application periodically checks the [BookLogr GitHub repository](https://github.com/Mozzo1000/booklogr) for new releases.
If a newer version than the one you are currently running is detected, an update icon will appear in the footer of the web app. Clicking this icon will allow you to read the release notes so you can see what's new before updating your instance.

## Disabling Update Checks
Update checks are enabled by default. If you prefer not to have your instance check for updates you can disable this functionality.

To disable update checks, set the `BL_CHECK_UPDATES` environment variable to `false` for the `booklogr-web` service:
```env
BL_CHECK_UPDATES=false
```