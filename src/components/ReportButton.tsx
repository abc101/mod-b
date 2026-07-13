'use client'

import { useState, useTransition } from 'react'
import { submitReport } from '@/app/(frontend)/board/[slug]/[id]/report-actions'

type Props = {
  targetType: 'post' | 'comment'
  targetId: number | string
}

const reasons = [
  { label: 'Spam', value: 'spam' },
  { label: 'Abuse / Harassment', value: 'abuse' },
  { label: 'Inappropriate Content', value: 'inappropriate' },
  { label: 'Personal Information', value: 'personal_info' },
  { label: 'Other', value: 'other' },
]

export default function ReportButton({ targetType, targetId }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('spam')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    setError('')

    const formData = new FormData()
    formData.set('targetType', targetType)
    formData.set('targetId', String(targetId))
    formData.set('reason', reason)
    formData.set('details', details)

    startTransition(async () => {
      try {
        await submitReport(formData)
        setDone(true)
        setOpen(false)
      } catch (err: any) {
        setError(err.message || 'Failed to submit report.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={done}
        className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50"
      >
        {done ? 'Reported' : 'Report'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Report {targetType}
            </h2>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {reasons.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Additional details"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
              >
                {isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}