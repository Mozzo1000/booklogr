# Data providers
Data providers can be configured to customize where BookLogr fetches its book information and metadata.

## Configuration
By default, BookLogr uses OpenLibrary as its primary source and falls back to the [openlibrary-local-db](https://github.com/Mozzo1000/openlibrary-local-db) backend. You can change these by setting the following environment variables for the `booklogr-api` service:

```env
DATA_PROVIDER=openlibrary
DATA_PROVIDER_FALLBACK=https://metadata.booklogr.app
```

:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::

## Available Providers

| Provider | Value | Description |
| :--- | :--- | :--- |
| **OpenLibrary** | `openlibrary` | The standard OpenLibrary API. This is the default primary source. |
| **openlibrary-local-db** | `[https://metadata.booklogr.app](https://metadata.booklogr.app)` | A dedicated metadata database. This is the default fallback source. |

:::info Official Instance
The URL [https://metadata.booklogr.app](https://metadata.booklogr.app) is an official hosted instance of the openlibrary-local-db backend.
:::

:::note
You can also provide a custom URL (e.g., `[http://192.168.1.50:5000](http://192.168.1.50:5000)`) if you are hosting your own instance of the `openlibrary-local-db` backend.
:::

## Self-Hosting
You can host your own version of the metadata database for better privacy or offline access using the [openlibrary-local-db](https://github.com/Mozzo1000/openlibrary-local-db) project. Once your local instance is running, simply point `DATA_PROVIDER` or `DATA_PROVIDER_FALLBACK` to your instance's address.

## How it works
When you search for a book or view details, BookLogr always checks your local database first. If the book already exists in your library, that local data is displayed to ensure your personal edits, reading progress, and ratings are preserved. If the book is not found locally, the system initiates a primary lookup by attempting to fetch data from the source defined in the `DATA_PROVIDER` variable. Should that primary provider be unavailable or fail to respond, the system automatically triggers its fallback logic to retrieve the metadata from the provider specified in `DATA_PROVIDER_FALLBACK`.