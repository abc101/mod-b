import type { SeedBoards } from './boards'
import type { SeedMedia } from './media'
import type { SeedContext } from './utils'
import { logStep } from './utils'

export async function seedGlobalHeroSlider(
  { payload }: SeedContext,
  boards: SeedBoards,
  media: SeedMedia,
) {
  logStep('Enabling and populating the global hero slider')

  if (media.hero.length < 3) {
    throw new Error(
      `Global hero slider requires 3 hero images, but only ${media.hero.length} were seeded.`,
    )
  }

  const current = (await payload.findGlobal({
    slug: 'site-settings' as never,
    depth: 0,
    overrideAccess: true,
  })) as Record<string, any>

  const currentHomeSettings =
    current.homeSettings && typeof current.homeSettings === 'object'
      ? current.homeSettings
      : {}

  await payload.updateGlobal({
    slug: 'site-settings' as never,
    data: {
      homeSettings: {
        ...currentHomeSettings,
        heroSettings: {
          enabled: true,
          sliderSettings: {
            autoPlay: true,
            autoPlayInterval: 4500,
            showDots: true,
            showArrows: true,
            width: 'full',
            heightType: 'medium',
          },
          slides: [
            {
              image: media.hero[0].id,
              title: 'Welcome to Mod-B',
              subtitle:
                'Explore every board style, community feature, and demo workflow.',
              linkUrl: `/board/${boards.free.slug || 'free'}`,
              linkLabel: 'Explore Community',
              linkTarget: '_self',
              order: 10,
              isActive: true,
            },
            {
              image: media.hero[1].id,
              title: 'Questions and Answers',
              subtitle:
                'Ask questions, share answers, and test the accepted-answer workflow.',
              linkUrl: `/board/${boards.qna.slug || 'qna'}`,
              linkLabel: 'Visit Q&A',
              linkTarget: '_self',
              order: 20,
              isActive: true,
            },
            {
              image: media.hero[2].id,
              title: 'Discover the Gallery',
              subtitle:
                'Browse visual posts and test the responsive gallery experience.',
              linkUrl: `/board/${boards.gallery.slug || 'gallery'}`,
              linkLabel: 'Open Gallery',
              linkTarget: '_self',
              order: 30,
              isActive: true,
            },
          ],
        },
      },
    } as never,
    overrideAccess: true,
  })

  console.log(
    `   Global hero slider: enabled, full width, ${media.hero.length} images`,
  )
}
