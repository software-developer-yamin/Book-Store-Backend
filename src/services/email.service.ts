/**
 * Creates a nodemailer transport using the SMTP configuration from the provided config object.
 * Verifies the connection to the email server if the environment is not 'test'.
 * Logs success or failure messages using the logger.
 * Sends an email to the specified recipient with the given subject and text content.
 * Sends a reset password email to the specified recipient.
 * Sends a verification email to the specified recipient with the provided token.
 */

import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from '../config/logger';

/**
 * Creates a nodemailer transport using the SMTP configuration from the provided config object.
 * Verifies the connection to the email server if the environment is not 'test'.
 * Logs success or failure messages using the logger.
 */
const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

/**
 * Sends an email to the specified recipient with the given subject and text content.
 * @param to - The email address of the recipient.
 * @param subject - The subject of the email.
 * @param text - The text content of the email.
 * @returns A promise that resolves when the email is successfully sent.
 */
const sendEmail = async (to: string, subject: string, text: string) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Sends a reset password email to the specified recipient.
 * @param {string} to - The email address of the recipient.
 * @param {string} token - The token used for password reset.
 * @returns {Promise<void>} A Promise that resolves once the email is sent.
 */
const sendResetPasswordEmail = async (to: string, token: string) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Sends a verification email to the specified recipient with the provided token.
 * @param to - The email address of the recipient.
 * @param token - The verification token to be included in the email.
 * @returns A promise that resolves once the email is sent successfully.
 */
const sendVerificationEmail = async (to: string, token: string) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}`;
  await sendEmail(to, subject, text);
};

export default {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
};
