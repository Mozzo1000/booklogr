# Configure Google Sign-In

BookLogr supports Google authentication for account sign-in. To enable it, you will need to set up credentials and apply them to your container environment.

## Steps to set up Google Sign-In
### 1. Create OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project.
3. Navigate to **APIs & Services** → **Credentials**.
4. Set up the OAuth consent screen.
5. Click **Create Credentials** → **OAuth 2.0 Client ID**.
6. Choose **Web application** and configure:
   - **Authorized JavaScript origin**:  
     ```
     http://{your-domain-or-ip-of-web}
     ```
    - **Authorized redirect URI**:  
     ```
     http://{your-domain-or-ip-of-api}/v1/authorize/google
     ```
7. Save and copy the **Client ID** and **Client Secret**.

:::note
Replace `{your-domain-or-ip-of-web}` with the user facing domain name or IP of your `booklogr-web` server/container.

Replace `{your-domain-or-ip-of-api}` with the user facing domain name or IP of your `booklogr-api` server/container.
:::

### 2. Configure Environment Variables
Use your **Client ID** and **Client Secret** and set the environment variables accordingly.
:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::

#### `booklogr-api` container
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### `booklogr-web` container
```env
BL_GOOGLE_ID=your-client-id.apps.googleusercontent.com
```
:::note
If BL_GOOGLE_ID is empty or not set, the Sign in with Google button will not appear on the login screen.
:::

## Troubleshooting
### Error: Google Sign-In Disabled
If the Google Sign-In button is disabled this indicates that the provided Client ID is in the wrong format. 

**Verify Client ID Format**

It should match this pattern:
```
[numbers]-[string].apps.googleusercontent.com
```
:::note
If you Client ID does indeed match this pattern and you are still getting "Google Sign-In Disabled", please open an [issue](https://github.com/mozzo1000/booklogr/issues).
:::

