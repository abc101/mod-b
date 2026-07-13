export function createAnonymousName(ip: string) {
  const source = ip || 'unknown'

  let hash = 0

  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i)
    hash |= 0
  }

  const suffix = Math.abs(hash).toString(36).slice(0, 4).toUpperCase()

  return `Guest-${suffix}`
}