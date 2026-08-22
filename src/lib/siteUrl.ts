export function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'

  return siteUrl.replace(/\/+$/, '')
}

export function getMetadataBase() {
  return new URL(getSiteUrl())
}