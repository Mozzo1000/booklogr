Debug mode can be enabled to help you diagnose configuration issues you are experiencing with the web interface.

:::danger Caution: Security Risk
**Never leave Debug Mode enabled in a public-facing production environment.** This mode exposes sensitive environment variables. Only enable it temporarily for troubleshooting or in private development/staging environments.
:::

## Enabling Debug Mode
If you want to enable debug mode, set the following environment variable for the `booklogr-web` service:
```env
BL_DEBUG=true
```
:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::
:::note
If `BL_DEBUG` is not set to `true`, the `/debug` route will be inaccessible.
:::

## Using Debug Mode
1.  Start your BookLogr containers.
2.  Navigate to your web instance URL and append `/debug` to the path:
    ```
    http://{your-domain-or-ip-of-web}/debug
    ```