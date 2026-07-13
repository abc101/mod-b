import HeroSliderComponent from '@/blocks/HeroSlider/Component'

type Props = {
  settings: any
}

export default function GlobalHeroSlider({
  settings,
}: Props) {
  const hero =
    settings?.homeSettings?.heroSettings

  const slider =
    hero?.sliderSettings || {}

  if (!hero?.enabled) {
    return null
  }

  const slides =
    hero?.slides
      ?.filter(
        (slide: any) =>
          slide?.isActive !== false &&
          slide?.image?.url,
      )
      ?.sort(
        (a: any, b: any) =>
          (a.order || 0) -
          (b.order || 0),
      ) || []

  if (slides.length === 0) {
    return null
  }

  const width =
    slider.width || 'content'

  const containerClass =
    width === 'full'
      ? 'w-full'
      : 'mx-auto w-full max-w-[var(--max-width)] px-6'

  return (
    <section className="w-full">
      <div className={containerClass}>
        <HeroSliderComponent
          slides={slides.map(
            (slide: any) => ({
              image: {
                ...slide.image,
                url:
                  slide.image?.sizes?.hero?.url ||
                  slide.image?.sizes?.large?.url ||
                  slide.image?.url,
              },
              title: slide.title,
              subtitle: slide.subtitle,
              linkUrl: slide.linkUrl,
              linkLabel: slide.linkLabel,
              linkTarget:
                slide.linkTarget ||
                '_self',
            }),
          )}
          heightType={
            slider.heightType || 'medium'
          }
          customHeight={
            slider.customHeight
          }
          autoPlay={
            slider.autoPlay !== false
          }
          autoPlayInterval={
            slider.autoPlayInterval ||
            4000
          }
          showDots={
            slider.showDots !== false
          }
          showArrows={
            slider.showArrows !== false
          }
        />
      </div>
    </section>
  )
}