// src/lib/relations.ts
export function getRelation<T>(
  value: T | number | string | null | undefined,
): T | null {
  return value && typeof value === 'object' ? value : null
}

export function getRelationId<T extends { id: number | string }>(
  value: T | number | string | null | undefined,
): number | string | undefined {
  if (!value) return undefined
  return typeof value === 'object' ? value.id : value
}