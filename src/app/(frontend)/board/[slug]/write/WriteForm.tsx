'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TipTapEditor from '@/components/TipTapEditor'
import { createPost } from './actions'
import AnonymousFields from '@/components/forms/AnonymousFields'
import TurnstileWidget from '@/components/forms/TurnstileWidget'
import { FEATURES } from '@/lib/config/features'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

type Props = {
  boardSlug: string
  boardId: number
  userRole?: string | null
  allowAttachment: boolean
  maxAttachments: number
  allowAnonymous?: boolean
}

export default function WriteForm({
  boardSlug,
  boardId,
  userRole,
  allowAttachment,
  maxAttachments,
  allowAnonymous = false,
}: Props) {
  const router = useRouter()

  const isLoggedIn = !!userRole
  const isAnonymousWrite = !isLoggedIn && allowAnonymous

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contentHtml, setContentHtml] = useState('')
  const [useHtml, setUseHtml] = useState(false)
  const [isSecret, setIsSecret] = useState(false)
  const [tags, setTags] = useState('')

  const [anonymousNickname, setAnonymousNickname] = useState('')
  const [anonymousPassword, setAnonymousPassword] = useState('')

  const [featuredImage, setFeaturedImage] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null)

  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const featuredImageRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const finalContentHtml =
    useHtml && userRole === 'admin' ? contentHtml : content

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFeaturedImage(file)
    setFeaturedImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveFeaturedImage = () => {
    setFeaturedImage(null)
    setFeaturedImagePreview(null)

    if (featuredImageRef.current) {
      featuredImageRef.current.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])

    if (selected.length + files.length > maxAttachments) {
      setError(`Max ${maxAttachments} attachments allowed.`)
      return
    }

    setFiles((prev) => [...prev, ...selected])
  }

  const uploadMedia = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('alt', file.name)

    const res = await fetch('/api/media', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Failed to upload file: ${file.name}`)
    }

    const data = await res.json()
    return data.doc.id as number
  }

  const enableTurnstile =
    process.env.NEXT_PUBLIC_ENABLE_TURNSTILE === 'true'

  const validate = () => {
    if (!title.trim()) {
      return 'Title is required.'
    }

    if (!finalContentHtml.trim()) {
      return 'Content is required.'
    }

    if (!isLoggedIn && !allowAnonymous) {
      return 'Login required.'
    }

    if (isAnonymousWrite && anonymousPassword.trim().length < 4) {
      return 'Password must be at least 4 characters.'
    }

    if (FEATURES.turnstile && isAnonymousWrite && !turnstileToken) {
      return 'Captcha verification is required.'
    }

    return ''
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null

    const nextStatus =
      submitter?.value === 'draft' ? 'draft' : 'published'

    setSubmitMode(nextStatus)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      let thumbnailId: number | null = null

      if (featuredImage) {
        thumbnailId = await uploadMedia(featuredImage)
      }

      const attachmentIds: number[] = []

      if (allowAttachment && files.length > 0) {
        for (const file of files) {
          const id = await uploadMedia(file)
          attachmentIds.push(id)
        }
      }

      const formData = new FormData()
      formData.set('title', title)
      formData.set('contentHtml', finalContentHtml)
      formData.set('isSecret', String(isSecret))
      formData.set('tags', tags)
      formData.set('thumbnailId', thumbnailId ? String(thumbnailId) : '')
      formData.set('attachmentIds', JSON.stringify(attachmentIds))
      formData.set('status', nextStatus)

      if (isAnonymousWrite) {
        formData.set('anonymousNickname', anonymousNickname.trim())
        formData.set('anonymousPassword', anonymousPassword)
        formData.set('turnstileToken', turnstileToken)
      }

      await createPost(boardSlug, boardId, formData)
    } catch (err: unknown) {
      if (isRedirectError(err)) {
        throw err
      }

      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred.',
      )

      setSubmitting(false)
    }
  }

  const [submitMode, setSubmitMode] =
    useState<'published' | 'draft'>('published')

  const [turnstileToken, setTurnstileToken] = useState('')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        required
      />

      {isAnonymousWrite && (
        <AnonymousFields
          nickname={anonymousNickname}
          password={anonymousPassword}
          onNicknameChange={setAnonymousNickname}
          onPasswordChange={setAnonymousPassword}
        />
      )}

      {isAnonymousWrite && (
        <TurnstileWidget
          onVerify={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
        />
      )}

      {userRole === 'admin' && (
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={useHtml}
            onChange={(e) => setUseHtml(e.target.checked)}
            className="rounded"
          />
          Use raw HTML editor (Admin only)
        </label>
      )}

      {useHtml && userRole === 'admin' ? (
        <textarea
          value={contentHtml}
          onChange={(e) => setContentHtml(e.target.value)}
          placeholder="<p>Enter HTML content...</p>"
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

      <section className="border border-gray-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Featured Image
        </p>

        {featuredImagePreview ? (
          <div>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={featuredImagePreview}
                alt="Featured image preview"
                fill
                className="object-cover"
              />
            </div>

            <button
              type="button"
              onClick={handleRemoveFeaturedImage}
              className="mt-2 text-xs text-red-400 hover:text-red-600"
            >
              Remove featured image
            </button>
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

        <input
          ref={featuredImageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFeaturedImageChange}
        />
      </section>

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma separated)"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      {allowAttachment && (
        <section className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Attachments
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-100"
            >
              📎 Add files
            </button>

            <span className="text-xs text-gray-400">
              {files.length}/{maxAttachments} files
            </span>
          </div>

          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <span className="truncate">📎 {file.name}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="text-red-400 hover:text-red-600 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={isSecret}
          onChange={(e) => setIsSecret(e.target.checked)}
          className="rounded"
        />
        Secret post
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-100"
        >
          Cancel
        </button>

       <button
          type="submit"
          name="status"
          value="draft"
          disabled={submitting}
          className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-100 disabled:opacity-50"
        >
          {submitting && submitMode === 'draft' ? 'Saving...' : 'Save Draft'}
        </button>

        <button
          type="submit"
          name="status"
          value="published"
          disabled={submitting}
          className="bg-gray-900 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting && submitMode === 'published' ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </form>
  )
}