# Environment variables
BookLogr uses environment variables to customize and set important variables across the app and between services. The variables and how they work are described below.

> ⚠️ The environment variables need to be changed in order to deploy `booklogr` to production.

## .env file
| Variable   | Options   | Default   | Description   |
|------------|-----------|-----------|---------------|
|DATABASE_URL|[SQLAlchemy Database URL](https://docs.sqlalchemy.org/en/20/core/engines.html)|sqlite:///books.db |Used by the API server and points to where the database is hosted. Use either SQLite or PostgreSQL. For PostgreSQL use `postgresql://admin:password@booklogr-db/booklogr` and use the env variables `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` and set them accordingly. **Note**: for PostgreSQL, when using docker it is important that the host part uses the same name as the database container. |
|AUTH_SECRET_KEY   |Text       |this-really-needs-to-be-changed |The secret key for authentication. **Change this to something completely random when deploying to production**|
|AUTH_ALLOW_REGISTRATION |True or False |True       |Allows non-authenticated users to sign up for an account. Set to `False` to not allow sign ups. |
|AUTH_REQUIRE_VERIFICATION |True or False     |False       |When registration is allowed, also require the user to verify their email adress. Set to `False` to not require verification. |
|GOOGLE_CLIENT_ID |Text     |None |Change this to your own Google Client ID if you want to allow authentication with Google |
|GOOGLE_CLIENT_SECRET |Text     |xxx       |Change this to your own Google Client Secret if you want to allow authentication with Google |
|POSTGRES_USER |Text     |admin       |The user to authenticate against the database with if using PostgreSQL |
|POSTGRES_PASSWORD |Text     |password       |The password for the user to authenticate against the database if using PostgreSQL.  |
|POSTGRES_DB |Text     |booklogr       |The name of the database if using PostgreSQL.|
|AUTH_DEFAULT_USER | Text (email address) | Commented out | Uncomment and type in an email adress if you want to create a specific user on startup. Example use case is the demo instance. |
|AUTH_DEFAULT_PASSWORD | Text (email address) | Commented out | Password for the user set with AUTH_DEFAULT_USER |

## Service: booklogr-web
| Variable             | Options   | Default   | Description   |
|----------------------|-----------|-----------|---------------|
|BL_API_ENDPOINT     |URL           |http://localhost:5000/  |URL to the booklogr API service.               |
|BL_GOOGLE_ID |Text           |Empty           |Leave empty to disable Google Login. Change this to your own Google Client ID if you want to allow authentication with Google. Set this to the same as in the `.env` file in the root directory.               |
|BL_DEMO_MODE |true or false |false |Adds information to login screen and removes features such as Google Login, used for demo purposes. |

### .env file for frontend
The frontend has it's own `.env` file located in the `web` directory. This is because [Vite](https://vitejs.dev/), the frontend tooling used in this project requires environment variables to be prefixed with `VITE_`. This causes some duplicate environment variables.
:::warning
These are only used if building from source or in a development fashion. If you are using docker and want to set these variables, see the table `Service: booklogr-web` above.
:::
| Variable             | Options   | Default   | Description   |
|----------------------|-----------|-----------|---------------|
|VITE_API_ENDPOINT     |URL           |http://localhost:5000/  |URL to the booklogr API service.               |
|VITE_GOOGLE_CLIENT_ID |Text           |XXX.apps.googleusercontent.com           |Change this to your own Google Client ID if you want to allow authentication with Google. Set this to the same as in the `.env` file in the root directory.               |
|VITE_DEMO_MODE |true or false |false |Adds information to login screen and removes features such as Google Login, used for demo purposes. |

