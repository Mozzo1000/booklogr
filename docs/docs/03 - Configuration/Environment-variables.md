# Environment variables
BookLogr uses environment variables to customize and set important variables across the app and between services. The variables and how they work are described below.

:::warning
The environment variables need to be changed in order to deploy `booklogr` to production.
:::

## .env file
| Variable   | Options   | Default   | Description   |
|------------|-----------|-----------|---------------|
|DATABASE_URL|[SQLAlchemy Database URL](https://docs.sqlalchemy.org/en/20/core/engines.html)|sqlite:///books.db |Used by the API server and points to where the database is hosted. Use either SQLite or PostgreSQL. For PostgreSQL use `postgresql://admin:password@booklogr-db/booklogr` and use the env variables `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` and set them accordingly. **Note**: for PostgreSQL, when using docker it is important that the host part uses the same name as the database container. |
|AUTH_SECRET_KEY   |Text       |None |The secret key for authentication. This needs to be set to a random string in order for BookLogr to start.|
|AUTH_ALLOW_REGISTRATION |True or False |True       |Allows non-authenticated users to sign up for an account. Set to `False` to not allow sign ups. |
|AUTH_REQUIRE_VERIFICATION |True or False     |False       |When registration is allowed, also require the user to verify their email address. Set to `False` to not require verification. |
|GOOGLE_CLIENT_ID |Text     |None |Change this to your own Google Client ID if you want to allow authentication with Google |
|GOOGLE_CLIENT_SECRET |Text     |xxx       |Change this to your own Google Client Secret if you want to allow authentication with Google |
|POSTGRES_USER |Text     |admin       |The user to authenticate against the database with if using PostgreSQL |
|POSTGRES_PASSWORD |Text     |password       |The password for the user to authenticate against the database if using PostgreSQL.  |
|POSTGRES_DB |Text     |booklogr       |The name of the database if using PostgreSQL.|
|AUTH_DEFAULT_USER | Text (email address) | Commented out | Uncomment and type in an email address if you want to create a specific user on startup. Example use case is the demo instance. |
|AUTH_DEFAULT_PASSWORD | Text (email address) | Commented out | Password for the user set with AUTH_DEFAULT_USER |
|SINGLE_USER_MODE | true or false | false | Disables all authentication and account management for private, trusted environments. Warning: Do not enable if the instance is public. [See Single-user Mode documentation.](/docs/Configuration/Single-user-mode) |
|OIDC_CLIENT_ID |Text |None |The Client ID provided by your OpenID Connect identity provider for application authentication.|
|OIDC_CLIENT_SECRET |Text |None |The Client Secret provided by your OpenID Connect identity provider.|
|OIDC_REDIRECT_URI |URL |None |The exact callback URL where users are redirected after OIDC authentication. Format: `http://{your-domain-or-ip-of-web}/callback`.|
|OIDC_DISCOVERY_URL |URL |None |The full discovery URL of your OIDC identity provider, ending in `/.well-known/openid-configuration`.|


## Service: booklogr-web
| Variable             | Options   | Default   | Description   |
|----------------------|-----------|-----------|---------------|
|BL_API_ENDPOINT     |URL           |http://localhost:5000/  |URL to the booklogr API service.               |
|BL_GOOGLE_ID |Text           |Empty           |Leave empty to disable Google Login. Change this to your own Google Client ID if you want to allow authentication with Google. Set this to the same as in the `.env` file in the root directory.               |
|BL_DEMO_MODE |true or false |false |Adds information to login screen and removes features such as Google Login, used for demo purposes. |
|BL_SINGLE_USER_MODE |true or false |false |Disables login and account management UI for private environments. [See Single-user Mode documentation.](/docs/Configuration/Single-user-mode) |
|BL_CHECK_UPDATES |true or false |true |Enables the periodic check for new releases from GitHub and shows a notification icon in the footer. |
|BL_DEBUG | true or false |false |Enables debug mode, exposing settings and debug information on the frontend (/debug). **Do NOT enable in production.** |
|BL_ALLOW_MANUAL_LOGIN | true or false |true |Toggles the visibility of the email and password card on the login screen. Set to `false` to hide the form entirely, which is useful when relying exclusively on Google or OIDC authentication. |
|BL_ALLOW_REGISTRATION | true or false |true |Controls the display of the registration button within the login card. Set to `false` to hide the "Register" button and prevent registration routes from being exposed in the UI. To be used in conjunction with `AUTH_ALLOW_REGISTRATION` in the api service. |
|BL_OIDC_AUTHORITY |URL |Empty |The base URL of your OpenID Connect identity provider. Do no set to hide the "Login with OpenID Connect" button on the login screen.|
|BL_OIDC_CLIENT_ID |Text |Empty |The Client ID from your OIDC identity provider. Must match the value used in the api service|

### .env file for frontend
The frontend has its own `.env` file located in the `web` directory. This is because [Vite](https://vitejs.dev/), the frontend tooling used in this project, requires environment variables to be prefixed with `VITE_`. This causes some duplicate environment variables.
:::warning
These are only used if building from source or in a development fashion. If you are using Docker and want to set these variables, see the table `Service: booklogr-web` above.
:::
| Variable             | Options   | Default   | Description   |
|----------------------|-----------|-----------|---------------|
|VITE_API_ENDPOINT     |URL           |http://localhost:5000/  |URL to the BookLogr API service.               |
|VITE_GOOGLE_CLIENT_ID |Text           |XXX.apps.googleusercontent.com           |Change this to your own Google Client ID if you want to allow authentication with Google. Set this to the same as in the `.env` file in the root directory.               |
|VITE_DEMO_MODE |true or false |false |Adds information to login screen and removes features such as Google Login, used for demo purposes. |
|VITE_SINGLE_USER_MODE |true or false |false |Disables login and account management UI for private environments. [See Single-user Mode documentation.](/docs/Configuration/Single-user-mode) |
|VITE_CHECK_UPDATES |true or false |true |Enables the periodic check for new releases from GitHub and shows a notification icon in the footer. |
|VITE_DEBUG | true or false |false |Enables debug mode, exposing settings and debug information on the frontend (/debug). **Do NOT enable in production.** |
|VITE_ALLOW_MANUAL_LOGIN | true or false |true |Toggles the visibility of the email and password card on the login screen. Set to `false` to hide the form entirely, which is useful when relying exclusively on Google or OIDC authentication. |
|VITE_ALLOW_REGISTRATION | true or false |true |Controls the display of the registration button within the login card. Set to `false` to hide the "Register" button and prevent registration routes from being exposed in the UI. To be used in conjunction with `AUTH_ALLOW_REGISTRATION` in the api service. |
|VITE_OIDC_AUTHORITY |URL |Empty |The base URL of your OpenID Connect identity provider.|
|VITE_OIDC_CLIENT_ID |Text |Empty |The Client ID from your OIDC identity provider.|