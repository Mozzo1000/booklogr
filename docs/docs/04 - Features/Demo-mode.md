# Demo Mode
BookLogr includes a demo mode feature for showcasing the applications functionality. This mode is used for the official demo site at https://demo.booklogr.app

To try the official demo website, use the following login credentials:
- **Username**: `demo@booklogr.app`
- **Password**: `demo`

## Disabled features in demo mode
The following features are disabled when in demo mode,

- Account registration
  - Users cannot create new accounts. Everyone uses the shared demo account.
- Google authentication
  - The Google sign-in option is removed from the login interface.

## Enabling Demo Mode
If you want to enable demo mode for your own server, set the following environment variable for the `booklogr-web` service:

```env
BL_DEMO_MODE=true
```
