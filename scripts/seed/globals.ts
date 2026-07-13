import type { Field, Payload } from 'payload'

import type { SeedContext } from './utils'
import type { SeedBoards } from './boards'
import type { SeedMedia } from './media'
import { logStep } from './utils'

type IdRef = {
  id: number | string
}

type NamedField = Field & {
  name: string
}

type SelectOption = {
  label: string
  value: string
}

type WorldLocation = {
  label: string
  name: string
  city: string
  country: string
  timezone: string
  timeZone: string
  latitude: number
  longitude: number
  lat: number
  lng: number
}

const WORLD_LOCATIONS: WorldLocation[] = [
  {
    label: 'Seoul',
    name: 'Seoul',
    city: 'Seoul',
    country: 'South Korea',
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
    timezone: 'Pacific/Honolulu',
    timeZone: 'Pacific/Honolulu',
    latitude: 21.315603,
    longitude: -157.858093,
    lat: 21.315603,
    lng: -157.858093,
  },
  {
    label: 'New York',
    name: 'New York',
    city: 'New York',
    country: 'United States',
    timezone: 'America/New_York',
    timeZone: 'America/New_York',
    latitude: 40.73061,
    longitude: -73.935242,
    lat: 40.73061,
    lng: -73.935242,
  },
]

function globalFields(
  payload: Payload,
  slug: string,
): Field[] {
  return (
    payload.config.globals?.find(
      (global) => global.slug === slug,
    )?.fields || []
  )
}

function namedFields(fields: Field[]): NamedField[] {
  return fields.filter(
    (field): field is NamedField => 'name' in field,
  )
}

function findField(
  fields: Field[],
  name: string,
): NamedField | undefined {
  return namedFields(fields).find(
    (field) => field.name === name,
  )
}

function getSelectOptions(
  field: Field | undefined,
): SelectOption[] {
  if (!field || field.type !== 'select') {
    return []
  }

  return field.options.map((option) => {
    if (typeof option === 'string') {
      return {
        label: option,
        value: option,
      }
    }

    return {
      label: String(option.label),
      value: String(option.value),
    }
  })
}

function resolveSelectValue(
  field: Field | undefined,
  preferred: string,
  aliases: string[] = [],
): string | undefined {
  const options = getSelectOptions(field)

  if (options.length === 0) {
    return preferred
  }

  const candidates = [
    preferred,
    ...aliases,
  ].map((value) => value.toLowerCase())

  const match = options.find((option) => {
    const value = option.value.toLowerCase()
    const label = option.label.toLowerCase()

    return candidates.some(
      (candidate) =>
        value === candidate ||
        label === candidate ||
        value.includes(candidate) ||
        label.includes(candidate),
    )
  })

  return match?.value
}

function normalizeRow(
  fields: Field[],
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const field of namedFields(fields)) {
    const value = source[field.name]

    if (value === undefined) {
      continue
    }

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
      if (!Array.isArray(value)) {
        continue
      }

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

    if (field.type === 'select') {
      const selected = resolveSelectValue(
        field,
        String(value),
      )

      if (selected !== undefined) {
        result[field.name] = selected
      }

      continue
    }

    result[field.name] = value
  }

  return result
}

function boardSectionFields(
  payload: Payload,
): Field[] {
  const siteFields = globalFields(
    payload,
    'site-settings',
  )

  const homeSettings = findField(
    siteFields,
    'homeSettings',
  )

  if (
    !homeSettings ||
    homeSettings.type !== 'group'
  ) {
    return []
  }

  const globalBoardSettings = findField(
    homeSettings.fields,
    'globalBoardSettings',
  )

  if (
    !globalBoardSettings ||
    globalBoardSettings.type !== 'group'
  ) {
    return []
  }

  const boardSections = findField(
    globalBoardSettings.fields,
    'boardSections',
  )

  if (
    !boardSections ||
    boardSections.type !== 'array'
  ) {
    return []
  }

  return boardSections.fields
}

