export function startOfTodayISO() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)

  return date.toISOString()
}

export function countBy<Item, Key extends string | number>(
  items: Item[],
  getter: (item: Item) => Key | undefined | null,
) {
  const map = new Map<Key, number>()

  for (const item of items) {
    const key = getter(item)

    if (key === undefined || key === null) {
      continue
    }

    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([key, count]) => ({
      key,
      count,
    }))
    .sort((first, second) => second.count - first.count)
}