const BRAND_GRADIENT = 'linear-gradient(135deg, rgba(47, 82, 51, 0.95) 0%, rgba(28, 28, 28, 0.92) 100%)';
const BRAND_TEXT_COLOR = '#1C1C1C';
const BRAND_BACKGROUND_COLOR = '#F5F5F4';
const BRAND_ACCENT_COLOR = '#D4A373';
const FOOTER_BACKGROUND_COLOR = '#1C1C1C';
const FOOTER_TEXT_COLOR = 'rgba(245, 245, 244, 0.78)';

export function wrapWithBranding(body, { title = 'Udoy Notification', previewText } = {}) {
  const safeBody = body || '';
  const safePreview = previewText ? String(previewText) : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    ${safePreview ? `<meta name="description" content="${safePreview}" />` : ''}
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        background-color: ${BRAND_BACKGROUND_COLOR};
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: ${BRAND_TEXT_COLOR};
      }
      a {
        color: inherit;
      }
      .preheader {
        display: none !important;
        visibility: hidden;
        opacity: 0;
        height: 0;
        width: 0;
        overflow: hidden;
        color: transparent;
        mso-hide: all;
      }
      .email-wrapper {
        width: 100%;
        background-color: ${BRAND_BACKGROUND_COLOR};
        padding: 32px 16px;
      }
      .email-container {
        width: 100%;
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 35px 80px rgba(28, 28, 28, 0.08);
      }
      .email-header {
        background: ${BRAND_GRADIENT};
        padding: 32px 40px;
        color: #ffffff;
        text-align: left;
      }
      .brand-title {
        margin: 0;
        font-family: 'Playfair Display', 'Times New Roman', serif;
        font-size: 28px;
        letter-spacing: -0.02em;
      }
      .brand-tagline {
        margin: 6px 0 0;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.3em;
        color: rgba(255, 255, 255, 0.72);
      }
      .email-body {
        padding: 40px;
        line-height: 1.65;
        font-size: 16px;
        color: ${BRAND_TEXT_COLOR};
      }
      .content {
        color: ${BRAND_TEXT_COLOR};
      }
      .content h1,
      .content h2,
      .content h3 {
        font-family: 'Playfair Display', 'Times New Roman', serif;
        margin: 0 0 16px;
        color: ${BRAND_TEXT_COLOR};
      }
      .content p {
        margin: 0 0 18px;
      }
      .content ul,
      .content ol {
        margin: 0 0 18px 20px;
        padding: 0;
      }
      .content li {
        margin-bottom: 10px;
      }
      .button {
        display: inline-block;
        padding: 14px 28px;
        border-radius: 999px;
        background-color: ${BRAND_ACCENT_COLOR};
        color: #1C1C1C !important;
        font-weight: 600;
        text-decoration: none;
        letter-spacing: 0.02em;
        transition: opacity 0.2s ease-in-out;
      }
      .button:hover {
        opacity: 0.88;
      }
      .divider {
        width: 100%;
        height: 1px;
        background: rgba(28, 28, 28, 0.08);
        margin: 32px 0;
      }
      .email-footer {
        background-color: ${FOOTER_BACKGROUND_COLOR};
        color: ${FOOTER_TEXT_COLOR};
        padding: 36px 40px;
        font-size: 13px;
      }
      .footer-headline {
        margin: 0 0 12px;
        font-family: 'Playfair Display', 'Times New Roman', serif;
        font-size: 20px;
        color: #ffffff;
      }
      .footer-text {
        margin: 0 0 16px;
        line-height: 1.6;
      }
      .footer-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 18px;
        margin-top: 24px;
        color: rgba(255, 255, 255, 0.55);
      }
      .footer-meta span {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      @media screen and (max-width: 600px) {
        .email-wrapper {
          padding: 24px 12px;
        }
        .email-header,
        .email-body,
        .email-footer {
          padding: 28px 24px;
        }
        .brand-title {
          font-size: 24px;
        }
        .brand-tagline {
          letter-spacing: 0.22em;
          font-size: 12px;
        }
        .email-body {
          font-size: 15px;
        }
        .button {
          width: 100%;
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <span class="preheader">${safePreview}</span>
    <div class="email-wrapper">
      <table role="presentation" class="email-container" cellspacing="0" cellpadding="0">
        <tr>
          <td class="email-header">
            <h1 class="brand-title">Udoy</h1>
            <p class="brand-tagline">Emerge, Rise, Thrive</p>
          </td>
        </tr>
        <tr>
          <td class="email-body">
            <div class="content">
              ${safeBody}
            </div>
          </td>
        </tr>
        <tr>
          <td class="email-footer">
            <p class="footer-headline">Rise beyond circumstances.</p>
            <p class="footer-text">
              Udoy aims to build equitable access to future-ready learning. Together, we nurture resilience, celebrate progress, and make opportunity undeniable.
            </p>
            <div class="divider" style="background: rgba(255, 255, 255, 0.12);"></div>
            <div class="footer-meta">
              <span>© ${new Date().getFullYear()} Udoy Collective. All rights reserved.</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

export default {
  wrapWithBranding,
};
