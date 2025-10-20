import type {ActionArgs} from '@shopify/remix-oxygen';

import config from 'theme.config';

export async function action({request, context}: ActionArgs) {
  if (request.method !== 'POST') {
    return {
      error: 'Error',
    };
  }

  const {env, transporter} = context;

  const jsonBody: any = await request.json();

  const {firstName, lastName, email, message} = jsonBody;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>[Contact Form] New Request from ${config.storeName}</title>
          <meta name="description" content="Contact Form - New Request from ${config.storeName}">
          <meta name="author" content="SitePoint">
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
          <link rel="stylesheet" href="css/styles.css?v=1.0">
        </head>
        <body>
          <div class="img-container" style="display: flex;justify-content: center;align-items: center;border-radius: 5px;overflow: hidden; font-family: 'helvetica', 'ui-sans';">
          </div>
            <div class="container" style="margin-left: 20px;margin-right: 20px; font-size: 16px;">
              <p>You've got a new message from <strong>${firstName} ${lastName},</strong></p>
              <p><strong>Their email is:</strong> ${email}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            </div>
        </body>
        </html>
        `;

  const thankYouHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <title>[Contact Form] New Request from ${config.storeName}</title>
                <meta name="description" content="Contact Form - New Request from ${config.storeName}">
                <meta name="author" content="SitePoint">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <link rel="stylesheet" href="css/styles.css?v=1.0">
              </head>
              <body>
                <div class="img-container" style="display: flex;justify-content: center;align-items: center;border-radius: 5px;overflow: hidden; font-family: 'helvetica', 'ui-sans';">
                </div>
                  <div class="container" style="margin-left: 20px;margin-right: 20px; font-size: 16px;">
                    <p>Hi <strong>${firstName} ${lastName},</strong></p>
                    <p>We received your new request and will get back to you asap.</p>
                    <p>While you are waiting, please feel free to respond to this email and share any additional information that you believe will be helpful for us.</p>
                    <p>Talk to you soon,</p>
                    <p>------------------------------------------------------------------</p>
                    <p>Request content we have from you:</p>
                    <p>Name: ${firstName} ${lastName}</p>
                    <p>Email: ${email}</p>
                    <p>Your message: ${message}</p>
                  </div>
              </body>
            </html>
        `;

  const mailOptions = {
    from: env.GMAIL_EMAIL,
    to: env.GMAIL_EMAIL,
    subject: `[Contact Form] New Request from ${config.storeName}`,
    html: html,
  };

  const thankYouMailOptions = {
    from: env.GMAIL_EMAIL,
    to: email,
    subject: `Thank you for your request - ${config.storeName}`,
    html: thankYouHtml,
  };

  let error = null;
  try {
    await transporter.sendMail(mailOptions);
    if (config.enableThankYou) {
      await transporter.sendMail(thankYouMailOptions);
    }
  } catch (e) {
    error = e;
  }

  return { error };
}
