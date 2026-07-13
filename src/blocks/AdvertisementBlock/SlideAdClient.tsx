'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

type Ad = {
  id: number
  title: string
  image?: { url: string }
  altText?: string
  linkUrl?: string
  linkTarget?: string
  widthType?: string
  customHeight?: string
  objectFit?: 'cover' | 'contain' | 'fill'
}

export default function SlideAdClient({ ads }: { ads: Ad[] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (ads.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c === ads.length - 1 ? 0 : c + 1))
    }, 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [ads.length])

  if (!ads.length) return null

  const ad = ads[current]

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-100" style={{ height: ad.customHeight || '200px' }}>
      <a
        href={ad.linkUrl || '#'}
        target={ad.linkTarget || '_blank'}
        rel="noopener noreferrer"
        className="block w-full h-full"
      >
        {ad.image?.url && (
          <Image
            src={ad.image.url}
            alt={ad.altText || ad.title}
            fill
            sizes="100vw"
            className={`object-${ad.objectFit || 'cover'}`}
          />
        )}
      </a>

      {ads.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c === 0 ? ads.length - 1 : c - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((c) => (c === ads.length - 1 ? 0 : c + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full ${i === current ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