function buildBoardSection(
  payload: Payload,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const fields = boardSectionFields(payload)

  if (fields.length === 0) {
    return source
  }

  const result = normalizeRow(fields, source)

  const displayTypeField = findField(
    fields,
    'displayType',
  )

  if (
    source.displayType !== undefined &&
    displayTypeField
  ) {
    const resolved = resolveSelectValue(
      displayTypeField,
      String(source.displayType),
      String(source.displayType) === 'ticker'
        ? ['list']
        : ['list'],
    )

    if (resolved !== undefined) {
      result.displayType = resolved
    } else {
      delete result.displayType
    }
  }

  return result
}

function navigationItemFields(
  payload: Payload,
): Field[] {
  const fields = globalFields(payload, 'navigation')
  const items = findField(fields, 'items')

  return items?.type === 'array'
    ? items.fields
    : []
}

function navigationFooterFields(
  payload: Payload,
): Field[] {
  const fields = globalFields(payload, 'navigation')
  const footer = findField(fields, 'footer')

  return footer?.type === 'group'
    ? footer.fields
    : []
}

function buildNavigationItem(
  payload: Payload,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const fields = navigationItemFields(payload)

  return fields.length > 0
    ? normalizeRow(fields, source)
    : source
}

function buildFooterData(
  payload: Payload,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const fields = navigationFooterFields(payload)

  return fields.length > 0
    ? normalizeRow(fields, source)
    : source
}

function buildDateTimeData(
  payload: Payload,
): Record<string, unknown> {
  const fields = globalFields(
    payload,
    'date-time-settings',
  )

  const source: Record<string, unknown> = {
    enabled: true,
    isEnabled: true,
    enable: true,
    active: true,
    isActive: true,
    show: true,
    visible: true,
    showDateTime: true,
    timezone: 'Pacific/Honolulu',
    dateFormat: 'MMM d, yyyy',
    timeFormat: 'h:mm a',
    locale: 'en-US',
    displayMode: 'rolling',
    mode: 'rolling',
    locations: WORLD_LOCATIONS,
    items: WORLD_LOCATIONS,
    cities: WORLD_LOCATIONS,
  }

  return normalizeRow(fields, source)
}

export async function seedPreUserGlobals(
  { payload }: SeedContext,
) {
  logStep('Seeding preliminary globals')

  await payload
    .updateGlobal({
      slug: 'site-settings' as never,
      data: {
        siteName: 'Mod-B',
        email: {
          requireEmailVerification: false,
        },
      } as never,
      overrideAccess: true,
    })
    .catch((error) => {
      console.warn(
        'Could not update preliminary site-settings:',
        error?.message,
      )
    })
}

