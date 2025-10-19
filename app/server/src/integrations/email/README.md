# Email Integration

The email adapter wraps a singleton Nodemailer transporter that powers outbound email delivery for the Udoy server.

## Files

- `nodemailerClient.js` – Instantiates a transporter during module load using the SMTP configuration exposed by `app/server/src/config/env.js` and logs connection issues.

## Configuration

Populate the `email` section in your environment configuration (see `.env.example`) with the following properties:

| Key | Description |
| --- | --- |
| `from` | Default sender address applied by higher-level mail helpers. |
| `verificationUrl` | Base URL for account verification links (consumed by feature modules). |
| `passwordResetUrl` | Base URL for password reset links. |
| `smtp.host` | SMTP server hostname. |
| `smtp.port` | Optional SMTP port. |
| `smtp.secure` | Boolean toggling TLS (`true` for port 465, `false` for STARTTLS ports like 587). |
| `smtp.auth.user` | SMTP username or login. |
| `smtp.auth.pass` | SMTP password or app token. |

If the SMTP configuration is missing, the adapter logs a warning and exports `null`, allowing the application to degrade gracefully in environments where email is optional.

## Usage

```js
import transporter from '../../integrations/email/nodemailerClient.js';

if (!transporter) {
  // Skip email logic when SMTP is unavailable.
  return;
}

await transporter.sendMail({
  to: 'user@example.com',
  subject: 'Greetings from Udoy',
  text: 'Hello! This message was sent through our email integration.',
});
```

The transporter performs a `verify` check at startup and logs detailed errors if the connection or credentials are invalid. It also listens for runtime `error` events to aid observability.
