# Share to Mastodon
BookLogr has a Mastodon integration that will allow BookLogr to share events onto your Mastodon profile when they happen in realtime. For example when finishing a book, BookLogr will automatically toot out your progress.

## Enable via web interface
By default, BookLogr will not share these events to Mastodon. You will first have to enable it in the Settings page on your BookLogr web interface.

![](https://raw.githubusercontent.com/Mozzo1000/booklogr/main/assets/mastodon-enable-share.png)

## Create app
1. Go to your Mastodon instance (ex https://mastodon.social)
2. Click the gear icon (Preferences) icon to access your Mastodon preferences.
3. Click Development in the left menu.
4. Click the New Application button.
5. Enter an Application Name of your choice (ex BookLogr).
6. Uncheck all the Scopes check boxes, and then check only the following check boxes: write:statuses.
7. Click the Submit button.
8. Click on the name of your application.
9. Copy your access token and paste it into BookLogr.

## References
- [Issue opened on 26th of July 2024 - ActivityPub support?](https://github.com/Mozzo1000/booklogr/issues/17)