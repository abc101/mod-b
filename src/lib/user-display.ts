export function getDisplayName(
  user: any,
  anonymousAuthor?: string,
) {
  if (!user) {
    return anonymousAuthor || 'Anonymous'
  }

  if (user.isDeleted) {
    return `${user.nickname} (Deleted)`
  }

  return user.nickname || user.name || anonymousAuthor || 'Anonymous'
}