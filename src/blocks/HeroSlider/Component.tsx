'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Slide = {
  image: { url: string; alt?: string; width?: number; height?: number }
  title?: string
  subtitle?: string
  linkUrl?: string
  linkLabel?: string
  linkTarget?: string
}

type Props = {
  slides: Slide[]
  heightType?: 'small' | 'medium' | 'large' | 'full' | 'custom'
  customHeight?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
}

const heightMap = {
  small: '300px',
  medium: '500px',
  large: '700px',
  full: '100vh',
  custom: '',
}

const ratioMap = {
  small: '16 / 5',
  medium: '16 / 6',
  large: '16 / 7',
}

function getNumericHeight(height?: string) {
  if (!height) return undefined
  const value = parseInt(height, 10)
  return Number.isFinite(value) ? value : undefined
}

export default function HeroSliderComponent({
  slides = [],
  heightType = 'medium',
  customHeight,
  autoPlay = true,
  autoPlayInterval = 4000,
  showDots = true,
  showArrows = true,
}: Props) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const height = heightType === 'custom' ? customHeight : heightMap[heightType]
  const maxHeight = heightType === 'full' ? '100vh' : height || undefined
  const numericHeight = getNumericHeight(height)

  const aspectRatio =
    heightType === 'full'
      ? undefined
      : heightType === 'custom' && numericHeight
        ? `1600 / ${numericHeight}`
        : ratioMap[heightType as keyof typeof ratioMap]

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))
    }, autoPlayInterval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, autoPlayInterval, slides.length])

  if (!slides.length) return null

  const slide = slides[current]

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{
        aspectRatio,
        maxHeight,
        minHeight: heightType === 'full' ? '100vh' : undefined,
      }}
    >
      {slides.map((s, i) => (
        s.image?.url && (
          <Image
            key={`${s.image.url}-${i}`}
            src={s.image.url}
            alt={s.image.alt || s.title || ''}
            fill
            sizes="100vw"
            className={`object-cover transition-all duration-1000 ease-in-out ${
              i === current
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
            priority={i === 0}
          />
        )
      ))}

      <div className="absolute inset-0 bg-black/30" />

      {(slide.title || slide.subtitle || slide.linkUrl) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          {slide.title && (
            <h2 className="text-2xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {slide.title}
            </h2>
          )}

          {slide.subtitle && (
            <p className="text-sm md:text-xl mb-6 drop-shadow-md max-w-2xl">
              {slide.subtitle}
            </p>
          )}

          {slide.linkUrl && slide.linkLabel && (
            <Link
              href={slide.linkUrl}
              target={slide.linkTarget || '_self'}
              className="bg-white text-gray-900 px-5 py-2 md:px-6 md:py-2.5 rounded font-semibold hover:bg-gray-100 transition-colors"
            >
              {slide.linkLabel}
            </Link>
          )}
        </div>
      )}

      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}