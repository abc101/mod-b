export function extractMentions(
  text?: string | null,
): string[] {
  if (!text) {
    return []
  }

  const plainText = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .normalize('NFC')

  const matches = plainText.matchAll(
    /(^|[\s([{'".,!?])@([\p{L}\p{N}_.-]{2,30})(?![\p{L}\p{N}_.-])/gu,
  )

  const handles = new Set<string>()

  for (const match of matches) {
    const handle = match[2]
      ?.normalize('NFC')
      .trim()

    if (handle) {
      handles.add(handle)
    }
  }

  return [...handles]
}