import type { Navigation } from '@/types/payload'

export type HeaderNavItem =
  NonNullable<Navigation['items']>[number]

export type HeaderNavChild =
  NonNullable<HeaderNavItem['children']>[number]

type FooterConfig = NonNullable<Navigation['footer']>

export type FooterColumn =
  NonNullable<FooterConfig['columnItems']>[number]

export type FooterColumnLink =
  NonNullable<FooterColumn['links']>[number]

type FooterBottomBar =
  NonNullable<FooterConfig['bottomBar']>

export type FooterBottomLink =
  NonNullable<FooterBottomBar['bottomLinks']>[number]