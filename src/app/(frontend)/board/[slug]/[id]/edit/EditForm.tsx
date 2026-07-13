'use client'

import type { Media, Post } from '@/types/payload'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updatePost } from './actions'
import TipTapEditor from '@/components/TipTapEditor'
import { getRelation, getRelationId } from '@/lib/relations'

type PostTag = {
  tag?: string | null
}

type EditFormPost = Post & {
  tags?: PostTag[] | null
}

type Attachment = {
  id?: string | null
  file: number | Media
}

type Props = {
  post: EditFormPost
  boardSlug: string
  userRole: string | null
}

export default function EditForm({ post, boardSlug, userRole }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(post.title || '')
  const [content, setContent] = useState(post.contentHtml || '')
  const [contentHtml, setContentHtml] = useState(post.contentHtml || '')
  const [useHtml, setUseHtml] = useState(false)
  const [isSecret, setIsSecret] = useState(post.isSecret || false)
  const [tags, setTags] = useState(
    post.tags?.map((t) => t.tag).filter(Boolean).join(', ') || '',
  )

  // Featured image
  const [existingFeaturedImage, setExistingFeaturedImage] = useState(post.thumbnail || null)
  const [newFeaturedImage, setNewFeaturedImage] = useState<File | null>(null)
  const [newFeaturedImagePreview, setNewFeaturedImagePreview] = useState<string | null>(null)
  const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false)
  const featuredImageRef = useRef<HTMLInputElement>(null)

  // Attachments
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(post.attachments || [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMode, setSubmitMode] = useState<'draft' | 'published'>(
    post.status === 'draft' ? 'draft' : 'published',
  )

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewFeaturedImage(file)
    setNewFeaturedImagePreview(URL.createObjectURL(file))
    setRemoveFeaturedImage(false)
  }

  const handleRemoveFeaturedImage = () => {
    setExistingFeaturedImage(null)
    setNewFeaturedImage(null)
    setNewFeaturedImagePreview(null)
    setRemoveFeaturedImage(true)
    if (featuredImageRef.current) featuredImageRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null

    const requestedStatus: 'draft' | 'published' =
      submitter?.value === 'draft' ? 'draft' : 'published'

    setSubmitMode(requestedStatus)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Upload new featured image
      let newFeaturedImageId: number | null = null
      if (newFeaturedImage) {
        const formData = new FormData()
        formData.append('file', newFeaturedImage)
        formData.append('alt', newFeaturedImage.name)
        const res = await fetch('/api/media', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          newFeaturedImageId = data.doc.id
        }
      }

      // Upload new attachments
      const newAttachmentIds: number[] = []
      for (const file of newFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name)
        const res = await fetch('/api/media', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          newAttachmentIds.push(data.doc.id)
        }
      }

      const formData = new FormData()
      formData.set('title', title)
      formData.set('content', '')
      // Store TipTap HTML
      formData.set('contentHtml', useHtml ? contentHtml : content)
      formData.set('useHtmlContent', 'true')
      formData.set('isSecret', String(isSecret))
      formData.set('tags', tags)
      formData.set('existingAttachments', JSON.stringify(existingAttachments))
      formData.set('newAttachmentIds', JSON.stringify(newAttachmentIds))
      formData.set('removeFeaturedImage', String(removeFeaturedImage))

      formData.set(
        'existingFeaturedImageId',
        String(getRelationId(existingFeaturedImage) ?? ''),
      )

      formData.set(
        'newFeaturedImageId',
        newFeaturedImageId ? String(newFeaturedImageId) : '',
      )
      formData.set('status', requestedStatus)

      const result = await updatePost(post.id, boardSlug, formData)

      // Draft saves can remain on the same edit route, so the component may
      // not unmount. Reset the pending state before navigating.
      setSubmitting(false)

      router.replace(result.href)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update post.')
      setSubmitting(false)
    }
  }

  const featuredPreview =
    newFeaturedImagePreview ||
    getRelation(existingFeaturedImage)?.url ||
    null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        required
      />

      {/* Admin HTML toggle */}
      {userRole === 'admin' && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={useHtml} onChange={(e) => setUseHtml(e.target.checked)} className="rounded" />
          Use raw HTML editor (Admin only)
        </label>
      )}

      {/* Content */}
      {useHtml && userRole === 'admin' ? (
        <textarea
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          placeholder="<p>Enter HTML...</p>"
          rows={16}
          className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y"
        />
      ) : (
        <TipTapEditor
          content={content}
          onChange={setContent}
          placeholder="Write your content here..."
        />
      )}

      {/* Featured Image */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Featured Image</p>
        {featuredPreview ? (
          <div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image src={featuredPreview} alt="Featured image" fill className="object-cover" />
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button type="button" onClick={() => featuredImageRef.current?.click()} className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100">
                Change image
              </button>
              <button type="button" onClick={handleRemoveFeaturedImage} className="text-xs text-red-400 hover:text-red-600">
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => featuredImageRef.current?.click()}
            className="flex items-center gap-2 text-sm border border-dashed border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 w-full justify-center text-gray-500"
          >
            🖼️ Select featured image
          </button>
        )}
        <input ref={featuredImageRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageChange} />
      </div>

      {/* Tags */}
      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      {/* Attachments */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Attachments</p>
        {existingAttachments.length > 0 && (
          <ul className="space-y-1.5">
            {existingAttachments.map((att) => {
              const file = getRelation(att.file)

              return (
                <li
                  key={att.id ?? getRelationId(att.file)}
                  className="flex items-center justify-between gap-2"
                >
                  {file?.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      📎 {file.filename || 'Attachment'}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Attachment #{getRelationId(att.file)}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setExistingAttachments((prev) =>
                        prev.filter((item) => item !== att),
                      )
                    }
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {newFiles.length > 0 && (
          <ul className="space-y-1.5">
            {newFiles.map((f, idx) => (
              <li key={idx} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-600 truncate">📎 {f.name}</span>
                <button type="button" onClick={() => setNewFiles((p) => p.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-600 shrink-0">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100">
          📎 Add files
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => setNewFiles((p) => [...p, ...Array.from(e.target.files || [])])} />
      </div>

      {/* Secret */}
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={isSecret} onChange={(e) => setIsSecret(e.target.checked)} className="rounded" />
        Secret post
      </label>

      {/* Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-100"
        >
          Cancel
        </button>

        {post.status === 'draft' && (
          <button
            type="submit"
            name="status"
            value="draft"
            disabled={submitting}
            className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            {submitting && submitMode === 'draft'
              ? 'Saving...'
              : 'Save Draft'}
          </button>
        )}

        <button
          type="submit"
          name="status"
          value="published"
          disabled={submitting}
          className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting && submitMode === 'published'
            ? post.status === 'draft'
              ? 'Publishing...'
              : 'Saving...'
            : post.status === 'draft'
              ? 'Publish'
              : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

