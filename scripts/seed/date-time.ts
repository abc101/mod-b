import type { Field, Payload } from 'payload'

import type { SeedContext } from './utils'
import { logStep } from './utils'

type NamedField = Field & {
  name: string
}

const DATE_TIME_LOCATIONS = [
  {
    label: 'Seoul',
    name: 'Seoul',
    city: 'Seoul',
    country: 'South Korea',
    icon: '🇰🇷',
    timezone: 'Asia/Seoul',
    timeZone: 'Asia/Seoul',
    latitude: 37.5326,
    longitude: 127.024612,
    lat: 37.5326,
    lng: 127.024612,
  },
  {
    label: 'Honolulu',
    name: 'Honolulu',
    city: 'Honolulu',
    country: 'United States',
    icon: '🌺',
    timezone: 'Pacific/Honolulu',
    timeZone: 'Pacific/Honolulu',
    latitude: 21.315603,
    longitude: -157.858093,
    lat: 21.315603,
    lng: -157.858093,
  },
]

function globalFields(payload: Payload, slug: string): Field[] {
  return (
    payload.config.globals?.find((global) => global.slug === slug)?.fields || []
  )
}

function namedFields(fields: Field[]): NamedField[] {
  return fields.filter(
    (field): field is NamedField => 'name' in field,
  )
}

function normalizeRow(
  fields: Field[],
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const field of namedFields(fields)) {
    const value = source[field.name]

    if (value === undefined) continue

    if (field.type === 'group') {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result[field.name] = normalizeRow(
          field.fields,
          value as Record<string, unknown>,
        )
      }
      continue
    }

    if (field.type === 'array') {
      if (!Array.isArray(value)) continue

      result[field.name] = value.map((item) => {
        if (
          typeof item !== 'object' ||
          item === null ||
          Array.isArray(item)
        ) {
          return item
        }

        return normalizeRow(
          field.fields,
          item as Record<string, unknown>,
        )
      })
      continue
    }

    result[field.name] = value
  }

  return result
}

export async function seedDateTimeSettings({ payload }: SeedContext) {
  logStep('Enabling Seoul and Honolulu date/time ticker')

  const source: Record<string, unknown> = {
    enabled: true,
    isEnabled: true,
    enable: true,
    active: true,
    isActive: true,
    show: true,
    visible: true,
    showWeather: true,
    showDateTime: true,
    timezone: 'Pacific/Honolulu',
    dateFormat: 'MMM d, yyyy',
    timeFormat: 'HH:mm',
    locale: 'en-US',
    displayMode: 'rolling',
    mode: 'rolling',
    locations: DATE_TIME_LOCATIONS,
    items: DATE_TIME_LOCATIONS,
    cities: DATE_TIME_LOCATIONS,
  }

  const data = normalizeRow(
    globalFields(payload, 'date-time-settings'),
    source,
  )

  console.log(
    '   date-time-settings seed data:',
    JSON.stringify(data, null, 2),
  )

  await payload.updateGlobal({
    slug: 'date-time-settings' as never,
    data: data as never,
    overrideAccess: true,
  })
}