export async function seedFinalGlobals(
  { payload }: SeedContext,
  boards: SeedBoards,
  media: SeedMedia,
  advertisements: IdRef[],
) {
  logStep('Seeding final globals')

  const boardSections = [
    buildBoardSection(payload, {
      sectionType: 'board',
      board: boards.notice.id,
      sectionTitle: 'Notices',
      postCount: 5,
      displayType: 'ticker',
      order: 10,
    }),

    // Advertisement sections must not receive displayType.
    buildBoardSection(payload, {
      sectionType: 'advertisement',
      advertisement: advertisements[0]?.id,
      sectionTitle: 'Sponsored',
      order: 15,
    }),

    buildBoardSection(payload, {
      sectionType: 'latest',
      boards: [
        boards.free.id,
        boards.qna.id,
        boards.gallery.id,
        boards.market.id,
      ],
      sectionTitle: 'Latest Posts',
      postCount: 8,
      displayType: 'list',
      order: 20,
    }),

    // Advertisement sections must not receive displayType.
    buildBoardSection(payload, {
      sectionType: 'advertisement',
      advertisement: advertisements[3]?.id,
      sectionTitle: 'Featured',
      order: 25,
    }),
  ]

  await payload
    .updateGlobal({
      slug: 'site-settings' as never,
      data: {
        siteName: 'Mod-B',
        description:
          'Mod-B demo community powered by Payload CMS.',
        homeSettings: {
          globalBoardSettings: {
            enabled: true,
            enable: true,
            show: true,
            position: 'right',
            boardSections,
          },
        },
        email: {
          requireEmailVerification: false,
        },
        seo: {
          defaultTitle: 'Mod-B',
          defaultDescription:
            'Mod-B demo community site.',
          defaultImage: media.hero[0]?.id,
        },
      } as never,
      overrideAccess: true,
    })
    .catch((error) => {
      console.warn(
        'Could not update site-settings:',
        error?.message,
      )
    })

  const navigationItems = [
    buildNavigationItem(payload, {
      label: 'Notice',
      type: 'board',
      board: boards.notice.id,
      url: '/board/notice',
      isActive: true,
    }),
    buildNavigationItem(payload, {
      label: 'Community',
      type: 'dropdown',
      dropdownLinkType: 'none',
      children: [
        {
          label: 'Free Board',
          type: 'board',
          board: boards.free.id,
          url: '/board/free',
          isActive: true,
        },
        {
          label: 'Anonymous Lounge',
          type: 'board',
          board: boards.anonymous.id,
          url: '/board/anonymous',
          isActive: true,
        },
        {
          label: 'Q&A',
          type: 'board',
          board: boards.qna.id,
          url: '/board/qna',
          isActive: true,
        },
      ],
      isActive: true,
    }),
    buildNavigationItem(payload, {
      label: 'Gallery',
      type: 'board',
      board: boards.gallery.id,
      url: '/board/gallery',
      isActive: true,
    }),
    buildNavigationItem(payload, {
      label: 'Compact',
      type: 'board',
      board: boards.compact.id,
      url: '/board/compact',
      isActive: true,
    }),
    buildNavigationItem(payload, {
      label: 'Marketplace',
      type: 'board',
      board: boards.market.id,
      url: '/board/marketplace',
      isActive: true,
    }),
  ].filter(
    (item) => Object.keys(item).length > 0,
  )

  const footer = buildFooterData(payload, {
    columns: '2',
    columnItems: [
      {
        title: 'Community',
        links: [
          {
            label: 'Free Board',
            url: '/board/free',
          },
          {
            label: 'Q&A',
            url: '/board/qna',
          },
          {
            label: 'Gallery',
            url: '/board/gallery',
          },
        ],
      },
      {
        title: 'Account',
        links: [
          {
            label: 'My Page',
            url: '/my-page',
          },
          {
            label: 'Bookmarks',
            url: '/my-page/bookmarks',
          },
          {
            label: 'Notifications',
            url: '/my-page/notifications',
          },
        ],
      },
    ],
    bottomBar: {
      copyrightName: 'Mod-B',
      showYear: true,
      bottomLinks: [
        {
          label: 'Terms',
          url: '/terms',
        },
        {
          label: 'Privacy',
          url: '/privacy',
        },
      ],
      rightText: 'Powered by Payload CMS',
    },
  })

  await payload
    .updateGlobal({
      slug: 'navigation' as never,
      data: {
        items: navigationItems,
        footer,
      } as never,
      overrideAccess: true,
    })
    .catch((error) => {
      console.warn(
        'Could not update navigation:',
        error?.message,
      )
    })

  const dateTimeData = buildDateTimeData(payload)

  console.log(
    '   date-time-settings seed data:',
    JSON.stringify(dateTimeData, null, 2),
  )

  await payload
    .updateGlobal({
      slug: 'date-time-settings' as never,
      data: dateTimeData as never,
      overrideAccess: true,
    })
    .catch((error) => {
      console.warn(
        'Could not update date-time-settings:',
        error?.message,
      )
    })
}
