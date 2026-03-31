# Single-user Mode

Single-user mode is a configuration option designed for users running BookLogr in private, trusted environments (like a home lab) where managing multiple accounts and passwords is unnecessary.
With single-user mode all authentication is disabled and you will not be prompted to login the web interface at all.

:::danger

**Do not enable Single-user mode if your BookLogr instance is accessible from the public internet.** 
Since this mode removes all password protection, anyone with your URL can modify your library, delete data, or view your private notes. Only use this mode within a local network or behind a strictly controlled VPN.

:::

## Enabling Single-user Mode
If you want to enable demo mode for your own server, set the following environment variable for the `booklogr-api` and `booklogr-web` services:

```env
# booklogr-api
SINGLE_USER_MODE=true

# booklogr-web
BL_SINGLE_USER_MODE=true
```

