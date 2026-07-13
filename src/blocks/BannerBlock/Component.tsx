import Image from 'next/image'

type Props = {
  image: { url: string; width?: number; height?: number; alt?: string }
  altText?: string
  linkUrl?: string
  linkTarget?: string
  widthType?: 'full' | 'content' | 'custom'
  customWidth?: string
  customHeight?: string
  objectFit?: 'cover' | 'contain' | 'fill'
}

export default function BannerBlockComponent({
  image,
  altText,
  linkUrl,
  linkTarget = '_self',
  widthType = 'content',
  customWidth,
  customHeight,
  objectFit = 'cover',
}: Props) {
  if (!image?.url) return null

  const wrapClass =
    widthType === 'full'
      ? 'w-full'
      : widthType === 'custom'
      ? ''
      : 'max-w-7xl mx-auto px-4'

  const style: React.CSSProperties = {}
  if (widthType === 'custom' && customWidth) style.width = customWidth
  if (customHeight) style.height = customHeight

  const imgEl = (
    <div
      className={`relative overflow-hidden rounded-lg ${customHeight ? '' : 'aspect-[6/1]'}`}
      style={style}
    >
      <Image
        src={image.url}
        alt={altText || ''}
        fill
        sizes="100vw"
        className={`object-${objectFit}`}
      />
    </div>
  )

  return (
    <div className={`${wrapClass} py-4`}>
      {linkUrl ? (
        <a href={linkUrl} target={linkTarget} rel="noopener noreferrer">
          {imgEl}
        </a>
      ) : (
        imgEl
      )}
    </div>
  )
}
