# OIDC Authentication

BookLogr supports OpenID Connect (OIDC) authentication for account sign-in. To enable it, you will need to set up credentials and apply them to your container environment.

## Prerequisites

Before enabling OIDC, you must configure a new client application in your identity provider. While the specifics of this setup vary from provider to provider, the general approach should be the same.

1. **Create a Client Application**
   - **Protocol**: `OpenID Connect`
   - **Client Type/Authentication**: `Confidential` (Requires a Client Secret)
   - **Grant Type**: `Authorization Code`
   - **PKCE**: Disable if possible (is not used)

2. **Configure Redirect URIs**
   The **Valid Redirect URIs** must include the exact path to the frontends callback route:
   - `http://{your-domain-or-ip-of-web}/callback`


:::note
Replace `{your-domain-or-ip-of-web}` with the user facing domain name or IP of your `booklogr-web` server/container.
:::

### Example Configuration

<details>
<summary>Keycloak Example</summary>

#### Keycloak Setup

1. **Create Client**: Navigate to **Clients** -> **Create client**.
   - **Client type**: `OpenID Connect`
   - **Client ID**: `booklogr`
![alt text](/img/keycloak_1.png)

2. **Capability Config**:
   - **Client Authentication**: `On`
   - **Authorization**: `Off`.
   - **Standard Flow**: `Enabled`.
   - **Require PKCE**: `Off`.
![alt text](/img/keycloak_2.png)
1. **Login Settings**:
   - **Valid Redirect URIs**: `http://{your-domain-or-ip-of-web}/callback`
   - **Web Origins**: `+`.
![alt text](/img/keycloak_3.png)

1. **Credentials**:
   - Navigate to the **Credentials** tab to copy your **Client Secret**.
</details>


<details>
<summary>Pocket ID Example</summary>

#### Pocket ID Setup

1. **Create Client**: Go to **Administration** -> **OIDC Clients** -> **Add OIDC Client**.
   - **Name**: `booklogr`
   - **Callback URLs**: `http://localhost:5173/callback`
   - **Public Client**: `Disabled`
   - **PKCE**: `Disabled`
![alt text](/img/pocketid_1.png)

2. **Retrieve Credentials**: After saving, copy the Client ID and Client Secret from the client details page.
![alt text](/img/pocketid_2.png)

:::warning CORS & Reverse Proxy
By default, Pocket ID does not send the necessary CORS headers for browser-based discovery. If you see a "Cross-Origin Request Blocked" error in your browser console, you must configure your reverse proxy (like Traefik or Nginx) to inject these headers.
:::

#### Traefik Configuration Example
Add these labels to your Pocket ID service in your `docker-compose.yml`:

```yaml
labels:
  - "traefik.http.middlewares.pocketid-cors.headers.accesscontrolalloworiginlist=*"
  - "traefik.http.middlewares.pocketid-cors.headers.accesscontrolallowmethods=GET,OPTIONS,POST"
  - "traefik.http.middlewares.pocketid-cors.headers.accesscontrolallowheaders=*"
  - "traefik.http.routers.pocketid.middlewares=pocketid-cors"
```

:::tip Proxy Settings
Ensure the `APP_URL` in your Pocket ID environment variables matches the domain you are using to access it, and set `TRUST_PROXY=true`.
:::

</details>

### Configure Environment Variables
:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::

#### `booklogr-api` container
```env
OIDC_CLIENT_ID=your_client_id
OIDC_CLIENT_SECRET=your_client_secret
OIDC_REDIRECT_URI=http://{your-domain-or-ip-of-web}/callback
OIDC_DISCOVERY_URL=http://{your-domain-or-ip-of-OIDC-provider}/.well-known/openid-configuration
```

#### `booklogr-web` container
```env
BL_OIDC_AUTHORITY={your-domain-or-ip-of-OIDC-provider}
BL_OIDC_CLIENT_ID=your_client_id
```
:::note
If BL_OIDC_AUTHORITY and/or BL_OIDC_CLIENT_ID is empty or not set, the Sign in with OpenID Connect button will not appear on the login screen.
:::