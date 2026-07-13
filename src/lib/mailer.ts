import nodemailer from 'nodemailer'

function parseBoolean(value: string | undefined, defaultValue = false) {
  if (value == null || value === '') return defaultValue
  return value.toLowerCase() === 'true'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getFromIdentity() {
  const name = process.env.SMTP_FROM_NAME || 'Mod-B'
  const address = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''

  if (!address) {
    throw new Error('SMTP_FROM_EMAIL is not configured.')
  }

  return { name, address }
}

function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const port = Number(process.env.SMTP_PORT || 587)

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP settings are not configured. Please check your .env file.',
    )
  }

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: parseBoolean(process.env.SMTP_SECURE),
    requireTLS: parseBoolean(process.env.SMTP_REQUIRE_TLS),
    auth: { user, pass },
    tls: {
      servername: process.env.SMTP_TLS_SERVERNAME || host,
      rejectUnauthorized: parseBoolean(
        process.env.SMTP_REJECT_UNAUTHORIZED,
        true,
      ),
    },
  })
}

function buildUrl(path: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const url = new URL(path, baseUrl)

  url.searchParams.set('token', token)

  return url.toString()
}

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string
  token: string
}) {
  const transporter = createTransporter()
  const from = getFromIdentity()
  const verifyUrl = buildUrl('/api/auth/verify-email', token)
  const safeSiteName = escapeHtml(from.name)
  const safeVerifyUrl = escapeHtml(verifyUrl)

  await transporter.sendMail({
    from,
    to: email,
    subject: `[${from.name}] Please verify your email`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif;padding:20px;">
        <h2 style="color:#111;">Welcome to ${safeSiteName}!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the button below.</p>

        <div style="text-align:center;margin:32px 0;">
          <a
            href="${safeVerifyUrl}"
            style="background:#111;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;"
          >
            Verify Email
          </a>
        </div>

        <p style="color:#666;font-size:12px;">
          Or copy and paste this link:<br />
          <a href="${safeVerifyUrl}" style="color:#4285f4;">
            ${safeVerifyUrl}
          </a>
        </p>

        <p style="color:#666;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  })
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const transporter = createTransporter()
  const from = getFromIdentity()

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  })
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string
  token: string
}) {
  const from = getFromIdentity()
  const resetUrl = buildUrl('/reset-password', token)
  const safeResetUrl = escapeHtml(resetUrl)

  await sendEmail({
    to: email,
    subject: `[${from.name}] Password Reset Instructions`,
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:sans-serif;padding:20px;">
        <h2 style="color:#111;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password.</p>
        <p>If you did not request this, you can safely ignore this email.</p>

        <div style="text-align:center;margin:32px 0;">
          <a
            href="${safeResetUrl}"
            style="background:#111;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;"
          >
            Reset Password
          </a>
        </div>

        <p style="color:#666;font-size:12px;">
          If the button does not work, copy and paste this link into your browser:<br />
          <a href="${safeResetUrl}" style="color:#4285f4;">
            ${safeResetUrl}
          </a>
        </p>

        <p style="color:#666;font-size:12px;">This link expires in 24 hours.</p>
      </div>
    `,
  })
}