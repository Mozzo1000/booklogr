# Configure Email Verification
BookLogr supports email-based verification of new accounts. When a user signs up, they will receive a verification code via email if this feature is enabled. The user then needs to use this code to verify their account before being able to login.
:::note
This feature is **disabled** by default.
:::
To enable email verification, set the following environment variables in the `booklogr-api` container:


| Variable         | Description                              | Required | Default     |
|------------------|------------------------------------------|----------|-------------|
| `AUTH_REQUIRE_VERIFICATION` | Enable verification of new accounts  | Yes       | `False`     |
| `MAIL_SERVER`    | SMTP server address                      | Yes       | —           |
| `MAIL_USERNAME`  | Username for SMTP authentication         | Yes       | —           |
| `MAIL_PASSWORD`  | Password for SMTP authentication         | Yes       | —           |
| `MAIL_SENDER`    | Default sender email address             | Yes       | —           |
| `MAIL_PORT`      | SMTP server port                         | No        | `587`       |
| `MAIL_USE_TLS`   | Use TLS encryption                       | No        | `True`      |
:::tip
See [Environment variables](/docs/Configuration/Environment-variables) for more information.
:::

### Example `.env` configuration

```env
AUTH_REQUIRE_VERIFICATION=True
MAIL_SERVER=smtp.example.com
MAIL_USERNAME=my_smtp_username
MAIL_PASSWORD=my_smtp_password
MAIL_SENDER=noreply@example.com
MAIL_PORT=587
MAIL_USE_TLS=True
```