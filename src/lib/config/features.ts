export const FEATURES = {
  turnstile:
    process.env.ENABLE_TURNSTILE === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true',
}