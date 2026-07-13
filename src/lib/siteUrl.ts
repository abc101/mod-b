export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  )
}

export function getMetadataBase() {
  return new URL(getSiteUrl())
}