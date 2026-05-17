# Customize Login Screen

Customize login screen allow you to tailor the sign-in experience for your BookLogr instance. This is especially useful if you rely exclusively on external authentication methods like OpenID Connect (OIDC) or Google Login.

## Configuration

You can customize the visibility of login elements by setting the following environment variables for the `booklogr-web` service:

```env
# booklogr-web
BL_ALLOW_MANUAL_LOGIN=true
BL_ALLOW_REGISTRATION=true
```
:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::

### BL_ALLOW_MANUAL_LOGIN

This variable controls whether users can sign in using the email and password form. When set to `false`, the standard login card and input fields are completely hidden from the interface. This is ideal if you want to force all users to authenticate exclusively through external single sign-on (SSO) providers like Google or OpenID Connect.

### BL_ALLOW_REGISTRATION

This variable toggles the visibility of the "Register" button inside the user interface, allowing you to quickly close public sign-ups from the frontend. When disabled, it prevents casual visitors from finding the registration page link, though you must pair it with `AUTH_ALLOW_REGISTRATION=false` in the API service to completely block backend account creation.