import React from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'

type Props = {
  content?: any
  contentHtml?: string
  useHtmlContent?: boolean
  widthType?: 'full' | 'content' | 'narrow'
  alignment?: 'left' | 'center' | 'right'
}

const widthMap = {
  full: 'w-full',
  content: 'max-w-7xl mx-auto px-4',
  narrow: 'max-w-3xl mx-auto px-4',
}

const alignMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export default function RichTextBlockComponent({
  content,
  contentHtml,
  useHtmlContent = false,
  widthType = 'content',
  alignment = 'left',
}: Props) {

    console.log('useHtmlContent', useHtmlContent)
  console.log('contentHtml', contentHtml)
  
  if (!content && !contentHtml) return null

  return (
    <div className={`${widthMap[widthType]} py-8`}>
      <div className={`prose prose-gray max-w-none ${alignMap[alignment]}`}>
        {useHtmlContent && contentHtml ? (
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        ) : (
          content && <RichText data={content} />
        )}
      </div>
    </div>
  )
}